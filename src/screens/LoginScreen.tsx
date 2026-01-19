import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChefHat, GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
           setLoading(false);
           onLogin('cook');
           return;
        }
        
        // Test Manager Account
        if (cleanStaffId === 'manager_test_001' && cleanPassword === 'manager123') {
           toast.success('Welcome, Manager! 👔');
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
        // Validation
        if (!email.endsWith('.edu') && !email.includes('college')) {
           // Relaxed validation for demo, but warning
           // throw new Error('Please use your college email address');
        }
        if (cleanPassword.length < 6) throw new Error('Password must be at least 6 characters');

        const { data, error } = await supabase.auth.signUp({
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
        onLogin('student');
        
      } else {
        // Login Flow (Both Student and Staff)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: cleanPassword,
        });

        if (error) throw error;

        // Determine role from metadata or fallback to tab selection for staff hardcoded accounts
        // If Supabase auth succeeds, check role
        const userRole = data.user?.user_metadata?.role || activeTab; // Default to active tab if no metadata
        
        // Special case: Manager detection
        if (activeTab === 'staff') {
           if (staffId.trim().startsWith('manager') || userRole === 'manager') {
             onLogin('manager');
           } else {
             onLogin('cook');
           }
        } else {
           onLogin('student');
        }
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      
      // Improve error message
      const errorMsg = error.message || '';
      
      if (errorMsg === 'Invalid login credentials') {
         if (activeTab === 'student' && authMode === 'login') {
            toast.error('User not found. Please Sign Up first!');
         } else {
            toast.error('Invalid ID or Password');
         }
      } else if (errorMsg.includes('Failed to fetch')) {
         toast.error('Connection failed. Please check your internet or use Test Credentials.');
      } else if (errorMsg.includes('Email not confirmed')) {
         toast.error('Email not confirmed. Please use Test Credentials for demo.');
      } else {
         toast.error(errorMsg || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#121212] relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#3F8A4F]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#8B4E2E]/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        layout
        className="w-full max-w-md bg-[#1E1E1E] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
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

        {/* Tabs */}
        <div className="flex p-1 bg-black/20 rounded-xl mb-8 relative">
          <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-[#333] rounded-lg transition-all duration-300" 
               style={{ transform: activeTab === 'staff' ? 'translateX(100%)' : 'translateX(0)' }} />
          
          <button 
            onClick={() => { setActiveTab('student'); setAuthMode('login'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${activeTab === 'student' ? 'text-white' : 'text-white/40'}`}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button 
            onClick={() => { setActiveTab('staff'); setAuthMode('login'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${activeTab === 'staff' ? 'text-white' : 'text-white/40'}`}
          >
            <ChefHat size={16} /> Staff
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4 text-left">
          
          {activeTab === 'student' && authMode === 'signup' && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 overflow-hidden">
                <div>
                   <label className="text-xs font-bold text-white/40 ml-1 mb-1 block">FULL NAME</label>
                   <Input 
                     placeholder="e.g. Rahul Sharma" 
                     className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                     value={fullName} onChange={e => setFullName(e.target.value)}
                     required
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-white/40 ml-1 mb-1 block">PHONE NUMBER</label>
                   <Input 
                     type="tel"
                     placeholder="+91 98765 43210" 
                     className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                     value={phone} onChange={e => setPhone(e.target.value)}
                     required
                   />
                </div>
             </motion.div>
          )}

          <div>
             <label className="text-xs font-bold text-white/40 ml-1 mb-1 block">
               {activeTab === 'staff' ? 'STAFF ID' : 'STUDENT ID'}
             </label>
             {activeTab === 'staff' ? (
                <Input 
                  placeholder="e.g. cook_001" 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20 font-mono"
                  value={staffId} onChange={e => setStaffId(e.target.value)}
                  required
                />
             ) : (
                <Input 
                  type="text"
                  placeholder="e.g. 2023CS101" 
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required
                />
             )}
          </div>

          <div>
             <label className="text-xs font-bold text-white/40 ml-1 mb-1 block">PASSWORD</label>
             <Input 
               type="password"
               placeholder="••••••••" 
               className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
               value={password} onChange={e => setPassword(e.target.value)}
               required
             />
          </div>

          <Button 
            type="submit" 
            className={`w-full py-6 text-lg font-bold mt-4 ${activeTab === 'staff' ? 'bg-[#8B4E2E] hover:bg-[#704025]' : 'bg-[#3F8A4F] hover:bg-[#32703f]'}`}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {authMode === 'login' ? 'Enter Canteen' : 'Create Account'} <ArrowRight size={20} className="ml-2 opacity-60" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle Signup */}
        {activeTab === 'student' && (
          <div className="mt-6 pt-6 border-t border-white/5">
             <button 
               onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
               className="text-white/40 text-sm hover:text-white transition-colors"
             >
               {authMode === 'login' ? "New here? Create your student account" : "Already have an account? Log in"}
             </button>
          </div>
        )}

        {/* Quick Demo Login for Students */}
        {activeTab === 'student' && authMode === 'login' && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-white/40 text-xs mb-3 text-center">Quick Demo Login</p>
            <button
              type="button"
              onClick={() => {
                setEmail('student_test');
                setPassword('student123');
                toast.info('Demo credentials filled! Click "Enter Canteen"');
              }}
              className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-bold hover:bg-blue-500/30 transition-all"
            >
              Fill Demo Student Credentials
            </button>
          </div>
        )}

         {activeTab === 'staff' && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-white/40 text-xs mb-3 text-center">Quick Demo Login</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setStaffId('cook_test_001');
                  setPassword('cook123');
                  toast.info('Cook credentials filled! Click "Enter Canteen"');
                }}
                className="w-full py-2.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg text-xs font-bold hover:bg-orange-500/30 transition-all"
              >
                Fill Cook Credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffId('manager_test_001');
                  setPassword('manager123');
                  toast.info('Manager credentials filled! Click "Enter Canteen"');
                }}
                className="w-full py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-all"
              >
                Fill Manager Credentials
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};