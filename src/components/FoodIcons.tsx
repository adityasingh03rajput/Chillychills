import React from 'react';
import { motion } from 'motion/react';

export const Burger2D = ({ onClick }: { onClick?: () => void }) => (
  <motion.div 
    className="relative w-24 h-24 cursor-pointer"
    onClick={onClick}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <path d="M 20 55 H 80 Q 80 20 50 20 Q 20 20 20 55 Z" fill="#F4C287" /> {/* Top Bun */}
      <path d="M 15 65 Q 25 70 35 62 Q 45 70 55 62 Q 65 70 75 62 Q 85 70 90 60 L 85 55 L 20 55 Z" fill="#4CAF50" /> {/* Lettuce */}
      <rect x="20" y="60" width="60" height="10" rx="5" fill="#795548" /> {/* Patty */}
      <path d="M 20 75 H 80 Q 80 85 50 85 Q 20 85 20 75 Z" fill="#F4C287" /> {/* Bottom Bun */}
      <circle cx="35" cy="35" r="2" fill="#FFE0B2" />
      <circle cx="50" cy="30" r="2" fill="#FFE0B2" />
      <circle cx="65" cy="35" r="2" fill="#FFE0B2" />
    </svg>
    <div className="text-center mt-1">
      <span className="text-xs font-bold text-white bg-black/20 px-2 py-0.5 rounded-full">North</span>
    </div>
  </motion.div>
);

export const Coke2D = ({ onClick }: { onClick?: () => void }) => (
  <motion.div 
    className="relative w-20 h-24 cursor-pointer"
    onClick={onClick}
    whileHover={{ scale: 1.1, rotate: -5 }}
    whileTap={{ scale: 0.95 }}
  >
    <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-lg">
      <path d="M 15 10 L 15 90 Q 40 100 65 90 L 65 10 Z" fill="#F44336" />
      <ellipse cx="40" cy="10" rx="25" ry="5" fill="#E0E0E0" />
      <path d="M 40 40 Q 60 30 50 60 Q 30 70 40 40" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
      <line x1="50" y1="5" x2="65" y2="-15" stroke="#FFA726" strokeWidth="4" strokeLinecap="round" /> {/* Straw */}
    </svg>
    <div className="text-center mt-1">
      <span className="text-xs font-bold text-white bg-black/20 px-2 py-0.5 rounded-full">Central</span>
    </div>
  </motion.div>
);

export const Chips2D = ({ onClick }: { onClick?: () => void }) => (
  <motion.div 
    className="relative w-24 h-24 cursor-pointer"
    onClick={onClick}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <path d="M 20 15 L 25 85 Q 50 95 75 85 L 80 15 Q 50 5 20 15 Z" fill="#FFC107" />
      <circle cx="50" cy="50" r="15" fill="#F57F17" opacity="0.2" />
      <path d="M 20 15 L 25 10 L 30 15 L 35 10 L 40 15 L 45 10 L 50 15 L 55 10 L 60 15 L 65 10 L 70 15 L 75 10 L 80 15" fill="none" stroke="#FFA000" strokeWidth="1" />
      <path d="M 25 85 L 75 85" stroke="#FFA000" strokeWidth="2" strokeDasharray="4 2" />
    </svg>
    <div className="text-center mt-1">
      <span className="text-xs font-bold text-white bg-black/20 px-2 py-0.5 rounded-full">South</span>
    </div>
  </motion.div>
);
