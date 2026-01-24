import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Receipt, Package, History, Plus, Star,
  TrendingUp, Wallet, ShoppingBag, LogOut, ChevronRight,
  ShieldCheck, ArrowUpRight, ArrowDownRight, Coffee, XCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MenuItem, Order } from '../utils/types';
import { toast } from 'sonner';
import { ChillyLogo } from '../components/ChillyLogo';

interface ManagerDashboardProps {
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onLogout: () => void;
}

export const ManagerDashboard = ({ orders, menu, onUpdateOrder, onLogout }: ManagerDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'refunds' | 'logs'>('analytics');

  // Stats Logic
  const validOrders = orders.filter(o => !['cancelled', 'rejected'].includes(o.status));
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRefunds = orders.filter(o => o.refundRequest?.status === 'pending');

  const tabs = [
    { id: 'analytics', label: 'Hub', icon: BarChart3 },
    { id: 'menu', label: 'Vault', icon: Coffee },
    { id: 'refunds', label: 'Claims', icon: Receipt, badge: pendingRefunds.length },
    { id: 'logs', label: 'Audit', icon: History },
  ];

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
    <div className="h-full flex flex-col bg-[var(--bg-primary)] px-4 sm:px-6 pt-6 sm:pt-10 pb-6 overflow-hidden">

      {/* Prime Header */}
      <div className="flex justify-between items-center mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--accent-orange)]/10 flex items-center justify-center p-1.5 sm:p-2 border border-[var(--accent-orange)]/20 shadow-lg shadow-orange-500/10 shrink-0">
            <ChillyLogo withFrame={false} className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-1 truncate">C7 Manager</h1>
            <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 leading-none">System Admin</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/5 text-red-500 border-red-500/20 p-0 shadow-sm shrink-0">
          <LogOut className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Dynamic Tab Bridge */}
      <div className="premium-glass p-1 rounded-2xl sm:rounded-[2rem] mb-8 sm:mb-10 flex gap-1 border border-[var(--border-color)] shadow-xl relative z-10 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 sm:py-4 rounded-xl sm:rounded-3xl transition-all relative overflow-hidden ${activeTab === tab.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'}`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="manager-tab-bg"
                className="absolute inset-0 bg-[var(--bg-primary)] shadow-md rounded-xl sm:rounded-3xl border border-[var(--border-color)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <div className="relative flex flex-col items-center gap-1">
              <tab.icon strokeWidth={3} className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${activeTab === tab.id ? 'text-[var(--accent-orange)]' : ''}`} />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none mt-1">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-red-500 text-white text-[7px] sm:text-[8px] font-black w-3.5 sm:h-4 sm:w-4 h-3.5 flex items-center justify-center rounded-full shadow-lg ${activeTab === tab.id ? 'scale-110' : ''}`}>
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Surface Volume Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar smooth-scroll space-y-6 sm:space-y-8 pb-32">
        <AnimatePresence mode="wait">

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-[var(--card-bg)] p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group">
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2 leading-none">Total Yield</p>
                  <h3 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter">₹{totalRevenue.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 text-[var(--accent-green)] mt-3">
                    <ArrowUpRight strokeWidth={3} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase">Growth</span>
                  </div>
                </div>
                <div className="bg-[var(--card-bg)] p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group">
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2 leading-none">Total Volume</p>
                  <h3 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter">{validOrders.length}</h3>
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)] mt-3 text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Success</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--accent-orange)] to-rose-600 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 opacity-70">
                    <Star fill="currentColor" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Peak Performance</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black leading-none mb-1 sm:mb-2 uppercase tracking-tight">Paneer Hub</h3>
                  <p className="text-white/60 text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none">128 Session Orders</p>
                </div>
                <Star size={100} className="absolute -bottom-4 -right-4 text-black/10 rotate-12 transition-transform duration-1000" />
              </div>

              <div className="bg-[var(--input-bg)] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] text-center border-dashed">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--text-muted)] opacity-30 mx-auto mb-3 sm:mb-4" />
                <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 leading-none">Status</p>
                <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em] opacity-60">Systems Optimal</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center mb-6 sm:mb-8 px-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1">Vault Inventory</h2>
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Campus Offerings</p>
                </div>
                <Button className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl p-0 shadow-xl shadow-orange-500/20">
                  <Plus strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>

              <div className="grid gap-3 sm:gap-5">
                {menu.map(item => (
                  <div key={item.id} className="bg-[var(--card-bg)] p-3 sm:p-5 rounded-[1.8rem] sm:rounded-[2.5rem] border border-[var(--border-color)] flex items-center justify-between shadow-lg active:scale-[0.98]">
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl bg-[var(--input-bg)] flex items-center justify-center text-2xl sm:text-3xl border border-[var(--border-color)] shrink-0">
                        {item.category === 'Burgers' ? '🍔' : item.category === 'Drinks' ? '🥤' : '🍟'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[var(--text-primary)] text-sm sm:text-lg mb-0.5 sm:mb-1 uppercase tracking-tight leading-none truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${item.available ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {item.available ? 'Active' : 'Out'}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-orange)] uppercase tracking-widest font-mono">₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-color)] shadow-inner shrink-0">
                      <ChevronRight strokeWidth={3} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'refunds' && (
            <motion.div key="refunds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-5">
              {pendingRefunds.length === 0 ? (
                <div className="text-center py-20 sm:py-24 px-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--input-bg)] flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)]">
                    <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--text-muted)] opacity-30" />
                  </div>
                  <p className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-2 leading-none">No Claims</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60">The refund queue is currently clear.</p>
                </div>
              ) : (
                pendingRefunds.map(order => (
                  <div key={order.id} className="bg-[var(--card-bg)] p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-color)] shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-5 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-1 h-5 sm:w-1.5 sm:h-6 bg-[var(--accent-orange)] rounded-full" />
                        <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight font-brand">#{order.token}</span>
                      </div>
                      <span className="text-base sm:text-xl font-black text-[var(--accent-orange)] font-mono">₹{order.totalAmount}</span>
                    </div>
                    <div className="bg-[var(--input-bg)] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] mb-6 sm:mb-8 border border-[var(--border-color)] border-dashed">
                      <p className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 leading-none">Claim Reason</p>
                      <p className="text-[11px] sm:text-sm font-medium text-[var(--text-secondary)] italic leading-relaxed opacity-80">" {order.refundRequest?.reason} "</p>
                    </div>
                    <div className="flex gap-2 sm:gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl uppercase tracking-widest text-[8px] sm:text-[10px] text-red-500 border-red-500/10 bg-red-500/5 shadow-sm"
                        onClick={() => handleRefundAction(order.id, 'rejected')}
                      >
                        Void
                      </Button>
                      <Button
                        className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl uppercase tracking-widest text-[8px] sm:text-[10px] shadow-lg shadow-orange-500/20"
                        onClick={() => handleRefundAction(order.id, 'approved')}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 sm:space-y-4">
              <div className="mb-4 sm:mb-6 px-1">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1">Audit Trail</h2>
                <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Transaction Logs</p>
              </div>
              {orders.slice().reverse().map(order => (
                <div key={order.id} className="bg-[var(--card-bg)] p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-color)] flex items-center justify-between group active:scale-[0.99] transition-all">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${order.status === 'completed' || order.status === 'picked_up' ? 'bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]' : 'bg-blue-500 shadow-[0_0_8px_rgb(59,130,246)]'}`} />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-black text-[var(--text-primary)] tracking-tighter uppercase font-brand truncate">#{order.token}</p>
                      <p className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 leading-none">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] sm:text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest leading-none font-mono">₹{order.totalAmount}</p>
                    <span className="text-[7px] sm:text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-30 mt-1 block">SECURED</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};