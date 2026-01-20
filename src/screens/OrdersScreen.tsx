import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Feedback } from '../utils/types';
import { Clock, CheckCircle2, ChefHat, Bell, AlertTriangle, Star, XCircle, Search } from 'lucide-react';
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

   // Filter orders by token search
   const filteredPastOrders = tokenSearch.trim()
      ? pastOrders.filter(o => o.token?.toLowerCase().includes(tokenSearch.toLowerCase()))
      : pastOrders;

   const handleTokenSearch = () => {
      if (!tokenSearch.trim()) {
         toast.error('Please enter a token number');
         return;
      }
      const found = orders.find(o => o.token?.toLowerCase() === tokenSearch.toLowerCase());
      if (!found) {
         toast.error('Order not found with this token');
      } else {
         toast.success('Order found!');
      }
   };

   return (
      <div className="h-full flex flex-col pt-6 pb-28 overflow-y-auto custom-scrollbar smooth-scroll bg-[#111] selection:bg-[#FF7A2F]/30">
         {/* Background Decor */}
         <div className="fixed top-0 right-0 p-10 opacity-[0.03] pointer-events-none select-none">
            <h1 className="text-[12rem] font-black tracking-tighter leading-none">ORDER</h1>
         </div>

         {/* Header */}
         <div className="px-6 mb-8 relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">My Receipts</h2>
                  <p className="text-stone-500 text-xs font-medium uppercase tracking-widest">Order History</p>
               </div>
               <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-xl">
                  <Clock className="text-[#FF7A2F]" size={20} />
               </div>
            </div>

            {/* Token Search */}
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7A2F]/20 to-[#D05A15]/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
               <Input
                  placeholder="SEARCH TOKEN"
                  className="bg-white/5 border-white/10 text-white font-black placeholder:text-stone-600 pr-12 h-14 rounded-2xl text-center tracking-[0.2em] focus:border-[#FF7A2F]/50 transition-all backdrop-blur-xl uppercase"
                  value={tokenSearch}
                  onChange={e => {
                     setTokenSearch(e.target.value);
                     if (window.navigator.vibrate) window.navigator.vibrate(5);
                  }}
                  onKeyPress={e => e.key === 'Enter' && handleTokenSearch()}
               />
               <button
                  onClick={() => {
                     if (window.navigator.vibrate) window.navigator.vibrate(10);
                     handleTokenSearch();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF7A2F] text-white w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/20 transition-all"
               >
                  <Search size={18} strokeWidth={3} />
               </button>
            </div>
         </div>

         <div className="px-6 space-y-8 relative z-10">
            {activeOrders.length > 0 && (
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-1">Live Tracking</p>
                  {activeOrders.map(order => (
                     <ActiveOrderCard key={order.id} order={order} onCancel={() => onCancelOrder(order.id)} />
                  ))}
               </div>
            )}

            {activeOrders.length === 0 && pastOrders.length === 0 && (
               <div className="flex flex-col items-center justify-center h-64 text-stone-600">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                     <Clock size={32} className="opacity-30" />
                  </div>
                  <p className="font-bold tracking-tight">No receipts found yet</p>
                  <p className="text-xs opacity-50">Your delicious orders will appear here</p>
               </div>
            )}

            {filteredPastOrders.length > 0 && (
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] ml-1">Archive</p>
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
         </div>
      </div>
   );
};

const ActiveOrderCard = ({ order, onCancel }: { order: Order, onCancel: () => void }) => {
   const steps = ['placed', 'accepted', 'preparing', 'ready'];
   let currentStepIndex = steps.indexOf(order.status);
   if (currentStepIndex === -1 && ['picked_up', 'completed'].includes(order.status)) currentStepIndex = 4;

   const isCancellable = order.status === 'placed';

   return (
      <motion.div
         layout
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group"
      >
         {/* Receipt Top Edge Decor */}
         <div className="absolute top-0 left-12 right-12 h-6 bg-[#111]/5 rounded-b-3xl" />

         <div className="flex justify-between items-start mb-8">
            <div className="relative">
               <div className="absolute -top-4 -left-2 text-[6rem] font-black text-black/[0.03] pointer-events-none tracking-tighter">
                  NOW
               </div>
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">Queue ID</p>
               <h3 className="text-7xl font-black text-stone-900 tracking-tighter leading-none font-brand">
                  {order.token || '---'}
               </h3>
            </div>
            <div className="flex flex-col gap-2 items-end">
               <div className={`p-4 rounded-2xl ${order.status === 'ready' ? 'bg-[#3F8A4F] text-white shadow-lg shadow-green-900/20' : 'bg-orange-50 text-[#FF7A2F]'} transition-all duration-500`}>
                  {order.status === 'ready' ? <Bell size={24} className="animate-bounce" /> : <ChefHat size={24} className="animate-pulse" />}
               </div>
            </div>
         </div>

         <div className="space-y-1 mb-8">
            <p className="text-stone-900 font-black text-xl tracking-tight leading-none">{order.items.length} Items Ordered</p>
            <p className="text-stone-400 text-xs font-medium truncate opacity-80">{order.items.map(i => i.name).join(' • ')}</p>
         </div>

         {/* Modern Step Progress */}
         <div className="relative pt-2 pb-6">
            <div className="absolute left-0 right-0 top-6 h-1 w-full bg-stone-100 rounded-full" />
            <div className="flex justify-between relative z-10">
               {['placed', 'preparing', 'ready'].map((step, i) => {
                  const isActive = steps.indexOf(order.status) >= steps.indexOf(step as any) || (order.status === 'ready' && step === 'ready');
                  const isCurrent = order.status === step;

                  return (
                     <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${isActive ? 'bg-stone-900 border-white text-white rotate-[360deg]' : 'bg-white border-stone-100 text-stone-200'
                           } ${isCurrent ? 'scale-125 shadow-xl shadow-stone-900/10' : ''}`}>
                           {step === 'placed' && <CheckCircle2 size={16} />}
                           {step === 'preparing' && <ChefHat size={16} />}
                           {step === 'ready' && <Bell size={16} />}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>
                           {step}
                        </span>
                     </div>
                  );
               })}
            </div>
         </div>

         <div className="flex gap-3 pt-4 border-t-2 border-dashed border-stone-100 mt-2">
            <div className="flex-1 bg-stone-50 p-4 rounded-2xl">
               <p className="text-[9px] font-black text-stone-400 uppercase mb-1">Total Paid</p>
               <p className="text-xl font-black text-stone-900 leading-none font-mono">₹{order.totalAmount}</p>
            </div>
            {isCancellable && (
               <button onClick={onCancel} className="px-6 rounded-2xl bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-100 active:scale-95 transition-all">
                  Revoke
               </button>
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
      <div className="bg-[#1C1C1C] rounded-[2rem] p-6 border border-white/5 relative group transition-all hover:bg-[#222]">
         <div className="flex justify-between items-start mb-6">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-black text-2xl tracking-tighter">#{order.token}</h4>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isSuccess ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     {order.status}
                  </span>
               </div>
               <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
            <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
               <CheckCircle2 size={16} className={isSuccess ? 'text-green-500/50' : 'text-stone-700'} />
            </div>
         </div>

         <div className="space-y-2 mb-6 opacity-60">
            {order.items.map((item: any, i: number) => (
               <div key={i} className="flex justify-between text-xs font-medium text-stone-300">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-mono">₹{item.price * item.quantity}</span>
               </div>
            ))}
         </div>

         <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/10 mb-6">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-black text-white font-mono">₹{order.totalAmount}</span>
         </div>

         <div className="flex gap-2">
            {isSuccess && !order.feedback && !showFeedback && (
               <button
                  onClick={() => setShowFeedback(true)}
                  className="flex-1 bg-white text-black h-12 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-white/5"
               >
                  Submit Feedback
               </button>
            )}

            {order.status === 'cancelled' && !order.refundRequest && !showRefund && (
               <button
                  onClick={() => setShowRefund(true)}
                  className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
               >
                  Get Refund
               </button>
            )}
         </div>

         {/* Expandable Forms */}
         <AnimatePresence>
            {showFeedback && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-white text-xs font-bold mb-3 uppercase tracking-wider text-center">Rate your feast</p>
                  <div className="flex justify-center gap-3 mb-4">
                     {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => setRating(r)} className={`transition-all ${r <= rating ? 'text-yellow-400 scale-125' : 'text-white/10'}`}>
                           <Star size={24} fill={r <= rating ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                     ))}
                  </div>
                  <Input placeholder="Share details..." className="bg-white/5 border-white/10 text-white text-xs h-12 mb-3 rounded-xl" value={comment} onChange={e => setComment(e.target.value)} />
                  <div className="flex gap-2">
                     <Button size="sm" onClick={() => { onSubmitFeedback(order.id, { rating, comment, createdAt: Date.now() }); setShowFeedback(false); }} className="flex-1 bg-green-600 h-10 rounded-xl font-black text-[10px] uppercase">Post Review</Button>
                     <Button size="sm" variant="ghost" onClick={() => setShowFeedback(false)} className="text-white/40 font-black text-[10px] uppercase tracking-widest">Back</Button>
                  </div>
               </motion.div>
            )}

            {showRefund && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-white/5">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-3">
                     <p className="text-orange-300 text-[10px] font-medium leading-relaxed">
                        Funds will be added to your wallet within 24 hours of approval.
                     </p>
                  </div>
                  <Input placeholder="Reason for refund..." className="bg-white/5 border-white/10 text-white text-xs h-12 mb-3 rounded-xl" value={reason} onChange={e => setReason(e.target.value)} />
                  <div className="flex gap-2">
                     <Button size="sm" onClick={() => { onRequestRefund(order.id, reason); setShowRefund(false); }} className="flex-1 bg-red-600 h-10 rounded-xl font-black text-[10px] uppercase">Apply</Button>
                     <Button size="sm" variant="ghost" onClick={() => setShowRefund(false)} className="text-white/40 font-black text-[10px] uppercase tracking-widest">Dismiss</Button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {order.refundRequest && (
            <div className={`mt-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest text-center ${order.refundRequest.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  order.refundRequest.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
               }`}>
               Refund Status: {order.refundRequest.status}
            </div>
         )}
      </div>
   );
};
