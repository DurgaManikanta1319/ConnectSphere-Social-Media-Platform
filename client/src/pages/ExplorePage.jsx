import React, { useState } from 'react';

import {
  Search,
  Play,
  Heart,
  MessageCircle,
  Flame,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

import { motion } from 'framer-motion';

const categories = [
  'Trending',
  'Photography',
  'Nature',
  'Cars',
  'Gaming',
  'Fashion',
  'Travel',
  'Music'
];

const exploreData = [
  {
    id: 1,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    likes: '24K',
    comments: '2K',
    username: 'Sophia',
    verified: true,
    height: 'tall'
  },

  {
    id: 2,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    likes: '90K',
    comments: '10K',
    username: 'Emma',
    verified: true,
    height: 'medium'
  },

  {
    id: 3,
    type: 'video',
    media:
      'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-4835-large.mp4',
    likes: '12K',
    comments: '1K',
    username: 'Alex',
    verified: false,
    height: 'medium'
  },

  {
    id: 4,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    likes: '41K',
    comments: '4K',
    username: 'Ryan',
    verified: true,
    height: 'large'
  },

  {
    id: 5,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    likes: '120K',
    comments: '13K',
    username: 'Olivia',
    verified: true,
    height: 'tall'
  },

  {
    id: 6,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    likes: '17K',
    comments: '2K',
    username: 'Isabella',
    verified: false,
    height: 'medium'
  },

  {
    id: 7,
    type: 'video',
    media:
      'https://assets.mixkit.co/videos/preview/mixkit-red-sports-car-moving-on-a-racetrack-3456-large.mp4',
    likes: '77K',
    comments: '8K',
    username: 'Lucas',
    verified: true,
    height: 'large'
  },

  {
    id: 8,
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    likes: '56K',
    comments: '5K',
    username: 'Daniel',
    verified: true,
    height: 'medium'
  }
];

const ExplorePage = () => {

  const [activeCategory, setActiveCategory] =
    useState('Trending');

  const getHeight = (height) => {

    switch (height) {

      case 'tall':
        return 'h-[500px]';

      case 'large':
        return 'h-[420px]';

      default:
        return 'h-[320px]';
    }
  };

  return (

    <div className="max-w-7xl mx-auto px-4 py-6 pb-32">

      {/* HEADER */}
      <div className="flex flex-col gap-5 mb-8">

        {/* TITLE */}
        <div className="flex items-center gap-3">

          <Sparkles className="w-8 h-8 text-purple-500" />

          <h1 className="text-3xl font-black text-white">
            Explore
          </h1>

        </div>

        {/* SEARCH */}
        <div className="relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search creators, reels, hashtags..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-purple-500"
          />

        </div>

        {/* CATEGORIES */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">

          {categories.map((cat) => (

            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat)
              }
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all text-sm font-semibold ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>

          ))}

        </div>

      </div>

      {/* TRENDING BANNER */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-3xl mb-8 h-[260px]"
      >

        <img
          src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

        <div className="absolute left-8 top-1/2 -translate-y-1/2">

          <div className="flex items-center gap-2 mb-4">

            <Flame className="w-7 h-7 text-orange-500" />

            <span className="text-orange-400 font-bold">
              TRENDING NOW
            </span>

          </div>

          <h2 className="text-5xl font-black text-white mb-3">
            Viral Moments
          </h2>

          <p className="text-slate-300 text-lg max-w-lg">
            Discover the hottest creators,
            reels and photography trends.
          </p>

        </div>

      </motion.div>

      {/* GRID */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">

        {exploreData.map((item) => (

          <motion.div
            key={item.id}
            whileHover={{
              scale: 1.02
            }}
            className={`relative overflow-hidden rounded-3xl bg-white/5 break-inside-avoid group cursor-pointer ${getHeight(
              item.height
            )}`}
          >

            {/* MEDIA */}
            {item.type === 'video' ? (

              <video
                src={item.media}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />

            ) : (

              <img
                src={item.media}
                alt=""
                className="w-full h-full object-cover"
              />

            )}

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">

              {/* STATS */}
              <div className="absolute inset-0 flex items-center justify-center">

                <div className="flex items-center gap-6 text-white">

                  <div className="flex items-center gap-2">

                    <Heart className="w-6 h-6 fill-white" />

                    <span className="font-bold">
                      {item.likes}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <MessageCircle className="w-6 h-6 fill-white" />

                    <span className="font-bold">
                      {item.comments}
                    </span>

                  </div>

                </div>

              </div>

              {/* USER */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <img
                    src={`https://i.pravatar.cc/150?u=${item.username}`}
                    alt=""
                    className="w-10 h-10 rounded-full border border-white"
                  />

                  <div>

                    <div className="flex items-center gap-1">

                      <h3 className="text-white font-bold text-sm">
                        {item.username}
                      </h3>

                      {item.verified && (

                        <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />

                      )}

                    </div>

                    <p className="text-xs text-slate-300">
                      Trending Creator
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* VIDEO ICON */}
            {item.type === 'video' && (

              <div className="absolute top-3 right-3 bg-black/60 p-2 rounded-full">

                <Play className="w-4 h-4 text-white fill-white" />

              </div>

            )}

          </motion.div>

        ))}

      </div>

    </div>
  );
};

export default ExplorePage;