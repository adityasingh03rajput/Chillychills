import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Send, Copy, Star, Users, Award, CreditCard, User, Loader2, Heart, Share2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner';
import { api } from '../utils/api';

// --- MODAL WRAPPER ---
export const FeatureModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1E1E1E] rounded-t-3xl border-t border-white/10 max-h-[75vh] flex flex-col"
          >
             <div className="p-4 flex justify-between items-center border-b border-white/5 flex-shrink-0">
                <h3 className="text-xl font-bold text-white font-brand text-[#FF7A2F]">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                   <X size={20} />
                </button>
             </div>
             <div className="p-6 pb-32 overflow-y-auto flex-1 overscroll-contain custom-scrollbar">
                {children}
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- RECOMMENDED ---
export const RecommendedList = ({ userId }: { userId: string }) => {
   const [recommendations, setRecommendations] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchRecs = async () => {
         try {
            const data = await api.getRecommendations(userId);
            setRecommendations(data);
         } catch (e) {
            console.error('Failed to fetch recommendations:', e);
         } finally {
            setLoading(false);
         }
      };
      fetchRecs();
   }, [userId]);

   const formatTime = (timestamp: number) => {
      const diff = Date.now() - timestamp;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      if (mins < 60) return `${mins}m ago`;
      return `${hours}h ago`;
   };

   if (loading) {
      return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#FF7A2F]" size={24} /></div>;
   }

   return (
      <div className="space-y-4">
         <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
            <h4 className="text-blue-400 font-bold mb-1 flex items-center gap-2"><Users size={16}/> Friend Activity</h4>
            <p className="text-blue-200/60 text-xs">See what your friends are ordering right now!</p>
         </div>
         {recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {rec.friendName[0]}
               </div>
               <div className="flex-1">
                  <p className="text-white font-medium text-sm"><span className="font-bold text-[#FF7A2F]">{rec.friendName}</span> recommends</p>
                  <p className="text-white/60 text-xs">{rec.item}</p>
               </div>
               <span className="text-xs text-white/40">{formatTime(rec.time)}</span>
            </div>
         ))}
      </div>
   );
};

// --- GIFT CARDS ---
export const GiftCardStore = ({ userId }: { userId: string }) => {
   const cards = [
      { val: 100, bonus: 0, color: 'from-orange-500 to-red-500' },
      { val: 500, bonus: 50, color: 'from-purple-500 to-indigo-500' },
      { val: 1000, bonus: 150, color: 'from-emerald-500 to-teal-500' },
   ];
   
   const [code, setCode] = useState('');
   const [claiming, setClaiming] = useState(false);
   const [purchasing, setPurchasing] = useState(false);

   const handlePurchase = async (amount: number, bonus: number) => {
      setPurchasing(true);
      try {
         const giftCard = await api.purchaseGiftCard(userId, amount, bonus);
         
         // Try to copy to clipboard, but don't fail if it doesn't work
         let copySuccess = false;
         try {
            await navigator.clipboard.writeText(giftCard.code);
            copySuccess = true;
         } catch (clipboardError) {
            console.log('Clipboard API not available:', clipboardError);
         }
         
         toast.success(
            <div className="flex flex-col gap-1">
               <span className="font-bold">🎉 Gift Card Purchased!</span>
               <div className="flex items-center gap-2 bg-black/30 px-2 py-1.5 rounded mt-1">
                  <span className="text-xs font-mono text-yellow-300 font-bold">{giftCard.code}</span>
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        // Fallback copy method
                        const textArea = document.createElement('textarea');
                        textArea.value = giftCard.code;
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                           document.execCommand('copy');
                           toast.info('Code copied to clipboard!');
                        } catch (err) {
                           console.log('Copy failed');
                        }
                        document.body.removeChild(textArea);
                     }}
                     className="text-blue-400 hover:text-blue-300 text-[10px] underline"
                  >
                     Copy
                  </button>
               </div>
               <span className="text-xs text-white/60">
                  {copySuccess ? '✓ Code copied to clipboard' : 'Tap "Copy" to copy the code'}
               </span>
            </div>,
            { duration: 8000 }
         );
      } catch (e: any) {
         console.error('Gift card purchase error:', e);
         toast.error(e.message || 'Failed to purchase gift card');
      } finally {
         setPurchasing(false);
      }
   };

   const handleClaim = async () => {
      if (!code) return;
      setClaiming(true);
      try {
         const result = await api.claimGiftCard(code, userId);
         toast.success(`Gift card redeemed! ₹${result.totalValue} added to your wallet.`);
         setCode('');
      } catch (e: any) {
         toast.error(e.message || 'Failed to claim gift card');
      } finally {
         setClaiming(false);
      }
   };

   return (
      <div className="space-y-6">
         {/* Buy Section */}
         <section>
            <h4 className="text-white font-bold mb-3 flex items-center gap-2"><CreditCard size={16} className="text-[#FF7A2F]"/> Buy Gift Cards</h4>
            <div className="grid gap-3">
               {cards.map(c => (
                  <button 
                     key={c.val} 
                     onClick={() => handlePurchase(c.val, c.bonus)} 
                     disabled={purchasing}
                     className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-r ${c.color} text-left group disabled:opacity-50`}
                  >
                     <div className="relative z-10 flex justify-between items-center text-white">
                        <div>
                           <h5 className="font-black text-2xl">₹{c.val}</h5>
                           {c.bonus > 0 && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">+ ₹{c.bonus} Bonus</span>}
                        </div>
                        {purchasing ? <Loader2 className="animate-spin" size={32} /> : <Gift size={32} className="opacity-80 group-hover:scale-110 transition-transform"/>}
                     </div>
                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
               ))}
            </div>
         </section>

         {/* Claim Section */}
         <section className="pt-4 border-t border-white/10">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2"><Gift size={16} className="text-[#FF7A2F]"/> Claim Code</h4>
            <div className="flex gap-2">
               <Input 
                  placeholder="ENTER-GIFT-CODE" 
                  className="bg-black/20 text-white font-mono uppercase" 
                  value={code} 
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  disabled={claiming}
               />
               <Button 
                  onClick={handleClaim} 
                  disabled={!code || claiming}
                  className="bg-[#FF7A2F]"
               >
                  {claiming ? <Loader2 className="animate-spin" size={18} /> : 'Claim'}
               </Button>
            </div>
            <p className="text-white/40 text-xs mt-2">Test code: CHILL-TEST123</p>
         </section>
      </div>
   );
};

// --- FEEDBACK ---
export const FeedbackForm = ({ userId }: { userId: string }) => {
   const [topic, setTopic] = useState('General Feedback');
   const [message, setMessage] = useState('');
   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async () => {
      if (!message.trim()) {
         toast.error('Please enter a message');
         return;
      }
      
      setSubmitting(true);
      try {
         await api.submitFeedback({ userId, topic, message, timestamp: Date.now() });
         toast.success('Feedback sent! Thank you for helping us improve.');
         setMessage('');
         setTopic('General Feedback');
      } catch (e) {
         toast.error('Failed to send feedback');
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="space-y-4">
         <p className="text-white/60 text-sm">We'd love to hear from you! Help us improve Chilly Chills.</p>
         
         <div className="space-y-2">
            <label className="text-xs font-bold text-white/40">TOPIC</label>
            <select 
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#FF7A2F]"
               value={topic}
               onChange={e => setTopic(e.target.value)}
               disabled={submitting}
            >
               <option>General Feedback</option>
               <option>Food Quality</option>
               <option>App Experience</option>
               <option>Staff Behavior</option>
            </select>
         </div>

         <div className="space-y-2">
            <label className="text-xs font-bold text-white/40">MESSAGE</label>
            <textarea 
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm min-h-[120px] outline-none focus:border-[#FF7A2F]" 
               placeholder="Tell us what you think..."
               value={message}
               onChange={e => setMessage(e.target.value)}
               disabled={submitting}
            />
         </div>

         <Button 
            onClick={handleSubmit} 
            disabled={submitting || !message.trim()}
            className="w-full bg-[#FF7A2F] py-6"
         >
            {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send size={18} className="mr-2" />}
            {submitting ? 'Sending...' : 'Send Feedback'}
         </Button>
      </div>
   );
};

// --- COLLECTION ---
export const CollectionList = ({ userId }: { userId: string }) => {
   const [collection, setCollection] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchCollection = async () => {
         try {
            const data = await api.getUserCollection(userId);
            setCollection(data);
         } catch (e) {
            console.error('Failed to fetch collection:', e);
         } finally {
            setLoading(false);
         }
      };
      fetchCollection();
   }, [userId]);

   if (loading) {
      return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#FF7A2F]" size={24} /></div>;
   }

   const badges = collection?.badges || [];

   return (
      <div className="grid grid-cols-2 gap-3">
         {badges.map((b: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 ${b.unlocked ? 'bg-[#FF7A2F]/10 border-[#FF7A2F]/30' : 'bg-white/5 border-white/5 opacity-50 grayscale'}`}>
               <div className="text-4xl mb-1">{b.icon}</div>
               <h4 className="font-bold text-white text-sm">{b.name}</h4>
               <p className="text-[10px] text-white/60">{b.desc}</p>
               {b.unlocked ? (
                  <span className="text-[10px] font-bold text-[#FF7A2F] bg-[#FF7A2F]/10 px-2 py-0.5 rounded-full mt-1">Unlocked</span>
               ) : (
                  <span className="text-[10px] font-bold text-stone-500 bg-white/5 px-2 py-0.5 rounded-full mt-1">Locked</span>
               )}
            </div>
         ))}
      </div>
   );
};

// --- PROFILE ---
export const UserProfile = ({ userId }: { userId: string }) => {
   return (
      <div className="space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF7A2F] to-pink-500 p-1">
               <div className="w-full h-full rounded-full bg-[#1E1E1E] flex items-center justify-center overflow-hidden">
                  <User size={32} className="text-white" />
               </div>
            </div>
            <div>
               <h3 className="text-2xl font-bold text-white">Rahul Sharma</h3>
               <p className="text-white/60 text-sm">Student • 2023CS101</p>
               <div className="flex items-center gap-1 text-[#FF7A2F] text-xs font-bold mt-1">
                  <Award size={12} /> Gold Member
               </div>
            </div>
         </div>

         <div className="bg-white/5 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
               <span className="text-white/60 text-sm">Phone</span>
               <span className="text-white font-mono text-sm">+91 98765 43210</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
               <span className="text-white/60 text-sm">Email</span>
               <span className="text-white font-mono text-sm">rahul@college.edu</span>
            </div>
            <div className="flex justify-between items-center py-2">
               <span className="text-white/60 text-sm">Member Since</span>
               <span className="text-white font-mono text-sm">Jan 2024</span>
            </div>
         </div>

         <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10">Delete Account</Button>
      </div>
   );
};

// --- RECOMMEND TO FRIENDS ---
export const RecommendToFriends = ({ userId, menu }: { userId: string, menu: any[] }) => {
   const [selectedItem, setSelectedItem] = useState('');
   const [friendName, setFriendName] = useState('');
   const [message, setMessage] = useState('');
   const [sending, setSending] = useState(false);

   const popularItems = menu.slice(0, 8);

   const handleRecommend = async () => {
      if (!selectedItem || !friendName.trim()) {
         toast.error('Please select an item and enter friend\'s name');
         return;
      }

      setSending(true);
      try {
         await api.recommendToFriend({
            userId,
            friendName: friendName.trim(),
            item: selectedItem,
            message: message.trim(),
            timestamp: Date.now()
         });
         
         toast.success(
            <div className="flex flex-col gap-1">
               <span className="font-bold">Recommendation Sent! 🎉</span>
               <span className="text-xs">{friendName} will see your suggestion</span>
            </div>
         );
         
         // Reset form
         setSelectedItem('');
         setFriendName('');
         setMessage('');
      } catch (e) {
         toast.error('Failed to send recommendation');
      } finally {
         setSending(false);
      }
   };

   return (
      <div className="flex flex-col h-full -m-6">
         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-4">
               <h4 className="text-pink-400 font-bold mb-1 flex items-center gap-2">
                  <Heart size={16} className="fill-current" /> Share the Love
               </h4>
               <p className="text-pink-200/60 text-xs">Recommend your favorite items to your friends!</p>
            </div>

            {/* Friend Name */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-white/40">FRIEND'S NAME</label>
               <Input 
                  placeholder="e.g. Sarah, Mike..." 
                  className="bg-black/20 text-white border-white/10"
                  value={friendName}
                  onChange={e => setFriendName(e.target.value)}
                  disabled={sending}
               />
            </div>

            {/* Select Item */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-white/40">SELECT ITEM TO RECOMMEND</label>
               <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto overscroll-contain p-1 bg-black/10 rounded-lg">
                  {popularItems.map((item, i) => (
                     <button
                        key={i}
                        onClick={() => setSelectedItem(item.name)}
                        disabled={sending}
                        className={`p-3 rounded-xl border transition-all text-left ${
                           selectedItem === item.name
                              ? 'bg-[#FF7A2F]/20 border-[#FF7A2F] ring-2 ring-[#FF7A2F]/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                     >
                        <div className="flex items-start gap-2">
                           <div className="text-2xl">🍔</div>
                           <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${
                                 selectedItem === item.name ? 'text-[#FF7A2F]' : 'text-white'
                              }`}>
                                 {item.name}
                              </p>
                              <p className="text-[10px] text-white/40">₹{item.price}</p>
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2 pb-4">
               <label className="text-xs font-bold text-white/40">ADD A MESSAGE (OPTIONAL)</label>
               <textarea
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm min-h-[80px] outline-none focus:border-[#FF7A2F]"
                  placeholder="Why do you love this dish?..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={sending}
               />
            </div>
         </div>

         {/* Sticky Send Button at Bottom */}
         <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1E1E1E] via-[#1E1E1E] to-transparent border-t border-white/5">
            <Button
               onClick={handleRecommend}
               disabled={sending || !selectedItem || !friendName.trim()}
               className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 py-6 text-base font-bold shadow-lg shadow-pink-500/30"
            >
               {sending ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Sending...</>
               ) : (
                  <><Share2 size={18} className="mr-2" /> Send Recommendation</>
               )}
            </Button>
         </div>
      </div>
   );
};