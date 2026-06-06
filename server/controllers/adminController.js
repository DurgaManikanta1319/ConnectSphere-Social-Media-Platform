import User from '../models/User.js';
import Post from '../models/Post.js';
import Story from '../models/Story.js';

// @desc    Get Admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    
    // Total active stories (since stories are TTL expired, count is accurate)
    const activeStories = await Story.countDocuments();

    // Count of banned users
    const bannedUsersCount = await User.countDocuments({ isBanned: true });

    // Count of reported posts
    const reportedPostsCount = await Post.countDocuments({ 'reports.0': { $exists: true } });

    // Get user registrations distribution or recent signups
    const recentSignups = await User.find()
      .sort({ createdAt: -1 })
      .select('username email profilePic createdAt')
      .limit(5);

    // Get popular posts (by likes count)
    const popularPosts = await Post.find()
      .populate('userId', 'username profilePic')
      .sort({ 'likes.length': -1 })
      .limit(5);

    return res.json({
      analytics: {
        totalUsers,
        totalPosts,
        activeStories,
        bannedUsers: bannedUsersCount,
        reportedPosts: reportedPostsCount
      },
      recentSignups,
      popularPosts
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Ban / Unban user
// @route   PUT /api/admin/users/ban/:id
// @access  Private/Admin
export const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban another administrator' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    return res.json({
      success: true,
      isBanned: user.isBanned,
      message: `User ${user.username} has been ${user.isBanned ? 'banned' : 'unbanned'} successfully`
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return res.status(500).json({ message: 'Server error toggling ban state' });
  }
};

// @desc    Get reported posts list
// @route   GET /api/admin/posts/reported
// @access  Private/Admin
export const getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('userId', 'username profilePic bio')
      .populate('reports.userId', 'username profilePic')
      .sort({ 'reports.length': -1 });

    return res.json(posts);
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    return res.status(500).json({ message: 'Server error retrieving reported posts' });
  }
};

// @desc    Report a post
// @route   POST /api/posts/report/:id
// @access  Private
export const reportPost = async (req, res) => {
  const { reason } = req.body;

  try {
    if (!reason) {
      return res.status(400).json({ message: 'Reason for reporting is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reported this post
    const alreadyReported = post.reports.some(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    post.reports.push({
      userId: req.user._id,
      reason
    });

    await post.save();

    return res.json({ success: true, message: 'Post reported successfully to administrators' });
  } catch (error) {
    console.error('Error reporting post:', error);
    return res.status(500).json({ message: 'Server error reporting post' });
  }
};
