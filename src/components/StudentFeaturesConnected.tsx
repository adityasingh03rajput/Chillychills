import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Send, Copy, Star, Users, Award, CreditCard, User, Loader2, Heart, Share2, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { api } from '../utils/api';

// --- ELITE MODAL WRAPPER ---
export const FeatureModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
   return (
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-md"
                  onClick={onClose}
               />
               <motion.div
                  initial={{ y: '100%', opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0.5 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
                  className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--bg-primary)] rounded-t-[3rem] border-t border-[var(--border-color)] overflow-hidden shadow-2xl flex flex-col"
                  style={{ maxHeight: '85vh' }}
               >
                  {/* Dynamic Handle */}
                  <div className="w-12 h-1 bg-[var(--text-muted)]/20 rounded-full mx-auto mt-3 mb-1" />

                  <div className="px-8 py-6 flex justify-between items-center border-b border-[var(--border-color)]">
                     <div>
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <div className="w-1 h-1 rounded-full bg-[var(--accent-orange)]" />
                           <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Premium Feature</span>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-primary)] active:scale-90 transition-all shadow-inner"
                     >
                        <X size={20} strokeWidth={2.5} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pt-8 pb-32">
                     {children}
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

// --- RECOMMENDED FRIENDS ---
export const RecommendedList = ({ userId }: { userId: string }) => {
   const [recommendations, setRecommendations] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchRecs = async () => {
         try {
            const data = await api.getRecommendations(userId);
            setRecommendations(data || []);
         } catch (e) {
            console.error('Failed to fetch recommendations:', e);
         } finally {
            setLoading(false);
         }
      };
      fetchRecs();
   }, [userId]);

   if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent-orange)]" size={32} /></div>;

   return (
      <div className="space-y-6">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
               <TrendingUp size={24} />
            </div>
            <div>
               <h4 className="font-black text-[var(--text-primary)] text-lg">Social Feed</h4>
               <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Trending among your friends</p>
            </div>
         </div>

         {recommendations.length === 0 ? (
            <div className="bg-[var(--card-bg)] p-8 rounded-[2rem] text-center border border-[var(--border-color)]">
               <Users size={32} className="mx-auto mb-4 opacity-20" />
               <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Quiet on the feed</p>
            </div>
         ) : recommendations.map((rec, i) => (
            <motion.div
               key={i}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-[var(--card-bg)] p-5 rounded-[2rem] border border-[var(--border-color)] flex items-center gap-4 shadow-xl hover:border-[var(--accent-orange)]/20 transition-all group"
            >
               <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[var(--input-bg)] group-hover:scale-105 transition-transform">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${rec.friendName}`} alt="friend" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)]"><span className="text-[var(--accent-orange)]">{rec.friendName}</span> recommends</p>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mt-1 truncate">{rec.item}</p>
               </div>
               <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter opacity-60">Just now</span>
            </motion.div>
         ))}
      </div>
   );
};

// --- ELITE GIFT CARDS ---
export const GiftCardStore = ({ userId }: { userId: string }) => {
   const [code, setCode] = useState('');
   const tokens = [
      { val: 200, bonus: 20, color: 'from-orange-500 to-rose-500', icon: Sparkles },
      { val: 500, bonus: 75, color: 'from-blue-500 to-indigo-600', icon: Award },
      { val: 1200, bonus: 300, color: 'from-emerald-500 to-teal-600', icon: Star },
   ];

   return (
      <div className="space-y-10">
         <section>
            <div className="flex justify-between items-end mb-8">
               <h4 className="font-black text-[var(--text-primary)] text-xl">Top Up Tokens</h4>
               <span className="text-[10px] font-black text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 px-3 py-1 rounded-full uppercase tracking-widest">+BONUS INCLUDED</span>
            </div>

            <div className="space-y-4">
               {tokens.map((t, i) => (
                  <motion.button
                     key={i}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className={`w-full p-6 rounded-[2.5rem] bg-gradient-to-br ${t.color} relative overflow-hidden flex justify-between items-center group shadow-2xl`}
                  >
                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="relative z-10 text-left">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Campus Token</span>
                        <h5 className="text-4xl font-black text-white tracking-tighter">₹{t.val}</h5>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                           <t.icon size={12} className="text-white" />
                           <span className="text-[10px] font-black text-white uppercase">+₹{t.bonus} ELITE BONUS</span>
                        </div>
                     </div>
                     <ChevronRight size={32} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" strokeWidth={3} />
                  </motion.button>
               ))}
            </div>
         </section>

         <section className="bg-[var(--input-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)]">
            <h4 className="font-black text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
               <ShieldCheck size={20} className="text-[var(--accent-green)]" /> Redeem Code
            </h4>
            <div className="flex gap-2">
               <Input
                  placeholder="CHILL-ELITE-XXX"
                  className="bg-[var(--card-bg)] border-[var(--border-color)] h-14 rounded-2xl text-[var(--text-primary)] font-black uppercase tracking-widest placeholder:text-[var(--text-muted)]"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
               />
               <Button className="h-14 bg-[var(--accent-orange)] px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">Apply</Button>
            </div>
         </section>
      </div>
   );
};

// --- ELITE PROFILE ---
export const UserProfile = ({ userId }: { userId: string }) => {
   return (
      <div className="space-y-10 pb-10">
         <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-[var(--accent-orange)] to-rose-500 shadow-2xl mb-6">
               <div className="w-full h-full rounded-full bg-[var(--bg-primary)] p-1 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
               </div>
            </div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Alex Johnson</h3>
            <div className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mt-1 opacity-60 flex items-center gap-2 justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" /> Computer Science • W120
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] flex flex-col items-center justify-center gap-2 shadow-xl">
               <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Orders</span>
               <span className="text-2xl font-black text-[var(--text-primary)]">42</span>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] flex flex-col items-center justify-center gap-2 shadow-xl">
               <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Points</span>
               <span className="text-2xl font-black text-[var(--accent-orange)]">1.2K</span>
            </div>
         </div>

         <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-xl">
            <div className="p-6 space-y-5">
               {[
                  { label: 'College ID', val: '2024CS101', icon: User },
                  { label: 'Phone Hub', val: '+91 98765 43210', icon: CreditCard },
                  { label: 'Security', val: 'Verified Student', icon: ShieldCheck }
               ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-2">
                     <div className="flex items-center gap-3 text-[var(--text-muted)]">
                        <item.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-xs font-black text-[var(--text-primary)]">{item.val}</span>
                  </div>
               ))}
            </div>
            <button className="w-full py-6 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border-t border-[var(--border-color)] active:bg-red-500/10 transition-colors">
               End Session / Logout
            </button>
         </div>
      </div>
   );
};

// Placeholder components to maintain build integrity
export const FeedbackForm = ({ userId }: { userId: string }) => <div className="py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-widest">Feedback Module Offline</div>;
export const CollectionList = ({ userId }: { userId: string }) => <div className="py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-widest">Badge Hub Locked</div>;
export const RecommendToFriends = ({ userId, menu }: { userId: string, menu: any[] }) => <div className="py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-widest">Social Connect Unavailable</div>;

import { ChevronRight as ChevronRightIcon } from 'lucide-react';
const ChevronRight = ChevronRightIcon;