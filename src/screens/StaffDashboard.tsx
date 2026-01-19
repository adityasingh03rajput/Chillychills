import { useState } from 'react';
import { Order } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Clock, Ban, LogOut } from 'lucide-react';

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

  const handleReject = () => {
    if (rejectId && rejectReason) {
      onUpdateStatus(rejectId, 'rejected', rejectReason);
      setRejectId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="h-full flex flex-col pt-6 pb-6 px-4 overflow-hidden bg-[#1A1A1A] text-white">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold flex items-center gap-2">👨‍🍳 Kitchen Display</h2>
         
         <div className="flex gap-2">
            {/* Branch Selector */}
            <select 
              className="bg-[#333] border border-stone-700 rounded-lg text-xs px-2 py-1 outline-none focus:border-[#FF7A2F]"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="All">All Branches</option>
              <option value="A">Branch A (Burger)</option>
              <option value="B">Branch B (Coke)</option>
              <option value="C">Branch C (Chips)</option>
            </select>
            
            <button 
              onClick={onLogout}
              className="bg-[#333] hover:bg-red-500/20 hover:text-red-500 text-stone-400 p-1.5 rounded-lg border border-stone-700 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
         </div>
       </div>

       {/* Filter Bar - Broadened to fill width */}
       <div className="flex gap-2 mb-4">
          {['all', 'placed', 'preparing', 'ready'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${filter === f ? 'bg-[#FF7A2F] text-white shadow-[#FF7A2F]/20' : 'bg-[#333] text-stone-400 hover:bg-[#444]'}`}
            >
              {f}
            </button>
          ))}
       </div>

       <div className="flex-1 overflow-y-auto space-y-3 pb-20">
         {filteredOrders.length === 0 && (
           <div className="text-center text-stone-600 mt-20 flex flex-col items-center">
             <span className="text-4xl mb-2">✅</span>
             <p>All caught up!</p>
           </div>
         )}
         {filteredOrders.map(order => (
           <div key={order.id} className={`bg-[#222] p-4 rounded-xl border border-stone-800 ${order.status === 'placed' ? 'border-l-4 border-l-[#FF7A2F]' : ''}`}>
             <div className="flex justify-between mb-3 border-b border-stone-800 pb-2">
               <div className="flex items-center gap-2">
                  <span className="font-black text-[#FF7A2F] text-2xl">#{order.token}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white/60">{order.status}</span>
                  {order.scheduledTime && (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      <Clock size={10} /> {order.scheduledTime}
                    </span>
                  )}
               </div>
               <span className="text-xs text-stone-500 font-mono">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
             
             <div className="space-y-2 mb-4">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-sm items-center">
                   <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                   {item.notes && <span className="text-stone-500 text-xs italic">({item.notes})</span>}
                 </div>
               ))}
             </div>

             {/* Action Buttons */}
             {rejectId === order.id ? (
               <div className="bg-red-900/20 p-2 rounded border border-red-500/20 animate-in fade-in zoom-in">
                  <Input 
                    autoFocus
                    placeholder="Reason for rejection..." 
                    className="bg-black/20 text-white h-8 text-xs mb-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReject} className="flex-1 bg-red-600 text-xs h-7">Confirm Reject</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectId(null)} className="text-xs h-7 text-white/60">Cancel</Button>
                  </div>
               </div>
             ) : (
               <div className="flex gap-2">
                  {order.status === 'placed' && (
                    <>
                      <Button size="sm" onClick={() => setRejectId(order.id)} className="w-24 h-12 bg-red-500/10 text-red-500 border border-red-500/20 shadow-none text-xs hover:bg-red-500 hover:text-white"><Ban size={18} /></Button>
                      <Button size="sm" onClick={() => onUpdateStatus(order.id, 'preparing')} className="flex-1 h-12 bg-blue-600 border-none shadow-none text-sm font-bold">Accept & Prepare</Button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full h-12 bg-[#FF7A2F] hover:bg-[#E06925] border-none shadow-none text-sm font-bold">Mark Ready</Button>
                  )}
                  {order.status === 'ready' && (
                    <Button size="sm" onClick={() => onUpdateStatus(order.id, 'picked_up')} className="w-full h-12 bg-stone-700 hover:bg-stone-600 border-none shadow-none text-sm font-bold">Complete Pickup</Button>
                  )}
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};
