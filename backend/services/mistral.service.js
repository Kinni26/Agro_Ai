const axios = require('axios');

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

const callMistral = async (messages, systemPrompt = null, temperature = 0.7) => {
  const msgs = [];
  if (systemPrompt) {
    msgs.push({ role: 'system', content: systemPrompt });
  }
  msgs.push(...messages);

  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-small-latest',
      messages: msgs,
      temperature,
      max_tokens: 1500
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
};

// 1. Crop Disease Diagnosis
const diagnoseCropDisease = async (symptoms, cropName, location) => {
  const system = `You are an expert agronomist and plant pathologist with 20 years of experience in Indian agriculture. 
  Always respond in a structured JSON format with keys: disease, confidence, severity, causes, treatment, prevention, urgency.
  Provide practical, affordable solutions suitable for Indian farmers. Include both chemical and organic options.`;

  const messages = [{
    role: 'user',
    content: `Crop: ${cropName}\nLocation: ${location}\nSymptoms: ${symptoms}\n\nDiagnose the disease and provide treatment in JSON format.`
  }];

  const raw = await callMistral(messages, system, 0.3);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { disease: raw, confidence: 'medium', treatment: raw };
  } catch {
    return { disease: 'Unable to parse', rawResponse: raw };
  }
};

// 2. Crop Recommendation
const recommendCrops = async (soilType, season, location, waterAvailability, landSize) => {
  const system = `You are an expert Indian agricultural advisor. Recommend crops based on conditions. 
  Respond in JSON: { recommendations: [{cropName, cropNameHindi, profitPotential, waterNeed, duration, marketDemand, tips}] }`;

  const messages = [{
    role: 'user',
    content: `Soil: ${soilType}\nSeason: ${season}\nLocation: ${location}\nWater: ${waterAvailability}\nLand: ${landSize} acres\n\nRecommend top 5 crops.`
  }];

  const raw = await callMistral(messages, system, 0.5);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };
  } catch {
    return { recommendations: [], rawResponse: raw };
  }
};

// 3. Fertilizer & Irrigation Advisory
const getFertilizerAdvice = async (cropName, growthStage, soilHealth, area) => {
  const system = `You are a soil scientist and agronomist specializing in Indian crops.
  Respond in JSON: { fertilizers: [{name, nameHindi, quantity, unit, timing, method, cost}], irrigationSchedule: [{stage, frequency, amount, method}], warnings: [] }`;

  const messages = [{
    role: 'user',
    content: `Crop: ${cropName}\nGrowth Stage: ${growthStage}\nSoil Health: ${JSON.stringify(soilHealth)}\nArea: ${area} acres\n\nProvide fertilizer and irrigation schedule.`
  }];

  const raw = await callMistral(messages, system, 0.4);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return { rawResponse: raw };
  }
};

// 4. Market Price Analysis
const analyzeMarketPrice = async (crop, currentPrice, location, season) => {
  const system = `You are an agricultural market analyst specializing in Indian mandi prices and commodity markets.
  Respond in JSON: { analysis: string, trend: 'up'|'down'|'stable', recommendation: string, bestMarkets: [], expectedPrice30Days: number, sellNow: boolean, reasons: [] }`;

  const messages = [{
    role: 'user',
    content: `Crop: ${crop}\nCurrent Price: ₹${currentPrice}/quintal\nLocation: ${location}\nSeason: ${season}\n\nAnalyze and advise on selling strategy.`
  }];

  const raw = await callMistral(messages, system, 0.5);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return { rawResponse: raw };
  }
};

// 5. General Farming Chatbot
const farmingChatbot = async (question, conversationHistory = [], farmerProfile = {}) => {
  const system = `You are KisaanMitra, an AI assistant for Indian farmers. You are helpful, empathetic, and knowledgeable about:
  - Crop cultivation, diseases, pests
  - Weather impact on farming
  - Government schemes (PM-KISAN, Fasal Bima, Kisan Credit Card)
  - Market prices and MSP
  - Organic and modern farming techniques
  - Soil health and water management
  
  Farmer profile: ${JSON.stringify(farmerProfile)}
  
  Always be practical. If explaining complex things, use simple analogies. Respond in the language the farmer asks in (Hindi/English).
  Keep responses concise but complete. Add 1-2 actionable tips.`;

  const messages = [
    ...conversationHistory.slice(-6),
    { role: 'user', content: question }
  ];

  return await callMistral(messages, system, 0.7);
};

// 6. Weather-based farming advice
const getWeatherFarmingAdvice = async (weatherData, crops, location) => {
  const system = `You are a precision agriculture expert. Analyze weather and give specific farming advice.
  Respond in JSON: { alerts: [{severity: 'high'|'medium'|'low', message: string, action: string}], recommendations: [], bestTimeForActivities: {plowing: string, irrigation: string, spraying: string, harvesting: string} }`;

  const messages = [{
    role: 'user',
    content: `Location: ${location}\nWeather: ${JSON.stringify(weatherData)}\nCrops: ${crops.join(', ')}\n\nProvide weather-based farming advice.`
  }];

  const raw = await callMistral(messages, system, 0.4);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return { rawResponse: raw };
  }
};

// 7. Scheme finder
const findGovernmentSchemes = async (farmerProfile) => {
  const system = `You are an expert on Indian government agricultural schemes. 
  List relevant schemes for this farmer in JSON: { schemes: [{name, nameHindi, benefit, eligibility, howToApply, deadline, link, amount}] }`;

  const messages = [{
    role: 'user',
    content: `Find government schemes for: ${JSON.stringify(farmerProfile)}`
  }];

  const raw = await callMistral(messages, system, 0.3);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return { rawResponse: raw };
  }
};

module.exports = {
  diagnoseCropDisease,
  recommendCrops,
  getFertilizerAdvice,
  analyzeMarketPrice,
  farmingChatbot,
  getWeatherFarmingAdvice,
  findGovernmentSchemes
};