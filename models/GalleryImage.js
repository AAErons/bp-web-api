const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  gallery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallery',
    required: false, // Now optional
  },
  cloudinaryId: {
    type: String,
    required: true, // The public_id from Cloudinary
  },
  imageUrl: {
    type: String,
    required: true, // The secure_url from Cloudinary
  },
  caption: {
    type: String,
    trim: true,
  },
  order: {
    type: Number, // For ordering images within a gallery
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GalleryImage', galleryImageSchema); 