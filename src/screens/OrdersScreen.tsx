import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Feedback } from '../utils/types';
import { Clock, CheckCircle2, ChefHat, Bell, AlertTriangle, Star, XCircle, Search, ChevronRight, Package, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

interface OrdersScreenProps {
   orders: Order[];
   onCancelOrder: (orderId: string) => void;
   onRequestRefund: (orderId: string, reason: string) => void;
   onSubmitFeedback: (orderId: string, feedback: Feedback) => void;
}

export const OrdersScreen = ({ orders, onCancelOrder, onRequestRefund, onSubmitFeedback }: OrdersScreenProps) => {
   const [tokenSearch, setTokenSearch] = useState('');

   const activeOrders = orders.filter(o => !['completed', 'cancelled', 'picked_up', 'rejected', 'rescued', 'awaiting_rescue'].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);
   const pastOrders = orders.filter(o => ['completed', 'cancelled', 'picked_up', 'rejected', 'rescued', 'awaiting_rescue'].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);

   const filteredPastOrders = tokenSearch.trim()
      ? pastOrders.filter(o => o.token?.toLowerCase().includes(tokenSearch.toLowerCase()))
      : pastOrders;

   const handleTokenSearch = () => {
      if (!tokenSearch.trim()) {
         toast.error('Enter token ID');
         return;
      }
      const found = orders.find(o => o.token?.toLowerCase() === tokenSearch.toLowerCase());
      if (!found) toast.error('Vault record not found');
      else toast.success('Record localized');
   };

   return (
      <div className="h-full pt-6 pb-40 overflow-y-auto no-scrollbar bg-black px-6">

         {/* 56dp Header equivalent */}
         <div className="flex justify-between items-center h-[56px] mb-8">
            <div>
               <h2 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">Security Logs</h2>
               <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                  <p className="text-[12px] font-black text-white/40 uppercase tracking-widest">System Tracking</p>
               </div>
            </div>
            <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
               <Clock size={20} className="text-[var(--accent-orange)]" />
            </div>
         </div>

         {/* 56dp Height Search Bar (16sp text) */}
         <div className="relative mb-10">
            <Input
               placeholder="SEARCH VAULT TOKEN"
               className="h-[56px] w-full bg-stone-900 border-white/5 text-center tracking-widest font-black text-[14px] px-12 rounded-xl text-white"
               value={tokenSearch}
               onChange={e => setTokenSearch(e.target.value)}
               onKeyPress={e => e.key === 'Enter' && handleTokenSearch()}
            />
            <button
               onClick={handleTokenSearch}
               className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent-orange)] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
               <Search size={18} strokeWidth={3} />
            </button>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
               <Zap size={16} />
            </div>
         </div>

         <div className="space-y-10">
            {activeOrders.length > 0 && (
               <div className="space-y-4">
                  <p className="text-[12px] font-black text-[var(--accent-orange)] uppercase tracking-widest ml-1">Live Transmissions</p>
                  {activeOrders.map(order => (
                     <ActiveOrderCard key={order.id} order={order} onCancel={() => onCancelOrder(order.id)} />
                  ))}
               </div>
            )}

            {filteredPastOrders.length > 0 && (
               <div className="space-y-4">
                  <p className="text-[12px] font-black text-white/20 uppercase tracking-widest ml-1">Archive Vault</p>
                  <div className="grid gap-4">
                     {filteredPastOrders.map(order => (
                        <PastOrderCard
                           key={order.id}
                           order={order}
                           onRequestRefund={onRequestRefund}
                           onSubmitFeedback={onSubmitFeedback}
                        />
                     ))}
                  </div>
               </div>
            )}

            {activeOrders.length === 0 && pastOrders.length === 0 && (
               <div className="flex flex-col items-center justify-center pt-20 opacity-30 text-center">
                  <Clock size={42} className="mb-4 text-white" />
                  <p className="text-[12px] font-black text-white uppercase tracking-widest leading-relaxed">No Transmissions Found <br /> in Central Records</p>
               </div>
            )}
         </div>
      </div>
   );
};

const ActiveOrderCard = ({ order, onCancel }: { order: Order, onCancel: () => void }) => {
   const steps = ['placed', 'accepted', 'preparing', 'ready'];
   const isCancellable = order.status === 'placed' || (order.status === 'preparing' && !order.items.some(i => !i.isRefundable)); // Allow cancel if all items refundable or placed

   return (
      <motion.div
         layout
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-stone-900 rounded-xl p-6 border border-white/5 shadow-2 shadow-orange-500/5 relative overflow-hidden"
      >
         <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-[60px] rounded-full -mr-16 -mt-16 ${order.status === 'ready' ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-orange)]'}`} />

         <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
               <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mb-1.5 leading-none">Receipt Token</p>
               <h3 className="text-[48px] font-black text-white tracking-tighter leading-none">
                  #{order.token || '---'}
               </h3>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${order.status === 'ready' ? 'bg-[var(--accent-green)] text-white shadow-xl' : 'bg-black/50 border border-white/10 text-[var(--accent-orange)]'} transition-all`}>
               {order.status === 'ready' ? <Bell strokeWidth={2.5} className="w-7 h-7 animate-bounce" /> : <ChefHat strokeWidth={2.5} className="w-7 h-7 animate-pulse" />}
            </div>
         </div>

         {/* Calibrated Mobile Safe Progress */}
         <div className="relative pt-2 pb-8">
            <div className="absolute left-6 right-6 top-10 h-[2px] bg-white/5 rounded-full" />
            <div className="flex justify-between relative z-10">
               {['placed', 'preparing', 'ready'].map((step) => {
                  const isActive = steps.indexOf(order.status) >= steps.indexOf(step as any);
                  const isCurrent = order.status === step;

                  return (
                     <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${isActive ? 'bg-white border-white text-black shadow-lg' : 'bg-stone-900 border-white/10 text-white/20'
                           } ${isCurrent ? 'scale-110' : ''}`}>
                           {step === 'placed' && <Package size={20} />}
                           {step === 'preparing' && <ChefHat size={20} />}
                           {step === 'ready' && <Bell size={20} />}
                        </div>
                        <span className={`text-[12px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>
                           {step}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="flex gap-4 pt-6 mt-2 border-t border-dashed border-white/10">
            <div className="flex-1">
               <p className="text-[12px] font-black text-white/30 uppercase tracking-widest mb-1.5 leading-none">Yield Clear</p>
               <p className="text-[24px] font-black text-white tracking-tighter tabular-nums leading-none">₹{order.totalAmount}</p>
            </div>
            {order.status !== 'ready' && (
               <Button onClick={onCancel} variant="none" className="bg-red-500/10 border border-red-500/20 text-red-500 h-12 px-6 rounded-lg text-[12px] font-black uppercase tracking-widest active:bg-red-500/20">
                  Revoke
               </Button>
            )}
         </div>
      </motion.div>
   );
};

const PastOrderCard = ({ order, onRequestRefund, onSubmitFeedback }: any) => {
   const [showRefund, setShowRefund] = useState(false);
   const [showFeedback, setShowFeedback] = useState(false);
   const [reason, setReason] = useState('');
   const [rating, setRating] = useState(5);
   const [comment, setComment] = useState('');

   const isSuccess = ['completed', 'picked_up', 'rescued'].includes(order.status);
   const isResalePending = order.status === 'awaiting_rescue';

   return (
      <div className="bg-stone-900 rounded-xl p-5 border border-white/5 relative group transition-all shadow-md">
         <div className="flex justify-between items-start mb-5">
            <div>
               <div className="flex items-center gap-3 mb-1.5">
                  <h4 className="text-white font-black text-[20px] tracking-tight">#{order.token}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isSuccess ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20' :
                     isResalePending ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border border-[var(--accent-orange)]/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                     {order.status === 'awaiting_rescue' ? 'LISTED FOR RESALE' : order.status}
                  </span>
               </div>
               <p className="text-white/30 text-[12px] font-black uppercase tracking-widest opacity-60">
                  {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
            <div className="h-10 w-10 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
               <CheckCircle2 className={`w-4 h-4 ${isSuccess ? 'text-[var(--accent-green)] opacity-50' : 'text-white/20'}`} />
            </div>
         </div>

         <div className="space-y-1.5 mb-5 opacity-40">
            {order.items.map((item: any, i: number) => (
               <div key={i} className="flex justify-between text-[12px] font-black uppercase tracking-widest text-white">
                  <span className="truncate mr-4">{item.quantity}× {item.name}</span>
                  <span className="shrink-0 tabular-nums">₹{item.price * item.quantity}</span>
               </div>
            ))}
         </div>

         <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/5 mb-6">
            <span className="text-[12px] font-black text-white/20 uppercase tracking-widest">Grand Total</span>
            <span className="text-[18px] font-black text-white tabular-nums">₹{order.totalAmount}</span>
         </div>

         <div className="flex gap-2">
            {isSuccess && !order.feedback && !showFeedback && (
               <Button
                  onClick={() => setShowFeedback(true)}
                  variant="white"
                  className="flex-1"
               >
                  Post Review
               </Button>
            )}

            {order.status === 'cancelled' && !order.refundRequest && !showRefund && (
               <Button
                  onClick={() => setShowRefund(true)}
                  variant="outline"
                  className="flex-1 bg-stone-800"
               >
                  Initiate Refund
               </Button>
            )}
         </div>

         <AnimatePresence>
            {showFeedback && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-6 border-t border-white/10 overflow-hidden">
                  <p className="text-[12px] font-black mb-6 uppercase tracking-widest text-center text-white/40">Rate the Experience</p>
                  <div className="flex justify-center gap-6 mb-8">
                     {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => setRating(r)} className={`transition-all ${r <= rating ? 'text-[var(--accent-orange)] scale-110' : 'text-white/10'}`}>
                           <Star fill={r <= rating ? "currentColor" : "none"} strokeWidth={3} size={28} />
                        </button>
                     ))}
                  </div>
                  <Input placeholder="REMARKS..." className="h-[56px] mb-4 text-[14px] font-black uppercase text-center bg-stone-800 rounded-xl" value={comment} onChange={e => setComment(e.target.value)} />
                  <div className="flex gap-2">
                     <Button onClick={() => { onSubmitFeedback(order.id, { rating, comment, createdAt: Date.now() }); setShowFeedback(false); }} variant="white" className="flex-1 h-[48px]">Transmit</Button>
                     <Button variant="outline" onClick={() => setShowFeedback(false)} className="flex-1 h-[48px]">Abort</Button>
                  </div>
               </motion.div>
            )}

            {showRefund && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-6 border-t border-white/10 overflow-hidden">
                  <div className="bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/10 p-4 rounded-xl mb-6">
                     <p className="text-[var(--accent-orange)] text-[12px] font-black leading-relaxed uppercase tracking-widest text-center">
                        Liquid capital arrives in 24 standard hours.
                     </p>
                  </div>
                  <Input placeholder="REASON..." className="h-[56px] mb-4 text-[14px] font-black uppercase text-center bg-stone-800 rounded-xl" value={reason} onChange={e => setReason(e.target.value)} />
                  <div className="flex gap-2">
                     <Button onClick={() => { onRequestRefund(order.id, reason); setShowRefund(false); }} variant="danger" className="flex-1 h-[48px]">Apply</Button>
                     <Button variant="outline" onClick={() => setShowRefund(false)} className="flex-1 h-[48px]">Cancel</Button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {order.refundRequest && (
            <div className={`mt-6 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest text-center ${order.refundRequest.status === 'approved' ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20 shadow-lg shadow-green-500/5' :
               order.refundRequest.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/5' :
                  'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/20 shadow-lg shadow-orange-500/5'
               }`}>
               VAULT STATUS: {order.refundRequest.status}
            </div>
         )}
      </div>
   );
};
