const express = require('express');
const router = express.Router();
const { Gallery, dropGalleryIndexes } = require('../models/Gallery');
const GalleryImage = require('../models/GalleryImage'); // Uncommented and will be used
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const mongoose = require('mongoose');

// Drop indexes when the server starts
dropGalleryIndexes().catch(console.error);

// Helper function to extract Cloudinary ID from URL
function extractCloudinaryIdFromUrl(url) {
  try {
    // Handle different Cloudinary URL formats
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      // Get everything after 'upload/v1234567890/'
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      // Remove file extension
      const cloudinaryId = pathAfterUpload.split('.')[0];
      return cloudinaryId;
    }
    
    // Fallback: try to get the last part before extension
    const filenameWithExt = urlParts[urlParts.length - 1];
    return filenameWithExt.split('.')[0];
  } catch (error) {
    console.error('Error extracting Cloudinary ID from URL:', error);
    return null;
  }
}

// GET all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'images.image',
        select: 'imageUrl cloudinaryId caption uploadedAt cloudinaryData',
        transform: (doc) => ({
          id: doc._id.toString(),
          url: doc.imageUrl,
          cloudinaryId: doc.cloudinaryId,
          title: doc.caption,
          description: doc.caption,
          uploadedAt: doc.uploadedAt,
          cloudinaryData: doc.cloudinaryData
        })
      });

    // Transform the response to include titleImage
    const transformedGalleries = galleries.map(gallery => ({
      ...gallery.toObject(),
      images: gallery.images.map(img => ({
        ...img.image,
        titleImage: img.titleImage
      }))
    }));

    res.json(transformedGalleries);
  } catch (err) {
    console.error('Error fetching galleries:', err.message);
    res.status(500).json({ message: 'Failed to fetch galleries', error: err.message });
  }
});

// GET a single gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate({
        path: 'images.image',
        select: 'imageUrl cloudinaryId caption uploadedAt cloudinaryData',
        transform: (doc) => ({
          id: doc._id.toString(),
          url: doc.imageUrl,
          cloudinaryId: doc.cloudinaryId,
          title: doc.caption,
          description: doc.caption,
          uploadedAt: doc.uploadedAt,
          cloudinaryData: doc.cloudinaryData
        })
      });

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Transform the response to include titleImage
    const transformedGallery = {
      ...gallery.toObject(),
      images: gallery.images.map(img => ({
        ...img.image,
        titleImage: img.titleImage
      }))
    };

    res.json(transformedGallery);
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
  const { name, coverImage, coverImageId, images, eventDate } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Gallery name is required' });
  }

  try {
    // Process images array - handle both URLs and ObjectIds
    const imageObjects = [];
    
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        if (typeof img === 'string') {
          // If it's a Cloudinary URL, create a GalleryImage document
          if (img.includes('cloudinary.com')) {
            // Extract Cloudinary ID from URL
            const cloudinaryId = extractCloudinaryIdFromUrl(img);
            if (!cloudinaryId) {
              throw new Error(`Invalid Cloudinary URL: ${img}`);
            }
            
            // Create new GalleryImage document
            const newImage = new GalleryImage({
              cloudinaryId: cloudinaryId,
              imageUrl: img,
              cloudinaryData: {
                public_id: cloudinaryId,
                format: img.split('.').pop() || 'jpg',
                resource_type: 'image'
              },
              order: i,
              caption: `Image ${i + 1}`
            });
            
            const savedImage = await newImage.save();
            
            imageObjects.push({
              image: savedImage._id,
              titleImage: i === 0 // First image is title image by default
            });
          } else {
            // Assume it's an ObjectId string
            imageObjects.push({
              image: new mongoose.Types.ObjectId(img),
              titleImage: i === 0
            });
          }
        } else if (typeof img === 'object') {
          // Handle object format
          if (img.url && img.url.includes('cloudinary.com')) {
            // Create GalleryImage from URL
            const cloudinaryId = extractCloudinaryIdFromUrl(img.url);
            if (!cloudinaryId) {
              throw new Error(`Invalid Cloudinary URL: ${img.url}`);
            }
            
            const newImage = new GalleryImage({
              cloudinaryId: cloudinaryId,
              imageUrl: img.url,
              cloudinaryData: {
                public_id: cloudinaryId,
                format: img.url.split('.').pop() || 'jpg',
                resource_type: 'image'
              },
              order: i,
              caption: img.caption || `Image ${i + 1}`
            });
            
            const savedImage = await newImage.save();
            
            imageObjects.push({
              image: savedImage._id,
              titleImage: img.titleImage || i === 0
            });
          } else {
            // Handle ObjectId reference
            const imageId = img.id || img.image;
            if (!imageId) {
              throw new Error('Image ID is required for each image object');
            }
            imageObjects.push({
              image: new mongoose.Types.ObjectId(imageId),
              titleImage: img.titleImage || i === 0
            });
          }
        }
      }
    }

    const galleryData = {
      name,
      coverImage,
      coverImageId,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      images: imageObjects,
    };

    const newGallery = new Gallery(galleryData);
    const savedGallery = await newGallery.save();
    
    // Populate the images field before sending response
    const populatedGallery = await Gallery.findById(savedGallery._id)
      .populate({
        path: 'images.image',
        select: 'imageUrl cloudinaryId caption uploadedAt cloudinaryData',
        transform: (doc) => ({
          id: doc._id.toString(),
          url: doc.imageUrl,
          cloudinaryId: doc.cloudinaryId,
          title: doc.caption,
          description: doc.caption,
          uploadedAt: doc.uploadedAt,
          cloudinaryData: doc.cloudinaryData
        })
      });

    // Transform the response to include titleImage
    const transformedGallery = {
      ...populatedGallery.toObject(),
      images: populatedGallery.images.map(img => ({
        ...img.image,
        titleImage: img.titleImage
      }))
    };

    res.status(201).json(transformedGallery);
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
  const { name, coverImage, coverImageId, images, eventDate } = req.body;
  try {
    // Process images array - handle both URLs and ObjectIds
    const imageObjects = [];
    
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        if (typeof img === 'string') {
          // If it's a Cloudinary URL, create a GalleryImage document
          if (img.includes('cloudinary.com')) {
            // Extract Cloudinary ID from URL
            const cloudinaryId = extractCloudinaryIdFromUrl(img);
            if (!cloudinaryId) {
              throw new Error(`Invalid Cloudinary URL: ${img}`);
            }
            
            // Create new GalleryImage document
            const newImage = new GalleryImage({
              cloudinaryId: cloudinaryId,
              imageUrl: img,
              cloudinaryData: {
                public_id: cloudinaryId,
                format: img.split('.').pop() || 'jpg',
                resource_type: 'image'
              },
              order: i,
              caption: `Image ${i + 1}`
            });
            
            const savedImage = await newImage.save();
            
            imageObjects.push({
              image: savedImage._id,
              titleImage: i === 0 // First image is title image by default
            });
          } else {
            // Assume it's an ObjectId string
            imageObjects.push({
              image: new mongoose.Types.ObjectId(img),
              titleImage: i === 0
            });
          }
        } else if (typeof img === 'object') {
          // Handle object format
          if (img.url && img.url.includes('cloudinary.com')) {
            // Create GalleryImage from URL
            const cloudinaryId = extractCloudinaryIdFromUrl(img.url);
            if (!cloudinaryId) {
              throw new Error(`Invalid Cloudinary URL: ${img.url}`);
            }
            
            const newImage = new GalleryImage({
              cloudinaryId: cloudinaryId,
              imageUrl: img.url,
              cloudinaryData: {
                public_id: cloudinaryId,
                format: img.url.split('.').pop() || 'jpg',
                resource_type: 'image'
              },
              order: i,
              caption: img.caption || `Image ${i + 1}`
            });
            
            const savedImage = await newImage.save();
            
            imageObjects.push({
              image: savedImage._id,
              titleImage: img.titleImage || i === 0
            });
          } else {
            // Handle ObjectId reference
            const imageId = img.id || img.image;
            if (!imageId) {
              throw new Error('Image ID is required for each image object');
            }
            imageObjects.push({
              image: new mongoose.Types.ObjectId(imageId),
              titleImage: img.titleImage || i === 0
            });
          }
        }
      }
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        coverImage, 
        coverImageId,
        images: imageObjects,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'images.image',
      select: 'imageUrl cloudinaryId caption uploadedAt cloudinaryData',
      transform: (doc) => ({
        id: doc._id.toString(),
        url: doc.imageUrl,
        cloudinaryId: doc.cloudinaryId,
        title: doc.caption,
        description: doc.caption,
        uploadedAt: doc.uploadedAt,
        cloudinaryData: doc.cloudinaryData
      })
    });

    if (!updatedGallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Transform the response to include titleImage
    const transformedGallery = {
      ...updatedGallery.toObject(),
      images: updatedGallery.images.map(img => ({
        ...img.image,
        titleImage: img.titleImage
      }))
    };

    res.json(transformedGallery);
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