const express = require('express');
const router = express.Router();
const { Piedavajums, dropPiedavajumsIndexes } = require('../models/Piedavajums');
const { PiedavajumsHeader, dropPiedavajumsHeaderIndexes } = require('../models/PiedavajumsHeader');

// Drop indexes when the server starts
dropPiedavajumsIndexes().catch(console.error);
dropPiedavajumsHeaderIndexes().catch(console.error);

// GET all piedavajumi
router.get('/', async (req, res) => {
  try {
    const piedavajumi = await Piedavajums.find()
      .sort({ createdAt: -1 });

    res.json(piedavajumi);
  } catch (err) {
    console.error('Error fetching piedavajumi:', err.message);
    res.status(500).json({ message: 'Failed to fetch piedavajumi', error: err.message });
  }
});

// GET piedavajums header/intro (must come before /:id route)
router.get('/header', async (req, res) => {
  try {
    // Get the first (and should be only) header document
    const header = await PiedavajumsHeader.findOne().sort({ createdAt: -1 });

    if (!header) {
      return res.json({
        header: '',
        introParagraph1: '',
        introParagraph2: ''
      });
    }

    res.json(header);
  } catch (err) {
    console.error('Error fetching piedavajums header:', err.message);
    res.status(500).json({ message: 'Failed to fetch piedavajums header', error: err.message });
  }
});

// PUT (create or update) piedavajums header/intro (must come before /:id route)
router.put('/header', async (req, res) => {
  const { header, introParagraph1, introParagraph2 } = req.body;
  
  // Validate required fields
  if (!header) {
    return res.status(400).json({ message: 'Header is required' });
  }
  if (!introParagraph1) {
    return res.status(400).json({ message: 'Intro paragraph 1 is required' });
  }
  if (!introParagraph2) {
    return res.status(400).json({ message: 'Intro paragraph 2 is required' });
  }

  try {
    // Use findOneAndUpdate with upsert to create if doesn't exist, update if exists
    const updatedHeader = await PiedavajumsHeader.findOneAndUpdate(
      {}, // empty filter to match any document
      { 
        header,
        introParagraph1,
        introParagraph2,
        updatedAt: Date.now()
      },
      { 
        new: true, 
        upsert: true, // create if doesn't exist
        runValidators: true 
      }
    );

    res.json(updatedHeader);
  } catch (err) {
    console.error('Error updating piedavajums header:', err);
    res.status(500).json({ message: 'Failed to update piedavajums header', error: err.message });
  }
});

// GET a single piedavajums by ID
router.get('/:id', async (req, res) => {
  try {
    const piedavajums = await Piedavajums.findById(req.params.id);

    if (!piedavajums) {
      return res.status(404).json({ message: 'Piedavajums not found' });
    }

    res.json(piedavajums);
  } catch (err) {
    console.error(`Error fetching piedavajums ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid piedavajums ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch piedavajums', error: err.message });
  }
});

// POST (create) a new piedavajums
router.post('/', async (req, res) => {
  const { title, duration, description, additionalTitle, additionalDescription, image } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!duration) {
    return res.status(400).json({ message: 'Duration is required' });
  }
  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }
  if (!additionalTitle) {
    return res.status(400).json({ message: 'Additional title is required' });
  }
  if (!additionalDescription) {
    return res.status(400).json({ message: 'Additional description is required' });
  }
  if (!image) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  try {
    const piedavajumsData = {
      title,
      duration,
      description,
      additionalTitle,
      additionalDescription,
      image,
    };

    const newPiedavajums = new Piedavajums(piedavajumsData);
    const savedPiedavajums = await newPiedavajums.save();

    res.status(201).json(savedPiedavajums);
  } catch (err) {
    console.error('Error creating piedavajums:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create piedavajums', error: err.message });
  }
});

// PUT (update) a piedavajums by ID
router.put('/:id', async (req, res) => {
  const { title, duration, description, additionalTitle, additionalDescription, image } = req.body;
  
  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (duration !== undefined) updateData.duration = duration;
    if (description !== undefined) updateData.description = description;
    if (additionalTitle !== undefined) updateData.additionalTitle = additionalTitle;
    if (additionalDescription !== undefined) updateData.additionalDescription = additionalDescription;
    if (image !== undefined) updateData.image = image;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = Date.now();

    const updatedPiedavajums = await Piedavajums.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPiedavajums) {
      return res.status(404).json({ message: 'Piedavajums not found' });
    }

    res.json(updatedPiedavajums);
  } catch (err) {
    console.error(`Error updating piedavajums ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid piedavajums ID format' });
    }
    res.status(500).json({ message: 'Failed to update piedavajums', error: err.message });
  }
});

// DELETE a piedavajums by ID
router.delete('/:id', async (req, res) => {
  try {
    const piedavajums = await Piedavajums.findById(req.params.id);
    if (!piedavajums) {
      return res.status(404).json({ message: 'Piedavajums not found' });
    }

    await Piedavajums.findByIdAndDelete(req.params.id);
    
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting piedavajums ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid piedavajums ID format' });
    }
    res.status(500).json({ message: 'Failed to delete piedavajums', error: err.message });
  }
});

module.exports = router; 