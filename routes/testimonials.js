const express = require('express');
const router = express.Router();
const { Testimonial, dropTestimonialIndexes } = require('../models/Testimonial');

// Drop indexes when the server starts
dropTestimonialIndexes().catch(console.error);

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 });

    res.json(testimonials);
  } catch (err) {
    console.error('Error fetching testimonials:', err.message);
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
});

// GET a single testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (err) {
    console.error(`Error fetching testimonial ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid testimonial ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch testimonial', error: err.message });
  }
});

// POST (create) a new testimonial
router.post('/', async (req, res) => {
  const { company, testimonial, signature } = req.body;
  
  // Validate required fields
  if (!company) {
    return res.status(400).json({ message: 'Company name is required' });
  }
  if (!testimonial) {
    return res.status(400).json({ message: 'Testimonial content is required' });
  }
  if (!signature) {
    return res.status(400).json({ message: 'Signature is required' });
  }

  try {
    const testimonialData = {
      company,
      testimonial,
      signature,
    };

    const newTestimonial = new Testimonial(testimonialData);
    const savedTestimonial = await newTestimonial.save();

    res.status(201).json(savedTestimonial);
  } catch (err) {
    console.error('Error creating testimonial:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create testimonial', error: err.message });
  }
});

// PUT (update) a testimonial by ID
router.put('/:id', async (req, res) => {
  const { company, testimonial, signature } = req.body;
  
  try {
    const updateData = {};
    if (company !== undefined) updateData.company = company;
    if (testimonial !== undefined) updateData.testimonial = testimonial;
    if (signature !== undefined) updateData.signature = signature;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = Date.now();

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(updatedTestimonial);
  } catch (err) {
    console.error(`Error updating testimonial ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid testimonial ID format' });
    }
    res.status(500).json({ message: 'Failed to update testimonial', error: err.message });
  }
});

// DELETE a testimonial by ID
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting testimonial ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid testimonial ID format' });
    }
    res.status(500).json({ message: 'Failed to delete testimonial', error: err.message });
  }
});

module.exports = router; 