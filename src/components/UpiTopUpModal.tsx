import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ShieldCheck, Check, AlertCircle, Copy, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { api } from '../utils/api';

interface UpiTopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
}

export const UpiTopUpModal = ({ isOpen, onClose, userId, onSuccess }: UpiTopUpModalProps) => {
    const [step, setStep] = useState<'amount' | 'payment' | 'verify'>('amount');
    const [amount, setAmount] = useState<string>('100');
    const [utr, setUtr] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [merchantDetails, setMerchantDetails] = useState<{ upiId: string; name: string } | null>(null);
    const [simulationMode, setSimulationMode] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setStep('amount');
            setUtr('');
            api.getPaymentDetails().then(setMerchantDetails).catch(console.error);
            api.getPaymentSimulationStatus()
                .then((s: any) => setSimulationMode(Boolean(s?.simulationMode)))
                .catch(() => setSimulationMode(false));
        }
    }, [isOpen]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleVerify = async () => {
        if (!simulationMode && utr.length !== 12) {
            toast.error('Invalid UTR. It must be exactly 12 digits.');
            return;
        }

        setIsVerifying(true);
        try {
            const utrToSend = simulationMode ? '000000000000' : utr;
            await api.verifyUTR(utrToSend, Number(amount), 'upi');
            setStep('verify');
            if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (e: any) {
            toast.error(e.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const upiUri = merchantDetails ? `upi://pay?pa=${merchantDetails.upiId}&pn=${encodeURIComponent(merchantDetails.name)}&am=${amount}&cu=INR` : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-stone-950 rounded-[32px] border border-white/10 overflow-hidden relative z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-[16px] tracking-tight">Direct UPI Top-up</h3>
                                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-none mt-1">Zero-KYC Protocol</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {step === 'amount' && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-white/30 text-[12px] font-black uppercase tracking-[0.2em] mb-4">Select Credit Amount</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-white/20 text-4xl font-black">₹</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="bg-transparent text-white text-6xl font-black text-center focus:outline-none w-48 tracking-tighter"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {['100', '200', '500', '1000'].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(val)}
                                                className={`h-14 rounded-2xl border transition-all font-black uppercase tracking-widest text-[12px] ${amount === val ? 'bg-[var(--accent-orange)] border-[var(--accent-orange)] text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                                            >
                                                ₹{val}
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => setStep('payment')}
                                        className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[14px]"
                                    >
                                        Initiate Transfer
                                        <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                </div>
                            )}

                            {step === 'payment' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-6">
                                        {!simulationMode && (
                                            <div className="relative group">
                                                <div className="absolute -inset-4 bg-orange-500/20 rounded-[40px] blur-2xl group-hover:bg-orange-500/30 transition-all opacity-0 group-hover:opacity-100" />
                                                <div className="relative bg-white p-4 rounded-[32px] shadow-2xl">
                                                    <img src={qrUrl} alt="UPI QR" className="w-48 h-48 block" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-center">
                                            <p className="text-white font-black text-[18px] tracking-tight mb-1">{simulationMode ? `Simulate Payment ₹${amount}` : `Scan & Pay ₹${amount}`}</p>
                                            {!simulationMode && (
                                                <p className="text-white/30 text-[12px] font-bold uppercase tracking-widest">{merchantDetails?.name}</p>
                                            )}
                                        </div>

                                        <div className="w-full space-y-3">
                                            {!simulationMode && (
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group">
                                                    <div className="flex flex-col">
                                                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">VPA Context</span>
                                                        <span className="text-white font-black text-[14px]">{merchantDetails?.upiId}</span>
                                                    </div>
                                                    <button onClick={() => handleCopy(merchantDetails?.upiId || '')} className="p-2 text-white/20 group-hover:text-white transition-colors">
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {!simulationMode && (
                                            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex gap-3 text-orange-500/80">
                                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                                <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                                                    After paying, you must enter the 12-digit UTR number from your bank app.
                                                </p>
                                            </div>
                                        )}

                                        {!simulationMode && (
                                            <div className="space-y-2">
                                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest ml-1">Step 2: Enter Transaction ID (UTR)</p>
                                                <Input
                                                    placeholder="Enter 12-digit UTR"
                                                    value={utr}
                                                    maxLength={12}
                                                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                                                    className="h-16 rounded-2xl bg-white/5 border-white/10 text-white font-black text-center text-[18px] tracking-[0.2em]"
                                                />
                                            </div>
                                        )}

                                        <Button
                                            disabled={(!simulationMode && utr.length !== 12) || isVerifying}
                                            onClick={handleVerify}
                                            className="w-full h-16 rounded-2xl bg-[var(--accent-green)] text-white font-black uppercase tracking-widest text-[14px]"
                                        >
                                            {isVerifying ? <Loader2 className="animate-spin" /> : (simulationMode ? 'Simulate & Credit' : 'Validate & Credit')}
                                        </Button>
                                    </div>
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
                                        <h3 className="text-white font-black text-3xl tracking-tighter uppercase mb-2">Vault Credited</h3>
                                        <p className="text-white/40 text-[14px] font-bold uppercase tracking-widest">₹{amount} Added Successfully</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                        <ShieldCheck size={14} className="text-[var(--accent-green)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Verified via Blockchain Proof</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Security Footer */}
                        <div className="p-4 bg-stone-900 border-t border-white/5 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-30">
                                <span className="text-[10px] font-black text-white italic uppercase">DirectPay</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Secure Node 256-BIT AES</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
