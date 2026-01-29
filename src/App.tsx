import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { LoginScreen } from './screens/LoginScreen';
import { StudentHomeWithFeatures } from './screens/StudentHomeWithFeatures';
import { MenuScreen } from './screens/MenuScreen';
import { CartScreen } from './screens/CartScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { Navbar } from './components/Navbar';
import { api } from './utils/api';
import { INITIAL_MENU } from './utils/initialData';
import { MenuItem, CartItem, Order, Feedback } from './utils/types';
import { Toaster, toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { initNotifications, sendLocalNotification } from './utils/notifications';
import { Loader2 } from 'lucide-react';

// Lazy load dashboards for performance
const StaffDashboard = lazy(() => import('./screens/StaffDashboard').then(m => ({ default: m.StaffDashboard })));
const ManagerDashboard = lazy(() => import('./screens/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));

const ScreenLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-black">
    <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-orange)]" />
  </div>
);

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('user_123');
  const [branch, setBranch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [branchPaused, setBranchPaused] = useState(false);

  const placingOrderRef = useRef(false);

  // Refresh menu from server
  const refreshMenu = async () => {
    try {
      const menuData = await api.getMenu();
      if (menuData) setMenu(menuData);
    } catch (e) {
      console.error('Menu refresh failed:', e);
    }
  };

  // Initialize App
  useEffect(() => {
    const init = async () => {
      await initNotifications().catch(() => { });

      try {
        const persisted = localStorage.getItem('chilly_user_session');
        if (persisted) {
          const { role: r, userId: id } = JSON.parse(persisted);
          setRole(r);
          setUserId(id);
          if (r === 'student') {
            setActiveTab('home');
            api.getUser(id).then(setUser).catch(console.error);
          }
        }

        try {
          const menuData = await api.getMenu();
          if (menuData && menuData.length > 0) {
            setMenu(menuData);
          } else {
            await api.seedMenu(INITIAL_MENU);
            setMenu(INITIAL_MENU);
          }
        } catch (menuError) {
          console.error('Menu fetch failed, using default menu:', menuError);
          toast.error('Server is slow. Using offline menu.');
          setMenu(INITIAL_MENU);
        }
      } catch (err) {
        console.error('Initial load failed:', err);
        toast.error('Connection issue. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Realtime Orders with Socket.io (10-20x faster than Supabase)
  useEffect(() => {
    if (!role) return;

    let isSubscribed = true;
    let socket: Socket | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let previousOrderIds = new Set<string>();

    const fetchOrders = async () => {
      if (!isSubscribed) return;

      try {
        const data = await api.getOrders();
        if (data && isSubscribed) {
          setOrders(data);
          previousOrderIds = new Set(data.map(o => o.id));
        }
      } catch (e) {
        console.error('Orders fetch failed:', e);
      }
    };

    // Initial fetch
    fetchOrders();

    // Setup Socket.io connection to Node.js backend
    const socketUrl = window.location.port === '3000' ? 'http://localhost:3001' : window.location.origin;
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket?.id);
      socket?.emit('joinRole', role); // Join role-specific room
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
    });

    // Listen for new orders (real-time <50ms)
    socket.on('newOrder', (order: Order) => {
      console.log('🛎️ New order received via Socket.io:', order);

      if (!previousOrderIds.has(order.id)) {
        if (role === 'cook' || role === 'manager') {
          toast.info(`🛎️ New order #${order.token} received!`);
          if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
        }

        setOrders(prev => {
          if (prev.some(o => o.id === order.id)) return prev;
          return [order, ...prev];
        });
        previousOrderIds.add(order.id);
      }
    });

    // Listen for order updates (real-time <50ms)
    socket.on('orderUpdate', (updatedOrder: Order) => {
      console.log('📝 Order updated via Socket.io:', updatedOrder);

      setOrders(prev => prev.map(o =>
        o.id === updatedOrder.id ? updatedOrder : o
      ));

      // Refresh balance if refund occurred
      if (role === 'student' && updatedOrder.userId === userId) {
        api.getUser(userId).then(setUser).catch(console.error);
      }
    });

    // Fallback polling (only as backup, 30s interval)
    pollingInterval = setInterval(fetchOrders, 30000);

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (pollingInterval) clearInterval(pollingInterval);

      if (socket) {
        socket.disconnect();
        console.log('✅ Socket.io cleanup complete');
      }
    };
  }, [role]);

  const handleLogin = (selectedRole: string, actualUserId: string) => {
    setRole(selectedRole);
    setUserId(actualUserId);
    localStorage.setItem('chilly_user_session', JSON.stringify({ role: selectedRole, userId: actualUserId }));
    if (selectedRole === 'student') {
      setActiveTab('home');
      api.getUser(actualUserId).then(setUser).catch(console.error);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('chilly_user_session');
    setRole(null);
    setUserId('');
    setCart([]);
    toast.info('Session Ended');
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Tray Updated: ${item.name}`);
  };

  const placeOrder = async (details: any) => {
    if (placingOrderRef.current) return;
    placingOrderRef.current = true;
    setIsPlacingOrder(true);

    const token = `${branch || 'A'}${Math.floor(Math.random() * 900) + 100}`;
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const newOrder = {
      id: `temp-${Date.now()}`,
      items: cart,
      totalAmount: total,
      token,
      branch: branch || 'A',
      userId,
      status: 'placed' as const,
      createdAt: Date.now(),
      ...details
    };

    // Optimistic update - instantly clear cart and switch tab
    setCart([]);
    setActiveTab('orders');
    toast.success(`Order Placed! Token: ${token}`);

    // Add order to local state immediately
    setOrders((prev: Order[]) => [...prev, newOrder as any]);

    try {
      // API call in background
      const createdOrder = await api.createOrder({
        items: cart.length > 0 ? cart : newOrder.items,
        totalAmount: total,
        token,
        branch: branch || 'A',
        userId,
        ...details
      });

      // Replace temp order with real one from server, handling potential socket race condition
      setOrders((prev: Order[]) => {
        if (prev.some(o => o.id === createdOrder.id)) {
          return prev.filter(o => o.id !== newOrder.id);
        }
        return prev.map(o => o.id === newOrder.id ? createdOrder : o);
      });

      // Refresh user balance and points from server
      api.getUser(userId).then(setUser).catch(console.error);
    } catch (e) {
      // Rollback on error
      toast.error('Order failed to reach kitchen');
      setOrders((prev: Order[]) => prev.filter(o => o.id !== newOrder.id));
      setCart(newOrder.items);
      setActiveTab('cart');
    } finally {
      setIsPlacingOrder(false);
      placingOrderRef.current = false;
      // Secondary refresh to be absolutely sure
      if (userId) api.getUser(userId).then(setUser).catch(() => { });
    }
  };

  const handleReplenish = async (amount: number) => {
    try {
      const updatedUser = await api.updateUserBalance(userId, amount);
      setUser(updatedUser);
      toast.success(`Vault Replenished: ₹${amount}`);
      return true;
    } catch (e) {
      toast.error('Refill failed');
      return false;
    }
  };

  const placeFlashOrder = async (saleId: string, amount: number) => {
    if (!user || user.balance < amount) {
      toast.error('Insufficient Funds');
      return;
    }

    const token = `R${Math.floor(Math.random() * 900) + 100}`; // 'R' for Rescue

    try {
      await api.createOrder({
        userId,
        branch: 'A',
        totalAmount: amount,
        token,
        status: 'preparing', // Rescued food is already preparing/ready
        paymentMethod: 'wallet',
        flashSaleId: saleId,
        items: [{
          id: 'flash',
          name: 'Rescue Deal',
          price: amount,
          quantity: 1,
          isRefundable: false,
          category: 'Offers',
          image: '',
          available: true,
          description: 'Flash Sale Item',
          branch: 'A'
        }]
      });
      api.getUser(userId).then(setUser);
      toast.success('Rescue Successful! +500 Aura');
    } catch (e) {
      toast.error('This rescue has expired.');
    }
  };

  if (loading) return <ScreenLoader />;
  if (!role) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <Toaster position="top-center" richColors theme="dark" />
      <Layout>
        <div className="flex-1 relative overflow-hidden h-full bg-black">
          <AnimatePresence mode="popLayout" initial={false}>
            {role === 'student' && activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <StudentHomeWithFeatures
                  userId={userId}
                  user={user}
                  menu={menu}
                  orders={orders.filter(o => o.userId === userId)}
                  onLogout={handleLogout}
                  onSelectBranch={b => { setBranch(b); setActiveTab('menu'); }}
                  onReplenish={handleReplenish}
                  onRefreshUser={() => api.getUser(userId).then(setUser).catch(console.error)}
                  onRescueOrder={placeFlashOrder}
                />
              </motion.div>
            )}

            {role === 'student' && activeTab === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <MenuScreen menu={menu} onAddToCart={addToCart} onBack={() => setActiveTab('home')} branch={branch} cart={cart} onGoToCart={() => setActiveTab('cart')} />
              </motion.div>
            )}

            {role === 'student' && activeTab === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                <CartScreen
                  cart={cart}
                  user={user}
                  total={cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                  onUpdateQuantity={(id: string, q: number) => setCart((prev: CartItem[]) => q < 1 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: q } : i))}
                  onPlaceOrder={placeOrder}
                  isPlacingOrder={isPlacingOrder}
                />
              </motion.div>
            )}

            {role === 'student' && activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="h-full">
                <OrdersScreen
                  orders={orders.filter(o => o.userId === userId)}
                  onCancelOrder={async id => {
                    const orderToCancel = orders.find(o => o.id === id);
                    if (!orderToCancel) return;

                    // Calculate Refundable vs Non-Refundable
                    const refundableAmount = orderToCancel.items.reduce((sum, item) => {
                      return sum + (item.isRefundable ? (item.price * item.quantity) : 0);
                    }, 0);

                    const nonRefundableAmount = orderToCancel.totalAmount - refundableAmount;
                    const updates: any = { status: 'cancelled' };

                    // If there's a non-refundable portion, request manager approval for THAT amount
                    if (nonRefundableAmount > 0) {
                      updates.refundRequest = {
                        status: 'pending',
                        reason: 'Non-refundable Item Cancellation',
                        requestedAt: Date.now(),
                        refundAmount: nonRefundableAmount, // Only ask for the remainder
                        cancelledBy: 'user'
                      };
                      toast.info('Cancellation under review (Non-refundable items)');
                    } else {
                      toast.success('Order Cancelled & Refunded');
                    }

                    // Optimistic update
                    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

                    try {
                      await api.updateOrder(id, updates);
                    } catch (error) {
                      toast.error('Failed to cancel order');
                      // Refresh to get correct state
                      const freshOrders = await api.getOrders().catch(() => []);
                      if (freshOrders.length) setOrders(freshOrders);
                    }
                  }}
                  onSubmitFeedback={async (id, f: Feedback) => {
                    // Optimistic update
                    setOrders((prev: Order[]) => prev.map(o => o.id === id ? { ...o, feedback: f } : o));
                    toast.success('Thanks for feedback!');

                    try {
                      await api.submitFeedback({ id, ...f });
                    } catch (error) {
                      toast.error('Failed to submit feedback');
                      // Rollback
                      setOrders((prev: Order[]) => prev.map(o => o.id === id ? { ...o, feedback: undefined } : o));
                    }
                  }}
                  onRequestRefund={async (id, r) => {
                    // Optimistic update
                    const refundRequest = { status: 'pending' as const, reason: r, requestedAt: Date.now() };
                    setOrders((prev: Order[]) => prev.map(o => o.id === id ? { ...o, refundRequest } : o));
                    toast.success('Refund requested');

                    try {
                      await api.updateOrder(id, { refundRequest });
                    } catch (error) {
                      toast.error('Failed to request refund');
                      // Rollback
                      setOrders((prev: Order[]) => prev.map(o => o.id === id ? { ...o, refundRequest: undefined } : o));
                    }
                  }}
                />
              </motion.div>
            )}

            {role === 'cook' && (
              <Suspense fallback={<ScreenLoader />}>
                <StaffDashboard
                  orders={orders}
                  onLogout={handleLogout}
                  onUpdateStatus={async (id, s, reason) => {
                    // Optimistic update - update UI immediately
                    setOrders(prevOrders =>
                      prevOrders.map(order =>
                        order.id === id
                          ? { ...order, status: s as any, ...(reason && { rejectionReason: reason }) }
                          : order
                      )
                    );

                    // Then make API call in background
                    try {
                      await api.updateOrder(id, {
                        status: s as any,
                        ...(reason && { rejectionReason: reason })
                      });
                    } catch (error) {
                      // Rollback on error and show notification
                      console.error('Failed to update order status:', error);
                      toast.error('Failed to update order status. Please try again.');

                      // Refresh orders from server to get accurate state
                      try {
                        const freshOrders = await api.getOrders();
                        if (freshOrders) setOrders(freshOrders);
                      } catch (e) {
                        console.error('Failed to refresh orders:', e);
                      }
                    }
                  }}
                />
              </Suspense>
            )}

            {role === 'manager' && (
              <Suspense fallback={<ScreenLoader />}>
                <ManagerDashboard
                  orders={orders}
                  menu={menu}
                  onLogout={handleLogout}
                  onUpdateOrder={async (id, s) => {
                    // Store previous state for rollback
                    const previousOrders = orders;

                    // Optimistic update
                    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...s } : o));
                    toast.success('System record updated');

                    try {
                      await api.updateOrder(id, s);
                    } catch (e) {
                      toast.error('Failed to update record');
                      // Rollback on error
                      setOrders(previousOrders);
                    }
                  }}
                  onUpdateMenu={async (id, updates) => {
                    // Store previous state
                    const previousMenu = menu;

                    // Optimistic update
                    setMenu(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

                    try {
                      await api.updateMenuItem(id, updates);
                      toast.success('Inventory updated');
                    } catch (e) {
                      toast.error('Failed to sync inventory');
                      setMenu(previousMenu);
                    }
                  }}
                  onAddMenu={async (item) => {
                    const tempId = Date.now().toString(); // temporary ID
                    const newItem = { ...item, id: tempId };

                    // Optimistic update
                    setMenu((prev: MenuItem[]) => [newItem as MenuItem, ...prev]);

                    try {
                      const addedItem = await api.addMenuItem(item);
                      // Replace temp item with real one (with correct ID)
                      setMenu((prev: MenuItem[]) => prev.map(m => m.id === tempId ? addedItem : m));
                      toast.success('Item added to Vault');
                    } catch (e) {
                      console.error(e);
                      toast.error('Failed to add item');
                      // Rollback
                      setMenu(prev => prev.filter(m => m.id !== tempId));
                    }
                  }}
                  onRefreshMenu={refreshMenu}
                />
              </Suspense>
            )}
          </AnimatePresence>
        </div>
        {role === 'student' && <Navbar activeTab={activeTab} onTabChange={setActiveTab} cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />}
      </Layout>
    </div>
  );
}