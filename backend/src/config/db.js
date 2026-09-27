const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or configured database instance
 */
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
    if (mongoUri) {
      console.log(`🌐 Connecting to MongoDB...`);
      try {
        await mongoose.connect(mongoUri, {
          dbName: 'kcas_department_db',
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        const activeDbName = mongoose.connection.db ? mongoose.connection.db.databaseName : 'kcas_department_db';
        console.log(`✅ MongoDB connected successfully.`);
        console.log(`🗄️  Database: ${activeDbName}`);
        return;
      } catch (uriError) {
        if (isProduction) {
          throw uriError;
        }
        console.warn(`⚠️  Failed to connect to configured MONGODB_URI: ${uriError.message}`);
        console.log(`ℹ️ Falling back to development database...`);
      }
    }

    // Local development fallback
    try {
      await mongoose.connect(connectionUri, {
        dbName: 'kcas_department_db',
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Local MongoDB Connected successfully.`);
      console.log(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
      return;
    } catch (localErr) {
      console.log(`ℹ️ Local MongoDB not running. Initializing embedded MongoMemoryServer for development...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoServerInstance.getUri();

      await mongoose.connect(inMemoryUri, {
        dbName: 'kcas_department_db',
      });
      console.log(`✅ Embedded MongoMemoryServer connected.`);
      console.log(`🗄️  Database: ${mongoose.connection.db.databaseName}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
