import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem } from '../utils/types';
import { Card } from '../components/ui/Card';
import { Plus, ShoppingBag, Star, ChevronLeft, UtensilsCrossed, Zap, ArrowRight } from 'lucide-react';
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

  const branchItems = menu.filter(i => {
    if (!i.branch || i.branch === 'All') return true;
    if (branch && i.branch === branch) return true;
    return false;
  });

  const categories = ['All', ...Array.from(new Set(branchItems.map(i => i.category || 'Other')))];

  const filteredItems = selectedCategory === 'All'
    ? branchItems
    : branchItems.filter(i => i.category === selectedCategory);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="h-full flex flex-col bg-black">

      {/* 56dp Top App Bar + 24dp Margins */}
      <div className="flex items-center h-[56px] px-6 mt-4 mb-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-stone-900 text-white border border-white/10 active:scale-90 transition-all"
            >
              <ChevronLeft strokeWidth={3} className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-[20px] font-black text-white uppercase tracking-tight leading-none">C7 Vault</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)]" />
              <p className="text-[12px] font-black text-white/40 uppercase tracking-widest">Sector Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* 48dp Height Category Selector (12sp labels) */}
      <div className="px-6 mb-6 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-[40px] px-5 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all border-2 ${selectedCategory === cat
                ? 'bg-white text-black border-white'
                : 'bg-stone-900 text-white/40 border-white/5 hover:border-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 8-12dp Corner Radius Card Grid (16sp Title, 18sp Price) */}
      <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card
                    className="p-2 bg-stone-900 border-white/5 rounded-xl group active:bg-stone-800 transition-all h-full flex flex-col"
                    onClick={() => {
                      if (window.navigator.vibrate) window.navigator.vibrate(5);
                      onAddToCart(item);
                    }}
                  >
                    <div className="aspect-square w-full relative overflow-hidden rounded-lg border border-white/5 bg-stone-800 mb-3">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.isDailySpecial && (
                        <div className="absolute top-2 left-2 bg-[var(--accent-orange)] px-2 py-0.5 rounded shadow-lg">
                          <p className="text-[8px] font-black text-white uppercase tracking-tighter">Elite</p>
                        </div>
                      )}
                    </div>

                    <div className="px-1 pb-1 flex flex-col flex-1">
                      <h3 className="font-black text-[14px] uppercase tracking-tight text-white mb-2 line-clamp-1">{item.name}</h3>

                      <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="font-black text-[var(--accent-orange)] text-[18px]">₹{item.price}</span>
                        <div className="w-8 h-8 rounded-lg bg-stone-800 border border-white/5 flex items-center justify-center text-white active:scale-75 transition-all">
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-30">
                <UtensilsCrossed size={32} className="text-white mb-4" />
                <p className="font-black uppercase tracking-widest text-[12px]">No Data in Vault</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 56dp-styled Floating Tray (16sp Body / 12sp labels) */}
      <AnimatePresence>
        {cartTotalItems > 0 && onGoToCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-6 right-6 z-40"
          >
            <button
              onClick={onGoToCart}
              className="w-full h-[64px] bg-white text-black p-3 rounded-2xl shadow-2xl flex items-center justify-between active:scale-95 transition-all group overflow-hidden"
            >
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center relative shadow-lg">
                  <ShoppingBag size={20} />
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent-orange)] text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white">
                    {cartTotalItems}
                  </span>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Subtotal</span>
                  <span className="text-[20px] font-black tabular-nums">₹{cartTotalPrice}</span>
                </div>
              </div>

              <div className="h-10 px-6 rounded-xl bg-black text-white flex items-center gap-2 group">
                <span className="text-[12px] font-black uppercase tracking-widest">View Tray</span>
                <ArrowRight size={16} strokeWidth={3} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};