import React from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[var(--bg-primary)] selection:bg-[var(--accent-orange)]/30 overflow-hidden flex justify-center">
      {/* Immersive Background Shell (Global) */}
      <div className="fixed inset-0 z-0 bg-black" />

      {/* Dynamic Ambient Gradient Flows (Global Background) */}
      <div className="fixed top-[-10%] left-[-20%] w-[140%] h-[140%] z-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-[var(--accent-orange)] rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-[var(--accent-green)] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* The Central Mobile Shell - Constraint for larger screens, fluid for mobile */}
      <div className="mobile-shell z-20">
        <main className="relative flex-1 flex flex-col pt-safe overflow-hidden">
          {children}
        </main>
      </div>

      {/* Persistent Visual Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] opacity-50" />
    </div>
  );
};
