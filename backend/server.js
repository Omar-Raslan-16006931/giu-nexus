const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes (you’ll add these later)
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/jobs", require("./routes/jobRoutes"));
app.use("/api/v1/applications", require("./routes/applicationRoutes"));
app.use("/api/v1/profile", require("./routes/profileRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handler (must be last)
app.use(require("./middleware/errorHandler"));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
