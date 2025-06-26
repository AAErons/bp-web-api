const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamMemberSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  id: {
    type: String,
    unique: true,
    default: () => uuidv4(),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  smallImage: {
    type: String,
    required: true,
    trim: true,
  },
  fullImage: {
    type: String,
    required: true,
    trim: true,
  },
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
teamMemberSchema.index({ _id: 1 }, { unique: true });
teamMemberSchema.index({ id: 1 }, { unique: true });

// Middleware to update 'updatedAt' field before saving
teamMemberSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

// Function to drop indexes - can be called when needed
const dropTeamMemberIndexes = async () => {
  try {
    await TeamMember.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) { // Ignore "namespace not found" error
      console.error('Error dropping indexes:', err);
    }
  }
};

// Export both the model and the dropIndexes function
module.exports = {
  TeamMember,
  dropTeamMemberIndexes
}; 