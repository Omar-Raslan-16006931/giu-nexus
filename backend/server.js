require("dotenv").config();  

const express = require("express");
const connectDB = require("./config/db");
const { protect, authorize } = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorHandler");
const sendEmail = require("./services/emailService");
const authRoutes = require("./routes/authRoutes");
const hf = require("./services/hfService");


connectDB();

const app = express();

app.use(express.json());




app.get("/", protect, (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;
app.use("/api/v1/auth", authRoutes);








app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});