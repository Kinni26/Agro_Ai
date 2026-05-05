const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  location: {
    state: String,
    district: String,
    village: String,
    pincode: String,
    lat: Number,
    lon: Number
  },
  farmDetails: {
    landSize: Number,
    landUnit: { type: String, default: 'acres' },
    soilType: String,
    primaryCrops: [String],
    irrigationType: String
  },
  language: { type: String, default: 'hindi' },
  avatar: String,
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);