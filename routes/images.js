const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const GalleryImage = require('../models/GalleryImage');
const Gallery = require('../models/Gallery'); // To validate gallery existence

// Configure Cloudinary (ensure it's configured in api/index.js as well)
// Redundant if already configured globally, but good for clarity if routes are modularized heavily
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and filename for Cloudinary
    // It's good practice to store images in folders, perhaps by gallery ID or type
    let folder = 'gallery_images';
    if (req.params.galleryId) { // if galleryId is part of the route for upload
      folder = `galleries/${req.params.galleryId}`;
    }
    return {
      folder: folder,
      // public_id: file.originalname, // Optional: use original name or generate a unique one
      format: 'jpg', // or png, etc. Cloudinary can auto-detect or convert
      // transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: transform images on upload
    };
  },
});

const upload = multer({ storage: storage });

// POST (upload) a new image (no gallery required)
router.post('/', upload.single('imageFile'), async (req, res) => {
  const { caption, order } = req.body;

  // Log the file object returned by multer-storage-cloudinary
  console.log('Cloudinary upload result:', req.file);

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const newImage = new GalleryImage({
      cloudinaryId: req.file.filename, // This is the public_id from CloudinaryStorage
      imageUrl: req.file.path,       // This is the secure_url from CloudinaryStorage
      caption,
      order,
    });

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (err) {
    console.error('Error uploading image:', err.message);
    // If there was an error saving to DB, but file was uploaded, delete from Cloudinary
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cldErr) {
        console.error('Error deleting image from Cloudinary after DB error:', cldErr.message);
      }
    }
    res.status(500).json({ message: 'Failed to upload image', error: err.message });
  }
});

// GET all images for a specific gallery
router.get('/gallery/:galleryId', async (req, res) => {
  try {
    const images = await GalleryImage.find({ gallery: req.params.galleryId }).sort({ order: 1, uploadedAt: 1 });
    res.json(images);
  } catch (err) {
    console.error('Error fetching images for gallery:', err.message);
    res.status(500).json({ message: 'Failed to fetch images', error: err.message });
  }
});

// GET a single image by its ID
router.get('/:imageId', async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  } catch (err) {
    console.error('Error fetching image:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid image ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch image', error: err.message });
  }
});

// PUT (update) image details (e.g., caption, order)
router.put('/:imageId', async (req, res) => {
  const { caption, order } = req.body;
  try {
    // Add updatedAt logic if you have that field in the model
    const updatedImage = await GalleryImage.findByIdAndUpdate(
      req.params.imageId,
      { caption, order /*, updatedAt: Date.now() */ },
      { new: true, runValidators: true }
    );
    if (!updatedImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(updatedImage);
  } catch (err) {
    console.error('Error updating image:', err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid image ID format' });
    }
    res.status(500).json({ message: 'Failed to update image', error: err.message });
  }
});

// DELETE an image by its ID
router.delete('/:imageId', async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryId);

    // Delete from MongoDB
    await GalleryImage.findByIdAndDelete(req.params.imageId);

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err.message);
    // Check for ObjectId error specifically for more granular client feedback
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid image ID format' });
    }
    res.status(500).json({ message: 'Failed to delete image', error: err.message });
  }
});

module.exports = router; 