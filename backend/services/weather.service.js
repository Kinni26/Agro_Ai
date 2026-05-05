// const axios = require('axios');

// const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// const getCurrentWeather = async (lat, lon) => {
//   const res = await axios.get(`${OWM_BASE}/weather`, {
//     params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', lang: 'en' }
//   });
//   return res.data;
// };

// const getForecast = async (lat, lon) => {
//   const res = await axios.get(`${OWM_BASE}/forecast`, {
//     params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', cnt: 40 }
//   });

//   // Group by day
//   const daily = {};
//   res.data.list.forEach(item => {
//     const date = item.dt_txt.split(' ')[0];
//     if (!daily[date]) {
//       daily[date] = { date, temps: [], descriptions: [], humidity: [], wind: [], rain: 0, icon: item.weather[0].icon };
//     }
//     daily[date].temps.push(item.main.temp);
//     daily[date].descriptions.push(item.weather[0].description);
//     daily[date].humidity.push(item.main.humidity);
//     daily[date].wind.push(item.wind.speed);
//     daily[date].rain += (item.rain?.['3h'] || 0);
//   });

//   return Object.values(daily).slice(0, 7).map(d => ({
//     date: d.date,
//     maxTemp: Math.max(...d.temps).toFixed(1),
//     minTemp: Math.min(...d.temps).toFixed(1),
//     avgHumidity: (d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length).toFixed(0),
//     description: d.descriptions[Math.floor(d.descriptions.length / 2)],
//     rain: d.rain.toFixed(1),
//     wind: (d.wind.reduce((a, b) => a + b, 0) / d.wind.length).toFixed(1),
//     icon: d.icon
//   }));
// };

// const getWeatherByCity = async (city) => {
//   const res = await axios.get(`${OWM_BASE}/weather`, {
//     params: { q: `${city},IN`, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' }
//   });
//   return res.data;
// };

// // Parse weather risk for farming
// const getWeatherRisk = (weatherData) => {
//   const risks = [];
//   if (weatherData.wind?.speed > 10) risks.push({ type: 'wind', level: 'high', message: 'High winds - avoid spraying pesticides' });
//   if (weatherData.main?.humidity > 85) risks.push({ type: 'humidity', level: 'medium', message: 'High humidity - fungal disease risk' });
//   if (weatherData.main?.temp > 40) risks.push({ type: 'heat', level: 'high', message: 'Extreme heat - increase irrigation frequency' });
//   if (weatherData.main?.temp < 10) risks.push({ type: 'cold', level: 'medium', message: 'Low temp - protect sensitive crops' });
//   return risks;
// };

// module.exports = { getCurrentWeather, getForecast, getWeatherByCity, getWeatherRisk };



const axios = require('axios');

// Open-Meteo - FREE, No API Key needed!
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Get coordinates from city name
const getCoordinates = async (city) => {
  const res = await axios.get(GEOCODING_URL, {
    params: { name: city, count: 1, language: 'en', format: 'json' }
  });
  const results = res.data.results;
  if (!results || results.length === 0) throw new Error('City not found');
  return { lat: results[0].latitude, lon: results[0].longitude, name: results[0].name, country: results[0].country };
};

// Get current weather + forecast
const getWeatherData = async (lat, lon) => {
  const res = await axios.get(WEATHER_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max',
      timezone: 'Asia/Kolkata',
      forecast_days: 7
    }
  });
  return res.data;
};

const getWeatherDesc = (code) => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫';
  if (code <= 67) return '🌧';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦';
  if (code <= 99) return '⛈';
  return '🌡';
};

const getCurrentWeather = async (lat, lon) => {
  const data = await getWeatherData(lat, lon);
  const current = data.current;
  return {
    main: {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      temp_max: data.daily.temperature_2m_max[0],
      temp_min: data.daily.temperature_2m_min[0],
      pressure: 1013
    },
    wind: { speed: current.wind_speed_10m },
    weather: [{ description: getWeatherDesc(current.weather_code), icon: getWeatherIcon(current.weather_code), main: getWeatherDesc(current.weather_code) }],
    clouds: { all: 0 },
    visibility: 10000,
    rain: { '1h': current.precipitation || 0 }
  };
};

const getForecast = async (lat, lon) => {
  const data = await getWeatherData(lat, lon);
  const daily = data.daily;
  return daily.time.map((date, i) => ({
    date,
    maxTemp: daily.temperature_2m_max[i]?.toFixed(1),
    minTemp: daily.temperature_2m_min[i]?.toFixed(1),
    avgHumidity: 60,
    description: getWeatherDesc(daily.weather_code[i]),
    icon: getWeatherIcon(daily.weather_code[i]),
    rain: (daily.precipitation_sum[i] || 0).toFixed(1),
    wind: daily.wind_speed_10m_max[i]?.toFixed(1)
  }));
};

const getWeatherByCity = async (city) => {
  const cleanCity = city.replace(/,\s*(India|IN)$/i, '').trim();
  const coords = await getCoordinates(cleanCity);
  const weather = await getCurrentWeather(coords.lat, coords.lon);
  return {
    ...weather,
    name: coords.name,
    coord: { lat: coords.lat, lon: coords.lon },
    sys: { country: coords.country, sunrise: 0, sunset: 0 }
  };
};

const getWeatherRisk = (weatherData) => {
  const risks = [];
  if (weatherData.wind?.speed > 10) risks.push({ type: 'wind', level: 'high', message: 'High winds - avoid spraying pesticides' });
  if (weatherData.main?.humidity > 85) risks.push({ type: 'humidity', level: 'medium', message: 'High humidity - fungal disease risk' });
  if (weatherData.main?.temp > 40) risks.push({ type: 'heat', level: 'high', message: 'Extreme heat - increase irrigation frequency' });
  if (weatherData.main?.temp < 10) risks.push({ type: 'cold', level: 'medium', message: 'Low temperature - protect sensitive crops' });
  return risks;
};

module.exports = { getCurrentWeather, getForecast, getWeatherByCity, getWeatherRisk, getCoordinates };