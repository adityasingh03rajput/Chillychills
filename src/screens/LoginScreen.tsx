import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChefHat, GraduationCap, ArrowRight, Loader2, Sparkles, ShieldCheck, Github } from 'lucide-react';
import { toast } from 'sonner';
import { ChillyLogo } from '../components/ChillyLogo';
import { api } from '../utils/api';

export const LoginScreen = ({ onLogin }: { onLogin: (role: string, userId: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [staffId, setStaffId] = useState('');

  // Reset form fields when switching tabs
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setStaffId('');
    setAuthMode('login');
  }, [activeTab]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanPassword = password.trim();
      const cleanId = activeTab === 'staff' ? staffId.trim() : email.trim();

      if (authMode === 'signup' && activeTab === 'student') {
        const user = await api.signup(cleanId, fullName.trim(), cleanPassword, 'student');
        toast.success(`Identity Verified: Welcome ${user.name} 🎓`);
        onLogin(user.role, user.id);
      } else {
        const user = await api.login(cleanId, cleanPassword);

        const welcomeMsg = user.role === 'student' ? 'Access Granted! 🎓' :
          user.role === 'cook' ? 'Welcome back, Chef! 👨‍🍳' :
            'Admin Dashboard Unlocked! 👔';

        toast.success(welcomeMsg);
        onLogin(user.role, user.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication protocol failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black overflow-y-auto custom-scrollbar no-scrollbar">

      {/* OLED Dynamic Backdrop */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent-orange)] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-green)] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <div className="relative inline-block group">
            <ChillyLogo className="h-28 mx-auto relative z-10 drop-shadow-[0_20px_40px_rgba(255,122,47,0.4)]" />
          </div>
          <h1 className="text-[28px] font-black text-white mt-6 tracking-tighter uppercase leading-none">Chilly Chills</h1>
          <p className="text-white/30 text-[12px] font-black uppercase tracking-[0.3em] mt-3">Elite Campus Dining</p>
        </div>

        <div className="bg-stone-900/40 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-2xl relative">

          {/* 56dp Height Tab Selector (12sp Label) */}
          <div className="flex h-[56px] p-1.5 bg-black rounded-xl mb-10 relative border border-white/5">
            <motion.div
              layoutId="auth-tab"
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-stone-800 rounded-lg shadow-xl"
              animate={{ x: activeTab === 'staff' ? '100.5%' : '0%' }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest relative z-10 transition-all ${activeTab === 'student' ? 'text-white' : 'text-white/20'}`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest relative z-10 transition-all ${activeTab === 'staff' ? 'text-white' : 'text-white/20'}`}
            >
              <ChefHat size={16} /> Staff
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {activeTab === 'student' && authMode === 'signup' && (
                  <div>
                    <label className="text-[12px] font-black text-white/30 uppercase ml-1 mb-2 block">Full Name</label>
                    <Input
                      placeholder="e.g. Alex Johnson"
                      className="h-[56px] bg-black border-white/5 rounded-xl px-5 text-[14px] font-black uppercase tracking-wider"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-[12px] font-black text-white/30 uppercase ml-1 mb-2 block">
                    {activeTab === 'staff' ? 'Vault ID' : 'Enrollment Key'}
                  </label>
                  <Input
                    placeholder={activeTab === 'staff' ? "cook" : "user"}
                    className="h-[56px] bg-black border-white/5 rounded-xl px-5 text-[14px] font-black uppercase tracking-widest"
                    value={activeTab === 'staff' ? staffId : email}
                    onChange={e => activeTab === 'staff' ? setStaffId(e.target.value) : setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[12px] font-black text-white/30 uppercase ml-1 mb-2 block">Neural Secret</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-[56px] bg-black border-white/5 rounded-xl px-5 text-[14px] font-black"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <Button
              type="submit"
              isLoading={loading}
              variant="primary"
              size="xl"
              className="w-full mt-4"
            >
              {authMode === 'login' ? 'Authenticate' : 'Initiate Sequence'} <ArrowRight size={18} strokeWidth={3} className="ml-2" />
            </Button>
          </form>

          {activeTab === 'student' && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Social Node</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <button
                onClick={() => {
                  toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                    loading: 'Syncing with GitHub...',
                    success: 'GitHub Verified - Node Linked',
                    error: 'Handshake Failed'
                  });
                }}
                className="w-full h-[56px] bg-white text-black rounded-xl flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-widest active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <Github size={20} /> Continue with GitHub
              </button>
            </div>
          )}

          {activeTab === 'student' && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[12px] font-black text-white/20 hover:text-white uppercase tracking-widest"
              >
                {authMode === 'login' ? "Request Clearance" : "Known Identity Log"}
              </button>
            </div>
          )}

          {/* Core Sandbox UI */}
          <div className="mt-10 pt-8 border-t border-white/5 border-dashed flex gap-3">
            <button
              onClick={() => {
                if (activeTab === 'student') { setEmail('user'); setPassword('123'); }
                else { setStaffId('cook'); setPassword('123'); }
                toast.info('Data Link Established');
              }}
              className="flex-1 h-12 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest"
            >
              Autofill
            </button>
            {activeTab === 'staff' && (
              <button
                onClick={() => { setStaffId('manager'); setPassword('123'); toast.info('Admin override detected'); }}
                className="flex-1 h-12 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest"
              >
                Manager
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};