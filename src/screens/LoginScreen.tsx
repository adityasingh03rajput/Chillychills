import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChefHat, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
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
  const [phone, setPhone] = useState('');

  // For staff login specifically (ID based)
  const [staffId, setStaffId] = useState('');

  // Reset form fields when switching tabs
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setStaffId('');
    setAuthMode('login'); // Reset to login mode when switching tabs
  }, [activeTab]);

  // Reset additional fields when switching between login/signup
  React.useEffect(() => {
    if (authMode === 'login') {
      setFullName('');
      setPhone('');
    }
  }, [authMode]);

  // Helper function to reset all fields
  const resetAllFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setStaffId('');
  };

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      if (window.navigator.vibrate) window.navigator.vibrate(10);

      // detect if we are running inside the Capacitor Android/iOS app
      const isApp = (window as any).Capacitor?.isNativePlatform();

      // If it's the app, use our deep link. If it's a browser, use the current origin.
      const redirectTo = isApp
        ? 'https://com.chillychills.app'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      toast.success('Connecting to Google...');
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      toast.error('Google Sign In failed.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanPassword = password.trim();

      // CHECK TEST CREDENTIALS FIRST - Skip Supabase for demo accounts
      if (activeTab === 'staff') {
        const cleanStaffId = staffId.trim();

        // Test Cook Account
        if ((cleanStaffId === 'cook_test_001' && cleanPassword === 'cook123') ||
          (cleanStaffId === 'cook_test_002' && cleanPassword === 'cook123')) {
          toast.success('Welcome, Chef! 👨‍🍳');
          resetAllFields();
          setLoading(false);
          onLogin('cook');
          return;
        }

        // Test Manager Account
        if (cleanStaffId === 'manager_test_001' && cleanPassword === 'manager123') {
          toast.success('Welcome, Manager! 👔');
          resetAllFields();
          setLoading(false);
          onLogin('manager');
          return;
        }
      }

      if (activeTab === 'student') {
        const cleanEmail = email.trim();
        // Test Student Account
        if ((cleanEmail === 'student_test' || cleanEmail === 'demo') && cleanPassword === 'student123') {
          toast.success('Welcome, Student! 🎓');
          resetAllFields();
          setLoading(false);
          onLogin('student');
          return;
        }
      }

      // If not test credentials, proceed with Supabase auth
      let emailToUse = email.trim();

      // If Staff, map ID to dummy email
      if (activeTab === 'staff') {
        const cleanStaffId = staffId.trim();
        if (!cleanStaffId) throw new Error('Staff ID is required');
        emailToUse = `${cleanStaffId}@chillychills.staff`;
      }

      // If Student, allow ID input and map to dummy email if not already an email
      if (activeTab === 'student') {
        if (!emailToUse.includes('@')) {
          // Use a standard .com domain to avoid Supabase validation errors
          emailToUse = `${emailToUse}@chillychills.com`;
        }
      }

      if (activeTab === 'student' && authMode === 'signup') {
        if (cleanPassword.length < 6) throw new Error('Password must be at least 6 characters');

        const { error } = await supabase.auth.signUp({
          email: emailToUse,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'student'
            }
          }
        });

        if (error) throw error;
        toast.success('Account created! Logging you in...');
        resetAllFields();
        onLogin('student');

      } else {
        // Login Flow (Both Student and Staff)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: cleanPassword,
        });

        if (error) throw error;

        const userRole = data.user?.user_metadata?.role || activeTab;

        if (activeTab === 'staff') {
          if (staffId.trim().startsWith('manager') || userRole === 'manager') {
            onLogin('manager');
          } else {
            onLogin('cook');
          }
        } else {
          resetAllFields();
          onLogin('student');
        }
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      const errorMsg = error.message || '';
      if (errorMsg === 'Invalid login credentials') {
        toast.error('Invalid ID or Password');
      } else {
        toast.error(errorMsg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#121212] custom-scrollbar selection:bg-[#FF7A2F]/30">
      {/* Background blobs - Fixed so they don't scroll with content */}
      <div className="fixed top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#3F8A4F]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#8B4E2E]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex min-h-full items-center justify-center p-6 py-12 relative z-10">
        <motion.div
          layout
          className="w-full max-w-md bg-[#1E1E1E]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden text-center"
        >
          {/* Subtle top edge highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4"
            >
              <ChillyLogo className="h-32 drop-shadow-2xl" />
            </motion.div>
            <p className="text-white/40 text-sm font-medium mt-1 font-brand text-[#FF7A2F]">Smart Canteen System</p>
          </div>

          <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-2xl mb-8 relative border border-white/5">
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-[#333] rounded-xl shadow-lg border border-white/5"
              animate={{ x: activeTab === 'staff' ? '100%' : '0%' }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />

            <button
              onClick={() => { setActiveTab('student'); setAuthMode('login'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold relative z-10 transition-colors active-shrink tap-highlight-none ${activeTab === 'student' ? 'text-white' : 'text-white/40'}`}
            >
              <GraduationCap size={16} /> Student
            </button>
            <button
              onClick={() => { setActiveTab('staff'); setAuthMode('login'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold relative z-10 transition-colors active-shrink tap-highlight-none ${activeTab === 'staff' ? 'text-white' : 'text-white/40'}`}
            >
              <ChefHat size={16} /> Staff
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeTab + authMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.5 }}
                className="space-y-4"
              >
                {activeTab === 'student' && authMode === 'signup' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-white/40 ml-1 mb-1 block uppercase">Full Name</label>
                      <Input
                        placeholder="e.g. Rahul Sharma"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-12"
                        value={fullName} onChange={e => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white/40 ml-1 mb-1 block uppercase">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-12"
                        value={phone} onChange={e => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-white/40 ml-1 mb-1 block uppercase">
                    {activeTab === 'staff' ? 'Staff ID' : 'Student ID'}
                  </label>
                  {activeTab === 'staff' ? (
                    <Input
                      placeholder="e.g. cook_001"
                      className="bg-black/40 border-white/10 text-white placeholder:text-white/20 font-mono h-12"
                      value={staffId} onChange={e => setStaffId(e.target.value)}
                      required
                    />
                  ) : (
                    <Input
                      type="text"
                      placeholder="e.g. 2023CS101"
                      className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-12"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 ml-1 mb-1 block uppercase">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-black/40 border-white/10 text-white placeholder:text-white/20 h-12"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <Button
              type="submit"
              className={`w-full py-6 text-lg font-bold mt-4 android-ripple active-shrink tap-highlight-none ${activeTab === 'staff' ? 'bg-[#8B4E2E] hover:bg-[#704025]' : 'bg-[#3F8A4F] hover:bg-[#32703f]'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  {authMode === 'login' ? 'Enter Canteen' : 'Create Account'} <ArrowRight size={20} className="ml-2 opacity-60" />
                </>
              )}
            </Button>
          </form>

          {/* Google Sign In - Only for Students */}
          {activeTab === 'student' && (
            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center w-full gap-4 mb-6">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-white/30 font-medium uppercase tracking-widest">Or continue with</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] group relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="text-sm font-black text-white/90 tracking-wide">
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            </div>
          )}

          {/* Toggle Signup */}
          {activeTab === 'student' && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-white/40 text-sm hover:text-white transition-colors"
                type="button"
              >
                {authMode === 'login' ? "New here? Create your student account" : "Already have an account? Log in"}
              </button>
            </div>
          )}

          {/* Quick Demo Login */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-white/40 text-xs mb-3 text-center uppercase tracking-widest font-black">Demo Access</p>
            {activeTab === 'student' ? (
              <button
                type="button"
                onClick={() => {
                  setEmail('student_test');
                  setPassword('student123');
                  toast.info('Credentials filled! Click "Enter Canteen"');
                }}
                className="w-full py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-500/20 transition-all"
              >
                Fill Student Demo
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('cook_test_001');
                    setPassword('cook123');
                    toast.info('Cook credentials filled!');
                  }}
                  className="py-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-[10px] font-black uppercase hover:bg-orange-500/20 transition-all"
                >
                  Cook Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('manager_test_001');
                    setPassword('manager123');
                    toast.info('Manager credentials filled!');
                  }}
                  className="py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black uppercase hover:bg-purple-500/20 transition-all"
                >
                  Manager Demo
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};