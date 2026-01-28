import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'white' | 'ghost' | 'none';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = ({ variant = 'primary', size = 'md', className, isLoading, children, ...props }: ButtonProps) => {
  const baseStyle = "font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#FF7A2F] text-white hover:bg-[#E6621F] shadow-lg shadow-[#FF7A2F]/20 border-b-4 border-[#D65A15] rounded-full",
    secondary: "bg-[#3F8A4F] text-white hover:bg-[#2E6B3C] shadow-lg shadow-[#3F8A4F]/20 border-b-4 border-[#255230] rounded-full",
    outline: "border-2 border-white/10 text-white bg-transparent hover:bg-white/5 rounded-xl",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 border-b-4 border-red-800 rounded-full",
    white: "bg-white text-black hover:bg-stone-100 shadow-xl shadow-white/10 rounded-xl",
    ghost: "bg-transparent text-white/40 hover:text-white border border-transparent hover:border-white/10 rounded-xl",
    none: "" // No opinionated styles for full manual control
  };

  const sizes = {
    sm: "px-4 h-[32px] text-[12px]",
    md: "px-6 h-[48px] text-[14px]",
    lg: "px-8 h-[56px] text-[16px]",
    xl: "px-10 h-[64px] text-[18px]"
  };

  return (
    <motion.button
      whileTap={variant !== 'none' ? { scale: 0.96, y: 1 } : {}}
      className={`${baseStyle} ${variants[variant]} ${variant !== 'none' ? sizes[size] : ''} ${className || ''}`}
      {...props as any}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
