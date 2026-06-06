import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete from DB after 24 hours (86400 seconds)
  }
});

const Story = mongoose.model('Story', storySchema);
export default Story;
