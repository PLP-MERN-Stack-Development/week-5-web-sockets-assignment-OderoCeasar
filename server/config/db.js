const mongoose = require('mongoose');

const connectDB = () => {
    try {
        mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
    }
};


module.exports = connectDB;