const mongoose = require('mongoose');

// Define a subdocument schema for gallery images that can handle both ObjectIds and URLs
const galleryImageReferenceSchema = new mongoose.Schema({
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GalleryImage',
    required: false // Now optional since we'll handle URLs too
  },
  // For direct Cloudinary URLs
  imageUrl: {
    type: String,
    required: false
  },
  // For Cloudinary ID extraction from URL
  cloudinaryId: {
    type: String,
    required: false
  },
  titleImage: {
    type: Boolean,
    default: false
  }
});

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
  eventDate: {
    type: Date,
  },
  // Cover image for the gallery - can be Cloudinary URL or ID
  coverImage: {
    type: String, // Cloudinary URL
    trim: true
  },
  // Cloudinary ID for the cover image (for easier management)
  coverImageId: {
    type: String, // Cloudinary public_id
    trim: true
  },
  images: [galleryImageReferenceSchema],
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

const Gallery = mongoose.model('Gallery', gallerySchema);

// Function to drop indexes - can be called when needed
const dropGalleryIndexes = async () => {
  try {
    await Gallery.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  Gallery,
  dropGalleryIndexes
}; 