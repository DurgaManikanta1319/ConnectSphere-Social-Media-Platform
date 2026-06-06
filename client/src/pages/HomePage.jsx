// ======================================================
// ULTRA INSTAGRAM / THREADS / TIKTOK HOMEPAGE
// FULL ADVANCED VERSION
// ======================================================

import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Trash2,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Music2,
  Plus,
  MoreHorizontal,
  Sparkles,
  Search,
  Bell,
  Video,
  Home,
  User,
  CheckCircle2,
  Flame,
  Moon,
  Sun,
  PlayCircle,
  Image as ImageIcon
} from 'lucide-react';

import {
  motion,
  AnimatePresence
} from 'framer-motion';

import { useAuth } from '../context/AuthContext';

import * as api from '../services/api';

const HomePage = () => {

  const { user, onlineUsers } = useAuth();

  // ======================================================
  // STATES
  // ======================================================

  const [posts, setPosts] = useState([]);

  const [stories, setStories] = useState([]);

  const [isLoadingFeed, setIsLoadingFeed] =
    useState(true);

  const [activeStoryGroup, setActiveStoryGroup] =
    useState(null);

  const [activeStoryIndex, setActiveStoryIndex] =
    useState(0);

  const [storyProgress, setStoryProgress] =
    useState(0);

  const [showHeart, setShowHeart] =
    useState(false);

  const [activeCommentPostId, setActiveCommentPostId] =
    useState(null);

  const [commentTexts, setCommentTexts] =
    useState({});

  const [likedPosts, setLikedPosts] =
    useState({});

  const [savedPosts, setSavedPosts] =
    useState({});

  const [showSharePopup, setShowSharePopup] =
    useState(false);

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [feedFilter, setFeedFilter] =
    useState('For You');

  const [darkMode, setDarkMode] =
    useState(true);

  // ======================================================
  // FETCH DATA
  // ======================================================

  useEffect(() => {

    const loadData = async () => {

      try {

        const feedData =
          await api.getFeedPosts(1, 20);

        const storyData =
          await api.getStories();

        setPosts(feedData);

        setStories(storyData);

      } catch (err) {

        console.error(err);

      } finally {

        setIsLoadingFeed(false);
      }
    };

    loadData();

  }, []);

  // ======================================================
  // STORY AUTO NEXT
  // ======================================================

  useEffect(() => {

    if (!activeStoryGroup) return;

    setStoryProgress(0);

    const interval = setInterval(() => {

      setStoryProgress((prev) => {

        if (prev >= 100) {

          nextStory();

          return 0;
        }

        return prev + 2;
      });

    }, 100);

    return () => clearInterval(interval);

  }, [activeStoryIndex, activeStoryGroup]);

  // ======================================================
  // ANIMATION
  // ======================================================

  const fadeUp = {

    hidden: {
      opacity: 0,
      y: 40
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45
      }
    }
  };

  // ======================================================
  // LIKE
  // ======================================================

  const handleLike = async (postId) => {

    try {

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId]
      }));

      await api.likePost(postId);

    } catch (err) {

      console.error(err);
    }
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async (postId) => {

    try {

      setSavedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId]
      }));

      await api.savePost(postId);

    } catch (err) {

      console.error(err);
    }
  };

  // ======================================================
  // SHARE
  // ======================================================

  const handleShare = (post) => {

    setSelectedPost(post);

    setShowSharePopup(true);
  };

  // ======================================================
  // COMMENT
  // ======================================================

  const handleCommentSubmit = async (postId) => {

    const text = commentTexts[postId];

    if (!text) return;

    try {

      const newComment =
        await api.commentPost(postId, text);

      setPosts((prev) =>
        prev.map((p) => {

          if (p._id === postId) {

            return {
              ...p,
              comments: [
                ...p.comments,
                newComment
              ]
            };
          }

          return p;
        })
      );

      setCommentTexts((prev) => ({
        ...prev,
        [postId]: ''
      }));

    } catch (err) {

      console.error(err);
    }
  };

  // ======================================================
  // STORIES
  // ======================================================

  const openStoryViewer = (group) => {

    setActiveStoryGroup(group);

    setActiveStoryIndex(0);
  };

  const closeStoryViewer = () => {

    setActiveStoryGroup(null);

    setActiveStoryIndex(0);
  };

  const nextStory = () => {

    if (!activeStoryGroup) return;

    const next = activeStoryIndex + 1;

    if (
      next <
      activeStoryGroup.stories.length
    ) {

      setActiveStoryIndex(next);

    } else {

      closeStoryViewer();
    }
  };

  const prevStory = () => {

    if (!activeStoryGroup) return;

    const prev = activeStoryIndex - 1;

    if (prev >= 0) {

      setActiveStoryIndex(prev);
    }
  };

  // ======================================================
  // DELETE STORY
  // ======================================================

  const handleDeleteStory = async (storyId) => {

    try {

      await api.deleteStory(storyId);

      setStories((prev) =>
        prev.map((group) => ({
          ...group,
          stories: group.stories.filter(
            (s) => s._id !== storyId
          )
        }))
      );

      closeStoryViewer();

    } catch (err) {

      console.error(err);
    }
  };

  // ======================================================
  // DOUBLE TAP STORY LIKE
  // ======================================================

  const reactToStory = () => {

    setShowHeart(true);

    setTimeout(() => {

      setShowHeart(false);

    }, 1000);
  };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (timestamp) => {

    const diff =
      new Date() - new Date(timestamp);

    const mins =
      Math.floor(diff / 60000);

    const hours =
      Math.floor(mins / 60);

    const days =
      Math.floor(hours / 24);

    if (mins < 1) return 'now';

    if (mins < 60) return `${mins}m`;

    if (hours < 24) return `${hours}h`;

    return `${days}d`;
  };

  // ======================================================
  // JSX
  // ======================================================

  return (

    <div
      className={`min-h-screen pb-32 transition-all duration-500 ${
        darkMode
          ? 'bg-black text-white'
          : 'bg-white text-black'
      }`}
    >

      {/* ====================================================== */}
      {/* TOP NAVBAR */}
      {/* ====================================================== */}

      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">

        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Sparkles className="w-7 h-7 text-purple-500" />

            <h1 className="text-2xl font-black">
              SocialX
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <button className="p-2 rounded-full hover:bg-white/10">

              <Search className="w-5 h-5" />

            </button>

            <button className="p-2 rounded-full hover:bg-white/10 relative">

              <Bell className="w-5 h-5" />

              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />

            </button>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="p-2 rounded-full hover:bg-white/10"
            >

              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}

            </button>

          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* STORIES */}
      {/* ====================================================== */}

      <div className="max-w-2xl mx-auto px-4 py-5">

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">

          {/* YOUR STORY */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >

            <div className="relative">

              <img
                src={
                  user?.profilePic ||
                  'https://i.pravatar.cc/150'
                }
                alt=""
                className="w-16 h-16 rounded-full border-2 border-purple-500 object-cover"
              />

              <div className="absolute bottom-0 right-0 bg-purple-600 p-1 rounded-full">

                <Plus className="w-3 h-3 text-white" />

              </div>

            </div>

            <span className="text-xs">
              Your Story
            </span>

          </motion.div>

          {/* STORIES */}
          {stories.map((group) => (

            <motion.div
              key={group.user._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                openStoryViewer(group)
              }
              className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
            >

              <div className="relative">

                {/* LIVE */}
                <div className="absolute -top-1 left-1 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold z-20">
                  LIVE
                </div>

                {/* ONLINE */}
                {onlineUsers?.includes(
                  group.user._id
                ) && (

                  <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-black z-20" />

                )}

                {/* RING */}
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500">

                  <img
                    src={
                      group.user.profilePic ||
                      'https://i.pravatar.cc/150'
                    }
                    alt=""
                    className="w-16 h-16 rounded-full border-2 border-black object-cover"
                  />

                </div>

              </div>

              <span className="text-xs max-w-[70px] truncate">
                {group.user.username}
              </span>

            </motion.div>

          ))}

        </div>

      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="max-w-2xl mx-auto px-4 mb-6">

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">

          {[
            '#Trending',
            '#Coding',
            '#Gaming',
            '#Music',
            '#Fashion',
            '#Photography'
          ].map((tag) => (

            <button
              key={tag}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm whitespace-nowrap"
            >
              {tag}
            </button>

          ))}

        </div>

      </div>

      {/* ====================================================== */}
      {/* POSTS */}
      {/* ====================================================== */}

      <div className="max-w-2xl mx-auto px-4 flex flex-col gap-8">

        {isLoadingFeed ? (

          <div className="flex justify-center py-20">

            <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />

          </div>

        ) : (

          posts.map((post) => {

            const hasLiked =
              likedPosts[post._id];

            const hasSaved =
              savedPosts[post._id];

            return (

              <motion.article
                key={post._id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/5 backdrop-blur-2xl"
              >

                {/* HEADER */}
                <div className="flex items-center justify-between p-4">

                  <div className="flex items-center gap-3">

                    <Link
                      to={`/profile/${post.userId.username}`}
                    >

                      <div className="relative">

                        <img
                          src={
                            post.userId.profilePic ||
                            'https://i.pravatar.cc/150'
                          }
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        {onlineUsers?.includes(
                          post.userId._id
                        ) && (

                          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border border-black" />

                        )}

                      </div>

                    </Link>

                    <div>

                      <div className="flex items-center gap-2">

                        <h3 className="font-bold text-sm">
                          {post.userId.username}
                        </h3>

                        <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />

                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">

                        <span>
                          {formatTime(
                            post.createdAt
                          )}
                        </span>

                        <span>•</span>

                        <Flame className="w-3 h-3 text-orange-400" />

                        <span>Trending</span>

                      </div>

                    </div>

                  </div>

                  <button className="p-2 rounded-full hover:bg-white/10">

                    <MoreHorizontal className="w-5 h-5" />

                  </button>

                </div>

                {/* CAPTION */}
                {post.caption && (

                  <div className="px-4 pb-4">

                    <p className="text-sm leading-relaxed">
                      {post.caption}
                    </p>

                  </div>

                )}

                {/* MEDIA */}
                {post.images?.length > 0 && (

                  <motion.div
                    whileHover={{
                      scale: 1.01
                    }}
                    className="overflow-hidden"
                  >

                    <img
                      src={post.images[0]}
                      alt=""
                      className="w-full max-h-[650px] object-cover"
                    />

                  </motion.div>

                )}

                {/* ACTIONS */}
                <div className="p-4 flex items-center justify-between">

                  <div className="flex items-center gap-5">

                    {/* LIKE */}
                    <motion.button
                      whileTap={{
                        scale: 1.3
                      }}
                      onClick={() =>
                        handleLike(post._id)
                      }
                      className="flex flex-col items-center"
                    >

                      <Heart
                        className={`w-7 h-7 ${
                          hasLiked
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />

                      <span className="text-xs mt-1">
                        {post.likes?.length || 0}
                      </span>

                    </motion.button>

                    {/* COMMENT */}
                    <motion.button
                      whileTap={{
                        scale: 1.2
                      }}
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId ===
                            post._id
                            ? null
                            : post._id
                        )
                      }
                      className="flex flex-col items-center"
                    >

                      <MessageCircle className="w-7 h-7" />

                      <span className="text-xs mt-1">
                        {post.comments?.length || 0}
                      </span>

                    </motion.button>

                    {/* SHARE */}
                    <motion.button
                      whileTap={{
                        scale: 1.2
                      }}
                      onClick={() =>
                        handleShare(post)
                      }
                      className="flex flex-col items-center"
                    >

                      <Share2 className="w-7 h-7" />

                      <span className="text-xs mt-1">
                        Share
                      </span>

                    </motion.button>

                  </div>

                  {/* SAVE */}
                  <motion.button
                    whileTap={{
                      scale: 1.2
                    }}
                    onClick={() =>
                      handleSave(post._id)
                    }
                  >

                    <Bookmark
                      className={`w-7 h-7 ${
                        hasSaved
                          ? 'fill-white'
                          : ''
                      }`}
                    />

                  </motion.button>

                </div>

                {/* COMMENTS */}
                <AnimatePresence>

                  {activeCommentPostId ===
                    post._id && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0
                      }}
                      animate={{
                        opacity: 1,
                        height: 'auto'
                      }}
                      exit={{
                        opacity: 0,
                        height: 0
                      }}
                      className="overflow-hidden border-t border-white/5"
                    >

                      <div className="p-4 flex flex-col gap-4">

                        {/* INPUT */}
                        <div className="flex gap-2">

                          <input
                            type="text"
                            value={
                              commentTexts[
                                post._id
                              ] || ''
                            }
                            onChange={(e) =>
                              setCommentTexts(
                                (prev) => ({
                                  ...prev,
                                  [post._id]:
                                    e.target.value
                                })
                              )
                            }
                            placeholder="Write comment..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none"
                          />

                          <button
                            onClick={() =>
                              handleCommentSubmit(
                                post._id
                              )
                            }
                            className="bg-purple-600 px-5 rounded-2xl"
                          >

                            <Send className="w-5 h-5 text-white" />

                          </button>

                        </div>

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </motion.article>

            );
          })

        )}

      </div>

    </div>
  );
};

export default HomePage;