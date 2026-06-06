import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { 
  Twitter, Instagram, Linkedin, Github, Edit, Check, UserPlus, UserMinus, 
  Grid, Info, Heart, MessageCircle, Star, Calendar, Hash
} from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setIsLoading(true);
      try {
        const profileData = await api.getUserProfile(username);
        setProfile(profileData);
        setFollowersCount(profileData.followers?.length || 0);

        // Check if current user is in followers list
        const isFollow = (profileData.followers || []).some(
          f => f._id.toString() === currentUser?._id.toString()
        );
        setIsFollowing(isFollow);

        const postsData = await api.getUserPosts(username);
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        alert('User profile not found');
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileAndPosts();
  }, [username, currentUser?._id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const data = await api.followUser(profile._id);
      setIsFollowing(data.isFollowing);
      setFollowersCount(prev => data.isFollowing ? prev + 1 : prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-semibold">Loading profile space...</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile?.username;

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      
      {/* PROFILE BANNER & PHOTO */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-900 border border-brand-border">
          {profile?.coverPic ? (
            <img src={profile.coverPic} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-brand-purple/20 via-brand-dark to-brand-neonBlue/20" />
          )}
        </div>

        {/* Profile Pic overlapping banner */}
        <div className="absolute bottom-[-45px] left-6">
          <img 
            src={profile?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
            alt={profile?.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-brand-dark shadow-xl"
          />
        </div>
      </div>

      {/* USER DESCRIPTION & METRICS */}
      <div className="mt-12 flex flex-col gap-4 px-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-1.5">
              <span>{profile?.username}</span>
              {profile?.role === 'admin' && (
                <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Admin
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(profile?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
            </p>
          </div>

          {/* Action button: Edit profile if self, follow toggle if other */}
          {isOwnProfile ? (
            <Link 
              to="/profile/edit"
              className="px-4 py-2 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Edit className="w-4 h-4 text-brand-purple" />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <button 
              onClick={handleFollowToggle}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.01] ${isFollowing ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'btn-neon-purple text-white shadow-neonPurple'}`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Bio */}
        {profile?.bio ? (
          <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">{profile.bio}</p>
        ) : (
          <p className="text-xs text-slate-500 italic">No bio written yet.</p>
        )}

        {/* METRICS COUNT BAR */}
        <div className="flex gap-6 border-y border-brand-border/40 py-3.5 mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-white">{posts.length}</span>
            <span className="text-xs text-slate-500 font-semibold">posts</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-white">{followersCount}</span>
            <span className="text-xs text-slate-500 font-semibold">followers</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-white">{profile?.following?.length || 0}</span>
            <span className="text-xs text-slate-500 font-semibold">following</span>
          </div>
        </div>
      </div>

      {/* TABS CONTROLLER (POSTS VS ABOUT DETAILS) */}
      <div className="flex border-b border-brand-border/40">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button 
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'about' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Info className="w-4 h-4" />
          <span>About & Skills</span>
        </button>
      </div>

      {/* TAB CONTENT: POSTS GRID */}
      {activeTab === 'posts' && (
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <Grid className="w-8 h-8 text-slate-700" />
              <p className="text-sm">No posts published yet</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="glass-panel rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={profile.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{profile.username}</p>
                      <p className="text-[9px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {post.caption && <p className="text-xs text-slate-200">{post.caption}</p>}
                
                {post.images && post.images.length > 0 && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img src={post.images[0]} alt="Post media" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex gap-4 border-t border-brand-border/20 pt-2.5 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span>{post.likes?.length || 0} Likes</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT, SOCIALS, SKILLS */}
      {activeTab === 'about' && (
        <div className="flex flex-col gap-6">
          {/* Social connections */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-neonBlue" />
              <span>Social Links</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={profile?.socialLinks?.github ? `https://github.com/${profile.socialLinks.github}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/5 transition-all ${profile?.socialLinks?.github ? 'text-white' : 'text-slate-600 cursor-default'}`}
              >
                <Github className="w-5 h-5 text-indigo-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">GitHub</p>
                  <p className="text-xs font-bold truncate">{profile?.socialLinks?.github || 'Not linked'}</p>
                </div>
              </a>

              <a 
                href={profile?.socialLinks?.linkedin ? `https://linkedin.com/in/${profile.socialLinks.linkedin}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/5 transition-all ${profile?.socialLinks?.linkedin ? 'text-white' : 'text-slate-600 cursor-default'}`}
              >
                <Linkedin className="w-5 h-5 text-blue-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">LinkedIn</p>
                  <p className="text-xs font-bold truncate">{profile?.socialLinks?.linkedin || 'Not linked'}</p>
                </div>
              </a>

              <a 
                href={profile?.socialLinks?.twitter ? `https://twitter.com/${profile.socialLinks.twitter}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/5 transition-all ${profile?.socialLinks?.twitter ? 'text-white' : 'text-slate-600 cursor-default'}`}
              >
                <Twitter className="w-5 h-5 text-cyan-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">Twitter</p>
                  <p className="text-xs font-bold truncate">{profile?.socialLinks?.twitter || 'Not linked'}</p>
                </div>
              </a>

              <a 
                href={profile?.socialLinks?.instagram ? `https://instagram.com/${profile.socialLinks.instagram}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 rounded-xl border border-brand-border bg-white/[0.02] hover:bg-white/5 transition-all ${profile?.socialLinks?.instagram ? 'text-white' : 'text-slate-600 cursor-default'}`}
              >
                <Instagram className="w-5 h-5 text-pink-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">Instagram</p>
                  <p className="text-xs font-bold truncate">{profile?.socialLinks?.instagram || 'Not linked'}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Skills and interests section */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-purple" />
              <span>Skills & Interests</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {(profile?.skills || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No skills listed yet.</p>
              ) : (
                profile.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-purple/20 bg-brand-purple/10 text-brand-purple uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
