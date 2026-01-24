import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Gift, MessageSquare, User, Users,
  Box, MapPin, ArrowRight, Bell, LogOut,
  Star, ChevronRight, TrendingUp
} from 'lucide-react';
import { ChillyLogo } from '../components/ChillyLogo';
import { Button } from '../components/ui/Button';
import {
  FeatureModal,
  RecommendedList,
  GiftCardStore,
  FeedbackForm,
  CollectionList,
  UserProfile,
  RecommendToFriends
} from '../components/StudentFeaturesConnected';

interface StudentHomeWithFeaturesProps {
  onSelectBranch: (id: string) => void;
  userId: string;
  menu: any[];
  onLogout: () => void;
  orders: any[];
}

export const StudentHomeWithFeatures = ({ onSelectBranch, userId, menu, onLogout, orders }: StudentHomeWithFeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const branches = [
    { id: 'A', name: 'Burger Junction', subtitle: 'Building A • North Side', icon: '🍔', gradient: 'from-orange-500 to-rose-500' },
    { id: 'B', name: 'Chill & Brew', subtitle: 'Building B • Center Hub', icon: '🥤', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'C', name: 'Quick Bites', subtitle: 'Building C • East Wing', icon: '🍕', gradient: 'from-emerald-500 to-teal-600' },
  ];

  const features = [
    { id: 'recommend', label: 'Friends', icon: Users, color: 'text-blue-500' },
    { id: 'giftcards', label: 'Gifts', icon: Gift, color: 'text-amber-500' },
    { id: 'collection', label: 'Badges', icon: Box, color: 'text-indigo-500' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-purple-500' },
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'recommend': return <RecommendedList userId={userId} />;
      case 'giftcards': return <GiftCardStore userId={userId} />;
      case 'collection': return <CollectionList userId={userId} />;
      case 'profile': return <UserProfile userId={userId} />;
      default: return null;
    }
  };

  return (
    <div className="h-full bg-[var(--bg-primary)] px-4 sm:px-6 pt-6 pb-40 overflow-y-auto custom-scrollbar flex flex-col">

      {/* Top Profile Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[var(--accent-orange)] to-rose-500 flex items-center justify-center p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden border border-[var(--border-color)]">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tighter">Elite Eater</h1>
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Verified Student</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shadow-sm active:scale-95 transition-all">
            <Bell size={18} />
          </button>
          <button onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-sm active:scale-95 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-1.5 tracking-tighter uppercase leading-none">Fresh <span className="text-[var(--accent-orange)]">Feasts.</span></h2>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium opacity-60 uppercase tracking-widest">Fuel your creative genius</p>
      </div>

      {/* Immersive Balance Hub */}
      <div className="premium-glass p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-orange)]/10 rounded-full -mr-32 -mt-32 blur-[80px] transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
        <div className="flex justify-between items-center relative z-10 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="px-2 py-0.5 bg-[var(--accent-orange)]/10 rounded-full border border-[var(--accent-orange)]/20">
                <Sparkles size={10} className="text-[var(--accent-orange)]" fill="currentColor" />
              </div>
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Vault Balance</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tighter">₹1,240</h3>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-[var(--accent-green)]">
              <TrendingUp size={12} strokeWidth={3} />
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">+240 points ready</p>
            </div>
          </div>
          <Button variant="primary" size="md" className="px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 whitespace-nowrap">
            REFILL
          </Button>
        </div>
      </div>

      {/* Live Canteens */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-6 px-1 lg:px-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Open Hubs</h2>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[var(--accent-green)]/10 text-[var(--accent-green)] rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-[var(--accent-green)]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
            3 LIVE
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {branches.map((branch, i) => (
            <motion.div
              layout
              key={branch.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
              onClick={() => onSelectBranch(branch.id)}
              className="bg-[var(--card-bg)] p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] flex items-center gap-4 sm:gap-6 group cursor-pointer hover:border-[var(--accent-orange)]/30 transition-all shadow-xl active:scale-[0.98]"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${branch.gradient} flex items-center justify-center text-3xl sm:text-4xl shadow-2xl group-hover:scale-105 transition-transform duration-500 border border-white/10 shrink-0`}>
                {branch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-[var(--text-primary)] text-lg sm:text-xl leading-none mb-1.5 sm:mb-2 truncate uppercase tracking-tight">{branch.name}</h4>
                <p className="text-[var(--text-secondary)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 sm:mb-4 truncate">{branch.subtitle}</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={10} className="fill-[var(--accent-orange)] text-[var(--accent-orange)]" />
                    <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-primary)]">4.8</span>
                  </div>
                  <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[var(--text-muted)] opacity-30" />
                  <span className="text-[9px] sm:text-[10px] font-black text-[var(--accent-green)] uppercase tracking-widest">Rapid ⚡</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--accent-orange)] group-hover:text-white transition-all border border-[var(--border-color)] shrink-0">
                <ChevronRight strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Power Tools */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mb-6 sm:mb-8 tracking-tight uppercase px-1 lg:px-2">Power Tools</h2>
        <div className="grid grid-cols-4 gap-3 sm:gap-6">
          {features.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActiveFeature(f.id)}
              className="flex flex-col items-center gap-3 sm:gap-4 active:scale-90 transition-all group"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.75rem] bg-[var(--card-bg)] flex items-center justify-center border border-[var(--border-color)] shadow-xl ${f.color} group-hover:border-[var(--accent-orange)]/30 transition-all group-hover:-translate-y-1`}>
                <f.icon strokeWidth={2.5} className="w-[22px] h-[22px] sm:w-7 sm:h-7" />
              </div>
              <span className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center group-hover:text-[var(--text-primary)]">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Modals */}
      <FeatureModal
        isOpen={!!activeFeature}
        onClose={() => setActiveFeature(null)}
        title={features.find(f => f.id === activeFeature)?.label || ''}
      >
        <div className="p-4">
          {renderFeatureContent()}
        </div>
      </FeatureModal>

    </div>
  );
};