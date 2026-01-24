import { motion } from 'motion/react';
import React from 'react';

export const Card = ({ children, className, onClick, ...props }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -5, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-[var(--border-color)] overflow-hidden transition-all duration-300 ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};
