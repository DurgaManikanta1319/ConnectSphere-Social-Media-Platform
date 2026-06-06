import Story from '../models/Story.js';
import User from '../models/User.js';

// @desc    Create a new story
// @route   POST /api/stories/create
// @access  Private
export const createStory = async (req, res) => {
  const { image, video } = req.body;

  try {
    if (!image && !video) {
      return res.status(400).json({ message: 'Story image or video is required' });
    }

    const story = await Story.create({
      userId: req.user._id,
      image: image || '',
      video: video || '',
      viewers: [],
      reactions: []
    });

    const populatedStory = await Story.findById(story._id)
      .populate('userId', 'username profilePic');

    return res.status(201).json(populatedStory);
  } catch (error) {
    console.error('Create story error:', error);
    return res.status(500).json({ message: 'Server error creating story' });
  }
};

// @desc    Get active stories of self and followed users (grouped by user)
// @route   GET /api/stories
// @access  Private
export const getStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following || [];
    const visibleUserIds = [...followingIds, req.user._id];

    // Find stories from users that the current user follows plus their own stories
    const activeStories = await Story.find({ userId: { $in: visibleUserIds } })
      .sort({ createdAt: 1 })
      .populate('userId', 'username profilePic')
      .populate('viewers', 'username profilePic')
      .populate('reactions.userId', 'username profilePic');

    // Group stories by user for UI convenience
    const groupedMap = {};

    for (const story of activeStories) {
      const uId = story.userId._id.toString();
      if (!groupedMap[uId]) {
        groupedMap[uId] = {
          user: story.userId,
          stories: []
        };
      }
      groupedMap[uId].stories.push(story);
    }

    return res.json(Object.values(groupedMap));
  } catch (error) {
    console.error('Get stories error:', error);
    return res.status(500).json({ message: 'Server error retrieving stories' });
  }
};

// @desc    Mark story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
export const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found or expired' });
    }

    // Add user to viewers array if not already present
    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    const populatedStory = await Story.findById(story._id)
      .populate('viewers', 'username profilePic');

    return res.json(populatedStory);
  } catch (error) {
    console.error('View story error:', error);
    return res.status(500).json({ message: 'Server error marking story as viewed' });
  }
};

// @desc    React to a story
// @route   POST /api/stories/:id/react
// @access  Private
export const reactStory = async (req, res) => {
  const { emoji } = req.body;

  try {
    if (!emoji) {
      return res.status(400).json({ message: 'Emoji reaction is required' });
    }

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found or expired' });
    }

    // Check if user already reacted
    const existingReactionIndex = story.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReactionIndex > -1) {
      story.reactions[existingReactionIndex].emoji = emoji;
    } else {
      story.reactions.push({
        userId: req.user._id,
        emoji
      });
    }

    await story.save();

    const populatedStory = await Story.findById(story._id)
      .populate('reactions.userId', 'username profilePic');

    return res.json(populatedStory);
  } catch (error) {
    console.error('React story error:', error);
    return res.status(500).json({ message: 'Server error adding reaction' });
  }
};
