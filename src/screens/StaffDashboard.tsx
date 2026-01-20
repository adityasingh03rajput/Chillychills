import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, Ban, LogOut, ChevronRight, CheckCircle2, Play } from 'lucide-react';

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

  const pendingOrders = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'picked_up' && o.status !== 'rejected')
    .sort((a, b) => a.createdAt - b.createdAt);

  const filteredOrders = pendingOrders
    .filter(o => branchFilter === 'All' || o.branch === branchFilter)
    .filter(o => filter === 'all' ? true : o.status === filter);

  const handleStatusUpdate = (id: string, status: string, reason?: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate([15, 30, 15]);
    onUpdateStatus(id, status, reason);
  };

  const handleReject = () => {
    if (rejectId && rejectReason) {
      handleStatusUpdate(rejectId, 'rejected', rejectReason);
      setRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="h-full flex flex-col pt-6 pb-6 px-4 overflow-hidden bg-[#0A0A0A] text-white">
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <span className="text-[#FF7A2F]">●</span> KITCHEN LIVE
          </h2>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{pendingOrders.length} Pending Actions</p>
        </div>

        <div className="flex gap-2">
          <select
            className="bg-black/40 border border-white/10 rounded-xl text-[10px] font-black uppercase px-3 py-2 outline-none focus:border-[#FF7A2F] transition-all"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All KITCHENS</option>
            <option value="A">Burger St.</option>
            <option value="B">Drink Bar</option>
            <option value="C">Side Deck</option>
          </select>

          <button
            onClick={onLogout}
            className="bg-red-500/10 text-red-500 p-2.5 rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all active:scale-90"
          >
            <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Modern Filter Switcher */}
      <div className="flex p-1 bg-white/5 rounded-2xl mb-6 border border-white/5">
        {['all', 'placed', 'preparing', 'ready'].map(f => (
          <button
            key={f}
            onClick={() => {
              if (window.navigator.vibrate) window.navigator.vibrate(5);
              setFilter(f);
            }}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-stone-500 hover:text-stone-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-24 custom-scrollbar smooth-scroll">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-20 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/5 flex items-center justify-center border border-green-500/10 mb-6">
                <CheckCircle2 size={48} className="text-green-500/30" />
              </div>
              <p className="font-black text-stone-400 text-lg uppercase tracking-wider">Kitchen Clear</p>
              {branchFilter !== 'All' && pendingOrders.length > filteredOrders.length && (
                <p className="text-[10px] bg-[#FF7A2F]/10 px-4 py-2 rounded-full mt-4 text-[#FF7A2F] font-black border border-[#FF7A2F]/20 uppercase tracking-widest">
                  💡 {pendingOrders.length - filteredOrders.length} Orders in other branches
                </p>
              )}
            </motion.div>
          )}
          {filteredOrders.map(order => (
            <motion.div
              layout
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`bg-white/[0.03] p-5 rounded-[2rem] border border-white/5 relative overflow-hidden group transition-all hover:bg-white/[0.06] ${order.status === 'placed' ? 'ring-1 ring-[#FF7A2F]/30' : ''}`}
            >
              {/* Status Glow Indicator */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'placed' ? 'bg-[#FF7A2F]' :
                order.status === 'preparing' ? 'bg-blue-500' : 'bg-green-500'
                } opacity-50`} />

              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-white tracking-tighter">#{order.token}</div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${order.status === 'placed' ? 'bg-[#FF7A2F]/10 text-[#FF7A2F]' :
                    order.status === 'preparing' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                    {order.status}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-stone-500 text-[10px] font-black uppercase tracking-tighter">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  {order.scheduledTime && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase mt-1">
                      <Clock size={10} /> {order.scheduledTime}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group/item">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-xs font-black text-[#FF7A2F] group-hover/item:bg-[#FF7A2F] group-hover/item:text-white transition-all">{item.quantity}</span>
                      <span className="text-sm font-bold text-stone-200">{item.name}</span>
                    </div>
                    {item.notes && <span className="text-[10px] text-stone-500 font-bold bg-white/5 px-2 py-0.5 rounded italic">"{item.notes}"</span>}
                  </div>
                ))}
              </div>

              {/* Action Control Panel */}
              <AnimatePresence>
                {rejectId === order.id ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                    <Input
                      autoFocus
                      placeholder="Specify Rejection Reason..."
                      className="bg-black/40 border-red-500/20 text-white h-11 text-xs mb-3 rounded-xl focus:border-red-500"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleReject} className="flex-1 bg-red-600 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest">Confirm VOID</Button>
                      <Button variant="ghost" onClick={() => setRejectId(null)} className="h-11 rounded-xl text-stone-400 font-black text-[10px] uppercase">Back</Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-3">
                    {order.status === 'placed' && (
                      <>
                        <button onClick={() => setRejectId(order.id)} className="w-14 h-14 rounded-2xl bg-white/5 text-red-500 flex items-center justify-center border border-white/5 hover:bg-red-500/10 transition-all active:scale-90">
                          <Ban size={20} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                          className="flex-1 h-14 bg-[#FF7A2F] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <Play size={16} fill="currentColor" /> START PREPPING
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                        className="w-full h-14 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} /> MOVE TO READY
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                        className="w-full h-14 bg-green-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronRight size={20} strokeWidth={3} /> SERVE CUSTOMER
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
