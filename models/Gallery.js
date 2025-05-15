const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  eventDate: {
    type: Date,
  },
  // Optional: A cover image for the gallery (Cloudinary ID or URL)
  coverImage: {
    type: String, // Could be a Cloudinary public_id or a full URL
  },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GalleryImage' }], // New field for image references
  // Optional: To store image IDs belonging to this gallery directly if not using a separate Image collection for references
  // images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GalleryImage' }], 
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
gallerySchema.index({ _id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
gallerySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Drop any existing indexes on the collection
Gallery.collection.dropIndexes().catch(err => {
  if (err.code !== 26) { // Ignore "namespace not found" error
    console.error('Error dropping indexes:', err);
  }
});

module.exports = mongoose.model('Gallery', gallerySchema); 