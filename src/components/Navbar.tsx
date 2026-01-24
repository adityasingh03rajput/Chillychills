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
    <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-[calc(var(--safe-area-bottom)+1.5rem)] pointer-events-none">
      <div className="premium-glass w-full max-w-[440px] mx-auto p-1.5 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] pointer-events-auto flex justify-around items-center h-[4.5rem] border border-white/10 relative overflow-hidden">

        {/* Modern Blur Accent */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-orange)]/5 to-transparent opacity-50" />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (window.navigator.vibrate) window.navigator.vibrate(5);
                onTabChange(tab.id);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center h-full rounded-[1.8rem] transition-all duration-500 ${isActive ? 'text-[var(--accent-orange)]' : 'text-[var(--text-muted)] opacity-50 hover:opacity-100'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="navbar-glow"
                  className="absolute inset-1 bg-[var(--accent-orange)]/10 rounded-[1.5rem] shadow-inner"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10">
                <tab.icon size={22} strokeWidth={isActive ? 3 : 2} className="transition-transform duration-500" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 bg-[var(--accent-orange)] text-white text-[9px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-lg border-[1.5px] border-[var(--card-bg)]"
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </div>

              <span className={`text-[8px] font-black uppercase tracking-[0.25em] mt-1.5 transition-all duration-500 z-10 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 h-0 hidden'}`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="navbar-dot"
                  className="absolute bottom-1.5 w-1 h-1 bg-[var(--accent-orange)] rounded-full shadow-[0_0_10px_var(--accent-orange)] z-10"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
