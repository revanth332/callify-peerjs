import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectDB = (async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected !!");
  } catch (error) {
    console.log("Failed !!", error);
    process.exit(1);
  }
})();

export default connectDB;
