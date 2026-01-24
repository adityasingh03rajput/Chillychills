import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, Ban, LogOut, ChevronRight, CheckCircle2, Play, Flame, Package, Utensils } from 'lucide-react';

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
    // Prevent double-clicks
    if (updatingOrders.has(id)) return;

    // Instant haptic feedback
    if (window.navigator.vibrate) window.navigator.vibrate([10, 20]);

    // Mark as updating
    setUpdatingOrders(prev => new Set(prev).add(id));

    // Call parent async, but don't await - fire and forget for speed
    onUpdateStatus(id, status, reason);

    // Remove updating state after a short delay (simulate completion)
    setTimeout(() => {
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] px-4 sm:px-6 pt-6 sm:pt-10 pb-6 overflow-hidden">

      {/* Premium Dynamic Header */}
      <div className="flex justify-between items-start mb-6 sm:mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--accent-orange)] animate-pulse shadow-[0_0_8px_var(--accent-orange)]" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-[var(--text-primary)] uppercase leading-none">Kitchen Live</h2>
          </div>
          <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">Pulse • {counts.all} Active</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-[var(--card-bg)] border border-[var(--border-color)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none shadow-sm transition-all pr-8 sm:pr-10"
              value={branchFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBranchFilter(e.target.value)}
            >
              <option value="All">All Wings</option>
              <option value="A">Burger St.</option>
              <option value="B">Drink Bar</option>
              <option value="C">East Wing</option>
            </select>
            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)] pointer-events-none w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-500/5 text-red-500 border-red-500/20 p-0 shadow-sm">
            <LogOut className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Modern Tab Bar */}
      <div className="premium-glass p-1 rounded-2xl sm:rounded-[2rem] mb-6 sm:mb-8 flex gap-1 border border-[var(--border-color)] shadow-xl relative z-10 shrink-0">
        {[
          { id: 'all', label: 'Flow', icon: Utensils },
          { id: 'placed', label: 'New', icon: Flame },
          { id: 'preparing', label: 'Prep', icon: Clock },
          { id: 'ready', label: 'Ready', icon: Package }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => {
              if (window.navigator.vibrate) window.navigator.vibrate(5);
              setFilter(f.id);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] transition-all relative overflow-hidden ${filter === f.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'}`}
          >
            {filter === f.id && (
              <motion.div
                layoutId="staff-filter-bg"
                className="absolute inset-0 bg-[var(--bg-primary)] shadow-sm rounded-xl sm:rounded-[1.5rem] border border-[var(--border-color)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <div className="relative flex flex-col items-center gap-1">
              <f.icon strokeWidth={3} className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${filter === f.id ? 'text-[var(--accent-orange)]' : ''}`} />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mt-1">{f.label}</span>
              {counts[f.id as keyof typeof counts] > 0 && (
                <span className={`absolute -top-3 sm:-top-4 -right-3 sm:-right-4 text-[7px] sm:text-[8px] font-black p-1 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 flex items-center justify-center rounded-full ${filter === f.id ? 'bg-[var(--accent-orange)] text-white' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'}`}>
                  {counts[f.id as keyof typeof counts]}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Dynamic Orders Stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar smooth-scroll space-y-4 sm:space-y-5 pb-20">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredOrders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-20 px-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--input-bg)] flex items-center justify-center mb-6 border border-[var(--border-color)] shadow-inner">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--accent-green)] opacity-50" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Kitchen Clear</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] mt-2 italic uppercase tracking-widest opacity-60">Ready for the rush, Chef.</p>
            </motion.div>
          ) : (
            filteredOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-[var(--card-bg)] rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] p-4 sm:p-6 shadow-xl relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-10 blur-3xl rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 ${order.status === 'placed' ? 'bg-[var(--accent-orange)]' :
                  order.status === 'preparing' ? 'bg-blue-500' : 'bg-[var(--accent-green)]'
                  }`} />

                <div className="flex justify-between items-start mb-5 sm:mb-6 pb-4 sm:pb-6 border-b border-[var(--border-color)] border-dashed relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase font-brand">#{order.token}</div>
                    <div className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] border ${order.status === 'placed' ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/20' :
                      order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20'
                      }`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--text-secondary)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    {order.scheduledTime && <div className="text-blue-500 text-[8px] sm:text-[10px] font-black flex items-center justify-end gap-1 uppercase tracking-tighter leading-none"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {order.scheduledTime}</div>}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 px-1 lg:px-2 relative z-10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--input-bg)] flex items-center justify-center text-[10px] sm:text-xs font-black text-[var(--accent-orange)] border border-[var(--border-color)] shrink-0">{item.quantity}</div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{item.name}</span>
                          {item.notes && <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] italic leading-tight truncate">" {item.notes} "</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 sm:gap-4 relative z-10">
                  {rejectId === order.id ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3 sm:space-y-4">
                      <Input
                        autoFocus
                        placeholder="Reason for Void..."
                        className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2 sm:gap-3">
                        <Button variant="danger" className="flex-1 h-12 sm:h-14 uppercase tracking-widest text-[9px] sm:text-[10px]" onClick={() => { handleStatusUpdate(order.id, 'rejected', rejectReason); setRejectId(null); setRejectReason(''); }}>
                          Void Receipt
                        </Button>
                        <Button variant="outline" className="px-5 sm:px-8 h-12 sm:h-14 uppercase text-[9px] sm:text-[10px]" onClick={() => setRejectId(null)}>
                          Back
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {order.status === 'placed' && (
                        <>
                          <Button
                            variant="outline"
                            disabled={updatingOrders.has(order.id)}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border-red-500/30 text-red-500 p-0 shadow-lg shadow-red-500/5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setRejectId(order.id)}
                          >
                            <Ban strokeWidth={3} className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                          </Button>
                          <Button
                            disabled={updatingOrders.has(order.id)}
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="flex-1 h-12 sm:h-16 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Play fill="currentColor" stroke="none" className="w-4 h-4 sm:w-[18px] sm:h-[18px] mr-1.5" /> Prep
                          </Button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          disabled={updatingOrders.has(order.id)}
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                          className="w-full h-12 sm:h-16 bg-blue-600 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] shadow-2xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          variant="secondary"
                          disabled={updatingOrders.has(order.id)}
                          onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                          className="w-full h-12 sm:h-16 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest sm:tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Serve <ChevronRight strokeWidth={3} className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] ml-1" />
                        </Button>
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
