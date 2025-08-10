import { Router } from 'express';
import { LocationController } from '../controllers/locationController';

const router = Router();

/**
 * @swagger
 * /api/locations/nearby:
 *   get:
 *     summary: Find nearby fitness locations
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 5000)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Location type filter
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Search query for names/addresses
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Maximum number of results (default 20)
 *     responses:
 *       200:
 *         description: List of nearby fitness locations
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/nearby', LocationController.findNearbyLocations);

/**
 * @swagger
 * /api/locations/categories:
 *   get:
 *     summary: Get available location categories
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of available location categories
 */
router.get('/categories', LocationController.getLocationCategories);

// Cleanup routes
router.post('/cleanup', LocationController.cleanupCorruptedLocations);
router.post('/cleanup-duplicates', LocationController.cleanupDuplicateLocations);

// Health check route
router.get('/health', LocationController.checkLocationHealth);

export default router;


