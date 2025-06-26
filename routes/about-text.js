const express = require('express');
const router = express.Router();
const { AboutText, dropAboutTextIndexes } = require('../models/AboutText');

// Drop indexes when the server starts
dropAboutTextIndexes().catch(console.error);

// GET about text
router.get('/', async (req, res) => {
  try {
    // Get the first (and should be only) about text document
    const aboutText = await AboutText.findOne().sort({ createdAt: -1 });

    if (!aboutText) {
      return res.json({ text: null });
    }

    res.json({ text: aboutText.text });
  } catch (err) {
    console.error('Error fetching about text:', err.message);
    res.status(500).json({ message: 'Failed to fetch about text', error: err.message });
  }
});

// PUT (create or update) about text
router.put('/', async (req, res) => {
  const { text } = req.body;
  
  // Validate required fields
  if (!text) {
    return res.status(400).json({ message: 'About text content is required' });
  }

  try {
    // Use findOneAndUpdate with upsert to create if doesn't exist, update if exists
    const aboutText = await AboutText.findOneAndUpdate(
      {}, // empty filter to match any document
      { 
        text,
        updatedAt: Date.now()
      },
      { 
        new: true, 
        upsert: true, // create if doesn't exist
        runValidators: true 
      }
    );

    res.json(aboutText);
  } catch (err) {
    console.error('Error updating about text:', err);
    res.status(500).json({ message: 'Failed to update about text', error: err.message });
  }
});

module.exports = router; 