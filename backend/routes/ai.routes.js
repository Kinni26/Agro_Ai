const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const mistral = require('../services/mistral.service');
const tavily = require('../services/tavily.service');

// Disease Diagnosis
router.post('/diagnose', protect, async (req, res) => {
  try {
    const { symptoms, cropName, location } = req.body;
    if (!symptoms || !cropName) return res.status(400).json({ message: 'Symptoms and crop name required' });

    const [diagnosis, pestAlerts] = await Promise.all([
      mistral.diagnoseCropDisease(symptoms, cropName, location || req.user.location?.state),
      tavily.getPestAlerts(cropName, location || req.user.location?.state).catch(() => null)
    ]);

    res.json({ diagnosis, relatedAlerts: pestAlerts?.results?.slice(0, 3) || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crop Recommendation
router.post('/recommend-crops', protect, async (req, res) => {
  try {
    const { soilType, season, waterAvailability } = req.body;
    const { location, farmDetails } = req.user;

    const result = await mistral.recommendCrops(
      soilType || farmDetails?.soilType,
      season,
      `${location?.district}, ${location?.state}`,
      waterAvailability || farmDetails?.irrigationType,
      farmDetails?.landSize
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fertilizer & Irrigation Advisory
router.post('/fertilizer-advice', protect, async (req, res) => {
  try {
    const { cropName, growthStage, soilHealth } = req.body;
    const result = await mistral.getFertilizerAdvice(
      cropName,
      growthStage,
      soilHealth,
      req.user.farmDetails?.landSize
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Market Price Analysis
router.post('/market-analysis', protect, async (req, res) => {
  try {
    const { crop, currentPrice, season } = req.body;
    const location = req.user.location?.state || 'India';

    const [analysis, mandiData] = await Promise.all([
      mistral.analyzeMarketPrice(crop, currentPrice, location, season),
      tavily.getMandiPrices(crop, location).catch(() => null)
    ]);

    res.json({ analysis, mandiData: mandiData?.results?.slice(0, 5) || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Chatbot
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    const farmerProfile = {
      name: req.user.name,
      location: req.user.location,
      crops: req.user.farmDetails?.primaryCrops,
      landSize: req.user.farmDetails?.landSize,
      soilType: req.user.farmDetails?.soilType
    };

    const response = await mistral.farmingChatbot(message, history || [], farmerProfile);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Government Schemes
router.get('/schemes', protect, async (req, res) => {
  try {
    const farmerProfile = {
      location: req.user.location,
      landSize: req.user.farmDetails?.landSize,
      crops: req.user.farmDetails?.primaryCrops
    };

    const [schemes, schemeNews] = await Promise.all([
      mistral.findGovernmentSchemes(farmerProfile),
      tavily.searchFarmingNews('government scheme farmer 2024 India', 4).catch(() => null)
    ]);

    res.json({ schemes, news: schemeNews?.results || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Agri News
router.get('/news', protect, async (req, res) => {
  try {
    const { topic } = req.query;
    const news = await tavily.getAgriNews(topic || 'agriculture India farming');
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;