import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  Key,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AdminUser } from '../../types/admin';

interface AdminAuthProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateToStorefront: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onNavigateToStorefront,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('admin@dspadire.com');
  const [password, setPassword] = useState('DSPAdire2026!');
  const [confirmPassword, setConfirmPassword] = useState('DSPAdire2026!');
  const [adminKey, setAdminKey] = useState('DSP-ADMIN-2026');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both Email and Password fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        const userPayload: AdminUser = {
          id: data.user?.id || 'admin-user-01',
          fullName: data.user?.user_metadata?.full_name || email.split('@')[0],
          email: data.user?.email || email,
          role: 'Master Admin',
          registeredAt: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('dsp_admin_session', JSON.stringify(userPayload));
        }

        setSuccessMessage('Authentication successful! Loading dashboard...');
        setTimeout(() => {
          onLoginSuccess(userPayload);
        }, 600);
      } else {
        // High-Speed Local Persistence Mode (when Supabase keys are pending)
        await new Promise((resolve) => setTimeout(resolve, 800));

        const userPayload: AdminUser = {
          id: 'admin-local-101',
          fullName: fullName || 'Executive Dyes Administrator',
          email,
          role: 'Master Admin',
          registeredAt: new Date().toISOString(),
        };

        if (rememberMe) {
          localStorage.setItem('dsp_admin_session', JSON.stringify(userPayload));
        }

        setSuccessMessage('Signed in successfully (Local Admin Mode)! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(userPayload);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName || !email || !password || !confirmPassword || !adminKey) {
      setErrorMessage('Please complete all registration form fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    // Secret Key validation (default: DSP-ADMIN-2026)
    if (adminKey.trim() !== 'DSP-ADMIN-2026') {
      setErrorMessage('Invalid Admin Registration Secret Key. Please verify with system administrator.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Supabase Auth SignUp
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'Master Admin',
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        // Insert record into admin_users table
        if (data.user) {
          await supabase.from('admin_users').insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: 'Master Admin',
              created_at: new Date().toISOString(),
            },
          ]);
        }

        setSuccessMessage('Admin account registered with Supabase! Redirecting to sign in...');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('Registration completed! Please sign in with your credentials.');
        }, 1200);
      } else {
        // Fallback local registration
        await new Promise((resolve) => setTimeout(resolve, 800));

        setSuccessMessage('Admin account registered! Redirecting to Sign-In...');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('Account created! Sign in below to enter the DSP Adire Dashboard.');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative adire-watermark-bg">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={onNavigateToStorefront}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-[#1B2A4A] text-xs font-semibold uppercase tracking-wider hover:border-[#D1B464] hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D1B464]" />
          <span>Back to Storefront</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1B2A4A] flex items-center justify-center text-[#D1B464] font-serif font-bold text-sm">
            D
          </div>
          <span className="font-serif-title font-bold text-lg text-[#1B2A4A] tracking-wider">
            DSP ADIRE ADMIN
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="my-auto max-w-md w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-10 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B2A4A] via-[#D1B464] to-[#1B2A4A]" />

          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center mx-auto mb-3 border border-[#1B2A4A]/20">
              <ShieldCheck className="w-6 h-6 text-[#D1B464]" />
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {mode === 'login' ? 'Admin Portal Sign-In' : 'Register Admin Account'}
            </h1>
            <p className="text-xs text-[#1A1A1A]/70 font-medium">
              {mode === 'login'
                ? 'Manage DSP Adire catalog, currency prices & leads'
                : 'Enter registration details & secret key to create admin credentials'}
            </p>
          </div>

          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dspadire.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1A1A1A]/80 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1B2A4A] focus:ring-[#D1B464] border-gray-300"
                  />
                  <span>Remember Session</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@dspadire.com');
                    setPassword('DSPAdire2026!');
                  }}
                  className="text-xs font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors"
                >
                  Fill Demo Pass
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-semibold text-xs uppercase tracking-wider hover:bg-[#23375e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#D1B464] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#D1B464]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Akinola Adewale"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@dspadire.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1">
                    Confirm Pass
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2A4A] mb-1">
                  Admin Registration Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="DSP-ADMIN-2026"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-sm text-[#1A1A1A] font-mono focus:outline-none focus:border-[#D1B464] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Default key: <code className="text-[#1B2A4A] font-bold">DSP-ADMIN-2026</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-[#1B2A4A] text-[#FAFAFA] font-semibold text-xs uppercase tracking-wider hover:bg-[#23375e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#D1B464] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register New Admin Account</span>
                    <Sparkles className="w-4 h-4 text-[#D1B464]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Register / Login */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
            {mode === 'login' ? (
              <p className="text-xs text-[#1A1A1A]/70">
                Need a new admin account?{' '}
                <button
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Register Here
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#1A1A1A]/70">
                Already have admin credentials?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#1B2A4A] hover:text-[#D1B464] transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[#1A1A1A]/50 py-4">
        &copy; {new Date().getFullYear()} DSP Adire Luxury Textiles Admin System. All rights reserved.
      </div>
    </div>
  );
};

export default AdminAuth;
