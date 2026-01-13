import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const MONGO_URL = process.env.MONGODB_URI;

const connectDB = async()=>{
  try{
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch(err){
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); 
  }
}

export default connectDB;