import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Private/Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePic bio')
      .populate('following', 'username profilePic bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'This user account is banned' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/follow/:id
// @access  Private
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      await currentUser.save();
      await targetUser.save();
      
      return res.json({ isFollowing: false, message: 'Unfollowed user successfully' });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Create Notification
      await Notification.create({
        receiverId: targetUserId,
        senderId: currentUserId,
        type: 'follow'
      });

      return res.json({ isFollowing: true, message: 'Followed user successfully' });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return res.status(500).json({ message: 'Server error processing follow request' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/edit
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set fields if provided in body
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
    user.coverPic = req.body.coverPic !== undefined ? req.body.coverPic : user.coverPic;
    
    if (req.body.socialLinks) {
      user.socialLinks = {
        twitter: req.body.socialLinks.twitter !== undefined ? req.body.socialLinks.twitter : user.socialLinks.twitter,
        instagram: req.body.socialLinks.instagram !== undefined ? req.body.socialLinks.instagram : user.socialLinks.instagram,
        linkedin: req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks.linkedin,
        github: req.body.socialLinks.github !== undefined ? req.body.socialLinks.github : user.socialLinks.github,
      };
    }

    if (req.body.skills) {
      // Ensure skills is an array
      user.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      coverPic: updatedUser.coverPic,
      followers: updatedUser.followers,
      following: updatedUser.following,
      role: updatedUser.role,
      skills: updatedUser.skills,
      socialLinks: updatedUser.socialLinks,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error updating user profile' });
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggested
// @access  Private
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    // Get all users except current user, those already followed, and banned users
    const excludedIds = [...currentUser.following, currentUserId];

    const suggested = await User.find({
      _id: { $nin: excludedIds },
      isBanned: false
    })
    .select('username profilePic bio followers')
    .limit(5);

    // We can also calculate mutual followers if we want, but returning 5 suggestions is a great fit
    return res.json(suggested);
  } catch (error) {
    console.error('Suggested users error:', error);
    return res.status(500).json({ message: 'Server error fetching suggested users' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  const query = req.query.q;

  try {
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { isBanned: false }
      ]
    })
    .select('username profilePic bio followers')
    .limit(10);

    return res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ message: 'Server error during user search' });
  }
};
