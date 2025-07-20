"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     DietEntry:
 *       type: object
 *       required:
 *         - foodName
 *         - userId
 *         - meal
 *         - calories
 *         - carbs
 *         - protein
 *         - fat
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the diet entry
 *           example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *         foodName:
 *           type: string
 *           description: Name of the food item
 *           example: "Grilled Chicken Breast"
 *         userId:
 *           type: string
 *           description: Reference to the user who owns this diet entry
 *           example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *         meal:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           description: Type of meal
 *           example: "lunch"
 *         calories:
 *           type: number
 *           description: Calories in the food item
 *           example: 250
 *         carbs:
 *           type: number
 *           description: Carbohydrates in grams
 *           example: 5.2
 *         protein:
 *           type: number
 *           description: Protein in grams
 *           example: 46.2
 *         fat:
 *           type: number
 *           description: Fat in grams
 *           example: 3.6
 *         status:
 *           type: string
 *           enum: [taken, next, overdue, skipped]
 *           description: Current status of the diet entry
 *           default: "next"
 *           example: "taken"
 *         goalId:
 *           type: string
 *           description: Optional reference to associated goal
 *           example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *     
 *     CreateDietRequest:
 *       type: object
 *       required:
 *         - foodName
 *         - userId
 *         - meal
 *         - calories
 *         - carbs
 *         - protein
 *         - fat
 *       properties:
 *         foodName:
 *           type: string
 *           example: "Grilled Chicken Breast"
 *         userId:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *         meal:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           example: "lunch"
 *         calories:
 *           type: number
 *           example: 250
 *         carbs:
 *           type: number
 *           example: 5.2
 *         protein:
 *           type: number
 *           example: 46.2
 *         fat:
 *           type: number
 *           example: 3.6
 *         status:
 *           type: string
 *           enum: [taken, next, overdue, skipped]
 *           example: "next"
 *         goalId:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *     
 *     UpdateDietRequest:
 *       type: object
 *       properties:
 *         foodName:
 *           type: string
 *           example: "Updated Food Name"
 *         meal:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           example: "dinner"
 *         calories:
 *           type: number
 *           example: 300
 *         carbs:
 *           type: number
 *           example: 8.5
 *         protein:
 *           type: number
 *           example: 50.0
 *         fat:
 *           type: number
 *           example: 4.2
 *         status:
 *           type: string
 *           enum: [taken, next, overdue, skipped]
 *           example: "taken"
 *         goalId:
 *           type: string
 *           example: "64f8a1b2c3d4e5f6a7b8c9d2"
 *     
 *     NutritionSummary:
 *       type: object
 *       properties:
 *         calories:
 *           type: number
 *           example: 2150.5
 *         carbs:
 *           type: number
 *           example: 250.3
 *         protein:
 *           type: number
 *           example: 120.8
 *         fat:
 *           type: number
 *           example: 65.2
 *         entryCount:
 *           type: number
 *           example: 15
 *     
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         total:
 *           type: integer
 *           example: 95
 *         totalPages:
 *           type: integer
 *           example: 5
 *     
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *           description: Response data (varies by endpoint)
 *         pagination:
 *           $ref: '#/components/schemas/PaginationResponse'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message description"
 *         error:
 *           type: string
 *           example: "Detailed error information"
 * 
 *   parameters:
 *     UserIdParam:
 *       in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID
 *       example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *     
 *     DietIdParam:
 *       in: path
 *       name: dietId
 *       required: true
 *       schema:
 *         type: string
 *       description: Diet entry ID
 *       example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     
 *     DateParam:
 *       in: path
 *       name: date
 *       required: true
 *       schema:
 *         type: string
 *         format: date
 *       description: Date in ISO format (YYYY-MM-DD)
 *       example: "2024-01-15"

 * tags:
 *   - name: Diet
 *     description: Diet entry management and nutrition tracking
 */

/**
 * @swagger
 * /api/diets:
 *   post:
 *     summary: Create a new diet entry
 *     description: Add a new food item to the user's diet log with nutritional information
 *     tags: [Diet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDietRequest'
 *     responses:
 *       201:
 *         description: Diet entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DietEntry'
 *       400:
 *         description: Invalid input data or duplicate entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   get:
 *     summary: Get all diet entries with filtering and pagination
 *     description: Retrieve diet entries with optional filtering by user, meal, status, and date range
 *     tags: [Diet]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *         example: "64f8a1b2c3d4e5f6a7b8c9d1"
 *       - in: query
 *         name: meal
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: Filter by meal type
 *         example: "lunch"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [taken, next, overdue, skipped]
 *         description: Filter by status
 *         example: "taken"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date
 *         example: "2024-01-15"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries until this date
 *         example: "2024-01-20"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, calories, foodName]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Diet entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DietEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/{dietId}:
 *   get:
 *     summary: Get a specific diet entry by ID
 *     description: Retrieve detailed information about a specific diet entry
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/DietIdParam'
 *     responses:
 *       200:
 *         description: Diet entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DietEntry'
 *       404:
 *         description: Diet entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   put:
 *     summary: Update a diet entry
 *     description: Update nutritional information and details of an existing diet entry
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/DietIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDietRequest'
 *     responses:
 *       200:
 *         description: Diet entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DietEntry'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Diet entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 *   delete:
 *     summary: Delete a diet entry
 *     description: Remove a diet entry from the database
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/DietIdParam'
 *     responses:
 *       200:
 *         description: Diet entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Diet entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/user/{userId}:
 *   get:
 *     summary: Get all diet entries for a specific user
 *     description: Retrieve all diet entries belonging to a specific user with pagination and sorting
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, calories, foodName]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: User diet entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DietEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/user/{userId}/summary:
 *   get:
 *     summary: Get nutrition summary for a user
 *     description: Calculate total calories, macros, and entry count for a user within a date range
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for summary calculation
 *         example: "2024-01-15"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for summary calculation
 *         example: "2024-01-20"
 *     responses:
 *       200:
 *         description: Nutrition summary calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NutritionSummary'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/user/{userId}/today:
 *   get:
 *     summary: Get today's diet entries for a user
 *     description: Retrieve all diet entries for the current date for a specific user with pagination
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, calories, foodName]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Today's diet entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DietEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/user/{userId}/date/{date}:
 *   get:
 *     summary: Get diet entries for a specific date
 *     description: Retrieve all diet entries for a specific date for a user with pagination
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *       - $ref: '#/components/parameters/DateParam'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, calories, foodName]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Diet entries for specific date retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DietEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/diets/search/{userId}:
 *   get:
 *     summary: Search diet entries for a user
 *     description: Search for diet entries by food name with fuzzy matching for a specific user
 *     tags: [Diet]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for food name
 *         example: "chicken"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, calories, foodName]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DietEntry'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: Missing or invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */