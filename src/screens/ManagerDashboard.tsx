import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Settings, Receipt, History, Plus, Edit, Star, Check, X, TrendingUp, DollarSign, Package, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { MenuItem, Order } from '../utils/types';
import { toast } from 'sonner@2.0.3';
import { ChillyLogo } from '../components/ChillyLogo';

interface ManagerDashboardProps {
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onLogout: () => void;
}

export const ManagerDashboard = ({ orders, menu, onUpdateOrder, onLogout }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'refunds' | 'logs'>('analytics');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Burgers',
    description: '',
    isRefundable: false,
    image: '',
  });

  // Analytics Logic
  const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const refundRequests = orders.filter(o => o.refundRequest?.status === 'pending');
  
  // Enhanced Analytics
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected').reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  
  // Best seller logic
  const itemCounts: Record<string, number> = {};
  validOrders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity; }));
  const bestSeller = Object.entries(itemCounts).sort((a,b) => b[1] - a[1])[0];
  
  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  validOrders.forEach(o => o.items.forEach(i => {
    categoryRevenue[i.category] = (categoryRevenue[i.category] || 0) + (i.price * i.quantity);
  }));
  const topCategory = Object.entries(categoryRevenue).sort((a,b) => b[1] - a[1])[0];

  const handleRefundAction = (orderId: string, action: 'approved' | 'rejected') => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      onUpdateOrder(orderId, {
         refundRequest: { 
            reason: order.refundRequest?.reason || '', 
            status: action, 
            requestedAt: order.refundRequest?.requestedAt || 0,
            refundAmount: order.refundRequest?.refundAmount,
            cancelledBy: order.refundRequest?.cancelledBy
         }
      });
      toast.success(`Refund ${action}! ${action === 'approved' ? `₹${order.refundRequest?.refundAmount} will be added to user wallet` : ''}`);
  };

  const toggleMenuAvailability = (item: MenuItem) => {
     // In a real app, this would call an API update
     toast.success(`${item.name} is now ${!item.available ? 'Available' : 'Sold Out'}`);
  };

  const tabs = [
    { id: 'analytics', label: 'Overview', icon: BarChart3 },
    { id: 'menu', label: 'Menu', icon: Package },
    { id: 'refunds', label: 'Refunds', icon: Receipt, count: refundRequests.length },
    { id: 'logs', label: 'Logs', icon: History },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
             <ChillyLogo className="h-12" />
             <div className="h-8 w-px bg-white/10 mx-2" />
             <div>
                <h1 className="text-xl font-brand text-[#FF7A2F] tracking-wide">Manager</h1>
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Control Panel</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-gradient-to-br from-[#FF7A2F] to-[#D05A15] rounded-full flex items-center justify-center shadow-lg shadow-orange-900/20">
               <BarChart3 size={20} className="text-white" />
             </div>
             <button 
                onClick={onLogout}
                className="h-10 w-10 bg-[#333] hover:bg-red-500/20 hover:text-red-500 text-stone-400 rounded-full flex items-center justify-center transition-colors border border-stone-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
           </div>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                  : 'bg-[#2A2A2A] text-stone-400 border-white/5 hover:bg-[#333]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-[#FF7A2F] text-white text-[10px] px-1.5 h-4 flex items-center justify-center rounded-full ml-1">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#252525] p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={40} />
                     </div>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Revenue</p>
                     <h3 className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
                     <span className="text-[10px] text-green-400 flex items-center gap-1 mt-1 font-bold"><TrendingUp size={10} /> +12% today</span>
                  </div>
                  <div className="bg-[#252525] p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={40} />
                     </div>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Orders</p>
                     <h3 className="text-2xl font-black text-white">{totalOrders}</h3>
                     <span className="text-[10px] text-stone-500 mt-1 font-bold">Total processed</span>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-[#FF7A2F] to-[#C05010] p-5 rounded-2xl text-white shadow-xl shadow-orange-900/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                       <Star size={14} fill="currentColor" />
                       <span className="text-xs font-bold uppercase tracking-widest">Best Seller</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-1">{bestSeller ? bestSeller[0] : 'No Data'}</h3>
                    <p className="text-white/70 text-sm font-medium">{bestSeller ? `${bestSeller[1]} orders this week` : 'Waiting for orders...'}</p>
                  </div>
                  <Star size={120} className="absolute -bottom-4 -right-4 text-black/10 rotate-12" />
               </div>

               <div className="bg-[#252525] rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                     <BarChart3 size={20} className="text-stone-500" />
                  </div>
                  <p className="text-stone-400 text-sm font-medium">Detailed charts available on desktop</p>
               </div>
            </motion.div>
          )}

          {/* MENU TAB */}
          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
               <div className="flex justify-between items-center bg-[#252525] p-3 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-stone-300">Management Mode</span>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddItem(true)}
                    className="h-8 text-xs bg-[#3F8A4F] hover:bg-[#357542] border-none"
                  >
                    <Plus size={14} className="mr-1" /> Add Item
                  </Button>
               </div>

               <div className="space-y-2">
                 {menu.map(item => (
                   <div key={item.id} className="bg-[#252525] p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                      <div className="h-12 w-12 bg-black/30 rounded-lg flex items-center justify-center text-xl shrink-0">
                         {item.category === 'burger' ? '🍔' : item.category === 'drink' ? '🥤' : '🍟'}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                           <h4 className="font-bold text-sm text-white truncate pr-2">{item.name}</h4>
                           <span className="text-xs font-mono text-[#FF7A2F]">₹{item.price}</span>
                         </div>
                         <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {item.available ? 'In Stock' : 'Sold Out'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.isRefundable ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                              {item.isRefundable ? '💰 Refundable' : '🔒 Non-Refundable'}
                            </span>
                            <button 
                              onClick={() => toggleMenuAvailability(item)}
                              className="text-xs font-bold text-stone-500 hover:text-white underline decoration-stone-700"
                            >
                              Toggle
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* REFUNDS TAB */}
          {activeTab === 'refunds' && (
            <motion.div 
              key="refunds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
               {refundRequests.length === 0 ? (
                 <div className="text-center py-20 text-stone-500">
                    <Receipt size={40} className="mx-auto mb-4 opacity-20" />
                    <p>No pending refund requests</p>
                 </div>
               ) : (
                 refundRequests.map(order => (
                   <div key={order.id} className="bg-[#252525] p-4 rounded-xl border border-l-4 border-l-orange-500 border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[#FF7A2F]">#{order.token}</span>
                        <span className="text-xs font-mono text-stone-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="mb-4">
                         <p className="text-sm text-stone-300">Reason: <span className="text-white italic">"{order.refundRequest?.reason}"</span></p>
                         <p className="text-xs text-stone-500 mt-1">Amount: ₹{order.totalAmount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleRefundAction(order.id, 'rejected')} 
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white border-transparent text-xs h-9"
                        >
                          Reject
                        </Button>
                        <Button 
                          onClick={() => handleRefundAction(order.id, 'approved')} 
                          className="flex-1 bg-[#FF7A2F] hover:bg-[#E06925] border-transparent text-xs h-9"
                        >
                          Approve Refund
                        </Button>
                      </div>
                   </div>
                 ))
               )}
            </motion.div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
             <motion.div 
               key="logs"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-2"
             >
                {orders.slice().reverse().map(order => (
                  <div key={order.id} className="bg-[#252525] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                            order.status === 'completed' || order.status === 'picked_up' ? 'bg-[#3F8A4F]' :
                            order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-500' :
                            'bg-blue-500'
                        }`} />
                        <div>
                           <p className="text-sm font-bold text-white">#{order.token}</p>
                           <p className="text-[10px] text-stone-500">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                     </div>
                     <span className="text-xs font-mono text-stone-400 font-medium capitalize">{order.status.replace('_', ' ')}</span>
                  </div>
                ))}
             </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
              onClick={() => setShowAddItem(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1E1E1E] rounded-t-3xl border-t border-white/10 max-h-[85vh] flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-white/5 flex-shrink-0">
                <h3 className="text-xl font-bold text-white font-brand text-[#FF7A2F]">Add New Menu Item</h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Item Name */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">ITEM NAME</label>
                  <Input
                    placeholder="e.g. Spicy Paneer Burger"
                    className="bg-black/20 text-white border-white/10"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">PRICE (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 120"
                    className="bg-black/20 text-white border-white/10"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">CATEGORY</label>
                  <select
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#FF7A2F]"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Croissants">Croissants</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">DESCRIPTION</label>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm min-h-[80px] outline-none focus:border-[#FF7A2F]"
                    placeholder="Brief description of the item..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">FOOD IMAGE</label>
                  
                  {/* Image Upload Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewItem({ ...newItem, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg text-center text-xs font-bold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2">
                        📱 Upload from Gallery
                      </div>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) setNewItem({ ...newItem, image: url });
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg text-center text-xs font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                    >
                      🔗 Paste URL
                    </button>
                  </div>
                  
                  <p className="text-white/40 text-xs mb-2">💡 Upload from your device or paste an image URL</p>
                  
                  {/* Image Preview */}
                  {newItem.image && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border-2 border-[#FF7A2F]/50 shadow-xl">
                      <img 
                        src={newItem.image} 
                        alt="Preview" 
                        className="w-full h-40 object-cover"
                        onError={() => {
                          toast.error('Failed to load image');
                          setNewItem({ ...newItem, image: '' });
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                          ✓ Image Ready
                        </span>
                        <button
                          onClick={() => setNewItem({ ...newItem, image: '' })}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Refundable Toggle */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm mb-1">Refundable Item?</p>
                      <p className="text-white/60 text-xs">Can customers get refund if they cancel?</p>
                    </div>
                    <button
                      onClick={() => setNewItem({ ...newItem, isRefundable: !newItem.isRefundable })}
                      className={`w-14 h-7 rounded-full transition-colors relative ${
                        newItem.isRefundable ? 'bg-[#FF7A2F]' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          newItem.isRefundable ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={() => {
                    if (!newItem.name || !newItem.price) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    toast.success('Menu item added successfully!');
                    setNewItem({ name: '', price: '', category: 'Burgers', description: '', isRefundable: false, image: '' });
                    setShowAddItem(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#FF7A2F] to-[#E06925] py-6 text-base font-bold"
                >
                  <Plus size={18} className="mr-2" /> Add to Menu
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};