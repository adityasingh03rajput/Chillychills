import React from 'react';
import logo from "../assets/logo.png";

export const ChillyLogo = ({ className = "h-16", withFrame = true }: { className?: string, withFrame?: boolean }) => {
  if (!withFrame) {
    return (
      <img
        src={logo}
        alt="Chilly Chills"
        className={`object-contain ${className} transition-all duration-700 hover:scale-110 active:scale-95`}
      />
    );
  }

  return (
    <div className="relative inline-block group">
      {/* Immersive Elite Frame */}
      <div className="relative p-6 bg-gradient-to-br from-[var(--card-bg)] via-[var(--bg-primary)] to-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl transition-all duration-700 group-hover:shadow-[var(--accent-orange)]/10">

        {/* Abstract Floating Rings (Glassmorphism Decor) */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-orange)]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-[var(--accent-green)]/5 rounded-full -ml-10 -mb-10 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

        {/* Tactical Corner Accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--accent-orange)] rounded-tl-lg opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--accent-orange)] rounded-br-lg opacity-40 group-hover:opacity-100 transition-opacity" />

        {/* Logo Visual Volume */}
        <div className="relative z-10">
          <img
            src={logo}
            alt="Chilly Chills"
            className={`object-contain transition-all duration-700 group-hover:rotate-1 group-hover:scale-105 drop-shadow-2xl ${className}`}
          />
        </div>

        {/* Core Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-orange)]/5 to-transparent rounded-[2.5rem] pointer-events-none" />
      </div>

      {/* Floating Base Shadow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/10 blur-xl rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
  );
};