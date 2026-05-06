const express = require("express");
const app = express();

// middleware
app.use(express.json());

// routes
const jobRoutes = require("./routes/jobRoutes");

app.use("/api/v1/jobs", jobRoutes);

module.exports = app;
