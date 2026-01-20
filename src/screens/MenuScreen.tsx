import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem } from '../utils/types';
import { Card } from '../components/ui/Card';
import { Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
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

  // Filter by branch first
  const branchItems = menu.filter(i => i.branch === branch || i.branch === 'All');

  const categories = ['All', ...Array.from(new Set(branchItems.map(i => i.category)))];

  const filteredItems = selectedCategory === 'All'
    ? branchItems
    : branchItems.filter(i => i.category === selectedCategory);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="h-full flex flex-col pt-6 pb-24">
      {/* Header */}
      <div className="px-6 mb-4 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold text-white drop-shadow-md flex-1">Delicious Menu 🍔</h2>
      </div>

      {/* Categories */}
      <div className="px-6 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pb-2 w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md active:scale-95 ${selectedCategory === cat
                ? 'bg-[#FF7A2F] text-white scale-100 ring-2 ring-[#FF7A2F]/50 ring-offset-2 ring-offset-[#4A2E1E]'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar smooth-scroll">
        <div className="grid grid-cols-2 gap-4 pb-20">
          <AnimatePresence mode='popLayout'>
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <Card
                  className="h-full flex flex-col p-0 overflow-hidden relative group border-0 shadow-2xl hover:shadow-[#FF7A2F]/20 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => onAddToCart(item)}
                >
                  {/* Food Image with Enhanced Frame */}
                  <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
                    {/* Decorative Pattern Background */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, #FF7A2F 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }} />

                    {/* Food Image */}
                    <div className="relative w-full h-full">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Subtle Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Corner Decorative Elements */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF7A2F] rounded-tl-2xl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF7A2F] rounded-tr-2xl" />
                    </div>

                    {/* Special Badge */}
                    {item.isDailySpecial && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-[#FF7A2F] to-[#ff9554] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg tracking-wide flex items-center gap-1 border-2 border-white/30">
                          <span className="animate-pulse">⭐</span>
                          SPECIAL
                        </div>
                      </div>
                    )}

                    {/* Bottom Decorative Border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF7A2F] to-transparent" />
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-br from-[#FAFAF7] via-white to-orange-50/30">
                    <div>
                      <h3 className="font-bold text-sm leading-tight mb-1.5 text-stone-900">{item.name}</h3>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Price and Add Button */}
                    <div className="flex justify-between items-end mt-3 pt-3 border-t-2 border-dashed border-[#FF7A2F]/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-400 font-bold">PRICE</span>
                        <span className="font-black text-[#3F8A4F] text-xl leading-none">₹{item.price}</span>
                      </div>
                      <div className="relative">
                        {/* Add Button with Glow Effect */}
                        <div className="absolute inset-0 bg-[#FF7A2F] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-[#FF7A2F] to-[#E06925] text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg active:scale-90 transition-transform hover:shadow-xl border-2 border-white">
                          <Plus size={18} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mini Cart Floating Bar */}
      <AnimatePresence>
        {cartTotalItems > 0 && onGoToCart && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 safe-area-bottom"
          >
            <button
              onClick={onGoToCart}
              className="w-full bg-[#1E1E1E] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 active:scale-98 transition-transform"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{cartTotalItems} ITEMS</span>
                <span className="text-xl font-bold text-[#FF7A2F]">₹{cartTotalPrice}</span>
              </div>

              <div className="flex items-center gap-2 bg-[#FF7A2F] px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-orange-900/20">
                View Cart <ShoppingBag size={18} fill="currentColor" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};