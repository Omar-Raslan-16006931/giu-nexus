const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/giu_nexus")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
