import React from 'react';
import { MapPin } from 'lucide-react';

interface BranchFilterProps {
  selectedBranch: 'ALL' | 'A' | 'B' | 'C';
  onBranchChange: (branch: 'ALL' | 'A' | 'B' | 'C') => void;
}

export const BranchFilter = ({ selectedBranch, onBranchChange }: BranchFilterProps) => {
  const branches = [
    { id: 'ALL' as const, name: 'All Branches', icon: '🏢' },
    { id: 'A' as const, name: 'Branch A', icon: '🍔', color: 'from-[#FF7A2F] to-[#E06925]' },
    { id: 'B' as const, name: 'Branch B', icon: '🥤', color: 'from-[#e74c3c] to-[#c0392b]' },
    { id: 'C' as const, name: 'Branch C', icon: '🍟', color: 'from-[#f1c40f] to-[#f39c12]' },
  ];

  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={14} className="text-[#FF7A2F]" />
        <span className="text-xs font-bold text-white/60">FILTER BY BRANCH</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onBranchChange(branch.id)}
            className={`p-2 rounded-lg text-center transition-all ${
              selectedBranch === branch.id
                ? 'bg-[#FF7A2F] text-white shadow-lg shadow-[#FF7A2F]/30 scale-105'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl mb-1">{branch.icon}</div>
            <div className="text-[9px] font-bold">{branch.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
