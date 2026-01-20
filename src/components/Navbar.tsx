import { Home, UtensilsCrossed, ShoppingBag, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = ({ activeTab, onTabChange, cartCount }: any) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'menu', icon: UtensilsCrossed, label: 'Menu' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
    { id: 'orders', icon: Clock, label: 'Orders' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-6 ios-safe-area pointer-events-none">
      <div className="bg-[#1a1410]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
        <div className="flex justify-around items-center relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center p-3 w-16 transition-all duration-300 active-shrink tap-highlight-none z-10 ${activeTab === tab.id ? 'text-[#FF7A2F]' : 'text-white/40'}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 bg-white/5 rounded-2xl border border-white/5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'fill-[#FF7A2F]/10' : ''}`} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
              {tab.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-2 bg-[#FF7A2F] text-white text-[9px] font-black px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full shadow-lg border-2 border-[#1a1410]"
                >
                  {tab.badge}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
