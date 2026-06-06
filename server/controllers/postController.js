import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

// Helper to extract hashtags from text
const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? matches.map(match => match.substring(1).toLowerCase()) : [];
};

// @desc    Create a new post
// @route   POST /api/posts/create
// @access  Private
export const createPost = async (req, res) => {
  const { caption, images } = req.body; // Expect images to be base64 strings or URLs

  try {
    if (!caption && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Post content or image is required' });
    }

    const hashtags = extractHashtags(caption);

    const post = await Post.create({
      userId: req.user._id,
      caption,
      images: images || [],
      hashtags
    });

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username profilePic bio');

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Server error creating post' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin status
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ postId: post._id });
    
    // Remove post from saved posts lists of all users
    await User.updateMany(
      { savedPosts: post._id },
      { $pull: { savedPosts: post._id } }
    );

    await Post.findByIdAndDelete(post._id);

    return res.json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Server error deleting post' });
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/posts/like/:id
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      await post.save();
      return res.json({ isLiked: false, likesCount: post.likes.length });
    } else {
      // Like
      post.likes.push(req.user._id);
      await post.save();

      // Create Notification if liking someone else's post
      if (post.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          receiverId: post.userId,
          senderId: req.user._id,
          type: 'like',
          postId: post._id
        });
      }

      return res.json({ isLiked: true, likesCount: post.likes.length });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ message: 'Server error processing like' });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/comment/:id
// @access  Private
export const commentPost = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      userId: req.user._id,
      postId: post._id,
      comment: text
    });

    // Link comment to post
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username profilePic');

    // Create Notification if commenting on someone else's post
    if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiverId: post.userId,
        senderId: req.user._id,
        type: 'comment',
        postId: post._id
      });
    }

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Comment post error:', error);
    return res.status(500).json({ message: 'Server error adding comment' });
  }
};

// @desc    Reply to a comment (nested comment)
// @route   POST /api/posts/comment/:commentId/reply
// @access  Private
export const replyComment = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      userId: req.user._id,
      comment: text,
      createdAt: new Date()
    };

    comment.replies.push(reply);
    await comment.save();

    // Get populated comment to send replies with user details back
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username profilePic')
      .populate('replies.userId', 'username profilePic');

    const newReply = populatedComment.replies[populatedComment.replies.length - 1];

    // Notification for comment author if someone replies
    if (comment.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        receiverId: comment.userId,
        senderId: req.user._id,
        type: 'reply',
        postId: comment.postId
      });
    }

    return res.status(201).json(newReply);
  } catch (error) {
    console.error('Reply comment error:', error);
    return res.status(500).json({ message: 'Server error adding reply' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/comment/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership of comment, post ownership, or admin status
    const post = await Post.findById(comment.postId);
    const isCommentOwner = comment.userId.toString() === req.user._id.toString();
    const isPostOwner = post && post.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return res.status(401).json({ message: 'User not authorized to delete this comment' });
    }

    // Pull from post comments array
    if (post) {
      post.comments = post.comments.filter(id => id.toString() !== comment._id.toString());
      await post.save();
    }

    await Comment.findByIdAndDelete(comment._id);

    return res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: 'Server error deleting comment' });
  }
};

// @desc    Get dynamic home feed
// @route   GET /api/posts
// @access  Private
export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following || [];
    
    // Include following ids, plus the current user's id
    const feedUserIds = [...followingIds, req.user._id];

    // If page is 1, let's load personalized feed. If following users have no posts,
    // we can merge with other recent posts so the feed is never empty!
    let posts = await Post.find({ userId: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePic bio')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePic' }
      });

    // Fallback: If feed has few posts, fetch general recent posts so that the feed is active
    if (posts.length < limit && page === 1) {
      const remainingLimit = limit - posts.length;
      const existingIds = posts.map(p => p._id);
      
      const extraPosts = await Post.find({ 
        _id: { $nin: existingIds },
        userId: { $nin: feedUserIds } 
      })
        .sort({ createdAt: -1 })
        .limit(remainingLimit)
        .populate('userId', 'username profilePic bio')
        .populate({
          path: 'comments',
          populate: { path: 'userId', select: 'username profilePic' }
        });
      
      posts = [...posts, ...extraPosts];
    }

    return res.json(posts);
  } catch (error) {
    console.error('Get feed posts error:', error);
    return res.status(500).json({ message: 'Server error fetching posts feed' });
  }
};

// @desc    Get posts of a user by username
// @route   GET /api/posts/user/:username
// @access  Private
export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePic bio')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePic' }
      });

    return res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ message: 'Server error fetching user posts' });
  }
};

// @desc    Save/Bookmark a post
// @route   POST /api/posts/save/:id
// @access  Private
export const savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isSaved = user.savedPosts.includes(post._id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
      await user.save();
      return res.json({ isSaved: false, message: 'Post removed from bookmarks' });
    } else {
      user.savedPosts.push(post._id);
      await user.save();
      return res.json({ isSaved: true, message: 'Post saved to bookmarks' });
    }
  } catch (error) {
    console.error('Save post error:', error);
    return res.status(500).json({ message: 'Server error saving post' });
  }
};

// @desc    Get current user's saved posts
// @route   GET /api/posts/saved
// @access  Private
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: [
        { path: 'userId', select: 'username profilePic bio' },
        { 
          path: 'comments', 
          populate: { path: 'userId', select: 'username profilePic' }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort by newest saved (reverse order)
    const saved = [...user.savedPosts].reverse();
    return res.json(saved);
  } catch (error) {
    console.error('Get saved posts error:', error);
    return res.status(500).json({ message: 'Server error fetching saved posts' });
  }
};

// @desc    Search posts and hashtags
// @route   GET /api/posts/search
// @access  Private
export const searchPosts = async (req, res) => {
  const query = req.query.q;

  try {
    if (!query) {
      return res.json([]);
    }

    let searchFilter = {};
    if (query.startsWith('#')) {
      const tag = query.substring(1).toLowerCase();
      searchFilter = { hashtags: tag };
    } else {
      searchFilter = {
        $or: [
          { caption: { $regex: query, $options: 'i' } },
          { hashtags: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(searchFilter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePic bio')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username profilePic' }
      });

    return res.json(posts);
  } catch (error) {
    console.error('Search posts error:', error);
    return res.status(500).json({ message: 'Server error searching posts' });
  }
};

// @desc    Get trending hashtags
// @route   GET /api/posts/trending-hashtags
// @access  Private
export const getTrendingHashtags = async (req, res) => {
  try {
    // Aggregate hashtags from all posts
    const result = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const formattedTags = result.map(item => ({
      tag: item._id,
      count: item.count
    }));

    return res.json(formattedTags);
  } catch (error) {
    console.error('Trending hashtags error:', error);
    return res.status(500).json({ message: 'Server error getting trending hashtags' });
  }
};
