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
    <div className="absolute bottom-0 left-0 right-0 z-50">
      <div className="bg-[#4A2E1E]/95 backdrop-blur-xl border-t border-white/10 p-2 pb-6 pt-3 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
             <button 
               key={tab.id}
               onClick={() => onTabChange(tab.id)}
               className={`relative flex flex-col items-center p-2 w-16 transition-all duration-300 ${activeTab === tab.id ? 'text-[#FF7A2F] -translate-y-2' : 'text-white/60'}`}
             >
               {activeTab === tab.id && (
                 <motion.div 
                   layoutId="active-glow"
                   className="absolute inset-0 -z-10 bg-[#FF7A2F]/20 blur-xl rounded-full"
                 />
               )}
               <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'fill-[#FF7A2F]/20' : ''}`} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
               <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
               {tab.badge > 0 && (
                 <span className="absolute top-0 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-[#4A2E1E]">
                   {tab.badge}
                 </span>
               )}
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};
