import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, Ban, LogOut, ChevronRight, CheckCircle2, Play, Flame, Package, Utensils, X } from 'lucide-react';

interface StaffDashboardProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string, reason?: string) => void;
  onLogout: () => void;
}

export const StaffDashboard = ({ orders, onUpdateStatus, onLogout }: StaffDashboardProps) => {
  const [filter, setFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('All');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const activeOrders = orders
    .filter(o => !['completed', 'cancelled', 'picked_up', 'rejected'].includes(o.status))
    .sort((a, b) => a.createdAt - b.createdAt);

  const filteredOrders = activeOrders
    .filter(o => branchFilter === 'All' || o.branch === branchFilter)
    .filter(o => filter === 'all' ? true : o.status === filter);

  const counts = {
    all: activeOrders.length,
    placed: activeOrders.filter(o => o.status === 'placed').length,
    preparing: activeOrders.filter(o => o.status === 'preparing').length,
    ready: activeOrders.filter(o => o.status === 'ready').length,
  };

  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const handleStatusUpdate = async (id: string, status: string, reason?: string) => {
    if (updatingOrders.has(id)) return;
    if (window.navigator.vibrate) window.navigator.vibrate([10, 20]);
    setUpdatingOrders(prev => new Set(prev).add(id));
    onUpdateStatus(id, status, reason);
    setTimeout(() => {
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <div className="h-full flex flex-col bg-black px-6 pt-safe pb-6 overflow-hidden">

      {/* 56dp Header */}
      <div className="flex justify-between items-center h-[56px] mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] animate-pulse" />
            <h2 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">Kitchen Live</h2>
          </div>
          <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mt-2">{counts.all} Active Nodes</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-stone-900 border border-white/5 text-[10px] font-black uppercase tracking-widest px-4 h-[40px] rounded-lg text-white"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="All">All Wings</option>
              <option value="A">Burger St.</option>
              <option value="B">Drink Bar</option>
              <option value="C">East Wing</option>
            </select>
          </div>
          <button onClick={onLogout} className="w-[40px] h-[40px] rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* 56dp Height Tab Selector */}
      <div className="h-[56px] p-1 bg-stone-900 rounded-xl mb-8 flex gap-1 border border-white/5 shadow-2xl shrink-0">
        {[
          { id: 'all', label: 'Flow', icon: Utensils },
          { id: 'placed', label: 'New', icon: Flame },
          { id: 'preparing', label: 'Prep', icon: Clock },
          { id: 'ready', label: 'Ready', icon: Package }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all relative overflow-hidden ${filter === f.id ? 'bg-white text-black' : 'text-white/30'}`}
          >
            <div className="relative flex flex-col items-center gap-0.5">
              <f.icon size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{f.label}</span>
              {counts[f.id as keyof typeof counts] > 0 && (
                <span className={`absolute -top-2 -right-3 text-[8px] font-black min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-black ${filter === f.id ? 'bg-[var(--accent-orange)] text-white' : 'bg-black text-white/30'}`}>
                  {counts[f.id as keyof typeof counts]}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Order Stream (24dp Margin) */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-32">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredOrders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
              <CheckCircle2 size={48} className="mb-4 text-[var(--accent-green)]" />
              <p className="text-[12px] font-black uppercase tracking-widest">Kitchen Matrix Optimal</p>
            </motion.div>
          ) : (
            filteredOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-stone-900 rounded-xl border border-white/5 p-5 shadow-xl relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] rounded-full -mr-16 -mt-16 ${order.status === 'placed' ? 'bg-[var(--accent-orange)]' : order.status === 'preparing' ? 'bg-blue-600' : 'bg-[var(--accent-green)]'}`} />

                <div className="flex justify-between items-start mb-6 relative z-10 border-b border-dashed border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[28px] font-black text-white tracking-tighter uppercase leading-none">#{order.token}</h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${order.status === 'placed' ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/20' : order.status === 'preparing' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20'}`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black text-white/30 uppercase tracking-widest leading-none">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {order.scheduledTime && <p className="text-blue-500 text-[10px] font-black flex items-center justify-end gap-1 uppercase tracking-widest mt-1"><Clock size={10} /> {order.scheduledTime}</p>}
                  </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-black border border-white/5 flex items-center justify-center text-[14px] font-black text-[var(--accent-orange)] shrink-0">{item.quantity}</div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-black text-white uppercase tracking-tight truncate">{item.name}</p>
                          {item.notes && <p className="text-[12px] text-white/30 italic truncate leading-none mt-1">"{item.notes}"</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 relative z-10">
                  {rejectId === order.id ? (
                    <div className="w-full space-y-3">
                      <Input
                        autoFocus
                        placeholder="VOID REASON..."
                        className="h-[56px] rounded-xl bg-black border-white/5 text-[14px] font-black uppercase px-4 text-white"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button className="flex-1 h-[56px] rounded-xl font-black uppercase text-[12px] bg-red-600 text-white" onClick={() => { handleStatusUpdate(order.id, 'rejected', rejectReason); setRejectId(null); setRejectReason(''); }}>Confirm Void</button>
                        <button className="px-6 h-[56px] rounded-xl font-black uppercase text-[12px] bg-stone-800 text-white" onClick={() => setRejectId(null)}>Abort</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {order.status === 'placed' && (
                        <>
                          <button
                            className="w-[56px] h-[56px] rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0"
                            onClick={() => setRejectId(order.id)}
                          >
                            <Ban size={24} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="flex-1 h-[56px] rounded-xl bg-white text-black text-[14px] font-black uppercase tracking-widest shadow-xl shadow-white/10 active:scale-95 transition-all"
                          >
                            Initiate Prep
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="w-full h-[56px] bg-blue-600 text-white rounded-xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                          className="w-full h-[56px] bg-[var(--accent-green)] text-white rounded-xl text-[14px] font-black uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition-all"
                        >
                          Complete Serve
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
