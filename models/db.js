import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ChatterUp';
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
