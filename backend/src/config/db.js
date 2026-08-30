const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kcas_department_db';
    
    // Attempt standard connection with 2-second timeout
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ MongoDB Connected successfully to: ${mongoUri}`);
      return;
    } catch (localErr) {
      console.log(`ℹ️ Direct MongoDB connection to ${mongoUri} failed or not running locally.`);
      console.log(`🚀 Initializing robust embedded MongoMemoryServer for instant zero-config full-stack experience...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoServerInstance.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`✅ Embedded MongoMemoryServer connected successfully at: ${inMemoryUri}`);
    }
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
