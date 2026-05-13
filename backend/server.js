require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API running...");
});
app.use("/uploads", express.static("uploads"));
// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});