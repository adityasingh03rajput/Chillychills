import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Receipt, Package, History, Plus, Star,
  TrendingUp, Wallet, ShoppingBag, LogOut, ChevronRight,
  ShieldCheck, ArrowUpRight, ArrowDownRight, Coffee, XCircle, CheckCircle2, DollarSign, Activity, X, Gift, Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MenuItem, Order } from '../utils/types';
import { toast } from 'sonner';
import { ChillyLogo } from '../components/ChillyLogo';
import { FinanceDashboard } from '../components/FinanceDashboard';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { api } from '../utils/api';

interface ManagerDashboardProps {
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onUpdateMenu: (id: string, updates: Partial<MenuItem>) => void;
  onAddMenu: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onRefreshMenu?: () => void;
  onLogout: () => void;
}

export const ManagerDashboard = ({ orders, menu, onUpdateOrder, onUpdateMenu, onAddMenu, onRefreshMenu, onLogout }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'refunds' | 'gifts' | 'users' | 'logs'>('analytics');
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showFinanceDashboard, setShowFinanceDashboard] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Add Menu Modal State
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: 'Burgers',
    description: '',
    available: true,
    branch: 'All',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isRefundable: false
  });

  // Edit Menu Modal State
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Stats Logic
  const validOrders = orders.filter(o => !['cancelled', 'rejected'].includes(o.status));
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRefunds = orders.filter(o => o.refundRequest?.status === 'pending');

  const tabs = [
    { id: 'analytics', label: 'Hub', icon: BarChart3 },
    { id: 'menu', label: 'Vault', icon: Package },
    { id: 'refunds', label: 'Flow', icon: Receipt, badge: pendingRefunds.length },
    { id: 'gifts', label: 'Gifts', icon: Gift },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'logs', label: 'Scan', icon: History },
  ];

  React.useEffect(() => {
    if (activeTab === 'gifts') {
      api.getGiftCardRegistry().then(setGiftCards).catch(() => toast.error('Registry Sync Failed'));
    }
    if (activeTab === 'users') {
      api.getUsers().then(setAllUsers).catch(() => toast.error('Node Sync Failed'));
    }
  }, [activeTab]);

  const handleRefundAction = async (orderId: string, action: 'approved' | 'rejected') => {
    try {
      await onUpdateOrder(orderId, {
        refundRequest: {
          ...orders.find(o => o.id === orderId)?.refundRequest!,
          status: action,
          resolvedAt: Date.now()
        }
      });
      toast.success(action === 'approved' ? 'Capital Reclaimed' : 'Claim Rejected');
    } catch (e) {
      toast.error('Sync failed');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden pt-safe px-6">

      {/* 56dp Prime Header */}
      <div className="flex justify-between items-center h-[64px] mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center p-2 shadow-lg">
            <ChillyLogo withFrame={false} className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">C7 Admin</h1>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1.5 leading-none">Elite Authority</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 active:scale-90 transition-all">
          <LogOut size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 56dp Height Tab Bridge (Material Inspired) */}
      <div className="h-[56px] p-1 bg-stone-900 rounded-xl mb-10 flex gap-1 border border-white/5 shadow-2xl shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all relative overflow-hidden ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/30'}`}
          >
            <div className="relative flex flex-col items-center gap-0.5">
              <tab.icon size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[8px] font-black min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-black animate-bounce">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Surface Logic Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-32">
        <AnimatePresence mode="wait">

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900 p-6 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg">
                  <p className="text-[12px] font-black text-white/20 uppercase tracking-widest leading-none">Net Yield</p>
                  <h3 className="text-[28px] font-black text-white tracking-tighter tabular-nums leading-none">₹{totalRevenue.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 text-[var(--accent-green)] mt-2">
                    <ArrowUpRight size={12} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Optimal Flow</span>
                  </div>
                </div>
                <div className="bg-stone-900 p-6 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg">
                  <p className="text-[12px] font-black text-white/20 uppercase tracking-widest leading-none">Total Mass</p>
                  <h3 className="text-[28px] font-black text-white tracking-tighter tabular-nums leading-none">{validOrders.length}</h3>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2 leading-none">Captured</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setShowFinanceDashboard(true)}
                  className="bg-emerald-600 h-[64px] rounded-xl flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <DollarSign size={20} className="text-white" strokeWidth={3} />
                    <span className="text-[14px] font-black text-white uppercase tracking-widest">Financial Ledger</span>
                  </div>
                  <ChevronRight size={24} className="text-white/40 group-hover:text-white" />
                </button>

                <button
                  onClick={() => setShowAnalyticsDashboard(true)}
                  className="bg-indigo-600 h-[64px] rounded-xl flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <Activity size={20} className="text-white" strokeWidth={3} />
                    <span className="text-[14px] font-black text-white uppercase tracking-widest">Operational Hub</span>
                  </div>
                  <ChevronRight size={24} className="text-white/40 group-hover:text-white" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-[var(--accent-orange)] to-rose-600 p-8 rounded-xl text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3 opacity-60">
                    <Star fill="currentColor" size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sector Alert</span>
                  </div>
                  <h3 className="text-[32px] font-black leading-none mb-2 uppercase tracking-tight">Prime Node</h3>
                  <p className="text-white/60 text-[12px] font-black uppercase tracking-widest leading-none">Paneer Delight Matrix</p>
                </div>
                <Star size={100} className="absolute -bottom-4 -right-4 text-black/10 rotate-12" />
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-[20px] font-black text-white uppercase tracking-tight">Vault Inventory</h2>
                  <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-1">Campus Assets</p>
                </div>
                <button onClick={() => setShowAddMenu(true)} className="w-[56px] h-[56px] bg-white text-black rounded-xl flex items-center justify-center shadow-xl active:scale-90 transition-all font-black text-2xl">
                  +
                </button>
              </div>

              <div className="grid gap-4">
                {menu.map(item => (
                  <div key={item.id} className="bg-stone-900 p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-lg active:bg-stone-800 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-black border border-white/10 flex items-center justify-center text-3xl">
                        {item.category === 'Burgers' ? '🍔' : item.category === 'Drinks' ? '🥤' : '🍟'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[16px] font-black text-white uppercase tracking-tight truncate leading-tight mb-1.5">{item.name}</h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onUpdateMenu(item.id, { available: !item.available })}
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${item.available ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20 shadow-lg shadow-green-500/5' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                          >
                            {item.available ? 'Active' : 'Offline'}
                          </button>
                          <span className="text-[16px] font-black text-[var(--accent-orange)] tabular-nums leading-none">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setEditingItem(item); setShowEditMenu(true); }} className="w-10 h-10 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center text-white/20 active:text-white transition-all">
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'refunds' && (
            <motion.div key="refunds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-[20px] font-black text-white uppercase tracking-tight">Credit Disputes</h2>
                <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-1">Pending Adjustments</p>
              </div>
              {pendingRefunds.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
                  <Receipt size={48} className="mb-4" />
                  <p className="text-[12px] font-black uppercase tracking-widest">Dispute Queue Empty</p>
                </div>
              ) : (
                pendingRefunds.map(order => (
                  <div key={order.id} className="bg-stone-900 p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <div>
                        <p className="text-[12px] font-black text-white/20 uppercase tracking-widest mb-1 leading-none">Receipt Token</p>
                        <h3 className="text-[24px] font-black text-white tracking-tighter">#{order.token}</h3>
                      </div>
                      <span className="text-[28px] font-black text-[var(--accent-orange)] tabular-nums leading-none">₹{order.totalAmount}</span>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg mb-8 border border-white/5 border-dashed">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 leading-none">Neural Justification</p>
                      <p className="text-[14px] font-medium text-white italic leading-relaxed opacity-60">"{order.refundRequest?.reason}"</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="danger"
                        className="flex-1 h-[56px] text-[12px] rounded-xl"
                        onClick={() => handleRefundAction(order.id, 'rejected')}
                      >
                        Void Dispute
                      </Button>
                      <Button
                        variant="white"
                        className="flex-1 h-[56px] text-[12px] rounded-xl"
                        onClick={() => handleRefundAction(order.id, 'approved')}
                      >
                        Restore Capital
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'gifts' && (
            <motion.div key="gifts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-[20px] font-black text-white uppercase tracking-tight">Transmission Registry</h2>
                <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-1">Global Gift Record</p>
              </div>
              {giftCards.length === 0 ? (
                <div className="bg-stone-900 p-8 rounded-xl text-center border border-white/5 opacity-20">
                  <Gift size={32} className="mx-auto mb-4" />
                  <p className="text-[12px] font-black uppercase tracking-widest">Registry Void</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {giftCards.map((card: any) => (
                    <div key={card._id} className="bg-stone-900 p-5 rounded-xl border border-white/5 shadow-lg relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1.5 leading-none">Access Code</span>
                          <h4 className="text-[18px] font-black text-white tracking-[0.1em] font-mono select-all">{card.code}</h4>
                        </div>
                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${card.isRedeemed ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'}`}>
                          {card.isRedeemed ? 'REDEEMED' : 'ACTIVE'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Recipient Node</span>
                          <span className="text-[12px] font-black text-[var(--accent-orange)] uppercase">{card.targetUserId}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Vault Value</span>
                          <span className="text-[16px] font-black text-white tabular-nums">₹{card.amount + card.bonus}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-[20px] font-black text-white uppercase tracking-tight">Terminal Nodes</h2>
                <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-1">Authorized User Registry</p>
              </div>
              <div className="grid gap-2">
                {allUsers.map((user: any) => (
                  <div key={user.id} className="h-[56px] bg-stone-900 px-5 rounded-xl border border-white/5 flex items-center justify-between group active:bg-stone-800 transition-all shadow-lg">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-white uppercase truncate leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-black text-[var(--accent-orange)] uppercase leading-none">{user.id}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-black text-[var(--accent-green)] tabular-nums leading-none">₹{user.balance}</p>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1 block">VAULT SYNCED</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-[20px] font-black text-white uppercase tracking-tight leading-none mb-1">Fiscal Audit</h2>
                <p className="text-[12px] font-black text-white/30 uppercase tracking-widest">Global Sequence Log</p>
              </div>
              <div className="grid gap-3">
                {orders.slice().reverse().map(order => (
                  <div key={order.id} className="bg-stone-900 h-[64px] px-5 rounded-xl border border-white/5 flex items-center justify-between group active:bg-stone-800 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${order.status === 'completed' || order.status === 'picked_up' ? 'bg-[var(--accent-green)] shadow-green-500/50' : 'bg-blue-500 shadow-blue-500/50 shadow-lg'}`} />
                      <div className="min-w-0">
                        <p className="text-[16px] font-black text-white tracking-tight uppercase truncate font-mono">#{order.token}</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5 leading-none">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[18px] font-black text-white tabular-nums leading-none">₹{order.totalAmount}</p>
                      <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em] mt-1 block">VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Fullscreen Modal Containers (OLED Absolute Black) */}
      <AnimatePresence>
        {showFinanceDashboard && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[100] bg-black">
            <FinanceDashboard onClose={() => setShowFinanceDashboard(false)} />
          </motion.div>
        )}
        {showAnalyticsDashboard && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[100] bg-black">
            <AnalyticsDashboard onClose={() => setShowAnalyticsDashboard(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Modals (24dp Rounding) */}
      <AnimatePresence>
        {(showAddMenu || showEditMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => { setShowAddMenu(false); setShowEditMenu(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-stone-900 rounded-[24px] p-8 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[20px] font-black text-white uppercase tracking-tight">{showAddMenu ? 'Add To Vault' : 'Edit Sector'}</h3>
                <button onClick={() => { setShowAddMenu(false); setShowEditMenu(false); }} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[12px] font-black text-white/20 uppercase mb-2 block">Identity Name</label>
                  <Input
                    placeholder="e.g. SPICE-GRID"
                    value={showAddMenu ? newItem.name : editingItem?.name}
                    onChange={e => showAddMenu ? setNewItem({ ...newItem, name: e.target.value }) : setEditingItem({ ...editingItem!, name: e.target.value })}
                    className="h-[56px] text-white bg-black border-white/5 rounded-xl font-black text-[14px] px-5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-black text-white/20 uppercase mb-2 block">Yield (₹)</label>
                    <Input
                      type="number"
                      value={showAddMenu ? newItem.price : editingItem?.price}
                      onChange={e => showAddMenu ? setNewItem({ ...newItem, price: Number(e.target.value) }) : setEditingItem({ ...editingItem!, price: Number(e.target.value) })}
                      className="h-[56px] text-white bg-black border-white/5 rounded-xl font-black text-[18px] px-5 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-black text-white/20 uppercase mb-2 block">Protocol</label>
                    <select
                      value={showAddMenu ? newItem.category : editingItem?.category}
                      onChange={e => showAddMenu ? setNewItem({ ...newItem, category: e.target.value }) : setEditingItem({ ...editingItem!, category: e.target.value })}
                      className="w-full h-[56px] rounded-xl bg-black border border-white/5 px-4 font-black text-[12px] text-white uppercase outline-none"
                    >
                      <option value="Burgers">Burgers</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between h-[56px] px-5 bg-black rounded-xl border border-white/5">
                  <span className="text-[12px] font-black text-white/40 uppercase">Refund Active</span>
                  <button
                    onClick={() => showAddMenu ? setNewItem({ ...newItem, isRefundable: !newItem.isRefundable }) : setEditingItem({ ...editingItem!, isRefundable: !editingItem!.isRefundable })}
                    className={`w-12 h-6 rounded-full transition-all relative ${(showAddMenu ? newItem.isRefundable : editingItem?.isRefundable) ? 'bg-[var(--accent-green)]' : 'bg-stone-800'}`}
                  >
                    <motion.div
                      animate={{ x: (showAddMenu ? newItem.isRefundable : editingItem?.isRefundable) ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <Button
                  variant="white"
                  size="xl"
                  className="w-full mt-4"
                  onClick={() => {
                    if (showAddMenu) {
                      if (!newItem.name || !newItem.price) { toast.error('Required Data Missing'); return; }
                      onAddMenu(newItem as any);
                      setShowAddMenu(false);
                    } else if (editingItem) {
                      onUpdateMenu(editingItem.id, editingItem);
                      setShowEditMenu(false);
                    }
                  }}
                >
                  Confirm Entry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};