"use strict";

/**
 * @swagger
 * tags:
 *   name: Sleep
 *   description: Sleep tracking and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Sleep:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the sleep record
 *         userId:
 *           type: string
 *           description: Reference to User ID
 *         duration:
 *           type: number
 *           description: Sleep duration in minutes
 *         date:
 *           type: string
 *           format: date
 *           description: Date of sleep record
 *         goalId:
 *           type: string
 *           description: Reference to Goal ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SleepInput:
 *       type: object
 *       required:
 *         - duration
 *         - date
 *         - goalId
 *       properties:
 *         duration:
 *           type: number
 *           minimum: 0
 *           maximum: 1440
 *           description: Sleep duration in minutes
 *         date:
 *           type: string
 *           format: date
 *           description: Date of sleep record
 *         goalId:
 *           type: string
 *           description: Reference to Goal ID
 */

/**
 * @swagger
 * /api/sleep:
 *   post:
 *     summary: Create a new sleep record
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SleepInput'
 *     responses:
 *       201:
 *         description: Sleep record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep record created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Sleep'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Validation error
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - record already exists for this date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Sleep record already exists for this date
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep:
 *   get:
 *     summary: Get all sleep records for authenticated user
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date
 *       - in: query
 *         name: goalId
 *         schema:
 *           type: string
 *         description: Filter by goal ID
 *     responses:
 *       200:
 *         description: Sleep records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep records retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sleep'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalRecords:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/{id}:
 *   get:
 *     summary: Get sleep record by ID
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sleep record ID
 *     responses:
 *       200:
 *         description: Sleep record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep record found
 *                 data:
 *                   $ref: '#/components/schemas/Sleep'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sleep record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Sleep record not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/{id}:
 *   put:
 *     summary: Update sleep record by ID
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sleep record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1440
 *                 description: Sleep duration in minutes
 *               goalId:
 *                 type: string
 *                 description: Reference to Goal ID
 *     responses:
 *       200:
 *         description: Sleep record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep record updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Sleep'
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sleep record not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/{id}:
 *   delete:
 *     summary: Delete sleep record by ID
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sleep record ID
 *     responses:
 *       200:
 *         description: Sleep record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sleep record not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/date/{date}:
 *   get:
 *     summary: Get sleep record by specific date
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Sleep record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep record found for date
 *                 data:
 *                   $ref: '#/components/schemas/Sleep'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sleep record not found for this date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No sleep record found for this date
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/stats:
 *   get:
 *     summary: Get sleep statistics for authenticated user
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics calculation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics calculation
 *       - in: query
 *         name: goalId
 *         schema:
 *           type: string
 *         description: Filter statistics by goal ID
 *     responses:
 *       200:
 *         description: Sleep statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sleep statistics calculated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                       description: Total number of sleep records
 *                     averageDuration:
 *                       type: number
 *                       description: Average sleep duration in minutes
 *                     totalDuration:
 *                       type: number
 *                       description: Total sleep duration in minutes
 *                     minDuration:
 *                       type: number
 *                       description: Minimum sleep duration in minutes
 *                     maxDuration:
 *                       type: number
 *                       description: Maximum sleep duration in minutes
 *                     streakDays:
 *                       type: integer
 *                       description: Current consecutive days with sleep records
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sleep/bulk:
 *   post:
 *     summary: Bulk create multiple sleep records
 *     tags: [Sleep]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             maxItems: 50
 *             items:
 *               $ref: '#/components/schemas/SleepInput'
 *     responses:
 *       201:
 *         description: Sleep records processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bulk sleep records processed
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sleep'
 *                     skipped:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           record:
 *                             $ref: '#/components/schemas/SleepInput'
 *                           reason:
 *                             type: string
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */