import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Eye, ShieldCheck, Heart, Share2, Globe, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden">
      {/* Background Neon Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-neonBlue/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Header */}
      <header className="glass-panel max-w-5xl w-full px-6 py-4 rounded-2xl flex items-center justify-between mb-16 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-neonBlue flex items-center justify-center shadow-neonPurple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">ConnectSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="text-sm font-bold btn-neon-purple shadow-neonPurple px-5 py-2 rounded-xl text-white hover:scale-105 transition-all"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full flex flex-col items-center text-center z-10 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next Generation Creator Social Hub</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl">
          The Ultimate Platform For <br/>
          <span className="bg-gradient-to-r from-brand-purple via-brand-neonBlue to-brand-neonPurple bg-clip-text text-transparent">
            Creators & Developers
          </span>
        </h1>

        <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
          Express your ideas, share rich media posts, build vertical stories, generate AI captions on the fly, and engage in real-time chats inside a gorgeous glassmorphism environment.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <button 
            onClick={() => navigate('/signup')}
            className="btn-neon-purple shadow-neonPurple text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white/5 border border-brand-border hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold transition-all text-sm"
          >
            Explore Platform
          </button>
        </div>

        {/* Feature Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 text-left">
          
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Real-time Messaging</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exhange direct messages, share images in chat, and track live online/offline presence states with zero latency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-neonBlue/10 border border-brand-neonBlue/20 flex items-center justify-center text-brand-neonBlue">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">AI Caption Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stuck on what to write? Generate AI-powered descriptions and trending hashtag suggestions instantly in the creation modal.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-neonPurple/10 border border-brand-neonPurple/20 flex items-center justify-center text-brand-neonPurple">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">24-hour Stories</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish stories that vanish automatically after 24 hours. Log viewers and collect emojis story reactions in real time.
            </p>
          </div>

        </section>

        {/* Footer info */}
        <footer className="w-full mt-24 text-center border-t border-brand-border/40 pt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ConnectSphere Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
            <a href="#" className="hover:text-slate-300">API Docs</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
