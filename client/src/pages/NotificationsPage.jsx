import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { Bell, Heart, MessageSquare, UserPlus, CornerDownRight, Check, CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const { setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      // Update unread badge in global context
      const unreadCount = data.filter(n => !n.readStatus).length;
      setUnreadNotifications(unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      // Set all local notifications status to read
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadNotifications(0);
      alert('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-brand-purple" />;
      case 'reply':
        return <CornerDownRight className="w-4 h-4 text-brand-neonBlue" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment thread';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your account';
    }
  };

  const formatTime = (timestamp) => {
    const diff = new Date() - new Date(timestamp);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-purple border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-semibold">Loading notifications activity...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-purple" />
            <span>Activity Logs</span>
          </h1>
          <p className="text-xs text-slate-500">Stay updated with likes, comments, and new followers</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-brand-neonBlue hover:underline flex items-center gap-1 bg-brand-neonBlue/10 hover:bg-brand-neonBlue/20 px-3 py-1.5 rounded-xl border border-brand-neonBlue/25 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 px-4 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-brand-border flex items-center justify-center text-slate-500">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400 font-semibold">All quiet for now</p>
            <p className="text-xs text-slate-500">Notifications about your posts and profile will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id} 
              className={`glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 transition-all ${n.readStatus ? 'border-transparent' : 'border-brand-purple bg-brand-purple/5'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Trigger User Avatar */}
                <Link to={`/profile/${n.senderId.username}`} className="relative flex-shrink-0">
                  <img 
                    src={n.senderId.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'} 
                    alt={n.senderId.username} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute bottom-[-2px] right-[-2px] p-1 bg-brand-dark rounded-full border border-brand-border">
                    {getNotificationIcon(n.type)}
                  </div>
                </Link>

                <div className="min-w-0">
                  <p className="text-xs text-slate-300 leading-normal">
                    <Link to={`/profile/${n.senderId.username}`} className="font-bold text-white hover:underline mr-1">
                      {n.senderId.username}
                    </Link>
                    <span>{getNotificationText(n.type)}</span>
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">{formatTime(n.createdAt)}</p>
                </div>
              </div>

              {/* Optional Post preview visual if notification is like/comment/reply */}
              {n.postId && (
                <Link 
                  to="/home" // Takes them back to home feed to view discussions
                  className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-brand-border"
                >
                  {n.postId.images && n.postId.images.length > 0 ? (
                    <img src={n.postId.images[0]} alt="Post visual" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600 font-bold overflow-hidden p-1 text-center leading-none">
                      TEXT
                    </div>
                  )}
                </Link>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
