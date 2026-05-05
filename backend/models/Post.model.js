const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['query', 'tip', 'success', 'alert', 'market'], default: 'query' },
  tags: [String],
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    isAI: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  aiAnswer: String,
  views: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);