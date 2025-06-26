const mongoose = require('mongoose');
const { Piedavajums } = require('./models/Piedavajums');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function migratePiedavajumiOrder() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all piedavajumi sorted by creation date
    const piedavajumi = await Piedavajums.find().sort({ createdAt: 1 });
    console.log(`Found ${piedavajumi.length} piedavajumi to migrate`);

    // Update order for each piedavajums
    for (let i = 0; i < piedavajumi.length; i++) {
      await Piedavajums.findByIdAndUpdate(piedavajumi[i]._id, { order: i });
      console.log(`Updated piedavajums "${piedavajumi[i].title}" with order: ${i}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migratePiedavajumiOrder();
}

module.exports = migratePiedavajumiOrder; 