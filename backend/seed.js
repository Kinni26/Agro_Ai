const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User.model');
const Crop = require('./models/Crop.model');
const Post = require('./models/Post.model');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Crop.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑 Cleared existing data');

    const user = await User.create({
      name: 'Ram Kumar Sharma',
      phone: '9876543210',
      password: 'demo123',
      location: { state: 'Madhya Pradesh', district: 'Bhopal', village: 'Berasia', pincode: '462038' },
      farmDetails: { landSize: 5, soilType: 'Black (काली)', primaryCrops: ['Wheat/गेहूं', 'Soybean/सोयाबीन'], irrigationType: 'Drip' },
      language: 'hindi'
    });
    console.log('✅ Demo user created: phone=9876543210, password=demo123');

    await Crop.create([
      {
        farmer: user._id, cropName: 'Wheat/गेहूं', variety: 'HI-8498',
        sowingDate: new Date('2023-11-15'), area: 3, areaUnit: 'acres',
        status: 'growing', soilHealth: { ph: 7.2 },
        aiRecommendations: ['Apply Urea 50kg/acre at tillering stage', 'Irrigate every 10 days']
      },
      {
        farmer: user._id, cropName: 'Soybean/सोयाबीन', variety: 'JS-335',
        sowingDate: new Date('2023-06-20'), area: 2, areaUnit: 'acres',
        status: 'harvested', soilHealth: { ph: 6.8 }
      }
    ]);
    console.log('✅ Demo crops created');

    await Post.create([
      {
        author: user._id,
        title: 'गेहूं में पीली पत्तियां — क्या करें?',
        content: 'मेरे गेहूं की फसल में पत्तियां नीचे से पीली हो रही हैं। 20 दिन पहले बुवाई की थी। क्या यह नाइट्रोजन की कमी है?',
        category: 'query',
        tags: ['गेहूं', 'पीली पत्ती', 'रोग'],
        aiAnswer: 'आपकी समस्या नाइट्रोजन की कमी के लक्षण दिखाती है। प्रति एकड़ 50 किलो यूरिया डालें।',
        likes: [],
        views: 45
      },
      {
        author: user._id,
        title: '🏆 जैविक खेती से ₹2 लाख कमाए',
        content: 'इस साल मैंने 3 एकड़ में जैविक सब्जियां उगाईं और ₹2 लाख कमाए!',
        category: 'success',
        tags: ['जैविक', 'सफलता'],
        likes: [],
        views: 120
      }
    ]);
    console.log('✅ Demo community posts created');

    console.log('\n🌾 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Login: Phone: 9876543210 | Password: demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();