import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { LoginScreen } from './screens/LoginScreen';
import { StudentHome } from './screens/StudentHome';
import { StudentHomeWithFeatures } from './screens/StudentHomeWithFeatures';
import { MenuScreen } from './screens/MenuScreen';
import { CartScreen } from './screens/CartScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { StaffDashboard } from './screens/StaffDashboard';
import { ManagerDashboard } from './screens/ManagerDashboard';
import { Navbar } from './components/Navbar';
import { api } from './utils/api';
import { INITIAL_MENU } from './utils/initialData';
import { MenuItem, CartItem, Order, Feedback } from './utils/types';
import { Toaster, toast } from 'sonner';
import { supabase } from './utils/supabase/client';
import { initNotifications, sendLocalNotification } from './utils/notifications';

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

  // Initial Load & Auth Check
  useEffect(() => {
    const init = async () => {
      // Initialize Push/Local Notifications
      await initNotifications().catch(() => { });

      try {
        // First, check localStorage for persisted session
        const persistedSession = localStorage.getItem('chilly_user_session');
        if (persistedSession) {
          try {
            const { role: savedRole, userId: savedUserId } = JSON.parse(persistedSession);
            setRole(savedRole);
            setUserId(savedUserId);
            if (savedRole === 'student') setActiveTab('home');
          } catch (e) {
            console.log('Failed to restore session from localStorage', e);
          }
        }

        // Then check Supabase session
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          // If there's an auth error (like unconfirmed email), clear the session
          if (error) {
            console.log('Auth session error, clearing:', error.message);
            await supabase.auth.signOut();
            localStorage.removeItem('chilly_user_session');
            setRole(null);
          } else if (session) {
            const userRole = session.user.user_metadata?.role || 'student';
            const newUserId = session.user.id || 'user_123';
            setRole(userRole);
            setUserId(newUserId);
            // Persist to localStorage
            localStorage.setItem('chilly_user_session', JSON.stringify({ role: userRole, userId: newUserId }));
            if (userRole === 'student') setActiveTab('home');
          }
        } catch (authError: any) {
          console.log('Auth error during session check:', authError.message);
          // Clear any problematic session
          await supabase.auth.signOut().catch(() => { });
          localStorage.removeItem('chilly_user_session');
          setRole(null);
        }

        let menuData = [];
        try {
          menuData = await api.getMenu();
        } catch (e) { console.log('Menu fetch error', e); }

        if (!menuData || menuData.length === 0) {
          console.log('Seeding menu...');
          await api.seedMenu(INITIAL_MENU);
          menuData = INITIAL_MENU;
        }
        setMenu(menuData);
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Listen for Auth Changes (Redirects from Google, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        let userRole = session.user.user_metadata?.role || 'student';
        const newUserId = session.user.id;

        // Force 'student' role for Google OAuth users
        const isGoogleUser = session.user.app_metadata.provider === 'google';
        if (isGoogleUser) {
          userRole = 'student';
          console.log('[Auth] Google Login detected - Forcing Student Role');
        }

        setRole(userRole);
        setUserId(newUserId);
        localStorage.setItem('chilly_user_session', JSON.stringify({ role: userRole, userId: newUserId }));

        if (userRole === 'student') setActiveTab('home');
        toast.success(`Logged in as ${userRole}`);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
        localStorage.removeItem('chilly_user_session');
      }
    });

    // Handle Capacitor Deep Links (Android/iOS)
    const initDeepLinks = async () => {
      if ((window as any).Capacitor) {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('appUrlOpen', async (data: any) => {
          const url = new URL(data.url);
          const hash = url.hash.substring(1);
          if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
            }
          }
        });
      }
    };
    initDeepLinks();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Separate Order Polling with proper dependencies
  useEffect(() => {
    if (!role) return;

    let errorShown = false;

    const fetchOrders = async () => {
      try {
        const ordersData = await api.getOrders();
        if (ordersData) {
          // Debug logs for user to verify branches
          console.log(`[Orders] Fetched ${ordersData.length} orders total.`);
          if (ordersData.length > 0) {
            const branchCounts = ordersData.reduce((acc: any, o) => {
              acc[o.branch] = (acc[o.branch] || 0) + 1;
              return acc;
            }, {});
            console.log(`[Orders] Branch distribution:`, branchCounts);
          }

          // Check for notifications before updating state
          if (role === 'cook' || role === 'manager') {
            const newOrders = ordersData.filter(newO =>
              newO.status === 'placed' && !orders.some(oldO => oldO.id === newO.id)
            );
            if (newOrders.length > 0) {
              sendLocalNotification(
                "New Order!",
                `You have ${newOrders.length} new order(s) waiting.`,
                201
              );
            }
          }
          setOrders(ordersData);
        }
      } catch (e: any) {
        console.error('Failed to fetch orders:', e);
        if (!errorShown) {
          toast.error('Kitchen connection unstable. Retrying...');
          errorShown = true;
        }
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // 4s polling
    return () => clearInterval(interval);
  }, [role, orders.length]); // Re-poll when role changes or order count changes

  const handleLogin = (selectedRole: string) => {
    setRole(selectedRole);
    setUserId(userId); // Keep existing userId
    // Persist session to localStorage
    localStorage.setItem('chilly_user_session', JSON.stringify({ role: selectedRole, userId }));
    if (selectedRole === 'student') setActiveTab('home');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Sign out error:', e);
    }
    // Clear localStorage session
    localStorage.removeItem('chilly_user_session');
    setRole(null);
    setUserId('user_123');
    setCart([]);
    setActiveTab('home');
    toast.info('Logged out successfully');
  };

  // Calculate refund amount based on item refundability and who cancelled
  const calculateRefundAmount = (order: Order, cancelledBy: 'user' | 'staff'): number => {
    if (cancelledBy === 'staff') {
      // Staff cancelled: refund everything
      return order.totalAmount;
    } else {
      // User cancelled: only refund refundable items
      const refundableTotal = order.items.reduce((sum, item) => {
        if (item.isRefundable) {
          return sum + (item.price * item.quantity);
        }
        return sum;
      }, 0);
      return refundableTotal;
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to tray`);
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  // Ref to track execution status synchronously
  const placingOrderRef = React.useRef(false);

  const placeOrder = async (orderDetails: any) => {
    if (cart.length === 0) return;

    // Prevent multiple submissions synchronously
    if (placingOrderRef.current) return;
    placingOrderRef.current = true;

    setIsPlacingOrder(true);

    // Generate Token: Branch + Random Number
    const token = `${branch || 'A'}${Math.floor(Math.random() * 900) + 100}`;

    const newOrder: Partial<Order> = {
      items: cart,
      totalAmount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      token,
      branch: branch || 'A',
      userId: userId, // Mock user
      ...orderDetails
    };

    try {
      await new Promise(r => setTimeout(r, 1500));
      const created = await api.createOrder(newOrder);
      setOrders(prev => [...prev, created]);
      setCart([]);
      setActiveTab('orders');
      toast.success(`Order Placed! Token: ${token}`);
      sendLocalNotification("Order Placed", `Your order #${token} has been placed successfully.`, 101);
    } catch (e) {
      toast.error('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
      placingOrderRef.current = false;
    }
  };

  // Generic Update Handler
  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const updated = await api.updateOrder(id, updates);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      // Toast logic based on status
      if (updates.status) {
        toast.info(`Order status updated to ${updates.status}`);
        let message = `Your order status is now ${updates.status}`;
        if (updates.status === 'preparing') message = "Chef has started preparing your order!";
        if (updates.status === 'ready') message = "Hurry! Your order is ready for pickup.";
        if (updates.status === 'rejected') message = "Sorry, your order was rejected.";
        sendLocalNotification("Order Update", message, parseInt(id.slice(-4)) || 102);
      }
      if (updates.refundRequest) {
        toast.info('Refund request updated');
        sendLocalNotification("Refund Update", "Your refund request has been received/updated.", 103);
      }
    } catch (e) {
      toast.error('Failed to update order');
    }
  };

  if (!role) {
    return (
      <Layout>
        <Toaster position="top-center" richColors theme="dark" />
        <LoginScreen onLogin={handleLogin} />
      </Layout>
    );
  }

  // --- STAFF UI ---
  if (role === 'cook') {
    return (
      <Layout>
        <Toaster position="top-center" richColors theme="dark" />
        <div className="flex flex-col h-full">
          <StaffDashboard
            orders={orders}
            onUpdateStatus={(id, status, reason) => handleUpdateOrder(id, { status: status as any, rejectionReason: reason })}
            onLogout={handleLogout}
          />
        </div>
      </Layout>
    );
  }

  // --- MANAGER UI ---
  if (role === 'manager') {
    return (
      <Layout>
        <Toaster position="top-center" richColors theme="dark" />
        <div className="flex flex-col h-full">
          <ManagerDashboard
            orders={orders}
            menu={menu}
            onUpdateOrder={handleUpdateOrder}
            onUpdateMenu={async (updatedMenu) => {
              setMenu(updatedMenu);
              toast.success('Menu updated successfully!');
            }}
            onAddMenuItem={async (item) => {
              try {
                const newItem = await api.addMenuItem(item);
                setMenu(prev => [...prev, newItem]);
                toast.success(`${item.name} added to menu!`);
              } catch (e) {
                toast.error('Failed to add menu item');
              }
            }}
            onUpdateMenuItem={async (id, updates) => {
              try {
                const updatedItem = await api.updateMenuItem(id, updates);
                setMenu(prev => prev.map(i => i.id === id ? updatedItem : i));
              } catch (e) {
                toast.error('Failed to update menu item');
              }
            }}
            branchPaused={branchPaused}
            onToggleBranchPause={() => setBranchPaused(!branchPaused)}
            onLogout={handleLogout}
          />
        </div>
      </Layout>
    );
  }

  // --- STUDENT UI ---
  return (
    <Layout>
      <Toaster position="top-center" richColors theme="dark" />

      {/* Branch Paused Banner */}
      {branchPaused && (
        <div className="bg-red-500 text-white text-center py-2 px-4 text-sm font-bold">
          ⚠️ Ordering is temporarily paused by management
        </div>
      )}

      <div className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              className="h-full w-full"
              initial={{ opacity: 0, x: -15, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              <StudentHomeWithFeatures
                userId={userId}
                menu={menu}
                onLogout={handleLogout}
                onSelectBranch={(id) => {
                  if (branchPaused) {
                    toast.error('Ordering is temporarily paused');
                    return;
                  }
                  setBranch(id);
                  setActiveTab('menu');
                }}
              />
            </motion.div>
          )}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              className="h-full w-full"
              initial={{ opacity: 0, x: 15, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              <MenuScreen menu={menu} onAddToCart={addToCart} onBack={() => setActiveTab('home')} branch={branch} cart={cart} onGoToCart={() => setActiveTab('cart')} />
            </motion.div>
          )}
          {activeTab === 'cart' && (
            <motion.div
              key="cart"
              className="h-full w-full"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              <CartScreen
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onPlaceOrder={placeOrder}
                total={cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                isPlacingOrder={isPlacingOrder}
              />
            </motion.div>
          )}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              className="h-full w-full"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              <OrdersScreen
                orders={orders}
                onCancelOrder={(id) => {
                  const order = orders.find(o => o.id === id);
                  if (order) {
                    const refundAmount = calculateRefundAmount(order, 'user');
                    handleUpdateOrder(id, {
                      status: 'cancelled',
                      refundRequest: {
                        reason: 'Cancelled by user',
                        status: 'pending',
                        requestedAt: Date.now(),
                        refundAmount,
                        cancelledBy: 'user'
                      }
                    });
                    if (refundAmount > 0) {
                      toast.info(`Refund of ₹${refundAmount} will be processed after approval`);
                    } else {
                      toast.info('Order cancelled. No refundable items.');
                    }
                  }
                }}
                onRequestRefund={(id, reason) => {
                  const order = orders.find(o => o.id === id);
                  if (order && order.refundRequest) {
                    handleUpdateOrder(id, {
                      refundRequest: {
                        ...order.refundRequest,
                        reason
                      }
                    });
                  }
                }}
                onSubmitFeedback={(id, feedback) => handleUpdateOrder(id, { feedback })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} cartCount={cart.length} />
    </Layout>
  );
}