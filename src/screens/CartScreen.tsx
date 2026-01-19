import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Trash2, CreditCard, Wallet, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/Input';

export const CartScreen = ({ cart, onUpdateQuantity, onPlaceOrder, total, isPlacingOrder }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet'>('upi');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  
  // Calculations
  const taxes = Math.ceil(total * 0.05);
  const grandTotal = total + taxes;
  const pointsToEarn = Math.floor(total * 0.05); // 5 points per 100rs approx logic (actually 5%)
  
  const walletBalance = 1500; // Mock balance

  const handleOrder = () => {
     onPlaceOrder({
       paymentMethod,
       scheduledTime: scheduledTime || undefined,
       loyaltyPointsEarned: pointsToEarn
     });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60 space-y-4">
         <motion.div 
           initial={{ scale: 0 }} 
           animate={{ scale: 1 }}
           className="bg-white/10 p-8 rounded-full"
         >
            <ShoppingBag size={48} />
         </motion.div>
         <p className="font-medium">Your tray is empty.</p>
         <p className="text-sm opacity-50 max-w-[200px] text-center">Add some delicious items from the menu to get started.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6 pb-24 px-6 overflow-hidden">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        Your Tray <span className="bg-[#FF7A2F] text-white text-xs px-2 py-1 rounded-full">{cart.length}</span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        <AnimatePresence mode='popLayout'>
          {cart.map((item: CartItem) => (
             <motion.div 
               key={item.id}
               layout
               initial={{ opacity: 0, x: -20, scale: 0.9 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: 20, scale: 0.9 }}
               className="bg-[#FAFAF7] rounded-2xl p-3 flex gap-4 shadow-lg items-center border-l-4 border-[#3F8A4F]"
             >
               <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <ImageWithFallback src={item.image} className="w-full h-full object-cover" />
               </div>
               
               <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-stone-800 text-sm truncate">{item.name}</h4>
                 <p className="text-[#3F8A4F] font-bold text-sm">₹{item.price * item.quantity}</p>
                 {item.isPackaged && <span className="text-[10px] text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">Packaged</span>}
               </div>
               
               <div className="flex items-center gap-3 bg-stone-200 rounded-xl p-1.5 shadow-inner">
                 <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:text-red-500 active:scale-90 transition-transform">
                   {item.quantity === 1 ? <Trash2 size={14} /> : '-'}
                 </button>
                 <span className="text-sm font-bold text-stone-800 w-4 text-center">{item.quantity}</span>
                 <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:text-[#3F8A4F] active:scale-90 transition-transform">+</button>
               </div>
             </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 bg-[#1A1A1A]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] space-y-4 relative z-20">
         
         {/* Scheduled Pickup */}
         <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/80 text-sm">
               <Clock size={16} className="text-[#FF7A2F]" />
               <span className="font-medium">Pickup Time</span>
            </div>
            <Input 
              type="time" 
              className="w-32 h-9 bg-white/10 border-white/10 text-white text-xs" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
         </div>

         {/* Bill Details */}
         <div className="space-y-1 pb-4 border-b border-white/10">
            <div className="flex justify-between text-white/60 text-sm">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-white/60 text-sm">
              <span>Taxes (5%)</span>
              <span>₹{taxes}</span>
            </div>
            <div className="flex justify-between text-[#FFD700] text-sm font-medium pt-1">
               <div className="flex items-center gap-1"><Sparkles size={12} /> Points to Earn</div>
               <span>+{pointsToEarn} pts</span>
            </div>
         </div>
         
         <div className="flex justify-between text-white font-black text-2xl items-baseline">
           <span className="text-lg font-normal text-white/80">Total</span>
           <span>₹{grandTotal}</span>
         </div>

         {/* Payment Methods */}
         <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => setPaymentMethod('upi')}
             className={`p-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all relative overflow-hidden ${paymentMethod === 'upi' ? 'bg-[#FF7A2F] text-white border-[#FF7A2F] shadow-lg shadow-[#FF7A2F]/20' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
           >
             <CreditCard size={20} className="relative z-10"/>
             <span className="text-xs font-bold relative z-10">UPI Pay</span>
           </button>
           <button 
             onClick={() => setPaymentMethod('wallet')}
             className={`p-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${paymentMethod === 'wallet' ? 'bg-[#3F8A4F] text-white border-[#3F8A4F] shadow-lg shadow-[#3F8A4F]/20' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
           >
             <Wallet size={20} />
             <span className="text-xs font-bold">Wallet (₹{walletBalance})</span>
           </button>
         </div>

         <Button onClick={handleOrder} className="w-full mt-2" size="lg" isLoading={isPlacingOrder}>
           Pay ₹{grandTotal} & Order
         </Button>
      </div>
    </div>
  );
};
