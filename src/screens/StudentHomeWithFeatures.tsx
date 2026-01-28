import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Gift, Box, User, Users, Bell, LogOut,
  Star, ChevronRight, TrendingUp, ShieldCheck, ArrowRight, Zap, Target, X, Wallet, MessageSquare, Radio
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  FeatureModal,
  RecommendedList,
  GiftCardStore,
  CollectionList,
  UserProfile,
  FeedbackForm,
  RecommendToFriends
} from '../components/StudentFeaturesConnected';

interface StudentHomeWithFeaturesProps {
  onSelectBranch: (id: string) => void;
  userId: string;
  menu: any[];
  user: any;
  onLogout: () => void;
  orders: any[];
  onReplenish?: (amount: number) => Promise<boolean>;
  onRefreshUser?: () => void;
}

export const StudentHomeWithFeatures = ({
  onSelectBranch,
  userId,
  menu,
  user,
  onLogout,
  orders,
  onReplenish,
  onRefreshUser
}: StudentHomeWithFeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showReplenish, setShowReplenish] = useState(false);
  const [isReplenishing, setIsReplenishing] = useState(false);

  const branches = [
    { id: 'A', name: 'Burger Junction', subtitle: 'Building A • North Side', icon: '🍔', gradient: 'from-orange-600 to-rose-600', hue: 'orange' },
    { id: 'B', name: 'Chill & Brew', subtitle: 'Building B • Center Hub', icon: '🥤', gradient: 'from-blue-600 to-indigo-700', hue: 'blue' },
    { id: 'C', name: 'Quick Bites', subtitle: 'Building C • East Wing', icon: '🍕', gradient: 'from-emerald-600 to-teal-700', hue: 'green' },
  ];

  const features = [
    { id: 'recommend', label: 'Social', icon: Users, color: 'text-blue-500' },
    { id: 'giftcards', label: 'Gifts', icon: Gift, color: 'text-amber-500' },
    { id: 'collection', label: 'Vault', icon: Box, color: 'text-indigo-500' },
    { id: 'feedback', label: 'Support', icon: MessageSquare, color: 'text-rose-500' },
    { id: 'broadcast', label: 'Relay', icon: Radio, color: 'text-emerald-500' },
    { id: 'profile', label: 'Status', icon: User, color: 'text-purple-500' },
  ];

  const replenishAmounts = [100, 200, 500, 1000];

  const handleReplenishClick = async (amount: number) => {
    if (!onReplenish) return;
    setIsReplenishing(true);
    const success = await onReplenish(amount);
    if (success) setShowReplenish(false);
    setIsReplenishing(false);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'recommend': return <RecommendedList userId={userId} />;
      case 'giftcards': return <GiftCardStore userId={userId} onActionSuccess={onRefreshUser} />;
      case 'collection': return <CollectionList userId={userId} />;
      case 'feedback': return <FeedbackForm userId={userId} />;
      case 'broadcast': return <RecommendToFriends userId={userId} menu={menu} />;
      case 'profile': return <UserProfile userId={userId} user={user} onLogout={onLogout} />;
      default: return null;
    }
  };

  return (
    <div className="h-full bg-black px-6 pt-6 pb-24 overflow-y-auto no-scrollbar">

      {/* 24dp Screen Margin + 56dp Header equivalent */}
      <div className="flex justify-between items-center mb-8 pt-safe">
        <div className="flex items-center gap-4">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[var(--accent-orange)] to-rose-600 p-0.5"
          >
            <div className="w-full h-full rounded-[10px] bg-stone-900 flex items-center justify-center overflow-hidden border border-white/5">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="avatar" className="w-[110%] h-[110%] object-cover" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-[20px] font-black text-white tracking-tight uppercase leading-none mb-1">Elite Eater</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 w-fit">
              <ShieldCheck size={10} className="text-[var(--accent-green)]" />
              <span className="text-[12px] font-black uppercase tracking-widest text-[var(--accent-green)]">Verified Hub</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-white shadow-lg">
            <Bell size={20} />
          </motion.button>
        </div>
      </div>

      {/* 32sp Display Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-[var(--accent-orange)]" />
          <span className="text-[12px] font-black text-[var(--accent-orange)] uppercase tracking-widest">Active Objective</span>
        </div>
        <h2 className="text-[32px] font-black text-white mb-2 tracking-tight uppercase leading-[1.1]">
          Sustain <br />
          <span className="text-[var(--accent-orange)] italic">Innovation.</span>
        </h2>
        <p className="text-white/30 text-[14px] font-bold uppercase tracking-widest mt-4">Hub Sector: 7G Mainframe</p>
      </div>

      {/* 16dp Grid Calibrated Vault */}
      <div className="bg-stone-900 p-6 rounded-2xl mb-10 relative overflow-hidden border border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--accent-orange)]/5 rounded-full -mr-[150px] -mt-[150px] blur-[80px]" />

        <div className="flex justify-between items-center relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <Zap size={14} className="text-white" />
              <span className="text-[12px] font-black text-white uppercase tracking-widest">Reserve Capital</span>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-[20px] font-black text-[var(--accent-orange)]">₹</span>
              <h3 className="text-[48px] font-black text-white tracking-tighter tabular-nums leading-none">
                {user?.balance || 0}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-[var(--accent-green)]/10 rounded-lg border border-[var(--accent-green)]/20 flex items-center gap-2">
                <TrendingUp size={12} className="text-[var(--accent-green)]" />
                <span className="text-[12px] font-black text-[var(--accent-green)] uppercase">+{user?.points || 0} Energy</span>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReplenish(true)}
            className="w-16 h-16 rounded-xl bg-[var(--accent-orange)] shadow-lg shadow-orange-500/20 flex items-center justify-center text-white"
          >
            <ArrowRight size={24} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* 18sp Section Header + 16dp Card Spacing */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[var(--accent-orange)] rounded-full" />
          <h2 className="text-[18px] font-black text-white uppercase tracking-tight">Canteen Sectors</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {branches.map((branch, i) => (
            <motion.div
              layout
              key={branch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelectBranch(branch.id)}
              className="bg-stone-900 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-stone-800/50 active:scale-98 transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${branch.gradient} flex items-center justify-center text-4xl shadow-lg border border-white/5`}>
                {branch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-white text-[16px] uppercase tracking-tight mb-1">{branch.name}</h4>
                <p className="text-white/30 text-[12px] font-bold uppercase tracking-widest mb-2">{branch.subtitle}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-[var(--accent-orange)] text-[var(--accent-orange)]" />
                    <span className="text-[12px] font-black text-white">4.8</span>
                  </div>
                  <span className="text-[10px] text-white/20">|</span>
                  <p className="text-[10px] font-black text-[var(--accent-green)] uppercase tracking-widest">Rapid Link ⚡</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/20" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 16sp Body / 8-12dp Corner Radius Modules */}
      <div className="mb-8">
        <h2 className="text-[18px] font-black text-white uppercase tracking-tight mb-6 px-1">System Modules</h2>
        <div className="grid grid-cols-3 gap-4">
          {features.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFeature(f.id)}
              className="flex flex-col items-center gap-2 active:scale-90 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center border border-white/10 shadow-lg ${f.color} group-hover:bg-stone-800`}>
                <f.icon size={24} />
              </div>
              <span className="text-[12px] font-black text-white/40 uppercase tracking-widest">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <FeatureModal
        isOpen={!!activeFeature}
        onClose={() => setActiveFeature(null)}
        title={features.find(f => f.id === activeFeature)?.label || ''}
      >
        <div className="p-4 bg-stone-900 min-h-[400px]">
          {renderFeatureContent()}
        </div>
      </FeatureModal>

      {/* 56dp Height Styled Input Modal */}
      <AnimatePresence>
        {showReplenish && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReplenish(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-[440px] bg-stone-900 rounded-t-[24px] border-t border-white/10 p-6 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-[20px] font-black text-white uppercase">Vault Refill</h3>
                  <p className="text-[12px] font-bold text-white/30 uppercase tracking-widest">Quantum Transfer</p>
                </div>
                <button onClick={() => setShowReplenish(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {replenishAmounts.map(amt => (
                  <button
                    key={amt}
                    disabled={isReplenishing}
                    onClick={() => handleReplenishClick(amt)}
                    className="h-[56px] rounded-xl bg-stone-800 border border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span className="text-[16px] font-black text-white group-hover:text-[var(--accent-orange)]">₹{amt}</span>
                  </button>
                ))}
              </div>

              <div className="bg-stone-800/50 p-4 rounded-xl border border-white/5 flex items-center gap-4 mb-6">
                <Wallet size={20} className="text-[var(--accent-green)]" />
                <div>
                  <p className="text-[12px] font-black text-white/30 uppercase">Vault Balance</p>
                  <p className="text-[18px] font-black text-white">₹{user?.balance || 0}</p>
                </div>
              </div>

              <Button
                disabled={isReplenishing}
                onClick={() => setShowReplenish(false)}
                className="w-full h-[56px] rounded-xl text-[14px] font-black uppercase bg-white text-black"
              >
                Abort
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};