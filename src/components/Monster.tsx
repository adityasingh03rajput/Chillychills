import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type MonsterState = 'idle' | 'eating' | 'drinking' | 'blasting';

export const Monster = ({ state }: { state: MonsterState }) => {
  const [blink, setBlink] = useState(false);

  // Blinking logic
  useEffect(() => {
    if (state !== 'idle') return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [state]);

  const bodyVariants = {
    idle: { 
      y: [0, -5, 0], 
      scaleY: [1, 1.02, 1],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
    },
    eating: { 
      scale: [1, 1.1, 0.9, 1.1, 1], 
      y: [0, -10, 5, 0],
      transition: { duration: 1.5, times: [0, 0.2, 0.4, 0.6, 1] } 
    },
    drinking: { 
      rotate: [0, -2, 2, 0], 
      transition: { duration: 0.5, repeat: Infinity } 
    },
    blasting: { 
      y: [0, -100, 20, 0], 
      scaleY: [1, 1.2, 0.6, 1],
      transition: { duration: 1, times: [0, 0.3, 0.8, 1] }
    }
  };

  const mouthVariants = {
    idle: { d: "M 70 115 Q 100 125 130 115" }, // Smile
    eating: { 
      d: [
        "M 70 115 Q 100 125 130 115", // Smile
        "M 70 100 Q 100 160 130 100", // Open Wide
        "M 70 110 Q 100 120 130 110", // Chew
        "M 70 100 Q 100 160 130 100", // Open Wide
        "M 70 115 Q 100 125 130 115"  // Smile
      ],
      transition: { duration: 1.5 }
    },
    drinking: { d: "M 90 115 Q 100 125 110 115" }, // Small O
    blasting: { d: "M 60 110 Q 100 150 140 110" } // Big shout
  };

  return (
    <div className="w-64 h-64 relative z-20">
      <motion.svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        {/* Shadow */}
        <motion.ellipse 
          cx="100" cy="190" rx="60" ry="10" 
          fill="#000" opacity="0.1" 
          animate={{ 
            scale: state === 'blasting' ? [1, 0.5, 1.2, 1] : 1,
            opacity: state === 'blasting' ? [0.1, 0, 0.2, 0.1] : 0.1
          }}
          transition={{ duration: 1 }}
        />

        {/* Body Group */}
        <motion.g variants={bodyVariants} animate={state}>
          {/* Main Body */}
          <path 
            d="M 40 180 C 20 180 20 120 40 80 C 60 20 140 20 160 80 C 180 120 180 180 160 180 Q 100 190 40 180" 
            fill="white" 
          />
          
          {/* Arms */}
          <motion.path 
            d="M 40 120 Q 20 140 40 150" 
            stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"
            animate={state === 'blasting' ? { d: "M 30 110 Q 10 70 40 50" } : { d: "M 40 120 Q 20 140 40 150" }}
          />
          <motion.path 
            d="M 160 120 Q 180 140 160 150" 
            stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"
            animate={state === 'blasting' ? { d: "M 170 110 Q 190 70 160 50" } : { d: "M 160 120 Q 180 140 160 150" }}
          />

          {/* Cheeks */}
          <circle cx="55" cy="115" r="8" fill="#FFB6C1" opacity="0.5" />
          <circle cx="145" cy="115" r="8" fill="#FFB6C1" opacity="0.5" />

          {/* Eyes */}
          <g transform="translate(0, 0)">
            <motion.ellipse 
              cx="70" cy="95" rx="8" ry={blink ? 0.5 : 10} 
              fill="#2D2D2D" 
            />
            <motion.ellipse 
              cx="130" cy="95" rx="8" ry={blink ? 0.5 : 10} 
              fill="#2D2D2D" 
            />
          </g>

          {/* Mouth */}
          <motion.path 
            stroke="#2D2D2D" 
            strokeWidth="4" 
            strokeLinecap="round" 
            fill={state === 'eating' || state === 'blasting' ? "#4A2E1E" : "none"}
            variants={mouthVariants}
            animate={state}
          />
          
          {/* Straw for Drinking */}
          {state === 'drinking' && (
            <motion.path
              d="M 100 115 L 120 140 L 140 100"
              stroke="#FF7A2F" strokeWidth="4" fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
            />
          )}
        </motion.g>
        
        {/* Particles for Blasting */}
        <AnimatePresence>
          {state === 'blasting' && (
            <g>
               {[...Array(8)].map((_, i) => (
                 <motion.circle
                   key={i}
                   cx="100" cy="180" r="5"
                   fill={["#FFC107", "#FF5722", "#FFEB3B"][i % 3]}
                   initial={{ opacity: 1, x: 0, y: 0 }}
                   animate={{ 
                     opacity: 0, 
                     x: (Math.random() - 0.5) * 200, 
                     y: -Math.random() * 150,
                     scale: 0
                   }}
                   transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                 />
               ))}
            </g>
          )}
        </AnimatePresence>

        {/* Crumbs for Eating */}
        <AnimatePresence>
          {state === 'eating' && (
            <g>
               {[...Array(4)].map((_, i) => (
                 <motion.circle
                   key={i}
                   cx="100" cy="120" r="3"
                   fill="#8D6E63"
                   initial={{ opacity: 0, y: 0 }}
                   animate={{ 
                     opacity: [0, 1, 0], 
                     y: 40,
                     x: (Math.random() - 0.5) * 40
                   }}
                   transition={{ duration: 0.5, delay: 0.5 + (i * 0.1), repeat: 2 }}
                 />
               ))}
            </g>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
};
