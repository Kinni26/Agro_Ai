const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const tavily = require('../services/tavily.service');

// Static MSP data (updated seasonally)
const MSP_DATA = {
  wheat: { msp: 2275, unit: 'quintal', season: 'rabi' },
  rice: { msp: 2183, unit: 'quintal', season: 'kharif' },
  maize: { msp: 2090, unit: 'quintal', season: 'kharif' },
  soybean: { msp: 4600, unit: 'quintal', season: 'kharif' },
  cotton: { msp: 7020, unit: 'quintal', season: 'kharif' },
  sugarcane: { msp: 340, unit: 'quintal', season: 'kharif' },
  mustard: { msp: 5650, unit: 'quintal', season: 'rabi' },
  chickpea: { msp: 5440, unit: 'quintal', season: 'rabi' },
  sunflower: { msp: 6760, unit: 'quintal', season: 'kharif' },
  groundnut: { msp: 6377, unit: 'quintal', season: 'kharif' }
};

router.get('/msp', protect, async (req, res) => {
  res.json({ msp: MSP_DATA, updatedYear: '2023-24' });
});

router.get('/mandi/:crop', protect, async (req, res) => {
  try {
    const { crop } = req.params;
    const state = req.query.state || req.user.location?.state || 'India';
    const data = await tavily.getMandiPrices(crop, state);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/news', protect, async (req, res) => {
  try {
    const data = await tavily.getAgriNews('agriculture market price mandi India');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;