const express = require('express');
const router = express.Router();
const { TeamMember, dropTeamMemberIndexes } = require('../models/TeamMember');

// Drop indexes when the server starts
dropTeamMemberIndexes().catch(console.error);

// GET all team members
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find()
      .sort({ createdAt: -1 });

    res.json(teamMembers);
  } catch (err) {
    console.error('Error fetching team members:', err.message);
    res.status(500).json({ message: 'Failed to fetch team members', error: err.message });
  }
});

// GET a single team member by ID
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json(teamMember);
  } catch (err) {
    console.error(`Error fetching team member ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid team member ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch team member', error: err.message });
  }
});

// POST (create) a new team member
router.post('/', async (req, res) => {
  const { name, description, smallImage, fullImage } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Team member name is required' });
  }
  if (!description) {
    return res.status(400).json({ message: 'Team member description is required' });
  }
  if (!smallImage) {
    return res.status(400).json({ message: 'Small image URL is required' });
  }
  if (!fullImage) {
    return res.status(400).json({ message: 'Full image URL is required' });
  }

  try {
    const teamMemberData = {
      name,
      description,
      smallImage,
      fullImage,
    };

    const newTeamMember = new TeamMember(teamMemberData);
    const savedTeamMember = await newTeamMember.save();

    res.status(201).json(savedTeamMember);
  } catch (err) {
    console.error('Error creating team member:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create team member', error: err.message });
  }
});

// PUT (update) a team member by ID
router.put('/:id', async (req, res) => {
  const { name, description, smallImage, fullImage } = req.body;
  
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (smallImage !== undefined) updateData.smallImage = smallImage;
    if (fullImage !== undefined) updateData.fullImage = fullImage;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = Date.now();

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json(updatedTeamMember);
  } catch (err) {
    console.error(`Error updating team member ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid team member ID format' });
    }
    res.status(500).json({ message: 'Failed to update team member', error: err.message });
  }
});

// DELETE a team member by ID
router.delete('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    await TeamMember.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    console.error(`Error deleting team member ${req.params.id}:`, err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid team member ID format' });
    }
    res.status(500).json({ message: 'Failed to delete team member', error: err.message });
  }
});

module.exports = router; 