import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'connectsphere_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const usernameExists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create user - password will be hashed via the mongoose pre-save hook
    const user = await User.create({
      username,
      email,
      password,
      skills: [],
      socialLinks: {
        twitter: '',
        instagram: '',
        linkedin: '',
        github: ''
      }
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        followers: user.followers,
        following: user.following,
        role: user.role,
        skills: user.skills,
        socialLinks: user.socialLinks,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please enter credentials and password' });
    }

    // Search by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: { $regex: new RegExp(`^${emailOrUsername}$`, 'i') } }
      ]
    });

    if (user && (await user.comparePassword(password))) {
      if (user.isBanned) {
        return res.status(403).json({ message: 'This account has been banned by the administrator' });
      }

      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        followers: user.followers,
        following: user.following,
        role: user.role,
        skills: user.skills,
        socialLinks: user.socialLinks,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Forgot/Reset Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide email and new password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Update password (mongoose hook handles hashing)
    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  // Since we are using stateless JWT, we client-side destroy the token,
  // but we can send a success response.
  return res.json({ success: true, message: 'Logged out successfully' });
};
