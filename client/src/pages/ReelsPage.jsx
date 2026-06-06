import React, { useRef, useState } from 'react';

import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Bookmark,
  Play
} from 'lucide-react';

import { motion } from 'framer-motion';

const reelsData = [
  {
    id: 1,
    username: 'KDM',
    caption: 'Late night coding vibes 💻🌃',
    likes: '24.8K',
    comments: '3.1K',
    type: 'video',
    media:
      'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-4835-large.mp4',
    avatar:
      'https://randomuser.me/api/portraits/men/32.jpg'
  },

  {
    id: 2,
    username: 'Sophia',
    caption: 'Travel moments ✈️',
    likes: '14.2K',
    comments: '1.4K',
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    avatar:
      'https://randomuser.me/api/portraits/women/44.jpg'
  },

  {
    id: 3,
    username: 'Alex',
    caption: 'Gym transformation 🔥',
    likes: '48K',
    comments: '5.9K',
    type: 'video',
    media:
      'https://assets.mixkit.co/videos/preview/mixkit-fitness-man-stretching-before-starting-his-workout-41451-large.mp4',
    avatar:
      'https://randomuser.me/api/portraits/men/12.jpg'
  },

  {
    id: 4,
    username: 'Emma',
    caption: 'Minimal aesthetic room 🌙',
    likes: '8.7K',
    comments: '728',
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    avatar:
      'https://randomuser.me/api/portraits/women/68.jpg'
  },

  {
    id: 5,
    username: 'Ryan',
    caption: 'Supercar reel 🏎️',
    likes: '93K',
    comments: '11K',
    type: 'video',
    media:
      'https://assets.mixkit.co/videos/preview/mixkit-red-sports-car-moving-on-a-racetrack-3456-large.mp4',
    avatar:
      'https://randomuser.me/api/portraits/men/75.jpg'
  },

  {
    id: 6,
    username: 'Isabella',
    caption: 'Coffee + rain = peace ☕🌧️',
    likes: '12K',
    comments: '1K',
    type: 'image',
    media:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    avatar:
      'https://randomuser.me/api/portraits/women/22.jpg'
  }
];

const ReelsPage = () => {
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState({});

  const videoRefs = useRef([]);

  // ======================
  // LIKE
  // ======================

  const toggleLike = (id) => {
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ======================
  // SAVE
  // ======================

  const toggleSave = (id) => {
    setSaved((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ======================
  // MUTE
  // ======================

  const toggleMute = () => {
    setMuted(!muted);

    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = !muted;
      }
    });
  };

  // ======================
  // PLAY / PAUSE
  // ======================

  const togglePause = (index, id) => {
    const video = videoRefs.current[index];

    if (!video) return;

    if (video.paused) {
      video.play();

      setPaused((prev) => ({
        ...prev,
        [id]: false
      }));
    } else {
      video.pause();

      setPaused((prev) => ({
        ...prev,
        [id]: true
      }));
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {reelsData.map((reel, index) => (

        <section
          key={reel.id}
          className="relative h-screen snap-start overflow-hidden flex items-center justify-center"
        >

          {/* MEDIA */}
          {reel.type === 'video' ? (

            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={reel.media}
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="auto"
              controls={false}
              className="absolute inset-0 w-full h-full object-cover"
            />

          ) : (

            <img
              src={reel.media}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />

          )}

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

          {/* PLAY ICON */}
          {reel.type === 'video' && paused[reel.id] && (
            <div className="absolute z-30 bg-black/60 p-5 rounded-full">
              <Play className="w-14 h-14 text-white fill-white" />
            </div>
          )}

          {/* CLICK TO PAUSE */}
          {reel.type === 'video' && (
            <div
              onClick={() => togglePause(index, reel.id)}
              className="absolute inset-0 z-10 cursor-pointer"
            />
          )}

          {/* TOP BAR */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">

            <h1 className="text-white text-xl font-bold">
              Reels
            </h1>

            <div className="flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

              <span className="text-white text-sm">
                Live Feed
              </span>

            </div>

          </div>

          {/* LEFT CONTENT */}
          <div className="absolute bottom-24 left-4 z-20 max-w-[75%]">

            {/* USER */}
            <div className="flex items-center gap-3 mb-4">

              <img
                src={reel.avatar}
                alt=""
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />

              <div>

                <h3 className="text-white font-bold text-lg">
                  @{reel.username}
                </h3>

                <p className="text-xs text-slate-300">
                  Following
                </p>

              </div>

            </div>

            {/* CAPTION */}
            <p className="text-white text-sm leading-relaxed">
              {reel.caption}
            </p>

          </div>

          {/* RIGHT ACTIONS */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-7 z-20">

            {/* LIKE */}
            <motion.button
              whileTap={{ scale: 1.4 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => toggleLike(reel.id)}
              className="flex flex-col items-center"
            >

              <Heart
                className={`w-8 h-8 ${
                  liked[reel.id]
                    ? 'fill-red-500 text-red-500'
                    : 'text-white'
                }`}
              />

              <span className="text-white text-xs mt-1 font-semibold">
                {reel.likes}
              </span>

            </motion.button>

            {/* COMMENT */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              className="flex flex-col items-center"
            >

              <MessageCircle className="w-8 h-8 text-white" />

              <span className="text-white text-xs mt-1 font-semibold">
                {reel.comments}
              </span>

            </motion.button>

            {/* SHARE */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              className="flex flex-col items-center"
            >

              <Share2 className="w-8 h-8 text-white" />

              <span className="text-white text-xs mt-1 font-semibold">
                Share
              </span>

            </motion.button>

            {/* SAVE */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={() => toggleSave(reel.id)}
              className="flex flex-col items-center"
            >

              <Bookmark
                className={`w-8 h-8 ${
                  saved[reel.id]
                    ? 'fill-white text-white'
                    : 'text-white'
                }`}
              />

            </motion.button>

            {/* MUTE */}
            <motion.button
              whileTap={{ scale: 1.2 }}
              onClick={toggleMute}
              className="flex flex-col items-center"
            >

              {muted ? (
                <VolumeX className="w-8 h-8 text-white" />
              ) : (
                <Volume2 className="w-8 h-8 text-white" />
              )}

            </motion.button>

          </div>

        </section>

      ))}

    </div>
  );
};

export default ReelsPage;