const mongoose = require('mongoose');

const piedavajumsHeaderSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  header: {
    type: String,
    required: true,
    trim: true
  },
  introParagraph1: {
    type: String,
    required: true,
    trim: true
  },
  introParagraph2: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Drop any existing indexes before creating new ones
piedavajumsHeaderSchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
piedavajumsHeaderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const PiedavajumsHeader = mongoose.model('PiedavajumsHeader', piedavajumsHeaderSchema);

// Function to drop indexes - can be called when needed
const dropPiedavajumsHeaderIndexes = async () => {
  try {
    await PiedavajumsHeader.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  PiedavajumsHeader,
  dropPiedavajumsHeaderIndexes
}; 