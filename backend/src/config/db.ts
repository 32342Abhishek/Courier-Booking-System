import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://cluster0.vdblqkq.mongodb.net/courier_system?appName=Cluster0`,
      {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS,
        dbName: 'courier_system',
        authSource: 'admin',
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
