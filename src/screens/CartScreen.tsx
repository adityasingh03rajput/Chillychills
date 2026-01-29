import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../utils/types';
import { Button } from '../components/ui/Button';
import { Trash2, CreditCard, Wallet, ShoppingBag, Clock, Sparkles, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export const CartScreen = ({ cart, onUpdateQuantity, onPlaceOrder, total, isPlacingOrder, user }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet'>('upi');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const taxes = 0;
  const grandTotal = total + taxes;
  const pointsToEarn = Math.floor(total * 0.05);
  const walletBalance = user?.balance || 0;
  const isInsufficientBalance = paymentMethod === 'wallet' && walletBalance < grandTotal;

  const handleOrder = () => {
    if (isInsufficientBalance) {
      toast.error('Insufficient Vault Capital', {
        description: 'Please refill your wallet or use UPI.',
        icon: <AlertCircle className="text-red-500" />
      });
      return;
    }

    if (window.navigator.vibrate) window.navigator.vibrate(10);

    onPlaceOrder({
      paymentMethod,
      scheduledTime: scheduledTime || undefined,
      loyaltyPointsEarned: pointsToEarn
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-black">
        <div className="w-20 h-20 rounded-[24px] bg-stone-900 border border-white/5 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-white/10" />
        </div>
        <h3 className="text-[20px] font-black text-white uppercase tracking-tight">Tray Empty</h3>
        <p className="text-[14px] font-bold text-white/30 uppercase mt-4 max-w-[180px]">Vault requires data input to proceed</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden pt-6 pb-24 px-6">

      {/* 56h Top App Bar Header */}
      <div className="flex justify-between items-center h-[56px] mb-8">
        <div>
          <h2 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">My Tray</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
            <p className="text-[12px] font-black text-white/40 uppercase">{cart.length} Selections</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-white/5 text-[10px] font-black text-white/30 uppercase">
          Safe Protocol
        </div>
      </div>

      {/* 24dp Margin Area + 12dp Corner Items */}
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-8">
        <AnimatePresence mode='popLayout'>
          {cart.map((item: CartItem) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 rounded-xl p-3 flex gap-4 border border-white/5 shadow-lg group relative"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-stone-800">
                <ImageWithFallback src={item.image} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 py-0.5">
                <h4 className="font-black text-white text-[16px] truncate uppercase tracking-tight mb-1">{item.name}</h4>
                <p className="text-[var(--accent-orange)] font-black text-[16px]">₹{item.price * item.quantity}</p>
                {item.isPackaged && (
                  <span className="text-[8px] font-black text-[var(--accent-green)] mt-2 inline-block uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--accent-green)]/20">Secured</span>
                )}
              </div>

              <div className="flex flex-col items-center justify-between py-1 bg-stone-800/50 rounded-lg w-10 border border-white/5 self-stretch">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-white active:scale-75 transition-all text-xl font-black"
                >
                  +
                </button>
                <span className="text-[14px] font-black text-white tabular-nums">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-white/30 active:scale-75 transition-all"
                >
                  {item.quantity === 1 ? <Trash2 size={14} /> : <span className="text-xl font-black">-</span>}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 56dp Height Interactive Action Block (Material Android Specs) */}
      <div className="bg-stone-900 rounded-[2.5rem] p-6 border border-white/10 shadow-2xl space-y-6 relative z-10 shrink-0 mb-4">

        <div className="space-y-4">
          {/* Pickup Selection (56dp Height Equivalent) */}
          <div className="flex items-center justify-between h-[56px] px-5 bg-stone-800 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-white">
              <Clock size={18} className="text-[var(--accent-orange)]" />
              <span className="text-[14px] font-black uppercase tracking-widest text-white/40">Pickup Protocol</span>
            </div>
            <Input
              type="time"
              className="w-24 h-8 px-2 text-[14px] font-black uppercase bg-transparent border-none text-right text-white"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`h-[56px] rounded-xl flex items-center justify-center gap-3 border transition-all ${paymentMethod === 'upi' ? 'bg-white text-black border-white shadow-xl' : 'bg-stone-800 text-white/30 border-white/5'}`}
            >
              <CreditCard size={18} />
              <span className="text-[14px] font-black uppercase tracking-tight leading-none">UPI Relay</span>
            </button>
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`h-[56px] rounded-xl flex items-center justify-center gap-3 border transition-all ${paymentMethod === 'wallet' ? (isInsufficientBalance ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[var(--accent-green)] text-white border-[var(--accent-green)] shadow-xl') : 'bg-stone-800 text-white/30 border-white/5'}`}
            >
              <Wallet size={18} />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[14px] font-black uppercase tracking-tight leading-none">Vault</span>
                <span className="text-[10px] font-bold opacity-60">₹{walletBalance}</span>
              </div>
            </button>
          </div>
        </div>

        {/* 12sp Caption Summary Details */}
        <div className="py-4 border-y border-white/5 border-dashed space-y-2">
          {/* 
          <div className="flex justify-between items-center opacity-40">
            <span className="text-[12px] font-black uppercase tracking-widest text-white">Transmission Fee</span>
            <span className="text-[14px] font-black tabular-nums text-white">₹{taxes}</span>
          </div> 
          */}
          <div className="flex justify-between items-center text-[var(--accent-green)]">
            <div className="flex items-center gap-2">
              <Sparkles size={14} />
              <span className="text-[12px] font-black uppercase tracking-widest">Energy Gain</span>
            </div>
            <span className="text-[14px] font-black tabular-nums">+{pointsToEarn} Energy</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 gap-4">
          <div className="shrink-0 flex flex-col gap-1">
            <p className="text-[12px] font-black text-white/30 uppercase tracking-widest">Total Credit</p>
            <h3 className="text-[28px] font-black text-white tracking-tighter tabular-nums leading-none">₹{grandTotal}</h3>
          </div>
          <Button
            onClick={handleOrder}
            isLoading={isPlacingOrder}
            disabled={isPlacingOrder || isInsufficientBalance}
            variant={isInsufficientBalance ? "ghost" : "white"}
            size="xl"
            className="flex-1"
          >
            {isPlacingOrder ? '...' : isInsufficientBalance ? 'No Storage' : 'Complete Transfer'}
            {!isPlacingOrder && !isInsufficientBalance && <ArrowRight size={18} strokeWidth={3} className="ml-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
