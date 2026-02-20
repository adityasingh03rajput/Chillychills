import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Gift, Box, User, Users, Bell, LogOut, Camera,
  Star, ChevronRight, TrendingUp, ShieldCheck, ArrowRight, Zap, Target, X, Wallet, MessageSquare, Radio
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import {
  FeatureModal,
  RecommendedList,
  GiftCardStore,
  CollectionList,
  UserProfile,
  FeedbackForm,
  RecommendToFriends,
  FlashSaleList
} from '../components/StudentFeaturesConnected';
import { api } from '../utils/api';
import { SelfieBroadcast, SelfieBroadcastRef } from '../components/SelfieBroadcast';
import { UpiTopUpModal } from '../components/UpiTopUpModal';

interface StudentHomeWithFeaturesProps {
  onSelectBranch: (id: string) => void;
  userId: string;
  menu: any[];
  user: any;
  onLogout: () => void;
  orders: any[];
  onReplenish?: (amount: number) => Promise<boolean>;
  onRefreshUser?: () => void;
  onRescueOrder?: (saleId: string, amount: number) => void;
}

export const StudentHomeWithFeatures = ({
  onSelectBranch,
  userId,
  menu,
  user,
  onLogout,
  orders,
  onReplenish,
  onRefreshUser,
  onRescueOrder
}: StudentHomeWithFeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showReplenish, setShowReplenish] = useState(false);
  const [isReplenishing, setIsReplenishing] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const selfieRef = useRef<SelfieBroadcastRef>(null);

  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.getAnnouncements();
        // Check for specific branch announcement first, then fallback to 'all'
        const msg = data['all'] || data['medical'] || null; // Simplified logic for demo
        setAnnouncement(msg);
      } catch (e) {
        console.error('Failed to fetch announcements');
      }
    };
    fetchAnnouncements();
  }, []);

  const branches = [
    { id: 'A', name: 'Burger Junction', subtitle: 'Zone A • North Side', icon: '🍔', gradient: 'from-orange-600 to-rose-600', hue: 'orange' },
    { id: 'B', name: 'Chill & Brew', subtitle: 'Zone B • Main Hub', icon: '🥤', gradient: 'from-blue-600 to-indigo-700', hue: 'blue' },
    { id: 'C', name: 'Quick Bites', subtitle: 'Zone C • Plaza', icon: '🍕', gradient: 'from-emerald-600 to-teal-700', hue: 'green' },
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
            <h1 className="text-[20px] font-black text-white tracking-tight uppercase leading-none mb-1">Valued Guest</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 w-fit">
              <ShieldCheck size={10} className="text-[var(--accent-green)]" />
              <span className="text-[12px] font-black uppercase tracking-widest text-[var(--accent-green)]">Club Member</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Bell button removed as per user request */}
        </div>
      </div>

      {/* 32sp Display Header */}
      <div className="mb-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-[var(--accent-orange)]" />
              <span className="text-[12px] font-black text-[var(--accent-orange)] uppercase tracking-widest">Today's Goal</span>
            </div>
            <h2 className="text-[32px] font-black text-white mb-2 tracking-tight uppercase leading-[1.1]">
              Eat <br />
              <span className="text-[var(--accent-orange)] italic">Fresh.</span>
            </h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => selfieRef.current?.openUploadModal()}
            className="w-14 h-14 rounded-2xl bg-stone-900 border border-white/10 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all group"
          >
            <Camera size={24} className="group-hover:text-[var(--accent-orange)] transition-colors" />
          </motion.button>
        </div>
        <p className="text-white/30 text-[14px] font-bold uppercase tracking-widest mt-4">Location: Downtown Branch</p>
      </div>

      {/* Selfie Broadcast Point */}
      <SelfieBroadcast ref={selfieRef} userId={userId} userName={user?.name || 'Guest'} />

      {/* Live Admin Announcement */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20 p-4 rounded-2xl flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-orange)] flex items-center justify-center text-black">
                <Bell size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-[14px] font-bold leading-tight marquee-container">
                  {announcement}
                </p>
              </div>
              <button onClick={() => setAnnouncement(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Status Card */}
      <div className="mb-8">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReplenish(true)}
          className="bg-gradient-to-br from-stone-900 to-stone-950 p-6 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-white/30 text-[12px] font-black uppercase tracking-[0.2em] mb-2">Vault Balance</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">₹{user?.balance || 0}</h3>
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 rounded-full w-fit">
                <ShieldCheck size={12} className="text-[var(--accent-green)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-green)]">Secured by UPI Relay</span>
              </div>
            </div>
            <Button size="sm" className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-6 h-10 rounded-xl">
              Add Money
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Flash Sale List */}
      {onRescueOrder && <FlashSaleList userId={userId} onRescue={onRescueOrder} />}

      {/* 18sp Section Header + 16dp Card Spacing */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-[var(--accent-orange)] rounded-full" />
          <h2 className="text-[18px] font-black text-white uppercase tracking-tight">Food Outlets</h2>
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
                  <p className="text-[10px] font-black text-[var(--accent-green)] uppercase tracking-widest">Fast Delivery ⚡</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/20" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 16sp Body / 8-12dp Corner Radius Modules */}
      <div className="mb-8">
        <h2 className="text-[18px] font-black text-white uppercase tracking-tight mb-6 px-1">Quick Actions</h2>
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
      <UpiTopUpModal
        isOpen={showReplenish}
        onClose={() => setShowReplenish(false)}
        userId={userId}
        onSuccess={() => {
          onRefreshUser?.();
          toast.success('Funds synchronized with network');
        }}
      />

    </div>
  );
};