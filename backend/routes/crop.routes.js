const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Crop = require('../models/Crop.model');

// Get all crops for farmer
router.get('/', protect, async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add crop
router.post('/', protect, async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, farmer: req.user._id });
    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update crop
router.put('/:id', protect, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      req.body,
      { new: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete crop
router.delete('/:id', protect, async (req, res) => {
  try {
    await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    res.json({ message: 'Crop removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;