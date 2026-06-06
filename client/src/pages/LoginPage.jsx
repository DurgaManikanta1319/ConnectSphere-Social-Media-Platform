import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, KeyRound, Mail, AlertTriangle, ArrowRight, Loader } from 'lucide-react';
import * as api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password modal/toggles
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login({ emailOrUsername, password });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetNewPassword) {
      setResetError('Please fill in all fields');
      return;
    }
    setResetError('');
    setResetMessage('');
    setIsResetting(true);
    try {
      await api.forgotPassword({ email: resetEmail, newPassword: resetNewPassword });
      setResetMessage('Password reset successful. You can now login.');
      setResetEmail('');
      setResetNewPassword('');
      setTimeout(() => setShowForgot(false), 2500);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-purple/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-neonBlue/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="glass-panel max-w-md w-full rounded-2xl p-8 flex flex-col gap-6 shadow-2xl z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-neonBlue flex items-center justify-center shadow-neonPurple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your ConnectSphere account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter email or username"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <button 
                type="button" 
                onClick={() => {
                  setShowForgot(true);
                  setResetError('');
                  setResetMessage('');
                }}
                className="text-xs font-semibold text-brand-neonBlue hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 rounded-xl text-white font-bold btn-neon-purple shadow-neonPurple flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-purple font-semibold hover:underline">
            Register now
          </Link>
        </p>
      </div>

      {/* FORGOT PASSWORD DIALOG */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl relative">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand-neonBlue" />
              <span>Reset Password</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your email and define a new password. The backend will verify and update it directly.
            </p>

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-2.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{resetError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-2.5">
                <span>{resetMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">Your Email Address</label>
                <input 
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-white/5 border border-brand-border rounded-lg py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">New Secure Password</label>
                <input 
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-brand-border rounded-lg py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForgot(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isResetting}
                  className="text-xs font-bold btn-neon-blue px-4 py-2 rounded-lg text-white disabled:opacity-50"
                >
                  {isResetting ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
