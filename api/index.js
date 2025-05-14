require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Import routes
const galleryRoutes = require('../routes/galleries');
const imageRoutes = require('../routes/images');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });

// Basic Route
app.get('/', (req, res) => {
  res.send('Gallery API Backend is running!');
});

app.get('/api', (req, res) => {
  res.send('Gallery API Backend is running! (from /api)');
});

// Mount routes
app.use('/api/galleries', galleryRoutes);
app.use('/api/images', imageRoutes);

// Global error handler (optional, can be more sophisticated)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app for Vercel
module.exports = app;

// Start server only if not in Vercel environment (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} 