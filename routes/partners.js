const express = require('express');
const router = express.Router();
const { Partner, dropPartnerIndexes } = require('../models/Partner');

// Drop indexes when the server starts
dropPartnerIndexes().catch(console.error);

// GET all partners
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find()
      .sort({ createdAt: -1 });

    res.json(partners);
  } catch (err) {
    console.error('Error fetching partners:', err.message);
    res.status(500).json({ message: 'Failed to fetch partners', error: err.message });
  }
});

// GET a single partner by ID
router.get('/:id', async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(partner);
  } catch (err) {
    console.error(`Error fetching partner ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch partner', error: err.message });
  }
});

// POST (create) a new partner
router.post('/', async (req, res) => {
  const { name, logo } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Partner name is required' });
  }
  if (!logo) {
    return res.status(400).json({ message: 'Partner logo URL is required' });
  }

  try {
    const partnerData = {
      name,
      logo,
    };

    const newPartner = new Partner(partnerData);
    const savedPartner = await newPartner.save();

    res.status(201).json(savedPartner);
  } catch (err) {
    console.error('Error creating partner:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create partner', error: err.message });
  }
});

// PUT (update) a partner by ID
router.put('/:id', async (req, res) => {
  const { name, logo } = req.body;
  
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = Date.now();

    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json(updatedPartner);
  } catch (err) {
    console.error(`Error updating partner ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }
    res.status(500).json({ message: 'Failed to update partner', error: err.message });
  }
});

// DELETE a partner by ID
router.delete('/:id', async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    await Partner.findByIdAndDelete(req.params.id);
    
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting partner ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }
    res.status(500).json({ message: 'Failed to delete partner', error: err.message });
  }
});

module.exports = router; 