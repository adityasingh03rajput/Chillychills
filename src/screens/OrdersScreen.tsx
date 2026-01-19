import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Feedback } from '../utils/types';
import { Clock, CheckCircle2, ChefHat, Bell, AlertTriangle, Star, XCircle, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner@2.0.3';

interface OrdersScreenProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onRequestRefund: (orderId: string, reason: string) => void;
  onSubmitFeedback: (orderId: string, feedback: Feedback) => void;
}

export const OrdersScreen = ({ orders, onCancelOrder, onRequestRefund, onSubmitFeedback }: OrdersScreenProps) => {
  const [tokenSearch, setTokenSearch] = useState('');
  
  const activeOrders = orders.filter(o => !['completed', 'cancelled', 'picked_up', 'rejected'].includes(o.status)).sort((a,b) => b.createdAt - a.createdAt);
  const pastOrders = orders.filter(o => ['completed', 'cancelled', 'picked_up', 'rejected'].includes(o.status)).sort((a,b) => b.createdAt - a.createdAt);

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
    <div className="h-full flex flex-col pt-6 pb-28 overflow-y-auto custom-scrollbar bg-[#4A2E1E]">
       {/* Header */}
       <div className="px-6 mb-6">
         <h2 className="text-3xl font-bold text-white mb-4">Your Orders</h2>
         
         {/* Token Search */}
         <div className="relative">
           <Input 
             placeholder="TOKEN NUMBER" 
             className="bg-white text-stone-800 font-bold placeholder:text-stone-400 pr-12 h-14 rounded-2xl text-center tracking-wider"
             value={tokenSearch}
             onChange={e => setTokenSearch(e.target.value)}
             onKeyPress={e => e.key === 'Enter' && handleTokenSearch()}
           />
           <button 
             onClick={handleTokenSearch}
             className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF7A2F] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ff9554] transition-colors"
           >
             <Search size={20} />
           </button>
         </div>
       </div>

       {activeOrders.length === 0 && pastOrders.length === 0 && (
         <div className="flex flex-col items-center justify-center h-48 text-white/40 px-6">
            <Clock size={48} className="mb-4 opacity-50"/>
            <p>No order history found.</p>
         </div>
       )}

       {activeOrders.map(order => (
         <div key={order.id} className="px-6 mb-6">
           <ActiveOrderCard order={order} onCancel={() => onCancelOrder(order.id)} />
         </div>
       ))}
       
       {filteredPastOrders.length > 0 && (
         <>
           <div className="px-6">
             <h3 className="text-white/60 text-sm font-bold uppercase tracking-wider mb-4">Past Orders</h3>
           </div>
           <div className="px-6 space-y-4 pb-8">
             {filteredPastOrders.map(order => (
               <PastOrderCard 
                 key={order.id} 
                 order={order} 
                 onRequestRefund={onRequestRefund}
                 onSubmitFeedback={onSubmitFeedback}
               />
             ))}
           </div>
         </>
       )}
    </div>
  );
};

const ActiveOrderCard = ({ order, onCancel }: { order: Order, onCancel: () => void }) => {
   const steps = ['placed', 'accepted', 'preparing', 'ready'];
   let currentStepIndex = steps.indexOf(order.status);
   if (currentStepIndex === -1 && ['picked_up', 'completed'].includes(order.status)) currentStepIndex = 4;
   
   // Check if cancellable (only if placed)
   const isCancellable = order.status === 'placed';

   return (
     <motion.div 
       layout
       className="bg-[#FAFAF7] rounded-3xl p-6 mb-6 shadow-2xl shadow-black/20 relative overflow-hidden"
     >
       <div className="absolute top-0 left-0 w-2 h-full bg-[#FF7A2F]" />
       
       <div className="flex justify-between items-start mb-6 pl-4">
         <div>
           <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">TOKEN NUMBER</p>
           <h3 className="text-6xl font-black text-[#FF7A2F] tracking-tighter leading-none">{order.token || '---'}</h3>
           <div className="mt-2">
              <p className="text-stone-800 font-bold text-sm">{order.items.length} Items</p>
              <p className="text-stone-400 text-xs truncate max-w-[200px]">{order.items.map(i => i.name).join(', ')}</p>
           </div>
           {order.scheduledTime && (
             <div className="mt-2 flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold w-fit">
                <Clock size={12} /> Scheduled: {order.scheduledTime}
             </div>
           )}
         </div>
         <div className="flex flex-col gap-2 items-end">
            <div className="bg-[#FF7A2F]/10 text-[#FF7A2F] p-3 rounded-full">
               <Clock className={order.status === 'ready' ? '' : 'animate-pulse'} />
            </div>
            {isCancellable && (
               <button onClick={onCancel} className="text-xs text-red-500 font-bold underline hover:text-red-600">
                 Cancel Order
               </button>
            )}
         </div>
       </div>

       {/* Status Steps */}
       <div className="relative pl-4 pr-2 mt-4">
         <div className="absolute left-4 right-6 top-4 h-1 bg-stone-200 -z-0 rounded-full" />
         <motion.div 
           className="absolute left-4 top-4 h-1 bg-[#3F8A4F] -z-0 rounded-full" 
           initial={{ width: 0 }}
           animate={{ width: `${Math.min((currentStepIndex / 3) * 100, 100)}%` }}
           transition={{ duration: 1 }}
         />

         <div className="flex justify-between items-start relative z-10">
           {['placed', 'preparing', 'ready'].map((step, i) => {
             let isActive = false;
             let isCurrent = false;

             if (step === 'placed') {
                isActive = true; 
                isCurrent = order.status === 'placed' || order.status === 'accepted';
             } else if (step === 'preparing') {
                isActive = ['preparing', 'ready', 'picked_up', 'completed'].includes(order.status);
                isCurrent = order.status === 'preparing';
             } else if (step === 'ready') {
                isActive = ['ready', 'picked_up', 'completed'].includes(order.status);
                isCurrent = order.status === 'ready';
             }

             return (
               <div key={step} className="flex flex-col items-center gap-2 w-12">
                 <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                   isActive ? 'bg-[#3F8A4F] border-[#3F8A4F] text-white' : 'bg-stone-100 border-stone-200 text-stone-300'
                 } ${isCurrent ? 'shadow-lg shadow-[#3F8A4F]/30' : ''}`}>
                   {step === 'placed' && <CheckCircle2 size={14} />}
                   {step === 'preparing' && <ChefHat size={14} />}
                   {step === 'ready' && <Bell size={14} />}
                 </motion.div>
                 <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-stone-800' : 'text-stone-300'}`}>
                   {step}
                 </span>
               </div>
             );
           })}
         </div>
       </div>
       
       {order.status === 'ready' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-6 bg-[#3F8A4F] text-white text-center py-3 rounded-xl font-bold animate-bounce shadow-lg shadow-[#3F8A4F]/40"
         >
           Order Ready for Pickup!
         </motion.div>
       )}
     </motion.div>
   );
};

const PastOrderCard = ({ order, onRequestRefund, onSubmitFeedback }: any) => {
   const [showRefund, setShowRefund] = useState(false);
   const [showFeedback, setShowFeedback] = useState(false);
   const [reason, setReason] = useState('');
   const [rating, setRating] = useState(5);
   const [comment, setComment] = useState('');

   const handleRefund = () => {
      onRequestRefund(order.id, reason);
      setShowRefund(false);
   };

   const handleFeedback = () => {
      onSubmitFeedback(order.id, { rating, comment, createdAt: Date.now() });
      setShowFeedback(false);
   };

   return (
      <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/10 relative overflow-hidden">
         <div className="flex justify-between items-start mb-2">
             <div>
               <p className="text-white font-bold text-lg">#{order.token}</p>
               <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
             </div>
             <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
               {order.status}
             </span>
         </div>
         
         {order.status === 'rejected' && order.rejectionReason && (
            <div className="bg-red-900/20 border border-red-500/20 p-2 rounded mb-3 text-red-400 text-xs">
               Reason: {order.rejectionReason}
            </div>
         )}

         <div className="space-y-1 mb-4">
             {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm text-white/80">
                   <span>{item.quantity}x {item.name}</span>
                   <span>₹{item.price * item.quantity}</span>
                </div>
             ))}
             <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white mt-2">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
             </div>
         </div>

         {/* Actions for Completed Orders */}
         {['completed', 'picked_up'].includes(order.status) && !order.feedback && !showFeedback && (
            <Button size="sm" variant="outline" className="w-full text-xs mb-2 border-white/20 hover:bg-white/10" onClick={() => setShowFeedback(true)}>
               Rate Order
            </Button>
         )}

         {/* Non-refundable notice for picked up orders */}
         {['completed', 'picked_up'].includes(order.status) && (
            <div className="text-center text-[9px] text-white/30 py-1 mt-2 border-t border-white/5">
               🔒 Picked-up orders are non-refundable
            </div>
         )}

         {/* Refund option ONLY for cancelled orders */}
         {order.status === 'cancelled' && !order.refundRequest && !showRefund && (
            <Button size="sm" variant="outline" className="w-full text-xs mb-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10" onClick={() => setShowRefund(true)}>
               Request Refund
            </Button>
         )}
         
         {/* Feedback Form */}
         {showFeedback && (
            <div className="bg-white/5 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
               <p className="text-white text-xs font-bold mb-2">How was it?</p>
               <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5].map(r => (
                     <button key={r} onClick={() => setRating(r)} className={r <= rating ? 'text-yellow-400' : 'text-white/20'}>
                        <Star size={16} fill={r <= rating ? "currentColor" : "none"} />
                     </button>
                  ))}
               </div>
               <Input 
                  placeholder="Any comments?" 
                  className="bg-black/20 text-white text-xs h-8 mb-2" 
                  value={comment} 
                  onChange={e => setComment(e.target.value)}
               />
               <div className="flex gap-2">
                  <Button size="sm" onClick={handleFeedback} className="flex-1 text-xs bg-[#3F8A4F]">Submit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowFeedback(false)} className="text-xs text-white/60">Cancel</Button>
               </div>
            </div>
         )}

         {/* Refund Form */}
         {showRefund && (
            <div className="bg-white/5 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
               <p className="text-white text-xs font-bold mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-yellow-500" /> Request Refund
               </p>
               <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded mb-2">
                  <p className="text-blue-300 text-[10px]">
                     ℹ️ Refund requests will be reviewed by management for approval.
                  </p>
               </div>
               <Input 
                  placeholder="Why are you requesting a refund?" 
                  className="bg-black/20 text-white text-xs h-8 mb-2" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
               />
               <div className="flex gap-2">
                  <Button size="sm" onClick={handleRefund} className="flex-1 text-xs bg-red-600">Submit Request</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowRefund(false)} className="text-xs text-white/60">Cancel</Button>
               </div>
            </div>
         )}

         {order.refundRequest && (
            <div className={`text-center text-[10px] py-1 rounded mt-2 border ${
               order.refundRequest.status === 'approved' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : order.refundRequest.status === 'rejected'
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            }`}>
               Refund Request: {order.refundRequest.status.toUpperCase()}
               {order.refundRequest.status === 'approved' && ' ✓'}
               {order.refundRequest.status === 'rejected' && ' ✗'}
               {order.refundRequest.refundAmount !== undefined && (
                  <span className="font-bold ml-1">• ₹{order.refundRequest.refundAmount}</span>
               )}
            </div>
         )}
      </div>
   );
};