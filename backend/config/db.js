const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee-system';
    console.log(`Attempting to connect to MongoDB at: ${connString}`);
    
    // Set connection timeout to 3 seconds for quick fallback
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Could not connect to local/configured MongoDB: ${error.message}`);
    console.log('Starting in-memory MongoDB Server (MongoMemoryServer) as fallback...');
    
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      const conn = await mongoose.connect(uri);
      console.log('In-Memory MongoDB Connected successfully!');
      console.log(`Connection URI: ${uri}`);
      
      // Store URI in environment so other files can see it if needed
      process.env.MONGO_URI_MEM = uri;
      process.env.USING_MEM_DB = 'true';
    } catch (memError) {
      console.error(`Failed to start In-Memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
