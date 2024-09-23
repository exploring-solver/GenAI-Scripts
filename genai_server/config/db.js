const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables.');
      return; // If Mongo URI is not defined, skip the connection attempt
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Optionally: Notify that MongoDB connection failed but continue running the server
  }
};

module.exports = connectDB;
