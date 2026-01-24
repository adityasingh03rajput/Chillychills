import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem } from '../utils/types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, ArrowLeft, ShoppingBag, Sparkles, Star, ChevronLeft } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const MenuScreen = ({
  menu,
  onAddToCart,
  onBack,
  branch,
  cart = [],
  onGoToCart
}: {
  menu: MenuItem[],
  onAddToCart: (item: MenuItem) => void,
  onBack?: () => void,
  branch: string | null,
  cart?: CartItem[],
  onGoToCart?: () => void
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const branchItems = menu.filter(i => i.branch === branch || i.branch === 'All');
  const categories = ['All', ...Array.from(new Set(branchItems.map(i => i.category)))];

  const filteredItems = selectedCategory === 'All'
    ? branchItems
    : branchItems.filter(i => i.category === selectedCategory);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="h-full flex flex-col pt-6 sm:pt-10 pb-40 bg-[var(--bg-primary)]">

      {/* Dynamic Header */}
      <div className="px-4 sm:px-6 mb-8 sm:mb-10 flex items-center gap-4 sm:gap-5">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm active:scale-90 transition-all shrink-0"
          >
            <ChevronLeft strokeWidth={3} className="w-[22px] h-[22px] sm:w-6 sm:h-6" />
          </button>
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-1.5">C7 Menu</h2>
          <p className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Elite Hub Selection</p>
        </div>
      </div>

      {/* Horizontal Category Island */}
      <div className="px-4 sm:px-6 mb-8 sm:mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 sm:gap-4 pb-2 w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border ${selectedCategory === cat
                ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-orange-500/20'
                : 'bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Gallery Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-20 custom-scrollbar smooth-scroll">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="h-full"
              >
                <Card
                  className="h-full flex flex-col p-2 group hover:border-[var(--accent-orange)]/40 duration-500"
                  onClick={() => onAddToCart(item)}
                >
                  <div className="aspect-square w-full relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-[var(--border-color)] shadow-inner mb-3 sm:mb-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {item.isDailySpecial && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                        <div className="bg-white/90 backdrop-blur-md text-stone-900 text-[7px] sm:text-[8px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xl tracking-[0.1em] flex items-center gap-1">
                          <Star size={10} className="fill-stone-900" />
                          ELITE
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-2 pb-3 sm:px-3 sm:pb-4 space-y-2 sm:space-y-3">
                    <div className="min-h-[2.2rem] sm:min-h-[2.5rem]">
                      <h3 className="font-black text-[11px] sm:text-sm uppercase tracking-tight text-[var(--text-primary)] leading-tight line-clamp-2">{item.name}</h3>
                      <p className="text-[8px] sm:text-[10px] font-bold text-[var(--text-muted)] mt-1 opacity-60 uppercase tracking-tighter">Campus Classic</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-[var(--border-color)] border-dashed">
                      <span className="font-black text-[var(--accent-orange)] text-base sm:text-lg tracking-tight font-mono">₹{item.price}</span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--input-bg)] group-hover:bg-[var(--accent-orange)] group-hover:text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-[var(--border-color)] active:scale-75">
                        <Plus strokeWidth={3} className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Tray Peek (Absolute anchored within shell) */}
      <AnimatePresence>
        {cartTotalItems > 0 && onGoToCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-28 left-4 right-4 sm:left-6 sm:right-6 z-40 pointer-events-none"
          >
            <button
              onClick={onGoToCart}
              className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between active:scale-[0.98] transition-all pointer-events-auto border border-white/10"
            >
              <div className="flex items-center gap-3 sm:gap-4 ml-1 sm:ml-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex flex-col items-start leading-none gap-1 shrink-0">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Selection Vault</span>
                  <span className="text-lg sm:text-xl font-black tracking-tighter text-white">₹{cartTotalPrice}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 bg-[var(--accent-orange)] px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 mr-1 whitespace-nowrap">
                View Tray
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};