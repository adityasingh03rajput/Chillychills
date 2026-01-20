import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const CategoryManager = ({ categories, onUpdateCategories }: CategoryManagerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [localCategories, setLocalCategories] = useState(categories);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (localCategories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    const updated = [...localCategories, newCategory.trim()];
    setLocalCategories(updated);
    setNewCategory('');
    toast.success(`Category "${newCategory}" added`);
  };

  const handleRemoveCategory = (category: string) => {
    const updated = localCategories.filter(c => c !== category);
    setLocalCategories(updated);
    toast.success(`Category "${category}" removed`);
  };

  const handleSave = () => {
    onUpdateCategories(localCategories);
    setShowModal(false);
    toast.success('Categories updated successfully!');
  };

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Tag size={16} /> Manage Categories
      </Button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1E1E1E] rounded-t-3xl border-t border-white/10 max-h-[75vh] flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-white/5">
                <h3 className="text-lg font-bold text-[#FF7A2F]">
                  <Tag size={20} className="inline mr-2" />
                  Manage Categories
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Add Category */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="text-xs font-bold text-white/60 mb-2 block">ADD NEW CATEGORY</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Beverages, Breakfast..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="flex-1 bg-black/20 text-white border-white/10"
                    />
                    <Button onClick={handleAddCategory} className="bg-[#3F8A4F]">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Current Categories */}
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">CURRENT CATEGORIES</label>
                  <div className="space-y-2">
                    {localCategories.map((category, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"
                      >
                        <span className="text-white font-medium">{category}</span>
                        <button
                          onClick={() => handleRemoveCategory(category)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-[#FF7A2F] to-[#E06925] py-6"
                >
                  Save Categories
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
