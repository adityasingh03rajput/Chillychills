import { Home, UtensilsCrossed, ShoppingBag, Clock, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  cartCount?: number;
}

export const Navbar = ({ activeTab, onTabChange, cartCount }: NavbarProps) => {
  const tabs = [
    { id: 'home', icon: LayoutGrid, label: 'Feed' },
    { id: 'menu', icon: UtensilsCrossed, label: 'Vault' },
    { id: 'cart', icon: ShoppingBag, label: 'Tray', badge: cartCount },
    { id: 'orders', icon: Clock, label: 'Logs' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 pb-[var(--safe-area-bottom)] pointer-events-none">
      <div className="bg-stone-900 border-t border-white/10 w-full h-[56px] pointer-events-auto flex justify-around items-center relative overflow-hidden shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">

        {/* Android Material-inspired selector */}
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (window.navigator.vibrate) window.navigator.vibrate(5);
                onTabChange(tab.id);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${isActive ? 'text-[var(--accent-orange)]' : 'text-white/40'}`}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-3 bg-[var(--accent-orange)] text-white text-[10px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full shadow-lg border border-stone-900"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </div>

                <span className={`text-[12px] font-medium tracking-tight transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
                  {tab.label}
                </span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-x-4 top-1 h-1 bg-[var(--accent-orange)] rounded-full opacity-20"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
