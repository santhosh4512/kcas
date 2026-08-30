const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI;

  if (isProduction && !mongoUri) {
    console.error('❌ FATAL: MONGODB_URI is required in production environment.');
    process.exit(1);
  }

  const connectionUri = mongoUri || 'mongodb://127.0.0.1:27017/kcas_department_db';
  const isAtlas = connectionUri.includes('mongodb+srv://') || connectionUri.includes('mongodb.net');

  try {
    if (isAtlas || isProduction || mongoUri) {
      console.log(`🌐 Connecting to MongoDB...`);
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB Atlas connected successfully.`);
      return;
    }

    // Local development fallback (only when no explicit MONGODB_URI is provided in non-production)
    try {
      await mongoose.connect(connectionUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Local MongoDB Connected successfully to: ${connectionUri}`);
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
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
