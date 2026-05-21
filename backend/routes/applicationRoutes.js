const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { getMyApplications,updateApplicationStatus,applyToJob ,getJobApplicants,getAllApplications} = require("../controllers/applicationController");

/**
 * @swagger
 * /api/v1/applications/my:
 *   get:
 *     summary: Get current user's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User applications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my", protect, getMyApplications);

/**
 * @swagger
 * /api/v1/applications:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/", protect, getAllApplications);

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: shortlisted
 *     responses:
 *       200:
 *         description: Application status updated
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/status", protect, updateApplicationStatus);

/**
 * @swagger
 * /api/v1/applications/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 example: I am interested in this role
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Already applied
 *       404:
 *         description: Job not found
 */
router.post("/jobs/:jobId/apply", protect, applyToJob);

/**
 * @swagger
 * /api/v1/applications/jobs/{jobId}/applicants:
 *   get:
 *     summary: Get applicants for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */
router.get("/jobs/:jobId/applicants", protect, getJobApplicants);


module.exports = router;