const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Drop any existing indexes before creating new ones
partnerSchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
partnerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Partner = mongoose.model('Partner', partnerSchema);

// Function to drop indexes - can be called when needed
const dropPartnerIndexes = async () => {
  try {
    await Partner.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  Partner,
  dropPartnerIndexes
}; 