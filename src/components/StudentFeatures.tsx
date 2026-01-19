import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Send, Copy, Star, Users, Award, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { toast } from 'sonner@2.0.3';

// --- MODAL WRAPPER ---
export const FeatureModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E] rounded-t-3xl border-t border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
          >
             <div className="p-4 flex justify-between items-center border-b border-white/5">
                <h3 className="text-xl font-bold text-white font-brand text-[#FF7A2F]">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                   <X size={20} />
                </button>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
                {children}
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- RECOMMENDED ---
export const RecommendedList = () => {
   const friends = [
     { name: 'Sarah', item: 'Spicy Paneer Burger', time: '2m ago' },
     { name: 'Mike', item: 'Mint Mojito', time: '15m ago' },
     { name: 'Priya', item: 'Cheesy Fries', time: '1h ago' },
   ];

   return (
      <div className="space-y-4">
         <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-4">
            <h4 className="text-blue-400 font-bold mb-1 flex items-center gap-2"><Users size={16}/> Friend Activity</h4>
            <p className="text-blue-200/60 text-xs">See what your friends are ordering right now!</p>
         </div>
         {friends.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {f.name[0]}
               </div>
               <div className="flex-1">
                  <p className="text-white font-medium text-sm"><span className="font-bold text-[#FF7A2F]">{f.name}</span> recommends</p>
                  <p className="text-white/60 text-xs">{f.item}</p>
               </div>
               <span className="text-xs text-white/40">{f.time}</span>
            </div>
         ))}
      </div>
   );
};

// --- GIFT CARDS ---
export const GiftCardStore = () => {
   const cards = [
      { val: 100, bonus: 0, color: 'from-orange-500 to-red-500' },
      { val: 500, bonus: 50, color: 'from-purple-500 to-indigo-500' },
      { val: 1000, bonus: 150, color: 'from-emerald-500 to-teal-500' },
   ];
   
   const [code, setCode] = useState('');

   return (
      <div className="space-y-6">
         {/* Buy Section */}
         <section>
            <h4 className="text-white font-bold mb-3 flex items-center gap-2"><CreditCard size={16} className="text-[#FF7A2F]"/> Buy Gift Cards</h4>
            <div className="grid gap-3">
               {cards.map(c => (
                  <button key={c.val} onClick={() => toast.success(`Redirecting to payment for ₹${c.val}...`)} className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-r ${c.color} text-left group`}>
                     <div className="relative z-10 flex justify-between items-center text-white">
                        <div>
                           <h5 className="font-black text-2xl">₹{c.val}</h5>
                           {c.bonus > 0 && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">+ ₹{c.bonus} Bonus</span>}
                        </div>
                        <Gift size={32} className="opacity-80 group-hover:scale-110 transition-transform"/>
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
                  onChange={e => setCode(e.target.value)}
               />
               <Button onClick={() => { if(code) { toast.success('Code redeemed successfully!'); setCode(''); } }} className="bg-[#FF7A2F]">Claim</Button>
            </div>
         </section>
      </div>
   );
};

// --- FEEDBACK ---
export const FeedbackForm = () => {
   return (
      <div className="space-y-4">
         <p className="text-white/60 text-sm">We'd love to hear from you! Help us improve Chilly Chills.</p>
         
         <div className="space-y-2">
            <label className="text-xs font-bold text-white/40">TOPIC</label>
            <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-[#FF7A2F]">
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
            />
         </div>

         <Button onClick={() => toast.success('Feedback sent! Thank you.')} className="w-full bg-[#FF7A2F] py-6">
            <Send size={18} className="mr-2" /> Send Feedback
         </Button>
      </div>
   );
};

// --- COLLECTION ---
export const CollectionList = () => {
   const badges = [
      { name: 'Burger King', icon: '🍔', desc: 'Ordered 50 Burgers', unlocked: true },
      { name: 'Caffeine Addict', icon: '☕', desc: 'Ordered 20 Coffees', unlocked: true },
      { name: 'Healthy Choice', icon: '🥗', desc: 'Ordered 10 Salads', unlocked: false },
      { name: 'Night Owl', icon: '🦉', desc: 'Ordered after 10 PM', unlocked: false },
   ];

   return (
      <div className="grid grid-cols-2 gap-3">
         {badges.map((b, i) => (
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
export const UserProfile = () => {
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
