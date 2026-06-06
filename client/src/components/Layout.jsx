import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Search, PlusCircle, MessageCircle, Bell, Bookmark, User, Settings, 
  ShieldAlert, LogOut, Sun, Moon, Sparkles, X, Image, Video, Hash, Globe, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Layout = () => {
  const { user, logout, onlineUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  
  // Post/Story Creation States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [storyImage, setStoryImage] = useState('');
  const [storyVideo, setStoryVideo] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  
  // AI Suggestion state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTip, setAiTip] = useState('');

  // Toggle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#050507';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load right sidebar data
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const suggData = await api.getSuggestedUsers();
        setSuggestions(suggData);
        
        const trendData = await api.getTrendingHashtags();
        setTrending(trendData);
      } catch (err) {
        console.error('Error fetching sidebar recommendations:', err);
      }
    };
    fetchSidebarData();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handlePostImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Promises = files.map(file => convertToBase64(file));
    try {
      const base64s = await Promise.all(base64Promises);
      setPostImages(prev => [...prev, ...base64s]);
    } catch (err) {
      console.error('Image parsing error:', err);
    }
  };

  const handleStoryMediaChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await convertToBase64(file);
      if (type === 'image') {
        setStoryImage(base64);
        setStoryVideo('');
      } else {
        setStoryVideo(base64);
        setStoryImage('');
      }
    } catch (err) {
      console.error('Story parsing error:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption && postImages.length === 0) return;
    
    setIsSubmittingPost(true);
    try {
      await api.createPost({ caption, images: postImages });
      setCaption('');
      setPostImages([]);
      setIsPostModalOpen(false);
      
      // Refresh active view
      if (location.pathname === '/home') {
        window.location.reload();
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to publish post');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyImage && !storyVideo) return;

    setIsSubmittingStory(true);
    try {
      await api.createStory({ image: storyImage, video: storyVideo });
      setStoryImage('');
      setStoryVideo('');
      setIsStoryModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to publish story');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // AI Assistant for Captions & Hashtags (Extra Feature!)
  const generateAICaption = () => {
    setIsGeneratingAI(true);
    const topics = [
      "Coding all night long 💻 Space theme activated. #webdev #connectsphere #programmer",
      "Experiencing the glassmorphic universe. Web design is evolving. ✨ #uitrends #glassmorphism #css",
      "Stunning sunset vibes combined with Node.js. Fullstack progress! 🌅 #fullstack #backend #javascript",
      "Coffee, code, and ConnectSphere. Ready to deploy. ☕🚀 #indiehackers #devlife",
      "Just launched my new creator profile. Let's connect! 🌌🤝 #creators #techcommunity #network"
    ];
    setTimeout(() => {
      const randomCaption = topics[Math.floor(Math.random() * topics.length)];
      setCaption(randomCaption);
      setIsGeneratingAI(false);
      setAiTip("AI caption suggestions loaded successfully.");
      setTimeout(() => setAiTip(''), 3000);
    }, 1200);
  };

  const navLinks = [
  { 
    to: '/home', 
    icon: <Home className="w-5 h-5" />, 
    label: 'Home' 
  },

  { 
    to: '/reels', 
    icon: <Video className="w-5 h-5" />, 
    label: 'Reels' 
  },

  { 
    to: '/explore', 
    icon: <Search className="w-5 h-5" />, 
    label: 'Explore' 
  },

  { 
    to: '/messages', 
    icon: <MessageCircle className="w-5 h-5" />, 
    label: 'Messages' 
  },

  { 
    to: '/notifications', 
    icon: <Bell className="w-5 h-5" />, 
    label: 'Notifications' 
  },

  { 
    to: '/saved', 
    icon: <Bookmark className="w-5 h-5" />, 
    label: 'Bookmarks' 
  },

  { 
    to: `/profile/${user?.username}`, 
    icon: <User className="w-5 h-5" />, 
    label: 'Profile' 
  },

  { 
    to: '/settings', 
    icon: <Settings className="w-5 h-5" />, 
    label: 'Settings' 
  },
];

  return (
    <div className={`min-h-screen text-slate-100 dark:text-slate-100 flex flex-col transition-colors duration-300 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-brand-dark'}`}>
      
      {/* Container Layout */}
      <div className="flex flex-1 max-w-[1400px] w-full mx-auto px-0 md:px-4 lg:px-8">
        
        {/* Left Sidebar navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-[240px] sticky top-0 h-screen py-6 border-r border-brand-border pr-4 gap-8">
          <div className="flex items-center gap-2 px-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-neonBlue flex items-center justify-center shadow-neonPurple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-neonBlue bg-clip-text text-transparent dark:from-white">
              ConnectSphere
            </span>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5">
            {navLinks.map((link, idx) => (
              <NavLink 
                key={link.to} 
                to={link.to}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 hover:bg-slate-200/20 dark:hover:bg-white/5 fade-up-delay-${Math.min(idx + 1, 5)} ${isActive ? 'bg-gradient-to-r from-brand-purple/20 to-brand-blue/10 border-l-4 border-brand-purple text-brand-purple dark:text-white font-semibold' : 'text-slate-400 dark:text-slate-400'}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <NavLink 
                to="/admin"
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 hover:bg-slate-200/20 dark:hover:bg-white/5 ${isActive ? 'bg-gradient-to-r from-red-500/10 to-brand-purple/10 border-l-4 border-red-500 text-red-500 font-semibold' : 'text-slate-400'}`}
              >
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Admin Dashboard</span>
              </NavLink>
            )}

            {/* Quick Action Buttons inside Sidebar */}
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="mt-6 w-full py-3 px-4 rounded-xl text-white font-semibold btn-neon-purple shadow-neonPurple flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </button>

            <button 
              onClick={() => setIsStoryModalOpen(true)}
              className="mt-2 w-full py-2.5 px-4 rounded-xl text-brand-purple border border-brand-purple/40 font-semibold flex items-center justify-center gap-2 hover:bg-brand-purple/10 transition-colors"
            >
              <span>Add Story</span>
            </button>
          </nav>

          {/* User Settings & LogOut */}
          <div className="flex flex-col gap-4 border-t border-brand-border pt-4">
            <div className="flex items-center gap-3 px-2">
              <img 
                src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                alt={user?.username} 
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-purple/40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-100 dark:text-slate-100">{user?.username}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg hover:bg-slate-200/20 dark:hover:bg-white/5 text-slate-400"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Middle Main Content */}
        <main className="flex-1 min-w-0 border-r border-brand-border min-h-screen flex flex-col pb-20 md:pb-6">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-brand-border sticky top-0 bg-brand-dark/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-2" onClick={() => navigate('/home')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-neonBlue flex items-center justify-center shadow-neonPurple">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-brand-neonBlue bg-clip-text text-transparent">
                ConnectSphere
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-slate-400"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>
              <button onClick={() => setIsPostModalOpen(true)} className="p-1 text-slate-100">
                <PlusCircle className="w-6 h-6 text-brand-purple" />
              </button>
              <img 
                src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                alt={user?.username}
                onClick={() => navigate(`/profile/${user?.username}`)}
                className="w-8 h-8 rounded-full object-cover border border-brand-purple/40"
              />
            </div>
          </header>

          {/* Children Routes render */}
          <div className="flex-1 py-4 px-4 md:py-6">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar (Desktop Recommendations & Hashtags) */}
        <aside className="hidden lg:flex flex-col w-[300px] sticky top-0 h-screen py-6 pl-6 gap-6 overflow-y-auto">
          {/* Suggested Creators panel */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
              <span>Suggested Creators</span>
              <Sparkles className="w-4 h-4 text-brand-neonBlue" />
            </h3>
            <div className="flex flex-col gap-3">
              {suggestions.length === 0 ? (
                <p className="text-xs text-slate-500">No suggestions available</p>
              ) : (
                suggestions.map((sugUser) => (
                  <div key={sugUser._id} className="flex items-center justify-between">
                    <Link to={`/profile/${sugUser.username}`} className="flex items-center gap-2 min-w-0">
                      <div className="relative">
                        <img 
                          src={sugUser.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'} 
                          alt={sugUser.username} 
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        {onlineUsers.includes(sugUser._id) && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-brand-dark" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate hover:text-brand-purple">{sugUser.username}</p>
                        <p className="text-[10px] text-slate-500 truncate">{sugUser.followers?.length || 0} followers</p>
                      </div>
                    </Link>
                    <button 
                      onClick={async () => {
                        try {
                          await api.followUser(sugUser._id);
                          setSuggestions(prev => prev.filter(u => u._id !== sugUser._id));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-xs text-brand-neonBlue font-semibold hover:text-white px-2 py-1 rounded bg-brand-neonBlue/10 hover:bg-brand-neonBlue transition-all"
                    >
                      Follow
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trending Hashtags panel */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-purple" />
              <span>Trending Hashtags</span>
            </h3>
            <div className="flex flex-col gap-2">
              {trending.length === 0 ? (
                <div className="flex flex-col gap-2">
                  {['#javascript', '#react', '#webdev', '#design', '#connectsphere'].map((tag) => (
                    <div 
                      key={tag} 
                      onClick={() => navigate(`/explore?q=${encodeURIComponent(tag)}`)}
                      className="text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300 flex items-center justify-between"
                    >
                      <span>{tag}</span>
                      <span className="text-[10px] text-slate-500">12 posts</span>
                    </div>
                  ))}
                </div>
              ) : (
                trending.map((tag) => (
                  <div 
                    key={tag._id} 
                    onClick={() => navigate(`/explore?q=${encodeURIComponent('#' + tag.tag)}`)}
                    className="text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300 flex items-center justify-between"
                  >
                    <span className="font-semibold text-brand-neonBlue">#{tag.tag}</span>
                    <span className="text-[10px] text-slate-500">{tag.count} posts</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark/85 backdrop-blur-lg border-t border-brand-border py-2 px-6 flex justify-between items-center z-40">
        {navLinks.slice(0, 5).map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to}
            className={({ isActive }) => `p-2.5 rounded-xl ${isActive ? 'text-brand-purple' : 'text-slate-400'}`}
          >
            {link.icon}
          </NavLink>
        ))}
      </nav>

      {/* CREATE POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative modal-sheet">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-purple" />
                <span>Create New Post</span>
              </h2>
              <button 
                onClick={() => {
                  setIsPostModalOpen(false);
                  setPostImages([]);
                  setCaption('');
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <img 
                  src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                  alt={user?.username} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 flex flex-col gap-2">
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="What is on your mind? Use hashtags like #react or #webdev..."
                    rows={4}
                    className="w-full bg-transparent border-0 outline-none resize-none text-slate-100 placeholder-slate-500 focus:ring-0 text-sm"
                  />
                  
                  {/* AI Generator button */}
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={generateAICaption}
                      disabled={isGeneratingAI}
                      className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-brand-purple border border-purple-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold disabled:opacity-50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingAI ? 'Writing...' : 'AI Caption Generator'}</span>
                    </button>
                    {aiTip && <span className="text-[10px] text-green-400">{aiTip}</span>}
                  </div>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {postImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {postImages.map((imgBase64, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={imgBase64} alt="Upload preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPostImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between border-t border-brand-border pt-4 mt-2">
                <label className="cursor-pointer p-2.5 rounded-xl hover:bg-white/5 text-brand-neonBlue flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  <span className="text-xs font-semibold">Add Photos</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePostImageChange} 
                    className="hidden" 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmittingPost || (!caption && postImages.length === 0)}
                  className="px-6 py-2 rounded-xl text-white font-bold btn-neon-purple shadow-neonPurple disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingPost && <Loader className="w-4 h-4 animate-spin" />}
                  <span>Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STORY MODAL */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative modal-sheet">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-neonBlue" />
                <span>Upload a Story</span>
              </h2>
              <button 
                onClick={() => {
                  setIsStoryModalOpen(false);
                  setStoryImage('');
                  setStoryVideo('');
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateStory} className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-500">Stories disappear automatically after 24 hours. Keep it fresh and real!</p>
              
              {/* Image/Video Preview Box */}
              <div className="w-full aspect-[9/16] bg-slate-900 rounded-2xl border-2 border-dashed border-brand-border flex flex-col items-center justify-center overflow-hidden relative group">
                {storyImage ? (
                  <img src={storyImage} alt="Story preview" className="w-full h-full object-cover" />
                ) : storyVideo ? (
                  <video src={storyVideo} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                    <Image className="w-8 h-8 text-brand-purple" />
                    <p className="text-sm font-semibold">No media selected</p>
                    <p className="text-[10px]">Upload vertical photos or short video clips</p>
                  </div>
                )}
                
                {(storyImage || storyVideo) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setStoryImage('');
                      setStoryVideo('');
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload buttons */}
              <div className="flex items-center gap-2 mt-2">
                <label className="flex-1 cursor-pointer py-2.5 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center gap-2 text-xs font-semibold">
                  <Image className="w-4 h-4 text-brand-purple" />
                  <span>Photo Story</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleStoryMediaChange(e, 'image')} 
                    className="hidden" 
                  />
                </label>

                <label className="flex-1 cursor-pointer py-2.5 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center gap-2 text-xs font-semibold">
                  <Video className="w-4 h-4 text-brand-neonBlue" />
                  <span>Video Story</span>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => handleStoryMediaChange(e, 'video')} 
                    className="hidden" 
                  />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingStory || (!storyImage && !storyVideo)}
                className="w-full mt-4 py-3 rounded-xl text-white font-bold btn-neon-blue shadow-neonBlue disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingStory && <Loader className="w-4 h-4 animate-spin" />}
                <span>Publish Story</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;
