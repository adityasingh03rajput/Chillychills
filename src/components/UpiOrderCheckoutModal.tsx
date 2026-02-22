import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Copy, CreditCard, Loader2, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { Button } from './ui/Button';

interface UpiOrderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaid: (paymentTransactionId?: string) => void;
}

export const UpiOrderCheckoutModal = ({ isOpen, onClose, amount, onPaid }: UpiOrderCheckoutModalProps) => {
  const [step, setStep] = useState<'payment' | 'verify'>('payment');
  const [isPaying, setIsPaying] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState<{ upiId: string; name: string } | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('payment');
    api.getPaymentDetails().then(setMerchantDetails).catch(() => setMerchantDetails(null));
    api.getPaymentSimulationStatus()
      .then((s: any) => setSimulationMode(Boolean(s?.simulationMode)))
      .catch(() => setSimulationMode(false));
  }, [isOpen]);

  const upiUri = useMemo(() => {
    if (!merchantDetails) return '';
    return `upi://pay?pa=${merchantDetails.upiId}&pn=${encodeURIComponent(merchantDetails.name)}&am=${amount}&cu=INR`;
  }, [merchantDetails, amount]);

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  }, [upiUri]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handlePay = async () => {
    if (!simulationMode) {
      toast.error('UPI gateway is not enabled on this server');
      return;
    }

    setIsPaying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const txId = `SIMUPI${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setStep('verify');
      if (window.navigator.vibrate) window.navigator.vibrate([60, 40, 60]);
      setTimeout(() => {
        onPaid(txId);
        onClose();
      }, 900);
    } catch (e: any) {
      toast.error(e?.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            className="w-full max-w-md bg-stone-950 rounded-[32px] border border-white/10 overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-[16px] tracking-tight">UPI Checkout</h3>
                  <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">Gateway Protocol</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Total Amount</p>
                    <p className="text-white text-5xl font-black tracking-tighter tabular-nums">₹{amount}</p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-orange-500/20 rounded-[40px] blur-2xl transition-all opacity-100" />
                      <div className="relative bg-white p-4 rounded-[32px] shadow-2xl">
                        <img src={qrUrl} alt="UPI QR" className="w-52 h-52 block" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-white font-black text-[18px] tracking-tight mb-1">Scan & Pay</p>
                      <p className="text-white/30 text-[12px] font-bold uppercase tracking-widest">{merchantDetails?.name || 'Merchant'}</p>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">VPA Context</span>
                          <span className="text-white font-black text-[14px]">{merchantDetails?.upiId || '---'}</span>
                        </div>
                        <button onClick={() => handleCopy(merchantDetails?.upiId || '')} className="p-2 text-white/20 group-hover:text-white transition-colors">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    disabled={isPaying || !simulationMode}
                    onClick={handlePay}
                    className="w-full h-16 rounded-2xl bg-[var(--accent-green)] text-white font-black uppercase tracking-widest text-[14px]"
                  >
                    {isPaying ? <Loader2 className="animate-spin" /> : 'Simulate & Place Order'}
                    {!isPaying && <ArrowRight className="ml-2" size={18} />}
                  </Button>
                </div>
              )}

              {step === 'verify' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 flex flex-col items-center text-center gap-6"
                >
                  <div className="w-24 h-24 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center text-[var(--accent-green)]">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-3xl tracking-tighter uppercase mb-2">Payment Verified</h3>
                    <p className="text-white/40 text-[14px] font-bold uppercase tracking-widest">Order Transmission Started</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                    <ShieldCheck size={14} className="text-[var(--accent-green)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Simulated Gateway Proof</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
