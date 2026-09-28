import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wifi,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, profiles, switchPersona } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoPersonas, setShowDemoPersonas] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (id: string, role: string) => {
    await switchPersona(id);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 mb-2 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <Wifi className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Sign In to NetSense
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Enter your credentials to access your real-time network operations dashboard
          </p>
        </div>

        {/* Login Card Form */}
        <div className="rounded-3xl glass-panel-glow border border-teal-500/30 p-6 sm:p-8 space-y-5 shadow-2xl">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300 font-medium">
                Email Address <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
                <span>Password <span className="text-teal-400">*</span></span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wide bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.45)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account link */}
          <div className="text-center pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <span>Don&apos;t have an account? </span>
            <Link
              to="/register"
              className="text-teal-400 hover:text-teal-300 font-bold hover:underline transition-colors ml-1"
            >
              Create Account →
            </Link>
          </div>
        </div>

        {/* Quick Demo Personas Accordion (Preserves Hackathon Reviewer Workflow) */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-4 space-y-3">
          <button
            onClick={() => setShowDemoPersonas(!showDemoPersonas)}
            className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Quick Demo Sign-In (Hackathon Reviewers)</span>
            </span>
            {showDemoPersonas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDemoPersonas && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-in fade-in">
              <p className="text-[11px] font-mono text-slate-500">
                Click any pre-seeded persona to sign in instantly with pre-configured role permissions (Default password: <code className="text-teal-300">password123</code>):
              </p>
              <div className="space-y-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickDemoLogin(p.id, p.role)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200 group-hover:text-teal-300">
                          {p.full_name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            p.role === 'admin'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : p.role === 'faculty'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{p.email}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Secure authentication with PBKDF2 password hashing & token verification.</span>
        </div>
      </div>
    </div>
  );
};
