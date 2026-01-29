import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Send, Copy, Star, Users, Award, CreditCard, User, Loader2, Heart, Share2, Sparkles, TrendingUp, ShieldCheck, ChevronRight, MessageSquare, Target, Zap, Info, Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { api } from '../utils/api';

// --- ANDROID CALIBRATED MODAL (24dp Margins, 56dp Header, Solid BG) ---
export const FeatureModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
   return (
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/95 z-[70]"
                  onClick={onClose}
               />
               <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0A0A0A] rounded-t-[24px] border-t border-white/10 overflow-hidden shadow-2xl flex flex-col"
                  style={{ maxHeight: '85vh' }}
               >
                  {/* Pull Handle */}
                  <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                  <div className="px-6 h-[64px] flex justify-between items-center border-b border-white/5 shrink-0 bg-black">
                     <div>
                        <h3 className="text-[20px] font-black text-white tracking-tight uppercase leading-none">{title}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
                           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Online</span>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
                     >
                        <X size={20} strokeWidth={3} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8 pb-32">
                     <div className="max-w-md mx-auto w-full">
                        {children}
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

// --- RECOMMENDED FRIENDS (56dp Fixed) ---
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
      <div className="space-y-2">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-blue-500">
               <TrendingUp size={24} />
            </div>
            <div>
               <h4 className="font-black text-white text-[18px] uppercase tracking-tight">Friends Buzz</h4>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mt-1">Global Signals</p>
            </div>
         </div>

         {recommendations.length === 0 ? (
            <div className="bg-[#111111] p-10 rounded-2xl text-center border border-white/5">
               <Users size={32} className="mx-auto mb-4 opacity-10" />
               <p className="text-[12px] font-black text-white/20 uppercase tracking-widest">Nothing here yet</p>
            </div>
         ) : recommendations.map((rec, i) => (
            <motion.div
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="h-[56px] bg-[#111111] px-4 rounded-xl border border-white/5 flex items-center gap-4 active:bg-stone-800 transition-all shadow-lg"
            >
               <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${rec.friendName}`} alt="friend" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-white uppercase truncate leading-none mb-1"><span className="text-[var(--accent-orange)]">{rec.friendName}</span> refers</p>
                  <p className="text-[10px] font-bold text-white/40 truncate uppercase leading-none">{rec.item}</p>
               </div>
               <span className="text-[8px] font-black text-white/10 uppercase">Active</span>
            </motion.div>
         ))}
      </div>
   );
};

// --- GIFT CARD STORE (56dp Strict Standard) ---
export const GiftCardStore = ({ userId, onActionSuccess }: { userId: string, onActionSuccess?: () => void }) => {
   const [code, setCode] = useState('');
   const [targetUserId, setTargetUserId] = useState('');
   const [searchTerm, setSearchTerm] = useState('');
   const [showSearch, setShowSearch] = useState(false);
   const [allUsers, setAllUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [purchasing, setPurchasing] = useState<number | null>(null);
   const [generatedCode, setGeneratedCode] = useState<string | null>(null);

   useEffect(() => {
      api.getUsers()
         .then(users => setAllUsers(users.filter((u: any) => u.id !== userId)))
         .catch(console.error);
   }, [userId]);

   const filteredUsers = allUsers.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const selectedUser = allUsers.find(u => u.id === targetUserId);

   const tokens = [
      { val: 200, bonus: 20, color: 'from-orange-600 to-rose-600', icon: Sparkles },
      { val: 500, bonus: 50, color: 'from-blue-600 to-indigo-700', icon: Award },
      { val: 1000, bonus: 150, color: 'from-emerald-600 to-teal-700', icon: Star },
   ];

   const handlePurchase = async (val: number, bonus: number) => {
      if (!targetUserId) {
         toast.error('Recipient Missing');
         return;
      }
      setPurchasing(val);
      try {
         const res = await api.purchaseGiftCard(userId, targetUserId, val, bonus);
         setGeneratedCode(res.code);
         toast.success('Sending Gift...');
         onActionSuccess?.();
      } catch (e) {
         toast.error('Gifting Failed');
      } finally {
         setPurchasing(null);
      }
   };

   const handleRedeem = async () => {
      if (!code) return;
      setLoading(true);
      try {
         const res = await api.claimGiftCard(code, userId);
         toast.success('Wallet Updated', { description: `₹${res.amount + res.bonus} added.` });
         setCode('');
         onActionSuccess?.();
      } catch (e: any) {
         toast.error(e.message || 'Request Failed');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="space-y-6">
         {generatedCode && (
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#111111] border border-white/10 p-6 rounded-2xl text-center shadow-2xl mb-6"
            >
               <p className="text-[10px] font-black text-[var(--accent-orange)] uppercase tracking-[0.2em] mb-4">GIFT CODE GENERATED</p>
               <div className="flex items-center justify-center gap-4 h-[56px] bg-black rounded-xl border border-white/5 px-4 mb-4">
                  <h3 className="text-[20px] font-black text-white tracking-[0.2em] font-mono">{generatedCode}</h3>
                  <button onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success('Copied'); }} className="p-2 text-white/40 active:text-white">
                     <Copy size={18} />
                  </button>
               </div>
               <Button variant="white" className="h-[56px] w-full rounded-xl" onClick={() => setGeneratedCode(null)}>Done</Button>
            </motion.div>
         )}

         <section>
            <div className="flex justify-between items-end mb-6 px-1">
               <h4 className="font-black text-white text-[18px] uppercase tracking-tight">Gift a Friend</h4>
               <span className="text-[10px] font-black text-[var(--accent-orange)] uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 leading-none">Gift Mode</span>
            </div>

            <div className="bg-[#111111] p-5 rounded-2xl border border-white/5 mb-6 shadow-xl relative">
               <label className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 block">Find Friend</label>

               {/* Search Interface */}
               <div className="relative">
                  <Input
                     placeholder="TYPE NAME OR ID..."
                     className="bg-black border-white/10 h-[56px] rounded-xl text-white font-black uppercase text-[12px] px-5 w-full"
                     value={searchTerm}
                     onChange={e => {
                        setSearchTerm(e.target.value);
                        setShowSearch(true);
                        if (!e.target.value) setTargetUserId('');
                     }}
                     onFocus={() => setShowSearch(true)}
                  />

                  <AnimatePresence>
                     {showSearch && searchTerm && (
                        <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="absolute top-[64px] left-0 right-0 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[240px] overflow-y-auto no-scrollbar"
                        >
                           {filteredUsers.length > 0 ? filteredUsers.map(u => (
                              <button
                                 key={u.id}
                                 onClick={() => {
                                    setTargetUserId(u.id);
                                    setSearchTerm(u.name);
                                    setShowSearch(false);
                                 }}
                                 className="w-full h-[56px] px-4 flex items-center gap-3 border-b border-white/5 last:border-none active:bg-stone-800 text-left"
                              >
                                 <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="avatar" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[12px] font-black text-white capitalize truncate">{u.name}</p>
                                    <p className="text-[8px] font-black text-[var(--accent-orange)] uppercase">{u.id}</p>
                                 </div>
                              </button>
                           )) : (
                              <div className="h-[56px] flex items-center justify-center text-[10px] font-black text-white/20 uppercase">
                                 No matching users found
                              </div>
                           )}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {selectedUser && !showSearch && (
                  <div className="mt-4 flex items-center gap-3 h-[48px] px-4 bg-black/40 rounded-xl border border-[var(--accent-green)]/20">
                     <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                     <p className="text-[10px] font-black text-white/60 uppercase">Locked to: <span className="text-white">{selectedUser.name}</span></p>
                  </div>
               )}
            </div>

            <div className="space-y-2">
               {tokens.map((t, i) => (
                  <motion.button
                     key={i}
                     disabled={purchasing !== null}
                     onClick={() => handlePurchase(t.val, t.bonus)}
                     whileTap={{ scale: 0.98 }}
                     className={`w-full h-[56px] rounded-xl bg-gradient-to-br ${t.color} relative overflow-hidden flex justify-between items-center px-5 shadow-lg border border-white/10 disabled:opacity-50`}
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center">
                           <t.icon size={18} className="text-white" />
                        </div>
                        <h5 className="text-[20px] font-black text-white tracking-tighter tabular-nums">₹{t.val}</h5>
                     </div>
                     <span className="text-[12px] font-black text-white/60 uppercase">₹{t.val + t.bonus}</span>
                  </motion.button>
               ))}
            </div>
         </section>

         <section className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-xl">
            <h4 className="font-black text-white text-[12px] uppercase tracking-widest mb-4 flex items-center gap-2">
               <ShieldCheck size={16} className="text-[var(--accent-green)]" /> Redeem Gift
            </h4>
            <div className="flex gap-2">
               <Input
                  placeholder="CODE..."
                  className="bg-black border-white/10 h-[56px] flex-1 rounded-xl text-white font-black uppercase tracking-widest text-[14px] px-5"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
               />
               <Button
                  variant="white"
                  className="h-[56px] px-8 shrink-0 rounded-xl uppercase font-black"
                  onClick={handleRedeem}
                  isLoading={loading}
               >
                  Apply
               </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 h-[56px] px-4 bg-black/50 rounded-xl border border-white/5 select-none">
               <Info size={16} className="text-[var(--accent-orange)] shrink-0" />
               <p className="text-[10px] font-black text-white/30 uppercase leading-none">Need help? Ask <span className="text-white">Offline Support</span></p>
            </div>
         </section>
      </div>
   );
};

// --- ELITE PROFILE ---
export const UserProfile = ({ userId, user, onLogout }: { userId: string, user: any, onLogout?: () => void }) => {
   return (
      <div className="space-y-10 pb-10">
         <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[var(--accent-orange)] to-rose-600 shadow-2xl mb-6">
               <div className="w-full h-full rounded-full bg-black p-0.5 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="avatar" className="w-full h-full rounded-full object-cover" />
               </div>
            </div>
            <h3 className="text-[28px] font-black text-white tracking-tight uppercase leading-none">{user?.name || 'Valued Member'}</h3>
            <div className="mt-3 h-[40px] px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Member ID: <span className="text-white">{userId}</span></span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-2">
            <div className="h-[80px] bg-[#111111] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 shadow-lg">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Balance</span>
               <span className="text-[22px] font-black text-[var(--accent-green)] tabular-nums">₹{user?.balance || 0}</span>
            </div>
            <div className="h-[80px] bg-[#111111] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 shadow-lg">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Points Gained</span>
               <span className="text-[22px] font-black text-[var(--accent-orange)] tabular-nums">{user?.points || 0}</span>
            </div>
         </div>

         <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
               {[
                  { label: 'Identity', val: 'C7-AUTH-SEC', icon: User },
                  { label: 'Wallet Balance', val: `₹${user?.balance || 0}`, icon: Wallet },
                  { label: 'Neural Link', val: '+91 98765 43210', icon: CreditCard },
                  { label: 'Hierarchy', val: 'Level Elite', icon: ShieldCheck }
               ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center h-[24px]">
                     <div className="flex items-center gap-3 text-white/20">
                        <item.icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                     </div>
                     <span className="text-[12px] font-black text-white uppercase tracking-tight">{item.val}</span>
                  </div>
               ))}
            </div>
            <button
               onClick={onLogout}
               className="w-full h-[64px] bg-red-600/5 text-red-500 text-[12px] font-black uppercase tracking-[0.2em] border-t border-white/5 active:bg-red-600/10 transition-colors"
            >
               Log Out
            </button>
         </div>
      </div>
   );
};

// --- COLLECTION LIST ---
export const CollectionList = ({ userId }: { userId: string }) => {
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      api.getUserCollection(userId).then(d => { setData(d); setLoading(false); });
   }, [userId]);

   if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent-orange)]" /></div>;

   return (
      <div className="space-y-8">
         <section>
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-6 px-1">My Badges</h4>
            <div className="grid grid-cols-2 gap-2">
               {data.badges.map((b: any) => (
                  <div key={b.id} className="h-[120px] bg-[#111111] rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 shadow-xl">
                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-3xl shadow-lg border border-white/10`}>
                        {b.icon}
                     </div>
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{b.name}</span>
                  </div>
               ))}
            </div>
         </section>
         <section>
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-6 px-1">Achievements</h4>
            <div className="space-y-2">
               {data.achievements.map((a: any) => (
                  <div key={a.id} className={`h-[56px] px-4 rounded-xl border flex items-center gap-4 ${a.completed ? 'bg-[#111111] border-white/10 shadow-lg' : 'bg-black/50 border-white/5 opacity-40'}`}>
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.completed ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]' : 'bg-white/5 text-white/20'}`}>
                        {a.completed ? <ShieldCheck size={18} /> : <Target size={18} />}
                     </div>
                     <div className="flex-1">
                        <p className="text-[12px] font-black text-white uppercase leading-none mb-1">{a.name}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase truncate leading-none">{a.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
};

// --- FEEDBACK FLOW ---
export const FeedbackForm = ({ userId }: { userId: string }) => {
   const [text, setText] = useState('');
   const [rating, setRating] = useState(5);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
      if (!text) return;
      setLoading(true);
      try {
         await api.submitFeedback({ userId, comment: text, rating, createdAt: Date.now() });
         toast.success('Feedback Sent');
         setText('');
      } catch (e) {
         toast.error('Submit Failed');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="space-y-6">
         <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest mb-8 text-center px-1">Give Feedback</h4>
            <div className="flex justify-center gap-2 mb-10">
               {[1, 2, 3, 4, 5].map(s => (
                  <button
                     key={s}
                     onClick={() => setRating(s)}
                     className={`w-12 h-[56px] rounded-xl flex items-center justify-center text-xl transition-all border ${rating >= s ? 'bg-white text-black border-white shadow-xl' : 'bg-black text-white/10 border-white/5'}`}
                  >
                     ★
                  </button>
               ))}
            </div>
            <textarea
               placeholder="MESSAGE..."
               className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 text-white font-black uppercase text-[12px] tracking-widest outline-none focus:border-white/20 transition-all resize-none shadow-inner"
               value={text}
               onChange={e => setText(e.target.value)}
            />
            <Button
               variant="white"
               className="w-full mt-6 h-[56px] rounded-xl uppercase font-black tracking-widest shadow-2xl"
               onClick={handleSubmit}
               isLoading={loading}
               disabled={!text}
            >
               Submit Now
            </Button>
         </div>
      </div>
   );
};

// --- FLASH SALE LIST (Rescue Food) ---
export const FlashSaleList = ({ userId, onRescue }: { userId: string, onRescue: (saleId: string, amount: number) => void }) => {
   const [sales, setSales] = useState<any[]>([]);

   const fetchSales = async () => {
      try {
         const data = await api.getFlashSales();
         setSales(data);
      } catch (e) {
         console.error(e);
      }
   };

   useEffect(() => {
      fetchSales();
      const interval = setInterval(fetchSales, 10000); // Poll every 10s
      return () => clearInterval(interval);
   }, []);

   if (sales.length === 0) return null;

   return (
      <div className="mb-10">
         <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-1.5 h-6 bg-[var(--accent-orange)] rounded-full animate-pulse" />
            <h2 className="text-[18px] font-black text-white uppercase tracking-tight">⚡ Live Rescues</h2>
         </div>

         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1 snap-x">
            {sales.map(sale => (
               <motion.div
                  layout
                  key={sale._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="min-w-[280px] bg-stone-900 rounded-2xl border border-[var(--accent-orange)]/30 p-5 shadow-[0_0_20px_rgba(249,115,22,0.1)] relative overflow-hidden snap-center"
               >
                  <div className="absolute top-0 right-0 bg-[var(--accent-orange)] text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                     30% OFF
                  </div>

                  <h4 className="text-[18px] font-black text-white uppercase leading-none mb-1 translate-y-2">{sale.itemName}</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6 translate-y-2">Chef prepared • Ready now</p>

                  <div className="flex items-end justify-between mt-4 border-t border-dashed border-white/10 pt-4">
                     <div>
                        <p className="text-[10px] font-black text-white/20 line-through tabular-nums">₹{sale.originalPrice}</p>
                        <p className="text-[24px] font-black text-[var(--accent-orange)] tabular-nums leading-none">₹{sale.discountedPrice}</p>
                     </div>
                     <Button
                        onClick={() => onRescue(sale._id, sale.discountedPrice)}
                        variant="white"
                        className="h-[40px] px-6 rounded-lg text-[10px] uppercase font-black tracking-widest bg-[var(--accent-orange)] text-white hover:bg-orange-600 border-none"
                     >
                        Rescue
                     </Button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
   );
};

// --- BROADCASTER ---
export const RecommendToFriends = ({ userId, menu }: { userId: string, menu: any[] }) => {
   const [selectedItem, setSelectedItem] = useState('');
   const [friendName, setFriendName] = useState('');
   const [loading, setLoading] = useState(false);

   const handleRecommend = async () => {
      if (!selectedItem || !friendName) return;
      setLoading(true);
      try {
         await api.recommendToFriend({ userId, item: selectedItem, friendName });
         toast.success('Recommended!');
         setSelectedItem('');
         setFriendName('');
      } catch (e) {
         toast.error('Sync Error');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="space-y-6">
         <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <Zap className="text-[var(--accent-orange)]" size={20} />
               </div>
               <h4 className="text-[14px] font-black text-white uppercase tracking-widest">Recommend Food</h4>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Friend's Name</label>
                  <Input
                     placeholder="NAME..."
                     className="bg-black border-white/10 h-[56px] rounded-xl text-white font-black uppercase text-[14px] px-5 shadow-inner"
                     value={friendName}
                     onChange={e => setFriendName(e.target.value)}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Food Item</label>
                  <select
                     className="w-full h-[56px] rounded-xl bg-black border border-white/10 px-5 font-black text-[12px] text-white uppercase outline-none shadow-inner"
                     value={selectedItem}
                     onChange={e => setSelectedItem(e.target.value)}
                  >
                     <option value="">SELECT...</option>
                     {menu.map(item => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                     ))}
                  </select>
               </div>
               <Button
                  variant="white"
                  className="w-full mt-4 h-[56px] rounded-xl uppercase font-black"
                  onClick={handleRecommend}
                  isLoading={loading}
                  disabled={!selectedItem || !friendName}
               >
                  Recommend
               </Button>
            </div>
         </div>
      </div>
   );
};