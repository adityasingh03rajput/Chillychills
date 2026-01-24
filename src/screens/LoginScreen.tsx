import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChefHat, GraduationCap, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { ChillyLogo } from '../components/ChillyLogo';

export const LoginScreen = ({ onLogin }: { onLogin: (role: string) => void }) => {
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

      // TEST CREDENTIALS
      if (activeTab === 'staff') {
        const cleanStaffId = staffId.trim();
        if ((cleanStaffId === 'cook_test_001' && cleanPassword === 'cook123')) {
          toast.success('Welcome back, Chef! 👨‍🍳');
          onLogin('cook');
          return;
        }
        if (cleanStaffId === 'manager_test_001' && cleanPassword === 'manager123') {
          toast.success('Admin Dashboard Unlocked! 👔');
          onLogin('manager');
          return;
        }
      }

      if (activeTab === 'student') {
        const cleanEmail = email.trim();
        if ((cleanEmail === 'student_test' || cleanEmail === 'demo') && cleanPassword === 'student123') {
          toast.success('Access Granted! 🎓');
          onLogin('student');
          return;
        }
      }

      // REAL SUPABASE AUTH
      let emailToUse = email.trim();
      if (activeTab === 'staff') emailToUse = `${staffId.trim()}@chillystaff.com`;
      else if (!emailToUse.includes('@')) emailToUse = `${emailToUse}@chillystudent.com`;

      if (activeTab === 'student' && authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: emailToUse,
          password: cleanPassword,
          options: { data: { full_name: fullName.trim(), role: 'student' } }
        });
        if (error) throw error;
        toast.success('Account Created! Welcome to Chilly Chills.');
        onLogin('student');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: cleanPassword,
        });
        if (error) throw error;
        const userRole = data.user?.user_metadata?.role || activeTab;
        onLogin(userRole);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-[var(--bg-primary)] overflow-y-auto custom-scrollbar">

      {/* Background Aesthetic is managed by Layout, but we add local focal points */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent-orange)] rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-green)] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-12">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-[var(--accent-orange)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent-orange)]/20 transition-all duration-700" />
            <ChillyLogo className="h-32 mx-auto relative z-10 drop-shadow-[0_20px_50px_rgba(255,122,47,0.3)]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mt-8 tracking-tighter uppercase leading-none">Chilly Chills</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60">Elite Campus Dining</p>
        </div>

        <div className="premium-glass p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative border border-[var(--border-color)]">
          {/* Tab Selection */}
          <div className="flex p-1.5 bg-[var(--input-bg)] rounded-3xl mb-10 relative border border-[var(--border-color)]">
            <motion.div
              layoutId="auth-tab"
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-[var(--card-bg)] rounded-2xl shadow-xl border border-[var(--border-color)]"
              animate={{ x: activeTab === 'staff' ? '100.5%' : '0%' }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
            />
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest relative z-10 transition-all ${activeTab === 'student' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-40'}`}
            >
              <GraduationCap size={16} strokeWidth={activeTab === 'student' ? 3 : 2} /> Student
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest relative z-10 transition-all ${activeTab === 'staff' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-40'}`}
            >
              <ChefHat size={16} strokeWidth={activeTab === 'staff' ? 3 : 2} /> Staff
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {activeTab === 'student' && authMode === 'signup' && (
                  <div>
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2 mb-2 block">Full Name</label>
                    <Input
                      placeholder="e.g. Alex Johnson"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2 mb-2 block">
                    {activeTab === 'staff' ? 'Vault ID' : 'Student Identity'}
                  </label>
                  <Input
                    placeholder={activeTab === 'staff' ? "cook_test_001" : "student_test"}
                    value={activeTab === 'staff' ? staffId : email}
                    onChange={e => activeTab === 'staff' ? setStaffId(e.target.value) : setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2 mb-2 block">Secret Key</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-16 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-orange-500/20 mt-4"
            >
              {authMode === 'login' ? 'Authenticate' : 'Register Account'} <ArrowRight size={18} strokeWidth={3} className="ml-2" />
            </Button>
          </form>

          {activeTab === 'student' && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[9px] font-black text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-all uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                {authMode === 'login' ? "Access Denied? Request Account" : "Identity Known? Go to Login"}
              </button>
            </div>
          )}

          {/* Sandbox Controls */}
          <div className="mt-10 pt-10 border-t border-[var(--border-color)] border-dashed">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sandbox Sync Active</span>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (activeTab === 'student') { setEmail('student_test'); setPassword('student123'); }
                  else { setStaffId('cook_test_001'); setPassword('cook123'); }
                  toast.info('Neural data populated');
                }}
                className="flex-1 h-12 text-[9px] uppercase tracking-widest rounded-xl"
              >
                AutoFill
              </Button>
              {activeTab === 'staff' && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => { setStaffId('manager_test_001'); setPassword('manager123'); toast.info('Admin clearance granted'); }}
                  className="flex-1 h-12 text-[9px] uppercase tracking-widest rounded-xl"
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};