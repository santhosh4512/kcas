const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kcas_department_db';
    const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('mongodb.net');

    if (isAtlas) {
      console.log(`🌐 Connecting to MongoDB Atlas Cluster...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Atlas connected successfully.`);
      return;
    }

    // Attempt local MongoDB connection
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Local MongoDB Connected successfully to: ${mongoUri}`);
      return;
    } catch (localErr) {
      console.log(`ℹ️ Local MongoDB not running. Initializing embedded MongoMemoryServer for development...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoServerInstance.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`✅ Embedded MongoMemoryServer connected at: ${inMemoryUri}`);
    }
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
