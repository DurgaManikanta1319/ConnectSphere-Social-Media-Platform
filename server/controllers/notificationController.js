import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username profilePic')
      .populate('postId', 'caption images');

    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiverId: req.user._id, readStatus: false },
      { $set: { readStatus: true } }
    );
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return res.status(500).json({ message: 'Server error marking notifications read' });
  }
};
