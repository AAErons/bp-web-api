const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  testimonial: {
    type: String,
    required: true,
    trim: true
  },
  signature: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Drop any existing indexes before creating new ones
testimonialSchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
testimonialSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Function to drop indexes - can be called when needed
const dropTestimonialIndexes = async () => {
  try {
    await Testimonial.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  Testimonial,
  dropTestimonialIndexes
}; 