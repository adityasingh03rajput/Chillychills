import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Gift, MessageSquare, User, Users, Box, MapPin, ArrowRight, CreditCard, Share2, LogOut } from 'lucide-react';
import { ChillyLogo } from '../components/ChillyLogo';
import {
  FeatureModal,
  RecommendedList,
  GiftCardStore,
  FeedbackForm,
  CollectionList,
  UserProfile,
  RecommendToFriends
} from '../components/StudentFeaturesConnected';

/**
 * StudentHomeWithFeatures - Main student dashboard with branch selection and feature access
 * 
 * Features:
 * - Branch Selection: Students choose their canteen location before ordering
 * - Friend Picks: See what friends are recommending
 * - Gift Cards: Buy and claim gift cards (Test code: CHILL-TEST123)
 * - Feedback: Submit feedback about food/service
 * - Collection: View unlocked achievement badges
 * - Profile: View user information
 */

interface StudentHomeWithFeaturesProps {
  onSelectBranch: (id: string) => void;
  userId: string;
  menu: any[];
  onLogout: () => void;
}

export const StudentHomeWithFeatures = ({ onSelectBranch, userId, menu, onLogout }: StudentHomeWithFeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const branches = [
    { id: 'A', name: 'North Campus', type: 'Main Food Court', color: 'from-[#FF7A2F] to-[#E06925]', icon: '🍔', location: 'Building A' },
    { id: 'B', name: 'South Campus', type: 'Drinks & Beverages', color: 'from-[#e74c3c] to-[#c0392b]', icon: '🥤', location: 'Building B' },
    { id: 'C', name: 'East Campus', type: 'Snacks & Quick Bites', color: 'from-[#f1c40f] to-[#f39c12]', icon: '🍟', location: 'Building C' },
  ];

  const features = [
    {
      id: 'recommend',
      label: 'Friend Picks',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/20',
      modalTitle: '👫 Recommended by Friends'
    },
    {
      id: 'share',
      label: 'Recommend Food',
      icon: Share2,
      color: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20',
      modalTitle: '💝 Recommend to Friends'
    },
    {
      id: 'giftcards',
      label: 'Gift Cards',
      icon: Gift,
      color: 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/20',
      modalTitle: '🎁 Gift Cards'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/20',
      modalTitle: '💬 Share Feedback'
    },
    {
      id: 'collection',
      label: 'Collection',
      icon: Box,
      color: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/20',
      modalTitle: '🏆 Your Collection'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/20',
      modalTitle: '👤 Your Profile'
    },
  ];

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'recommend': return <RecommendedList userId={userId} />;
      case 'share': return <RecommendToFriends userId={userId} menu={menu} />;
      case 'giftcards': return <GiftCardStore userId={userId} />;
      case 'feedback': return <FeedbackForm userId={userId} />;
      case 'collection': return <CollectionList userId={userId} />;
      case 'profile': return <UserProfile userId={userId} />;
      default: return null;
    }
  };

  const getModalTitle = () => {
    const feature = features.find(f => f.id === activeFeature);
    return feature?.modalTitle || '';
  };

  return (
    <>
      <div className="h-full flex flex-col p-6 overflow-y-auto bg-gradient-to-b from-[#1a1410] via-[#121212] to-[#0a0a0a] pb-28 custom-scrollbar smooth-scroll">

        {/* Header with decorative elements */}
        <div className="relative mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <ChillyLogo className="h-20 -ml-2 mb-2" />
              <p className="text-stone-400 text-sm font-medium font-brand text-[#FF7A2F] flex items-center gap-2">
                <MapPin size={14} className="animate-pulse" />
                Select your canteen location
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 mt-4">
              <div className="bg-gradient-to-r from-[#FF7A2F] to-[#ff9554] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-orange-500/40 flex items-center gap-2 border border-[#ff9554]/30">
                <Sparkles size={14} className="animate-pulse" fill="currentColor" />
                <span className="text-sm">120 Pts</span>
              </div>
              <button
                onClick={onLogout}
                className="h-10 w-10 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-stone-400 rounded-full flex items-center justify-center transition-all border border-white/10 android-ripple active-shrink tap-highlight-none"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF7A2F]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Branch Selection Cards - Enhanced */}
        <div className="grid gap-4 mb-8">
          {branches.map((branch, index) => (
            <motion.button
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectBranch(branch.id)}
              className="relative overflow-hidden rounded-2xl p-6 text-left shadow-2xl h-36 flex items-center group border border-white/5 android-ripple active-shrink tap-highlight-none"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${branch.color} opacity-90 group-hover:opacity-100 transition-all duration-300`} />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />

              {/* Content */}
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-black/30 text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    {branch.type}
                  </span>
                  <span className="bg-green-500/30 text-green-200 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-green-400/30 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    OPEN
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white drop-shadow-lg">{branch.name}</h3>
                <div className="flex items-center gap-1 text-white/70 text-xs font-medium mt-1">
                  <MapPin size={10} /> <span>{branch.location}</span>
                </div>
              </div>

              {/* Animated icon */}
              <div className="relative z-10 text-6xl drop-shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                {branch.icon}
              </div>

              {/* Arrow with hover effect */}
              <div className="absolute bottom-4 right-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300">
                <ArrowRight size={20} />
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Features Grid - Enhanced */}
        <div className="pb-24">
          <h3 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-[#FF7A2F]" />
            Quick Access
          </h3>

          {/* Info Banner - Test Gift Card */}
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-3 mb-4 flex items-start gap-3">
            <Gift size={20} className="text-pink-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-pink-200 text-xs font-bold mb-1">🎁 Try Our Gift Cards!</p>
              <p className="text-pink-300/70 text-[10px] leading-relaxed">
                Use code <span className="font-mono bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-200 font-bold">CHILL-TEST123</span> to claim ₹550 credit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFeature(feature.id)}
                className={`relative overflow-hidden ${feature.color} p-5 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3 group android-ripple active-shrink tap-highlight-none`}
              >
                <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-white/90">
                  {feature.label}
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Modals */}
      <FeatureModal
        isOpen={!!activeFeature}
        onClose={() => setActiveFeature(null)}
        title={getModalTitle()}
      >
        {renderFeatureContent()}
      </FeatureModal>
    </>
  );
};