import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import * as api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Socket Connection Management
  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl);
      
      setSocket(newSocket);
      
      newSocket.emit('setup', user._id);
      
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      // Simple real-time notifications counter
      newSocket.on('new_notification', () => {
        setUnreadNotifications(prev => prev + 1);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
    }
  }, [user]);

  // Login handler
  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.login(credentials);
      localStorage.setItem('token', data.token);
      
      const { token, ...userData } = data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      localStorage.setItem('token', data.token);
      
      const { token, ...newUser } = data;
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update profile locally handler
  const updateUserProfile = (updatedProfile) => {
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const mergedUser = { ...currentUser, ...updatedProfile };
    
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const value = {
    user,
    loading,
    socket,
    onlineUsers,
    unreadNotifications,
    setUnreadNotifications,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
