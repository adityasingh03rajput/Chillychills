import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Feedback } from '../utils/types';
import { Clock, CheckCircle2, ChefHat, Bell, AlertTriangle, Star, XCircle, Search, ChevronRight, Package } from 'lucide-react';
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

   const activeOrders = orders.filter(o => !['completed', 'cancelled', 'picked_up', 'rejected'].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);
   const pastOrders = orders.filter(o => ['completed', 'cancelled', 'picked_up', 'rejected'].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);

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
      <div className="h-full flex flex-col pt-6 sm:pt-10 pb-40 overflow-y-auto custom-scrollbar smooth-scroll bg-[var(--bg-primary)]">

         {/* Header */}
         <div className="px-4 sm:px-6 mb-8 sm:mb-10">
            <div className="flex justify-between items-end mb-6 sm:mb-8 px-1 lg:px-2">
               <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">Security Logs</h2>
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1.5 opacity-60">System Tracking</p>
               </div>
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--card-bg)] rounded-xl sm:rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-sm">
                  <Clock size={20} className="text-[var(--accent-orange)]" />
               </div>
            </div>

            <div className="relative group">
               <Input
                  placeholder="SEARCH VAULT TOKEN"
                  className="h-14 sm:h-16 text-center tracking-[0.2em] font-black text-[10px] sm:text-xs"
                  value={tokenSearch}
                  onChange={e => setTokenSearch(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleTokenSearch()}
               />
               <button
                  onClick={handleTokenSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent-orange)] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
               >
                  <Search size={18} strokeWidth={3} />
               </button>
            </div>
         </div>

         <div className="px-4 sm:px-6 space-y-8 sm:space-y-10">
            {activeOrders.length > 0 && (
               <div className="space-y-4 sm:space-y-6">
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-1">Live Transmissions</p>
                  {activeOrders.map(order => (
                     <ActiveOrderCard key={order.id} order={order} onCancel={() => onCancelOrder(order.id)} />
                  ))}
               </div>
            )}

            {filteredPastOrders.length > 0 && (
               <div className="space-y-4 sm:space-y-6">
                  <p className="text-[8px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-1">Archive Vault</p>
                  <div className="grid gap-4 sm:gap-6">
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
               <div className="flex flex-col items-center justify-center pt-20 px-8 opacity-30 text-center">
                  <Clock size={42} className="mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Transmissions Found</p>
               </div>
            )}
         </div>
      </div>
   );
};

const ActiveOrderCard = ({ order, onCancel }: { order: Order, onCancel: () => void }) => {
   const steps = ['placed', 'accepted', 'preparing', 'ready'];
   const isCancellable = order.status === 'placed';

   return (
      <motion.div
         layout
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="bg-[var(--card-bg)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group"
      >
         <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-16 -mt-16 ${order.status === 'ready' ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-orange)]'}`} />

         <div className="flex justify-between items-start mb-8 sm:mb-10 relative z-10">
            <div>
               <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1.5 sm:mb-2 leading-none">Receipt Token</p>
               <h3 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tighter leading-none font-brand">
                  #{order.token || '---'}
               </h3>
            </div>
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center ${order.status === 'ready' ? 'bg-[var(--accent-green)] text-white shadow-xl shadow-green-500/20' : 'bg-[var(--input-bg)] text-[var(--accent-orange)]'} transition-all duration-700`}>
               {order.status === 'ready' ? <Bell strokeWidth={2.5} className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce" /> : <ChefHat strokeWidth={2.5} className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />}
            </div>
         </div>

         {/* Elite Mobile-Safe Progress */}
         <div className="relative pt-2 pb-8 sm:pb-10">
            <div className="absolute left-6 right-6 top-10 sm:top-12 h-0.5 sm:h-1 bg-[var(--input-bg)] rounded-full" />
            <div className="flex justify-between relative z-10">
               {['placed', 'preparing', 'ready'].map((step) => {
                  const isActive = steps.indexOf(order.status) >= steps.indexOf(step as any);
                  const isCurrent = order.status === step;

                  return (
                     <div key={step} className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-4 transition-all duration-700 ${isActive ? 'bg-[var(--text-primary)] border-[var(--bg-primary)] text-[var(--bg-primary)] shadow-xl' : 'bg-[var(--card-bg)] border-[var(--input-bg)] text-[var(--text-muted)]'
                           } ${isCurrent ? 'scale-110' : ''}`}>
                           {step === 'placed' && <Package className="w-[18px] h-[18px] sm:w-[22px] h-[22px]" />}
                           {step === 'preparing' && <ChefHat className="w-[18px] h-[18px] sm:w-[22px] h-[22px]" />}
                           {step === 'ready' && <Bell className="w-[18px] h-[18px] sm:w-[22px] h-[22px]" />}
                        </div>
                        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-40'}`}>
                           {step}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="flex gap-4 pt-6 sm:pt-10 border-t border-dashed border-[var(--border-color)]">
            <div className="flex-1">
               <p className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 sm:mb-2 leading-none">Yield Clear</p>
               <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter font-mono leading-none">₹{order.totalAmount}</p>
            </div>
            {isCancellable && (
               <Button variant="danger" size="sm" onClick={onCancel} className="px-5 sm:px-8 h-10 sm:h-14 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-xl shadow-red-500/10">
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

   const isSuccess = !['cancelled', 'rejected'].includes(order.status);

   return (
      <div className="bg-[var(--card-bg)] rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-[var(--border-color)] relative group transition-all shadow-xl">
         <div className="flex justify-between items-start mb-5 sm:mb-6">
            <div>
               <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <h4 className="text-[var(--text-primary)] font-black text-xl sm:text-2xl tracking-tighter font-brand">#{order.token}</h4>
                  <span className={`text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap ${isSuccess ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20 shadow-green-500/5' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-red-500/5'}`}>
                     {order.status}
                  </span>
               </div>
               <p className="text-[var(--text-muted)] text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">
                  {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[var(--input-bg)] rounded-xl sm:rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-inner">
               <CheckCircle2 className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${isSuccess ? 'text-[var(--accent-green)] opacity-50' : 'text-[var(--text-muted)] opacity-30'}`} />
            </div>
         </div>

         <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 opacity-40">
            {order.items.map((item: any, i: number) => (
               <div key={i} className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                  <span className="truncate mr-4">{item.quantity}× {item.name}</span>
                  <span className="font-mono shrink-0">₹{item.price * item.quantity}</span>
               </div>
            ))}
         </div>

         <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-dashed border-[var(--border-color)] mb-6 sm:mb-8">
            <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Grand Total</span>
            <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">₹{order.totalAmount}</span>
         </div>

         <div className="flex gap-2 sm:gap-3">
            {isSuccess && !order.feedback && !showFeedback && (
               <Button
                  onClick={() => setShowFeedback(true)}
                  className="flex-1 h-12 sm:h-14 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl"
               >
                  Post Review
               </Button>
            )}

            {order.status === 'cancelled' && !order.refundRequest && !showRefund && (
               <Button
                  variant="outline"
                  onClick={() => setShowRefund(true)}
                  className="flex-1 h-12 sm:h-14 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl"
               >
                  Initiate Refund
               </Button>
            )}
         </div>

         <AnimatePresence>
            {showFeedback && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[var(--border-color)] overflow-hidden">
                  <p className="text-[var(--text-primary)] text-[9px] sm:text-[10px] font-black mb-4 sm:mb-6 uppercase tracking-widest text-center opacity-60 leading-none">Rate the Experience</p>
                  <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                     {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => setRating(r)} className={`transition-all ${r <= rating ? 'text-[var(--accent-orange)] scale-110 sm:scale-125' : 'text-[var(--text-muted)] opacity-20'}`}>
                           <Star fill={r <= rating ? "currentColor" : "none"} strokeWidth={3} className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                     ))}
                  </div>
                  <Input placeholder="REMARKS..." className="h-12 sm:h-14 mb-4 text-[9px] sm:text-[10px] font-black uppercase text-center" value={comment} onChange={e => setComment(e.target.value)} />
                  <div className="flex gap-2">
                     <Button size="sm" onClick={() => { onSubmitFeedback(order.id, { rating, comment, createdAt: Date.now() }); setShowFeedback(false); }} className="flex-1 h-10 sm:h-12 uppercase text-[9px] tracking-widest">Transmit</Button>
                     <Button size="sm" variant="outline" onClick={() => setShowFeedback(false)} className="flex-1 h-10 sm:h-12 uppercase text-[9px] tracking-widest">Abort</Button>
                  </div>
               </motion.div>
            )}

            {showRefund && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[var(--border-color)] overflow-hidden">
                  <div className="bg-[var(--accent-orange)]/5 border border-[var(--accent-orange)]/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                     <p className="text-[var(--accent-orange)] text-[8px] sm:text-[9px] font-black leading-relaxed uppercase tracking-[0.15em] sm:tracking-widest text-center">
                        Liquid capital arrives in 24 standard hours.
                     </p>
                  </div>
                  <Input placeholder="REASON..." className="h-12 sm:h-14 mb-4 text-[9px] sm:text-[10px] font-black uppercase text-center" value={reason} onChange={e => setReason(e.target.value)} />
                  <div className="flex gap-2">
                     <Button variant="danger" size="sm" onClick={() => { onRequestRefund(order.id, reason); setShowRefund(false); }} className="flex-1 h-10 sm:h-12 uppercase text-[9px] tracking-widest shadow-xl shadow-red-500/20">Apply</Button>
                     <Button size="sm" variant="outline" onClick={() => setShowRefund(false)} className="flex-1 h-10 sm:h-12 uppercase text-[9px] tracking-widest">Cancel</Button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {order.refundRequest && (
            <div className={`mt-5 sm:mt-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-center ${order.refundRequest.status === 'approved' ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20 shadow-lg shadow-green-500/5' :
               order.refundRequest.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/5' :
                  'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-[var(--accent-orange)]/20 shadow-lg shadow-orange-500/5'
               }`}>
               VAULT STATUS: {order.refundRequest.status}
            </div>
         )}
      </div>
   );
};
