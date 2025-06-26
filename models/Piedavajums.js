const mongoose = require('mongoose');

const piedavajumsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  additionalTitle: {
    type: String,
    trim: true
  },
  additionalDescription: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Drop any existing indexes before creating new ones
piedavajumsSchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
piedavajumsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Piedavajums = mongoose.model('Piedavajums', piedavajumsSchema);

// Function to drop indexes - can be called when needed
const dropPiedavajumsIndexes = async () => {
  try {
    await Piedavajums.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  Piedavajums,
  dropPiedavajumsIndexes
}; 