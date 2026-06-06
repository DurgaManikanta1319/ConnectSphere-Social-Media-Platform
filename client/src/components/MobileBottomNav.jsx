import React from 'react';

import {
  Home,
  Search,
  PlusSquare,
  PlaySquare,
  Heart,
  User
} from 'lucide-react';

import {
  Link,
  useLocation
} from 'react-router-dom';

import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {

  const location = useLocation();

  const { user } = useAuth();

  const navItems = [
    {
      icon: Home,
      path: '/home'
    },

    {
      icon: Search,
      path: '/explore'
    },

    {
      icon: PlusSquare,
      path: '/create'
    },

    {
      icon: PlaySquare,
      path: '/reels'
    },

    {
      icon: Heart,
      path: '/notifications'
    }
  ];

  return (

    <div className="fixed bottom-0 left-0 right-0 z-50">

      {/* BLUR BACKGROUND */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-3xl border-t border-white/10" />

      <div className="relative max-w-2xl mx-auto flex items-center justify-around py-3">

        {navItems.map((item, index) => {

          const isActive =
            location.pathname === item.path;

          const Icon = item.icon;

          return (

            <Link
              key={index}
              to={item.path}
            >

              <motion.div
                whileTap={{
                  scale: 0.85
                }}
                className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/10'
                }`}
              >

                <Icon className="w-7 h-7" />

                {/* ACTIVE DOT */}
                {isActive && (

                  <motion.div
                    layoutId="navDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"
                  />

                )}

              </motion.div>

            </Link>

          );
        })}

        {/* PROFILE */}
        <Link
          to={`/profile/${user?.username}`}
        >

          <motion.div
            whileTap={{
              scale: 0.85
            }}
            className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${
              location.pathname.includes('/profile')
                ? 'border-purple-500'
                : 'border-transparent'
            }`}
          >

            <img
              src={
                user?.profilePic ||
                '/default-avatar.png'
              }
              alt=""
              className="w-full h-full object-cover"
            />

          </motion.div>

        </Link>

      </div>

    </div>
  );
};

export default MobileBottomNav;