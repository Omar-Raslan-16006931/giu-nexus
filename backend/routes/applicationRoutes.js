const express = require("express");
const router = express.Router();

const {
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.patch("/:id/status", updateApplicationStatus);

module.exports = router;