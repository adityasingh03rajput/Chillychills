import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface DeleteMenuItemProps {
  itemId: string;
  itemName: string;
  onDelete: (id: string) => void;
}

export const DeleteMenuItem = ({ itemId, itemName, onDelete }: DeleteMenuItemProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(itemId);
    toast.success(`${itemName} deleted from menu`);
    setShowConfirm(false);
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
      >
        <Trash2 size={14} />
      </button>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[70] backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-[#1E1E1E] rounded-2xl border border-red-500/30 p-6 max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Delete Menu Item?</h3>
                  <p className="text-white/60 text-xs">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg mb-4">
                <p className="text-white text-sm">
                  Are you sure you want to delete <span className="font-bold text-[#FF7A2F]">{itemName}</span>?
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600" 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
