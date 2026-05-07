const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { getAdminStats } = require("../controllers/userController");

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/stats", protect, authorize("admin"), getAdminStats);

module.exports = router;