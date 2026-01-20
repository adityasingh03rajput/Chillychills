import React from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-stone-900 flex justify-center overflow-hidden relative font-sans text-stone-100">
      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
         .font-brand { font-family: 'Pacifico', cursive; }
       `}</style>
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center blur-sm scale-110"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1754380630120-35eeee7fcc06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#4A2E1E]/80 to-[#1A1A1A]/90 mix-blend-multiply" />

      {/* Mobile Container */}
      <div className="w-full max-w-md h-[100dvh] relative z-10 bg-[#FAFAF7]/5 backdrop-blur-md shadow-2xl flex flex-col overflow-y-auto border-x border-white/10 sm:rounded-3xl sm:my-4 sm:h-[calc(100vh-2rem)] ios-safe-area">
        {children}
      </div>
    </div>
  );
};
