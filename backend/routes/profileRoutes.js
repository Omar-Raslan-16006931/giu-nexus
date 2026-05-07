const express = require("express");
const router = express.Router();
const { changePassword } = require("../controllers/profileController");
const { extractSkills } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const { getProfile } = require("../controllers/profileController");
const { updateProfile } = require("../controllers/profileController");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/",protect,upload.single("profilePicture"),updateProfile);

/**
 * @swagger
 * /api/v1/profile/change-password:
 *   patch:
 *     summary: Change current user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password
 */
router.patch("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/v1/profile/extract-skills:
 *   post:
 *     summary: Extract skills from text using AI
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Experienced in Node.js, React, MongoDB and Docker
 *     responses:
 *       200:
 *         description: Skills extracted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/extract-skills", protect, extractSkills);

module.exports = router;