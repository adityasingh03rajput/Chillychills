import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Settings, Receipt, History, Plus, Edit, Star, Check, X, TrendingUp, DollarSign, Package, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { MenuItem, Order } from '../utils/types';
import { toast } from 'sonner';
import { ChillyLogo } from '../components/ChillyLogo';

interface ManagerDashboardProps {
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onUpdateMenu?: (menu: MenuItem[]) => Promise<void>;
  onAddMenuItem?: (item: Partial<MenuItem>) => Promise<void>;
  onUpdateMenuItem?: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  branchPaused?: boolean;
  onToggleBranchPause?: () => void;
  onLogout: () => void;
}

export const ManagerDashboard = ({
  orders,
  menu,
  onUpdateOrder,
  onUpdateMenu,
  onAddMenuItem,
  onUpdateMenuItem,
  branchPaused,
  onToggleBranchPause,
  onLogout
}: ManagerDashboardProps) => {
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
    branch: 'All', // Default to all branches
  });
  const [branchFilter, setBranchFilter] = useState<'All' | 'A' | 'B' | 'C'>('All');

  // Handle Android back button to close modal
  useEffect(() => {
    const handleBackButton = (e: any) => {
      if (showAddItem) {
        e.preventDefault();
        setShowAddItem(false);
      }
    };

    if (showAddItem) {
      document.addEventListener('backbutton', handleBackButton);
      return () => document.removeEventListener('backbutton', handleBackButton);
    }
  }, [showAddItem]);

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
  const bestSeller = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];

  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  validOrders.forEach(o => o.items.forEach(i => {
    categoryRevenue[i.category] = (categoryRevenue[i.category] || 0) + (i.price * i.quantity);
  }));
  const topCategory = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])[0];

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
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2 tap-highlight-none relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border relative active-shrink ${activeTab === tab.id
                ? 'text-black border-transparent'
                : 'bg-[#2A2A2A] text-stone-400 border-white/5 hover:bg-[#333]'
                }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="manager-tab-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-lg shadow-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={14} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 h-4 flex items-center justify-center rounded-full ml-1 ${activeTab === tab.id ? 'bg-black text-white' : 'bg-[#FF7A2F] text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar smooth-scroll">
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
              <div className="flex flex-col gap-3 bg-[#252525] p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-300">Management Mode</span>
                  <Button
                    size="sm"
                    onClick={() => setShowAddItem(true)}
                    className="h-9 px-4 text-xs bg-[#3F8A4F] hover:bg-[#357542] border-none android-ripple active-shrink tap-highlight-none"
                  >
                    <Plus size={14} className="mr-1" /> Add Item
                  </Button>
                </div>

                {/* Branch Filter for Menu */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['All', 'A', 'B', 'C'].map(b => (
                    <button
                      key={b}
                      onClick={() => setBranchFilter(b as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${branchFilter === b
                        ? 'bg-[#FF7A2F] border-[#FF7A2F] text-white'
                        : 'bg-white/5 border-white/10 text-stone-400'
                        }`}
                    >
                      Branch {b}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                {menu
                  .filter(item => branchFilter === 'All' || item.branch === branchFilter || item.branch === 'All')
                  .map(item => (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        show: { opacity: 1, x: 0 }
                      }}
                      className="bg-[#252525] p-3 rounded-xl border border-white/5 flex gap-3 items-center active-shrink android-ripple"
                    >
                      <div className="h-12 w-12 bg-black/30 rounded-lg flex items-center justify-center text-xl shrink-0">
                        {item.category === 'Burgers' ? '🍔' : item.category === 'Drinks' ? '🥤' : item.category === 'Snacks' ? '🍟' : item.category === 'Croissants' ? '🥐' : '🍰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 truncate">
                            <h4 className="font-bold text-sm text-white truncate font-brand">{item.name}</h4>
                            <span className="text-[9px] bg-white/10 text-white/40 px-1 rounded border border-white/5 uppercase font-black">BR: {item.branch}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#FF7A2F]">₹{item.price}</span>
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
                            className="text-xs font-bold text-stone-500 hover:text-white underline decoration-stone-700 ml-auto"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
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
                    <div className="flex gap-2 font-bold uppercase tracking-tight">
                      <Button
                        onClick={() => handleRefundAction(order.id, 'rejected')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white border-transparent text-[11px] h-10 android-ripple active-shrink tap-highlight-none"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleRefundAction(order.id, 'approved')}
                        className="flex-1 bg-[#FF7A2F] hover:bg-[#E06925] border-transparent text-[11px] h-10 android-ripple active-shrink tap-highlight-none"
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
                    <div className={`h-2 w-2 rounded-full ${order.status === 'completed' || order.status === 'picked_up' ? 'bg-[#3F8A4F]' :
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
              className="fixed inset-0 z-[60] bg-[#1E1E1E] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] ios-safe-area"
            >
              <div className="p-4 flex justify-between items-center border-b border-white/5 flex-shrink-0">
                <h3 className="text-xl font-bold text-white font-brand text-[#FF7A2F]">Add New Menu Item</h3>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors active-shrink tap-highlight-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pt-4 overflow-y-auto flex-1 space-y-6 pb-28 custom-scrollbar smooth-scroll">
                {/* Item Name */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Item Name <span className="text-red-400">*</span></label>
                  <Input
                    placeholder="e.g. Spicy Paneer Burger"
                    className="bg-black/20 text-white border-white/10 h-12 text-base focus:border-[#FF7A2F] focus:ring-2 focus:ring-[#FF7A2F]/20"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Price (₹) <span className="text-red-400">*</span></label>
                  <Input
                    type="number"
                    placeholder="e.g. 120"
                    className="bg-black/20 text-white border-white/10 h-12 text-base focus:border-[#FF7A2F] focus:ring-2 focus:ring-[#FF7A2F]/20"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Category</label>
                  <div className="relative">
                    <select
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3.5 text-white text-base outline-none focus:border-[#FF7A2F] focus:ring-2 focus:ring-[#FF7A2F]/20 custom-scrollbar appearance-none cursor-pointer"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                      <option value="Burgers">🍔 Burgers</option>
                      <option value="Drinks">🥤 Drinks</option>
                      <option value="Snacks">🍟 Snacks</option>
                      <option value="Desserts">🍰 Desserts</option>
                      <option value="Croissants">🥐 Croissants</option>
                      <option value="Pizza">🍕 Pizza</option>
                      <option value="Sandwiches">🥪 Sandwiches</option>
                      <option value="Salads">🥗 Salads</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Description <span className="text-red-400">*</span></label>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3.5 text-white text-base min-h-[100px] max-h-[150px] outline-none focus:border-[#FF7A2F] focus:ring-2 focus:ring-[#FF7A2F]/20 resize-y"
                    placeholder="Brief description of the item..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <p className="text-xs text-white/40 mt-1">{newItem.description.length}/200 characters</p>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Assign Branch</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['All', 'A', 'B', 'C'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setNewItem({ ...newItem, branch: b })}
                        className={`py-3.5 rounded-xl text-sm font-black transition-all border-2 active-shrink tap-highlight-none ${newItem.branch === b
                          ? 'bg-[#FF7A2F] border-[#FF7A2F] text-white shadow-lg shadow-orange-900/20 scale-105'
                          : 'bg-black/20 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">Food Image <span className="text-red-400">*</span></label>

                  {/* Image Upload Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <label className="cursor-pointer android-ripple active-shrink tap-highlight-none min-h-[60px]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden pointer-events-none"
                        style={{ display: 'none', visibility: 'hidden', position: 'absolute' }}
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
                      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-300 border-2 border-blue-500/30 p-4 rounded-xl text-center text-sm font-bold transition-all flex flex-col items-center justify-center gap-2 h-full min-h-[60px] hover:border-blue-500/50">
                        <span className="text-2xl">📱</span>
                        Upload from Gallery
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) setNewItem({ ...newItem, image: url });
                      }}
                      className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-300 border-2 border-purple-500/30 p-4 rounded-xl text-center text-sm font-bold android-ripple active-shrink tap-highlight-none transition-all flex flex-col items-center justify-center gap-2 min-h-[60px] hover:border-purple-500/50"
                    >
                      <span className="text-2xl">🔗</span>
                      Paste URL
                    </button>
                  </div>

                  <p className="text-white/40 text-xs text-center mb-3 italic">💡 Choose a clean photo to make your menu stand out</p>

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
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-bold text-base mb-1">Refundable Item?</p>
                      <p className="text-white/60 text-sm">Can customers get refund if they cancel?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, isRefundable: !newItem.isRefundable })}
                      className={`w-16 h-8 rounded-full transition-all relative flex-shrink-0 ${newItem.isRefundable ? 'bg-[#FF7A2F]' : 'bg-white/20'
                        }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-lg ${newItem.isRefundable ? 'translate-x-9' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Footer with Submit Button */}
              <div className="p-4 pt-3 border-t border-white/10 bg-[#1E1E1E] mt-auto">
                <Button
                  onClick={() => {
                    // Validate all required fields
                    if (!newItem.name || !newItem.name.trim()) {
                      toast.error('Please enter an item name');
                      return;
                    }
                    if (!newItem.price || newItem.price.trim() === '' || parseFloat(newItem.price) <= 0) {
                      toast.error('Please enter a valid price');
                      return;
                    }
                    if (!newItem.description || !newItem.description.trim()) {
                      toast.error('Please add a description');
                      return;
                    }
                    if (!newItem.image || !newItem.image.trim()) {
                      toast.error('Please add a food image');
                      return;
                    }

                    // All validation passed
                    toast.success(`${newItem.name} added to menu!`);
                    if (onAddMenuItem) onAddMenuItem(newItem as any);
                    // Reset form
                    setNewItem({ name: '', price: '', category: 'Burgers', description: '', isRefundable: false, image: '', branch: 'All' });
                    setShowAddItem(false);
                  }}
                  className="w-full h-14 bg-gradient-to-r from-[#FF7A2F] to-[#E06925] border-none text-lg font-black shadow-xl shadow-orange-900/30 android-ripple active-shrink tap-highlight-none flex items-center justify-center"
                >
                  <Plus size={20} className="mr-2" strokeWidth={3} /> Add to Menu
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};