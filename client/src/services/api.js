import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to inject JWT token in request headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- AUTH API ---
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await API.post('/auth/forgot-password', data);
  return response.data;
};

// --- USER API ---
export const getUserProfile = async (username) => {
  const response = await API.get(`/users/profile/${username}`);
  return response.data;
};

export const editUserProfile = async (profileData) => {
  const response = await API.put('/users/edit', profileData);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await API.post(`/users/follow/${userId}`);
  return response.data;
};

export const getSuggestedUsers = async () => {
  const response = await API.get('/users/suggested');
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// --- POST API ---
export const getFeedPosts = async (page = 1, limit = 10) => {
  const response = await API.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserPosts = async (username) => {
  const response = await API.get(`/posts/user/${username}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await API.post('/posts/create', postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await API.delete(`/posts/${postId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await API.post(`/posts/like/${postId}`);
  return response.data;
};

export const commentPost = async (postId, text) => {
  const response = await API.post(`/posts/comment/${postId}`, { text });
  return response.data;
};

export const replyComment = async (commentId, text) => {
  const response = await API.post(`/posts/comment/${commentId}/reply`, { text });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await API.delete(`/posts/comment/${commentId}`);
  return response.data;
};

export const savePost = async (postId) => {
  const response = await API.post(`/posts/save/${postId}`);
  return response.data;
};

export const getSavedPosts = async () => {
  const response = await API.get('/posts/saved');
  return response.data;
};

export const searchPosts = async (query) => {
  const response = await API.get(`/posts/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getTrendingHashtags = async () => {
  const response = await API.get('/posts/trending-hashtags');
  return response.data;
};

export const reportPost = async (postId, reason) => {
  const response = await API.post(`/admin/posts/report/${postId}`, { reason });
  return response.data;
};

// --- MESSAGES API ---
export const getConversations = async () => {
  const response = await API.get('/messages/conversations');
  return response.data;
};

export const getMessages = async (userId) => {
  const response = await API.get(`/messages/get/${userId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await API.post('/messages/send', messageData);
  return response.data;
};

// --- STORIES API ---
export const getStories = async () => {
  const response = await API.get('/stories');
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await API.post('/stories/create', storyData);
  return response.data;
};

export const viewStory = async (storyId) => {
  const response = await API.post(`/stories/${storyId}/view`);
  return response.data;
};

export const reactStory = async (storyId, emoji) => {
  const response = await API.post(`/stories/${storyId}/react`, { emoji });
  return response.data;
};

// --- NOTIFICATIONS API ---
export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await API.put('/notifications/read');
  return response.data;
};

// --- ADMIN API ---
export const getAdminAnalytics = async () => {
  const response = await API.get('/admin/analytics');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const toggleBanUser = async (userId) => {
  const response = await API.put(`/admin/users/ban/${userId}`);
  return response.data;
};

export const getReportedPosts = async () => {
  const response = await API.get('/admin/posts/reported');
  return response.data;
};

export default API;
