const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const GalleryImage = require('../models/GalleryImage'); // Uncommented and will be used
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const mongoose = require('mongoose');

// GET all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (err) {
    console.error('Error fetching galleries:', err.message);
    res.status(500).json({ message: 'Failed to fetch galleries', error: err.message });
  }
});

// GET a single gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    // Optionally populate images if you have a direct reference in Gallery model
    // const gallery = await Gallery.findById(req.params.id).populate('images'); 
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.json(gallery);
  } catch (err) {
    console.error(`Error fetching gallery ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid gallery ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch gallery', error: err.message });
  }
});

// POST (create) a new gallery
router.post('/', async (req, res) => {
  const { name, description, coverImage, images, eventDate } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Gallery name is required' });
  }

  try {
    // Convert string image IDs to ObjectIds if they exist
    const imageObjectIds = images ? images.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (err) {
        throw new Error(`Invalid image ID format: ${id}`);
      }
    }) : [];

    // Create gallery without explicitly setting _id
    const galleryData = {
      name,
      description,
      coverImage,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      images: imageObjectIds,
    };

    const newGallery = new Gallery(galleryData);
    const savedGallery = await newGallery.save();
    
    // Populate the images field before sending response
    const populatedGallery = await Gallery.findById(savedGallery._id).populate('images');
    res.status(201).json(populatedGallery);
  } catch (err) {
    console.error('Error creating gallery:', err);
    if (err.name === 'CastError' || err.message.includes('Invalid image ID format')) {
      return res.status(400).json({ message: err.message || 'Invalid image ID format' });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create gallery', error: err.message });
  }
});

// PUT (update) a gallery by ID
router.put('/:id', async (req, res) => {
  const { name, description, coverImage, images } = req.body;
  try {
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { name, description, coverImage, images, updatedAt: Date.now() },
      { new: true, runValidators: true } // new: true returns the updated doc, runValidators ensures schema rules apply
    );
    if (!updatedGallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.json(updatedGallery);
  } catch (err) {
    console.error(`Error updating gallery ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid gallery ID format' });
    }
    res.status(500).json({ message: 'Failed to update gallery', error: err.message });
  }
});

// DELETE a gallery by ID
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Find all GalleryImage documents associated with this gallery
    const images = await GalleryImage.find({ gallery: req.params.id });

    // Collect Cloudinary public_ids for deletion
    const cloudinaryIds = images.map(image => image.cloudinaryId);

    // Delete images from Cloudinary if any exist
    // cloudinary.api.delete_resources takes an array of public_ids
    if (cloudinaryIds.length > 0) {
      // We need to ensure cloudinary is configured. It should be from api/index.js
      // but it's good practice to have it available if routes are truly modular.
      // For this setup, global config is fine.
      const deletionResults = await cloudinary.api.delete_resources(cloudinaryIds);
      // Optional: Check deletionResults for errors from Cloudinary
      // console.log('Cloudinary deletion results:', deletionResults);
      
      // Check for any errors in the Cloudinary deletion response
      // The response structure for delete_resources includes a `deleted` object 
      // and an `errors` array for partial failures.
      // Example: { deleted: { 'id1': 'deleted', 'id2': 'not_found' }, errors: [] }
      // We should be careful here as an error in deleting one image shouldn't stop others
      // For simplicity, we'll log if there are general issues.
      // A more robust solution would iterate results and handle individual failures.
      if (deletionResults && Object.values(deletionResults.deleted).some(status => status === 'not_found')){
          console.warn('Some images were not found in Cloudinary during gallery deletion:', deletionResults.deleted);
      }
      // You might also want to check `deletionResults.errors` if that field exists and is populated
    }

    // Delete GalleryImage documents from MongoDB
    await GalleryImage.deleteMany({ gallery: req.params.id });

    // Finally, delete the gallery itself
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Gallery and all associated images deleted successfully' });
  } catch (err) {
    console.error(`Error deleting gallery ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid gallery ID format' });
    }
    res.status(500).json({ message: 'Failed to delete gallery', error: err.message });
  }
});

module.exports = router; 