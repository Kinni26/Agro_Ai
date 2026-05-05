const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Post = require('../models/Post.model');
const mistral = require('../services/mistral.service');

// Get all posts
router.get('/', protect, async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};
    const posts = await Post.find(filter)
      .populate('author', 'name location.state farmDetails.primaryCrops')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const count = await Post.countDocuments(filter);
    res.json({ posts, total: count, pages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post with AI answer
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    let aiAnswer = null;

    if (category === 'query') {
      try {
        const farmerProfile = { location: req.user.location, crops: req.user.farmDetails?.primaryCrops };
        aiAnswer = await mistral.farmingChatbot(content, [], farmerProfile);
      } catch (e) { aiAnswer = null; }
    }

    const post = await Post.create({
      author: req.user._id, title, content, category, tags, aiAnswer
    });
    await post.populate('author', 'name location.state');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like/unlike post
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name');
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;