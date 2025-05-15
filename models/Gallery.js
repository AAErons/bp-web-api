const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
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

// Middleware to update 'updatedAt' field before saving
gallerySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// If you have a method that updates (like findOneAndUpdate), 
// you might want to ensure updatedAt is updated there too.
// gallerySchema.pre('findOneAndUpdate', function(next) {
//   this.set({ updatedAt: new Date() });
//   next();
// });

module.exports = mongoose.model('Gallery', gallerySchema); 