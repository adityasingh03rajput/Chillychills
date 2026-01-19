import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({ variant = 'primary', size = 'md', className, isLoading, children, ...props }: ButtonProps) => {
  const baseStyle = "rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer";
  
  const variants = {
    primary: "bg-[#FF7A2F] text-white hover:bg-[#E6621F] shadow-[#FF7A2F]/40 border-b-4 border-[#D65A15]",
    secondary: "bg-[#3F8A4F] text-white hover:bg-[#2E6B3C] shadow-[#3F8A4F]/40 border-b-4 border-[#255230]",
    outline: "border-2 border-[#8B4E2E] text-[#8B4E2E] bg-white/50 backdrop-blur hover:bg-[#8B4E2E]/10",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 border-b-4 border-red-700"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95, y: 2, borderBottomWidth: "0px", marginBottom: "4px" }}
      whileHover={{ y: -1 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className || ''} ${isLoading ? 'opacity-80 pointer-events-none' : ''}`}
      {...props}
    >
      {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </motion.button>
  );
};
