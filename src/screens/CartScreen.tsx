import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Trash2, CreditCard, Wallet, ShoppingBag, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/Input';

export const CartScreen = ({ cart, onUpdateQuantity, onPlaceOrder, total, isPlacingOrder }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet'>('upi');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const taxes = Math.ceil(total * 0.05);
  const grandTotal = total + taxes;
  const pointsToEarn = Math.floor(total * 0.05);
  const walletBalance = 1540;

  const handleOrder = () => {
    onPlaceOrder({
      paymentMethod,
      scheduledTime: scheduledTime || undefined,
      loyaltyPointsEarned: pointsToEarn
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-[var(--bg-primary)]">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--input-bg)] flex items-center justify-center mb-8 border border-[var(--border-color)]">
          <ShoppingBag className="w-9 h-9 sm:w-[42px] sm:h-[42px] text-[var(--text-muted)] opacity-50" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight">Your Tray is Empty</h3>
        <p className="text-[var(--text-secondary)] text-[10px] sm:text-xs font-medium max-w-[200px] leading-relaxed">Delicious feasts are just a tap away. Head back to the menu to begin!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6 sm:pt-10 pb-40 px-4 sm:px-6 overflow-hidden bg-[var(--bg-primary)]">
      <div className="flex justify-between items-end mb-6 sm:mb-8 px-1 lg:px-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">My Tray</h2>
          <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1.5">{cart.length} Curated Items</p>
        </div>
        <div className="bg-[var(--accent-orange)] text-white text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20 whitespace-nowrap">
          READY TO SERVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 pr-1 pb-4 custom-scrollbar smooth-scroll">
        <AnimatePresence mode='popLayout'>
          {cart.map((item: CartItem) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-[var(--card-bg)] rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 flex gap-3 sm:gap-5 border border-[var(--border-color)] shadow-xl relative overflow-hidden"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-[var(--border-color)] shadow-inner">
                <ImageWithFallback src={item.image} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                <h4 className="font-black text-[var(--text-primary)] text-[11px] sm:text-sm truncate uppercase tracking-tight">{item.name}</h4>
                <p className="text-[var(--accent-orange)] font-black text-sm sm:text-base mt-0.5">₹{item.price * item.quantity}</p>
                {item.isPackaged && <span className="text-[7px] sm:text-[8px] font-black text-[var(--text-muted)] bg-[var(--input-bg)] px-2 py-0.5 rounded-full border border-[var(--border-color)] uppercase tracking-widest mt-1.5 inline-block">Safe Pack</span>}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 bg-[var(--input-bg)] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-[var(--border-color)] shadow-inner self-center">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-[var(--text-muted)] hover:text-red-500 active:scale-75 transition-all"
                >
                  {item.quantity === 1 ? <Trash2 size={14} className="sm:w-4 sm:h-4" /> : '-'}
                </button>
                <span className="text-[10px] sm:text-xs font-black text-[var(--text-primary)] w-4 sm:w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-[var(--text-muted)] hover:text-[var(--accent-green)] active:scale-75 transition-all"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 sm:mt-6 premium-glass p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-color)] shadow-2xl space-y-4 sm:space-y-6 relative z-10 shrink-0 mb-4 sm:mb-0">

        {/* Scheduled Pickup */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-orange)]" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Schedule Pickup</span>
          </div>
          <Input
            type="time"
            className="w-28 sm:w-32 h-8 sm:h-10 px-3 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase rounded-xl"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>

        {/* Dynamic Payment Selection */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => setPaymentMethod('upi')}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 sm:gap-2 border-2 transition-all relative overflow-hidden group ${paymentMethod === 'upi' ? 'bg-[var(--accent-orange)] border-[var(--accent-orange)] text-white shadow-xl shadow-orange-500/20' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-muted)]'}`}
          >
            <CreditCard className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${paymentMethod === 'upi' ? 'animate-pulse' : 'opacity-40'}`} />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none">UPI Digital</span>
          </button>
          <button
            onClick={() => setPaymentMethod('wallet')}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 sm:gap-2 border-2 transition-all relative overflow-hidden group ${paymentMethod === 'wallet' ? 'bg-[var(--accent-green)] border-[var(--accent-green)] text-white shadow-xl shadow-green-500/20' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-muted)]'}`}
          >
            <Wallet className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${paymentMethod === 'wallet' ? 'animate-pulse' : 'opacity-40'}`} />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none text-center">Wallet Credit</span>
          </button>
        </div>

        {/* Final Receipt */}
        <div className="space-y-1.5 sm:space-y-2 py-3 sm:py-4 border-t border-b border-[var(--border-color)] border-dashed">
          <div className="flex justify-between items-center">
            <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Items Value</span>
            <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] font-mono">₹{total}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FFD700]" />
              <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-green)] uppercase tracking-widest">C7 Rewards</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-green)] font-mono">+{pointsToEarn} pts</span>
          </div>
        </div>

        <div className="flex justify-between items-center pb-1">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Grand Total</p>
            <h3 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tighter leading-none">₹{grandTotal}</h3>
          </div>
          <Button onClick={handleOrder} isLoading={isPlacingOrder} className="px-5 sm:px-8 h-12 sm:h-14 text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-2xl">
            {isPlacingOrder ? '...' : 'Checkout'} <ChevronRight strokeWidth={3} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
