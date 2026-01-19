import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Gift, MessageSquare, User, Users, Box, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ChillyLogo } from '../components/ChillyLogo';

export const StudentHome = ({ onSelectBranch }: { onSelectBranch: (id: string) => void }) => {
  
  const branches = [
    { id: 'A', name: 'Branch A', type: 'Burger', color: 'from-[#FF7A2F] to-[#E06925]', icon: '🍔' },
    { id: 'B', name: 'Branch B', type: 'Drinks', color: 'from-[#e74c3c] to-[#c0392b]', icon: '🥤' },
    { id: 'C', name: 'Branch C', type: 'Snacks', color: 'from-[#f1c40f] to-[#f39c12]', icon: '🍟' },
  ];

  const features = [
    { id: 'recommend', label: 'Recommended by friend', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { id: 'buy-gift', label: 'Buy Gift Cards', icon: Gift, color: 'bg-pink-500/10 text-pink-500' },
    { id: 'claim-gift', label: 'Claim Gift Cards', icon: Sparkles, color: 'bg-purple-500/10 text-purple-500' },
    { id: 'feedback', label: 'Feedbacks', icon: MessageSquare, color: 'bg-green-500/10 text-green-500' },
    { id: 'collection', label: 'Your Collection', icon: Box, color: 'bg-orange-500/10 text-orange-500' },
    { id: 'profile', label: 'Profile', icon: User, color: 'bg-stone-500/10 text-stone-500' },
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#FAFAF7] dark:bg-[#121212]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <ChillyLogo className="h-20 -ml-2 mb-2" />
          <p className="text-gray-500 dark:text-stone-400 text-sm font-medium font-brand text-[#FF7A2F]">Which branch are you at?</p>
        </div>
        <div className="bg-[#FF7A2F] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-orange-500/30 flex items-center gap-1 mt-4">
          <Sparkles size={12} fill="currentColor" />
          120 Pts
        </div>
      </div>

      {/* Main Branch Selection */}
      <div className="grid gap-4 mb-8">
        {branches.map((branch) => (
          <motion.button
            key={branch.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectBranch(branch.id)}
            className={`relative overflow-hidden rounded-2xl p-6 text-left shadow-xl h-32 flex items-center group`}
          >
             {/* Background Gradient */}
             <div className={`absolute inset-0 bg-gradient-to-r ${branch.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
             
             {/* Content */}
             <div className="relative z-10 flex-1">
               <span className="bg-black/20 text-white/80 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                 {branch.type}
               </span>
               <h3 className="text-2xl font-black text-white mt-1">{branch.name}</h3>
               <div className="flex items-center gap-1 text-white/60 text-xs font-medium mt-1">
                 <MapPin size={10} /> <span>Open now</span>
               </div>
             </div>

             {/* Icon */}
             <div className="relative z-10 text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
               {branch.icon}
             </div>
             
             {/* Arrow Decoration */}
             <div className="absolute bottom-4 right-4 text-white/20">
               <ArrowRight size={20} />
             </div>
          </motion.button>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <h3 className="text-gray-900 dark:text-white font-bold mb-4 text-lg">Explore</h3>
        <div className="grid grid-cols-2 gap-3 pb-20">
          {features.map((feature) => (
            <motion.button
              key={feature.id}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2"
            >
              <div className={`p-3 rounded-full ${feature.color}`}>
                <feature.icon size={20} />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-stone-300">
                {feature.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
};