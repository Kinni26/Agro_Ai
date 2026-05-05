const axios = require('axios');

const TAVILY_API_URL = 'https://api.tavily.com/search';

const searchFarmingNews = async (query, maxResults = 5) => {
  const response = await axios.post(TAVILY_API_URL, {
    api_key: process.env.TAVILY_API_KEY,
    query: `${query} farming agriculture India`,
    search_depth: 'basic',
    max_results: maxResults,
    include_answer: true,
    include_domains: ['agrifarming.in', 'krishijagran.com', 'agriculturetoday.in', 'weather.com'],
    topic: 'general'
  });
  return response.data;
};

const getMandiPrices = async (crop, state) => {
  const response = await axios.post(TAVILY_API_URL, {
    api_key: process.env.TAVILY_API_KEY,
    query: `${crop} mandi price today ${state} India 2024`,
    search_depth: 'basic',
    max_results: 5,
    include_answer: true
  });
  return response.data;
};

const getPestAlerts = async (crop, region) => {
  const response = await axios.post(TAVILY_API_URL, {
    api_key: process.env.TAVILY_API_KEY,
    query: `${crop} pest disease alert ${region} India`,
    search_depth: 'basic',
    max_results: 5,
    include_answer: true
  });
  return response.data;
};

const getAgriNews = async (topic = 'agriculture India') => {
  const response = await axios.post(TAVILY_API_URL, {
    api_key: process.env.TAVILY_API_KEY,
    query: `latest ${topic} news today`,
    search_depth: 'basic',
    max_results: 6,
    include_answer: false,
    topic: 'news'
  });
  return response.data;
};

module.exports = { searchFarmingNews, getMandiPrices, getPestAlerts, getAgriNews };