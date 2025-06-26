const mongoose = require('mongoose');

const aboutTextSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Drop any existing indexes before creating new ones
aboutTextSchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
aboutTextSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const AboutText = mongoose.model('AboutText', aboutTextSchema);

// Function to drop indexes - can be called when needed
const dropAboutTextIndexes = async () => {
  try {
    await AboutText.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  AboutText,
  dropAboutTextIndexes
}; 