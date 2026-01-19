import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Megaphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner@2.0.3';

interface BranchAnnouncementProps {
  currentAnnouncement: string;
  onUpdateAnnouncement: (announcement: string) => void;
}

export const BranchAnnouncement = ({ currentAnnouncement, onUpdateAnnouncement }: BranchAnnouncementProps) => {
  const [showModal, setShowModal] = useState(false);
  const [announcement, setAnnouncement] = useState(currentAnnouncement);

  const handleSave = () => {
    onUpdateAnnouncement(announcement);
    setShowModal(false);
    if (announcement.trim()) {
      toast.success('Announcement updated!');
    } else {
      toast.success('Announcement removed');
    }
  };

  const handleClear = () => {
    setAnnouncement('');
    onUpdateAnnouncement('');
    setShowModal(false);
    toast.success('Announcement cleared');
  };

  return (
    <>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Bell size={16} /> {currentAnnouncement ? 'Edit' : 'Add'} Announcement
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
                  <Megaphone size={20} className="inline mr-2" />
                  Branch Announcement
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                  <p className="text-blue-300 text-xs">
                    📢 This message will be displayed to all students at the top of their screen
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block">ANNOUNCEMENT MESSAGE</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm min-h-[120px] outline-none focus:border-[#FF7A2F]"
                    placeholder="e.g., Special Diwali discount - 20% off on all items today!"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-[10px] text-white/40 mt-1">
                    {announcement.length}/200 characters
                  </p>
                </div>

                {/* Preview */}
                {announcement && (
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block">PREVIEW</label>
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-lg text-center text-sm font-bold">
                      📢 {announcement}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {currentAnnouncement && (
                    <Button 
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1 border-red-500/30 text-red-400"
                    >
                      Clear
                    </Button>
                  )}
                  <Button 
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-[#FF7A2F] to-[#E06925]"
                  >
                    Save Announcement
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
