import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, KeyRound, AlertTriangle, Loader } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await register({ username, email, password });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username/email.');
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-2xl font-black tracking-tight mt-2">Get Started</h2>
          <p className="text-xs text-slate-400">Create a new ConnectSphere account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. janesmith)"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 rounded-xl text-white font-bold btn-neon-purple shadow-neonPurple flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <span>Register Now</span>}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-purple font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
