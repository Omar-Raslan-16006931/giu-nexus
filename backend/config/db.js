const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
    });

    console.log("MongoDB Connected");
    console.log("Host:", conn.connection.host);

  } catch (err) {
    console.error("DB ERROR FULL:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;