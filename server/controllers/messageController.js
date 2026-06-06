import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a direct message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req, res) => {
  const { receiverId, message, image } = req.body;

  try {
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (!message && !image) {
      return res.status(400).json({ message: 'Message content or image is required' });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message: message || '',
      image: image || '',
      seenStatus: false
    });

    // Populate sender details for real-time notification
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'username profilePic')
      .populate('receiverId', 'username profilePic');

    // Socket.io real-time trigger will be bound in server.js
    if (global.io) {
      // Send to receiver user if online
      global.io.to(receiverId.toString()).emit('new_message', populatedMessage);
      // Send back to sender
      global.io.to(req.user._id.toString()).emit('new_message', populatedMessage);
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get messages between current user and target user
// @route   GET /api/messages/get/:userId
// @access  Private
export const getMessages = async (req, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;

  try {
    // Fetch all messages in conversation
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'username profilePic')
    .populate('receiverId', 'username profilePic');

    // Mark messages sent by the other user to the current user as seen
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, seenStatus: false },
      { $set: { seenStatus: true } }
    );

    // Notify other user that messages were seen
    if (global.io) {
      global.io.to(otherUserId.toString()).emit('messages_seen', {
        seenBy: currentUserId,
        senderId: otherUserId
      });
    }

    return res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Server error retrieving messages' });
  }
};

// @desc    Get chat user list (conversations)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    })
    .sort({ timestamp: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.senderId.toString() === currentUserId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, msg);
      }
    }

    const otherUserIds = Array.from(conversationMap.keys());
    const users = await User.find({ _id: { $in: otherUserIds } })
      .select('username profilePic bio');

    // Format list with last message details
    const conversations = users.map(user => {
      const lastMessage = conversationMap.get(user._id.toString());
      return {
        user,
        lastMessage
      };
    })
    // Sort by most recent message
    .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

    return res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'Server error fetching conversations' });
  }
};
