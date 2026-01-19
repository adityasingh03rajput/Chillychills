import { motion } from 'motion/react';
import React from 'react';

export const Card = ({ children, className, onClick, ...props }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -5 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-black/5 border border-white/40 ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};
