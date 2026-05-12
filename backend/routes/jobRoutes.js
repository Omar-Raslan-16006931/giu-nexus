const express = require("express");
const router = express.Router();

const {updateJob,deleteJob, createJob,getJobs,getJobById,getRecommendedJobs,toggleSaveJob,getSavedJobs,getMyJobs} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");


/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
router.get("/", getJobs);

/**
 * @swagger
 * /api/v1/jobs/recommended:
 *   get:
 *     summary: Get recommended jobs for current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/recommended", protect, getRecommendedJobs);

/**
 * @swagger
 * /api/v1/jobs/saved:
 *   get:
 *     summary: Get saved jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/saved", protect, getSavedJobs);

/**
 * @swagger
 * /api/v1/jobs/my-jobs:
 *   get:
 *     summary: Get jobs created by recruiter
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter jobs retrieved successfully
 *       403:
 *         description: Recruiter access required
 */
router.get("/my-jobs", protect, authorize("recruiter"), getMyJobs);

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: full-time
 *               salary:
 *                 type: number
 *               totalSlots:
 *                 type: number
 *     responses:
 *       201:
 *         description: Job created successfully
 *       403:
 *         description: Recruiter access required
 */
router.post("/", protect, authorize("recruiter"), createJob);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *       404:
 *         description: Job not found
 */
router.get("/:id", getJobById);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   patch:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */
router.patch("/:id", protect, authorize("recruiter"), updateJob);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 */
router.delete("/:id", protect, authorize("recruiter", "admin"), deleteJob);

/**
 * @swagger
 * /api/v1/jobs/{id}/save:
 *   post:
 *     summary: Save or unsave a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job save status updated
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/save", protect, toggleSaveJob);

module.exports = router;