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
import { ManagerDashboardComplete } from './screens/ManagerDashboardComplete';
import { Navbar } from './components/Navbar';
import { api } from './utils/api';
import { INITIAL_MENU } from './utils/initialData';
import { MenuItem, CartItem, Order, Feedback } from './utils/types';
import { Toaster, toast } from 'sonner@2.0.3';
import { supabase } from './utils/supabase/client';

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
      try {
        // Clear any invalid sessions first
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          // If there's an auth error (like unconfirmed email), clear the session
          if (error) {
            console.log('Auth session error, clearing:', error.message);
            await supabase.auth.signOut();
            setRole(null);
          } else if (session) {
            const userRole = session.user.user_metadata?.role || 'student';
            setRole(userRole);
            setUserId(session.user.id || 'user_123');
            if (userRole === 'student') setActiveTab('home');
          }
        } catch (authError: any) {
          console.log('Auth error during session check:', authError.message);
          // Clear any problematic session
          await supabase.auth.signOut().catch(() => {});
          setRole(null);
        }

        let menuData = [];
        try {
           menuData = await api.getMenu();
        } catch(e) { console.log('Menu fetch error', e); }

        if (!menuData || menuData.length === 0) {
          console.log('Seeding menu...');
          await api.seedMenu(INITIAL_MENU);
          menuData = INITIAL_MENU;
        }
        setMenu(menuData);
        
        const fetchOrders = async () => {
           try {
             const ordersData = await api.getOrders();
             if (ordersData) setOrders(ordersData);
           } catch(e) {}
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = (selectedRole: string) => {
    setRole(selectedRole);
    if (selectedRole === 'student') setActiveTab('home');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Sign out error:', e);
    }
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

  const placeOrder = async (orderDetails: any) => {
    if (cart.length === 0) return;
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
    } catch (e) {
      toast.error('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  // Generic Update Handler
  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
     try {
       const updated = await api.updateOrder(id, updates);
       setOrders(prev => prev.map(o => o.id === id ? updated : o));
       // Toast logic based on status
       if (updates.status) toast.info(`Order status updated to ${updates.status}`);
       if (updates.refundRequest) toast.info('Refund request updated');
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
           <ManagerDashboardComplete 
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
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
            >
              <StudentHomeWithFeatures userId={userId} menu={menu} onSelectBranch={(id) => { 
                if (branchPaused) {
                  toast.error('Ordering is temporarily paused');
                  return;
                }
                setBranch(id); 
                setActiveTab('menu'); 
              }} />
            </motion.div>
          )}
          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              className="h-full w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <MenuScreen menu={menu} onAddToCart={addToCart} onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
          {activeTab === 'cart' && (
            <motion.div 
              key="cart"
              className="h-full w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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