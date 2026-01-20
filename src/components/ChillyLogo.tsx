import React from 'react';
import logo from "../assets/logo.png";

export const ChillyLogo = ({ className = "h-16", withFrame = true }: { className?: string, withFrame?: boolean }) => {
  if (!withFrame) {
    return (
      <img
        src={logo}
        alt="Chilly Chills"
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <div className="relative inline-block">
      {/* Decorative Frame Container */}
      <div className="relative p-4 bg-gradient-to-br from-[#FF7A2F]/10 via-transparent to-[#FF7A2F]/5 rounded-2xl">

        {/* Corner Decorations - Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF7A2F] rounded-tl-2xl" />
        <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-[#ff9554] rounded-tl-xl opacity-60" />

        {/* Corner Decorations - Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF7A2F] rounded-tr-2xl" />
        <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#ff9554] rounded-tr-xl opacity-60" />

        {/* Corner Decorations - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF7A2F] rounded-bl-2xl" />
        <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#ff9554] rounded-bl-xl opacity-60" />

        {/* Corner Decorations - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF7A2F] rounded-br-2xl" />
        <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-[#ff9554] rounded-br-xl opacity-60" />

        {/* Accent Dots */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FF7A2F] rounded-full" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FF7A2F] rounded-full" />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FF7A2F] rounded-full" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FF7A2F] rounded-full" />

        {/* Logo */}
        <img
          src={logo}
          alt="Chilly Chills"
          className={`object-contain relative z-10 ${className}`}
        />

        {/* Subtle Inner Glow */}
        <div className="absolute inset-3 rounded-xl bg-[#FF7A2F]/5 blur-xl -z-10" />
      </div>

      {/* Outer Shadow */}
      <div className="absolute inset-0 rounded-2xl shadow-xl shadow-[#FF7A2F]/20 -z-20" />
    </div>
  );
};