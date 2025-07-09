import mongoose from "mongoose";

const mongoDBConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB connection failed ", error);
  }
};
export default mongoDBConnect;