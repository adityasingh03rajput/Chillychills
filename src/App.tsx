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
import { supabase } from './utils/supabase/client';
import { initNotifications, sendLocalNotification } from './utils/notifications';
import { Loader2 } from 'lucide-react';

// Lazy load dashboards for performance
const StaffDashboard = lazy(() => import('./screens/StaffDashboard').then(m => ({ default: m.StaffDashboard })));
const ManagerDashboard = lazy(() => import('./screens/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));

const ScreenLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-primary)]">
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
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [branchPaused, setBranchPaused] = useState(false);

  const placingOrderRef = useRef(false);

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
          if (r === 'student') setActiveTab('home');
        }

        const menuData = await api.getMenu();
        if (menuData && menuData.length > 0) setMenu(menuData);
        else {
          await api.seedMenu(INITIAL_MENU);
          setMenu(INITIAL_MENU);
        }
      } catch (err) {
        console.error('Initial load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userRole = session.user.app_metadata.provider === 'google' ? 'student' : (session.user.user_metadata?.role || 'student');
        setRole(userRole);
        setUserId(session.user.id);
        localStorage.setItem('chilly_user_session', JSON.stringify({ role: userRole, userId: session.user.id }));
        if (userRole === 'student') setActiveTab('home');
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
        localStorage.removeItem('chilly_user_session');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Realtime Orders with Enhanced Connection Handling
  useEffect(() => {
    if (!role) return;

    let isSubscribed = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let pollingInterval: NodeJS.Timeout | null = null;
    let previousOrderIds = new Set<string>();

    const fetchOrders = async () => {
      if (!isSubscribed) return;

      try {
        const data = await api.getOrders();
        if (data && isSubscribed) {
          setOrders(data);
          reconnectAttempts = 0; // Reset on successful fetch

          // Update previousOrderIds for notification logic
          previousOrderIds = new Set(data.map(o => o.id));
        }
      } catch (e) {
        console.error('Orders fetch failed:', e);

        // Exponential backoff for retries
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Retrying in ${backoffTime}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(() => isSubscribed && fetchOrders(), backoffTime);
        }
      }
    };

    // Initial fetch
    fetchOrders();

    // Setup Supabase realtime channel - simplified config for postgres_changes
    const channel = supabase
      .channel('orders-realtime-' + Date.now()) // Unique channel name
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (!isSubscribed) return;

          console.log('📡 Realtime event received:', payload.eventType, payload);

          try {
            const data = await api.getOrders();
            if (data && isSubscribed) {
              // Check for new orders using previousOrderIds instead of stale closure
              const newOrders = data.filter(n => n.status === 'placed' && !previousOrderIds.has(n.id));

              if ((role === 'cook' || role === 'manager') && newOrders.length > 0) {
                toast.info(`🛎️ ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received!`);
                if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
              }

              setOrders(data);
              previousOrderIds = new Set(data.map(o => o.id));
            }
          } catch (error) {
            console.error('Error handling realtime update:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ Supabase subscription error:', err);
        }
        console.log('🔌 Supabase channel status:', status);
      });

    // Optimized polling based on role - increased frequency
    const pollingIntervalTime = (role === 'cook' || role === 'manager') ? 10000 : 30000;
    pollingInterval = setInterval(fetchOrders, pollingIntervalTime);

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (pollingInterval) clearInterval(pollingInterval);

      supabase.removeChannel(channel).then(() => {
        console.log('✅ Channel cleanup complete');
      }).catch((err) => {
        console.error('Error during channel cleanup:', err);
      });
    };
  }, [role]);

  const handleLogin = (selectedRole: string) => {
    setRole(selectedRole);
    localStorage.setItem('chilly_user_session', JSON.stringify({ role: selectedRole, userId }));
    if (selectedRole === 'student') setActiveTab('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => { });
    localStorage.removeItem('chilly_user_session');
    setRole(null);
    setCart([]);
    toast.info('Session Ended');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
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
    setOrders(prev => [...prev, newOrder as any]);

    try {
      // API call in background
      const createdOrder = await api.createOrder({ items: cart.length > 0 ? cart : newOrder.items, totalAmount: total, token, branch: branch || 'A', userId, ...details });

      // Replace temp order with real one from server
      setOrders(prev => prev.map(o => o.id === newOrder.id ? createdOrder : o));
    } catch (e) {
      // Rollback on error
      toast.error('Order failed to reach kitchen');
      setOrders(prev => prev.filter(o => o.id !== newOrder.id));
      setCart(newOrder.items);
      setActiveTab('cart');
    } finally {
      setIsPlacingOrder(false);
      placingOrderRef.current = false;
    }
  };

  if (loading) return <ScreenLoader />;
  if (!role) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
      <Toaster position="top-center" richColors theme="dark" />
      <Layout>
        <div className="flex-1 relative overflow-hidden h-full">
          <AnimatePresence mode="wait">
            {role === 'student' && activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <StudentHomeWithFeatures
                  userId={userId}
                  menu={menu}
                  orders={orders.filter(o => o.userId === userId)}
                  onLogout={handleLogout}
                  onSelectBranch={b => { setBranch(b); setActiveTab('menu'); }}
                />
              </motion.div>
            )}

            {role === 'student' && activeTab === 'menu' && (
              <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                <MenuScreen menu={menu} onAddToCart={addToCart} onBack={() => setActiveTab('home')} branch={branch} cart={cart} onGoToCart={() => setActiveTab('cart')} />
              </motion.div>
            )}

            {role === 'student' && activeTab === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="h-full">
                <CartScreen
                  cart={cart}
                  total={cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                  onUpdateQuantity={(id: string, q: number) => setCart(prev => q < 1 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: q } : i))}
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
                    // Optimistic update
                    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as any } : o));
                    toast.success('Order Cancelled');

                    try {
                      await api.updateOrder(id, { status: 'cancelled' });
                    } catch (error) {
                      toast.error('Failed to cancel order');
                      // Refresh to get correct state
                      const freshOrders = await api.getOrders().catch(() => []);
                      if (freshOrders.length) setOrders(freshOrders);
                    }
                  }}
                  onSubmitFeedback={async (id, f: Feedback) => {
                    // Optimistic update
                    setOrders(prev => prev.map(o => o.id === id ? { ...o, feedback: f } : o));
                    toast.success('Thanks for feedback!');

                    try {
                      await api.submitFeedback({ id, ...f });
                    } catch (error) {
                      toast.error('Failed to submit feedback');
                      // Rollback
                      setOrders(prev => prev.map(o => o.id === id ? { ...o, feedback: undefined } : o));
                    }
                  }}
                  onRequestRefund={async (id, r) => {
                    // Optimistic update
                    const refundRequest = { status: 'pending' as const, reason: r, requestedAt: Date.now() };
                    setOrders(prev => prev.map(o => o.id === id ? { ...o, refundRequest } : o));
                    toast.success('Refund requested');

                    try {
                      await api.updateOrder(id, { refundRequest });
                    } catch (error) {
                      toast.error('Failed to request refund');
                      // Rollback
                      setOrders(prev => prev.map(o => o.id === id ? { ...o, refundRequest: undefined } : o));
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