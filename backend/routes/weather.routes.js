const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const weatherSvc = require('../services/weather.service');
const mistral = require('../services/mistral.service');

router.get('/current', protect, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    let weather;

    if (lat && lon) {
      weather = await weatherSvc.getCurrentWeather(parseFloat(lat), parseFloat(lon));
    } else if (city) {
      weather = await weatherSvc.getWeatherByCity(city);
    } else if (req.user.location?.lat) {
      weather = await weatherSvc.getCurrentWeather(req.user.location.lat, req.user.location.lon);
    } else {
      return res.status(400).json({ message: 'Location required' });
    }

    const risks = weatherSvc.getWeatherRisk(weather);
    res.json({ weather, risks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/forecast', protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const userLat = parseFloat(lat) || req.user.location?.lat;
    const userLon = parseFloat(lon) || req.user.location?.lon;

    if (!userLat || !userLon) return res.status(400).json({ message: 'Coordinates required' });

    const forecast = await weatherSvc.getForecast(userLat, userLon);
    res.json({ forecast });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/farming-advice', protect, async (req, res) => {
  try {
    const { weatherData } = req.body;
    const crops = req.user.farmDetails?.primaryCrops || [];
    const location = `${req.user.location?.district}, ${req.user.location?.state}`;

    const advice = await mistral.getWeatherFarmingAdvice(weatherData, crops, location);
    res.json(advice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;