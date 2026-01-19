import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner@2.0.3';

interface BranchMenuManagerProps {
  currentBranch: 'A' | 'B' | 'C';
  branchMenus: Record<string, any[]>;
  onCopyMenu: (fromBranch: string, toBranch: string) => void;
}

export const BranchMenuManager = ({ currentBranch, branchMenus, onCopyMenu }: BranchMenuManagerProps) => {
  const [showCopyOptions, setShowCopyOptions] = useState(false);

  const handleCopyFrom = (sourceBranch: string) => {
    onCopyMenu(sourceBranch, currentBranch);
    toast.success(`Menu copied from Branch ${sourceBranch} to Branch ${currentBranch}`);
    setShowCopyOptions(false);
  };

  const otherBranches = ['A', 'B', 'C'].filter(b => b !== currentBranch);

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4 rounded-xl mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-purple-300">
            Branch-Specific Menu
          </span>
        </div>
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full font-bold">
          Branch {currentBranch}
        </span>
      </div>

      <p className="text-xs text-white/60 mb-3">
        Each branch can have its own unique menu. Items you add here will only appear for Branch {currentBranch}.
      </p>

      <Button 
        size="sm" 
        variant="outline"
        onClick={() => setShowCopyOptions(!showCopyOptions)}
        className="w-full gap-2 text-xs"
      >
        <Copy size={14} /> Copy Menu from Another Branch
      </Button>

      {showCopyOptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-2"
        >
          {otherBranches.map(branch => (
            <button
              key={branch}
              onClick={() => handleCopyFrom(branch)}
              className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center justify-between text-left transition-all"
            >
              <div>
                <p className="text-white font-bold text-sm">Branch {branch}</p>
                <p className="text-white/60 text-xs">
                  {branchMenus[branch]?.length || 0} items
                </p>
              </div>
              <CheckCircle size={16} className="text-green-400" />
            </button>
          ))}
        </motion.div>
      )}

      <div className="mt-3 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
        <p className="text-blue-300 text-[10px]">
          💡 <strong>Tip:</strong> Copy a menu template from another branch and then customize it for this location.
        </p>
      </div>
    </div>
  );
};
