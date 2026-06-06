import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, User, Shield, Moon, Sun, Monitor, CheckCircle, Database, LogOut, Code, Network 
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, socket } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  useEffect(() => {
    if (socket?.connected) {
      setSocketStatus('Connected');
    } else {
      setSocketStatus('Disconnected');
    }
  }, [socket]);

  const toggleTheme = (val) => {
    const root = window.document.documentElement;
    if (val === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#050507';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
    setTheme(val);
    localStorage.setItem('theme', val);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-purple" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs text-slate-500">Configure theme preferences, monitor platform metrics, and manage sessions</p>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* THEME SELECTOR PANEL */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-purple" />
            <span>Preferences</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Visual Appearance</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Toggle between dark aesthetic and light mode</p>
            </div>
            
            <div className="flex rounded-xl bg-slate-900/50 p-1 border border-brand-border">
              <button 
                onClick={() => toggleTheme('dark')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === 'dark' ? 'bg-brand-purple text-white shadow-neonPurple' : 'text-slate-500'}`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button 
                onClick={() => toggleTheme('light')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === 'light' ? 'bg-slate-500 text-white' : 'text-slate-500'}`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECURITY & ACCOUNT ROLES */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-neonBlue" />
            <span>Security & Role</span>
          </h3>

          <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
            <div>
              <p className="text-xs font-bold text-white">Account Privileges</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Current access classification level</p>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border ${user?.role === 'admin' ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-brand-purple/30 bg-brand-purple/10 text-brand-purple'}`}>
              {user?.role || 'User'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Profile Customizations</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Adjust skills list and social connection badges</p>
            </div>
            <Link 
              to="/profile/edit"
              className="text-xs font-bold bg-white/5 border border-brand-border hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl"
            >
              Configure
            </Link>
          </div>
        </div>

        {/* DEVELOPER DIAGNOSTICS */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-brand-neonPurple" />
            <span>Diagnostics</span>
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-brand-border/20">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-brand-neonBlue" />
                <span>Socket Gateway</span>
              </span>
              <span className={`font-bold ${socketStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                {socketStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-brand-border/20">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-purple" />
                <span>API Node Address</span>
              </span>
              <span className="font-mono text-[10px] text-brand-purple">
                http://localhost:5000/api
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-brand-border/20">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span>App Build Version</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                v1.0.0-production-release
              </span>
            </div>
          </div>
        </div>

        {/* LOGOUT CONTROL BUTTON */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 glass-panel border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform mt-4"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate Active Session</span>
        </button>

      </div>

    </div>
  );
};

export default SettingsPage;
