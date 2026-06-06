import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, MessageCircle, X, Trash } from 'lucide-react';
import * as api from '../services/api';

const SavedPage = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await api.getSavedPosts();
        setSavedPosts(data);
      } catch (err) {
        console.error('Error fetching bookmarked posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleUnsave = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Remove this post from your bookmarks?')) return;
    try {
      await api.savePost(postId);
      setSavedPosts(prev => prev.filter(p => p._id !== postId));
      alert('Post removed from saved list');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-semibold">Loading bookmarked posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-black flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-purple" />
          <span>Bookmarked Posts</span>
        </h1>
        <p className="text-xs text-slate-500">Access and manage all content posts you have saved for later</p>
      </div>

      {/* SAVED LIST */}
      <div className="flex flex-col gap-4">
        {savedPosts.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 px-4 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-brand-border flex items-center justify-center text-slate-500">
              <Bookmark className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 font-semibold">No bookmarked posts</p>
            <p className="text-xs text-slate-500">Tapping the bookmark icon on feed posts places them here.</p>
          </div>
        ) : (
          savedPosts.map((post) => (
            <div key={post._id} className="glass-panel rounded-2xl p-4 flex flex-col gap-3 relative group">
              {/* Creator details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={post.userId?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'} 
                    alt="Creator" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <Link to={`/profile/${post.userId?.username}`} className="text-xs font-bold text-white hover:underline">
                      {post.userId?.username}
                    </Link>
                    <p className="text-[9px] text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Unsave button */}
                <button 
                  onClick={(e) => handleUnsave(e, post._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove Bookmark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Caption */}
              {post.caption && <p className="text-xs text-slate-200 leading-normal">{post.caption}</p>}

              {/* Cover visual if has image */}
              {post.images && post.images.length > 0 && (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-brand-border">
                  <img src={post.images[0]} alt="Post visual content" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Metrics footers */}
              <div className="flex gap-4 border-t border-brand-border/20 pt-2.5 text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> {post.likes?.length || 0} Likes</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-brand-purple fill-current" /> {post.comments?.length || 0} Comments</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default SavedPage;
