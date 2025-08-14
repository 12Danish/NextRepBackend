import { Request, Response, NextFunction } from 'express';
import { LocationService, LocationSearchParams } from '../services/locationServices';
import LocationModel from '../models/LocationModel';
import { CustomError } from '../utils/customError';

export class LocationController {
  /**
   * Find nearby fitness locations
   * GET /api/locations/nearby
   * Query params: lat, lng, radius, type, searchQuery, limit, useCache
   */
  static async findNearbyLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        lat, 
        lng, 
        radius, 
        type, 
        searchQuery, 
        limit,
        useCache = 'true'
      } = req.query;

      // Validate required parameters
      if (!lat || !lng) {
        throw new CustomError('Latitude and longitude are required', 400);
      }

      const searchParams: LocationSearchParams = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius: radius ? parseFloat(radius as string) : 5000,
        type: type as 'gym' | 'studio' | 'crossfit' | 'pool' | 'martial-arts',
        searchQuery: searchQuery as string,
        limit: limit ? parseInt(limit as string, 10) : 20
      };

      // Validate coordinates
      if (isNaN(searchParams.lat) || isNaN(searchParams.lng)) {
        throw new CustomError('Invalid coordinates provided', 400);
      }

      if (searchParams.lat < -90 || searchParams.lat > 90 || 
          searchParams.lng < -180 || searchParams.lng > 180) {
        throw new CustomError('Coordinates out of valid range', 400);
      }

      // Validate other parameters
      if (searchParams.radius && (searchParams.radius < 100 || searchParams.radius > 50000)) {
        throw new CustomError('Radius must be between 100m and 50km', 400);
      }

      if (searchParams.limit && (searchParams.limit < 1 || searchParams.limit > 100)) {
        throw new CustomError('Limit must be between 1 and 100', 400);
      }

      let locations;
      let source = 'osm';

      // Try database first if useCache is true and no search query
      if (useCache === 'true' && !searchParams.searchQuery) {
        try {
          // Simple database query instead of complex aggregation
          const cachedResults = await LocationModel.find({
            lat: { $gte: searchParams.lat - 0.1, $lte: searchParams.lat + 0.1 },
            lng: { $gte: searchParams.lng - 0.1, $lte: searchParams.lng + 0.1 }
          }).limit(searchParams.limit || 20);
          
          if (cachedResults.length > 0) {
            // Check if data is reasonably fresh (not older than 7 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentResults = cachedResults.filter(location => {
              return new Date(location.updatedAt) > sevenDaysAgo;
            });

            if (recentResults.length >= Math.min(5, (searchParams.limit || 20) * 0.3)) {
              locations = recentResults;
              source = 'cache';
            }
          }
        } catch (error) {
          console.error('Error querying cached locations:', error);
          // Fall through to OSM API
        }
      }

      // Fall back to OSM API if no cached results or cache disabled
      if (!locations) {
        locations = await LocationService.findNearbyLocations(searchParams);
        source = 'osm';
      }

      res.status(200).json({
        success: true,
        data: locations,
        count: locations.length,
        source,
        searchParams: {
          ...searchParams,
          radiusFormatted: (searchParams.radius || 5000) < 1000 
            ? `${searchParams.radius || 5000}m` 
            : `${((searchParams.radius || 5000) / 1000).toFixed(1)}km`
        },
        meta: {
          hasMore: locations.length === (searchParams.limit || 20),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search locations by name or text
   * GET /api/locations/search
   * Query params: q, lat, lng, radius, type, limit
   */
  static async searchLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, lat, lng, radius, type, limit } = req.query;

      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        throw new CustomError('Search query is required', 400);
      }

      const searchQuery = q.trim();
      const searchLimit = limit ? parseInt(limit as string, 10) : 20;

      if (searchLimit < 1 || searchLimit > 100) {
        throw new CustomError('Limit must be between 1 and 100', 100);
      }

      let locations;

      // If coordinates provided, do proximity search
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const searchRadius = radius ? parseFloat(radius as string) : 10000; // 10km default

        if (isNaN(latitude) || isNaN(longitude)) {
          throw new CustomError('Invalid coordinates provided', 400);
        }

        // Simple database query instead of complex aggregation
        locations = await LocationModel.find({
          lat: { $gte: latitude - 0.1, $lte: latitude + 0.1 },
          lng: { $gte: longitude - 0.1, $lte: longitude + 0.1 }
        }).limit(searchLimit);
      } else {
        // Text-only search without location
        locations = await LocationModel.find({
          $text: { $search: searchQuery }
        }).limit(searchLimit);
      }

      res.status(200).json({
        success: true,
        data: locations,
        count: locations.length,
        searchQuery,
        meta: {
          hasMore: locations.length === searchLimit,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location by ID
   * GET /api/locations/:id
   */
  static async getLocationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new CustomError('Location ID is required', 400);
      }

      // Try to find by MongoDB _id first, then by osmId
      let location = await LocationModel.findById(id);
      
      if (!location) {
        location = await LocationModel.findOne({ osmId: id });
      }

      if (!location) {
        throw new CustomError('Location not found', 404);
      }

      res.status(200).json({
        success: true,
        data: location
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        next(new CustomError('Invalid location ID format', 400));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get location categories with counts
   * GET /api/locations/categories
   */
  static async getLocationCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius } = req.query;

      let categories = [
        { id: 'all', name: 'All Locations', icon: '🏋️‍♂️', count: 0 },
        { id: 'gym', name: 'Gyms', icon: '💪', count: 0 },
        { id: 'studio', name: 'Studios', icon: '🧘‍♀️', count: 0 },
        { id: 'crossfit', name: 'CrossFit', icon: '🔥', count: 0 },
        { id: 'pool', name: 'Pools', icon: '🏊‍♂️', count: 0 },
        { id: 'martial-arts', name: 'Martial Arts', icon: '🥋', count: 0 }
      ];

      // If coordinates provided, get counts for each category
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const searchRadius = radius ? parseFloat(radius as string) : 5000;

        if (!isNaN(latitude) && !isNaN(longitude)) {
          // Get counts for each type
          const countPromises = categories.slice(1).map(async (category) => {
            const count = await LocationModel.countDocuments({
              lat: { $gte: latitude - 0.1, $lte: latitude + 0.1 },
              lng: { $gte: longitude - 0.1, $lte: longitude + 0.1 },
              type: category.id
            });
            return { type: category.id, count };
          });

          const counts = await Promise.all(countPromises);
          const totalCount = counts.reduce((sum, item) => sum + item.count, 0);

          // Update categories with counts
          categories = categories.map(category => {
            if (category.id === 'all') {
              return { ...category, count: totalCount };
            }
            const countData = counts.find(c => c.type === category.id);
            return { ...category, count: countData?.count || 0 };
          });
        }
      }

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location statistics
   * GET /api/locations/stats
   */
  static async getLocationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await LocationModel.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgLat: { $avg: '$lat' },
            avgLng: { $avg: '$lng' }
          }
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            avgLat: { $round: ['$avgLat', 6] },
            avgLng: { $round: ['$avgLng', 6] },
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalLocations = stats.reduce((sum, stat) => sum + stat.count, 0);

      res.status(200).json({
        success: true,
        data: {
          totalLocations,
          byType: stats,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh location data from OSM
   * POST /api/locations/refresh
   */
  static async refreshLocationData(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius, force } = req.body;

      if (!lat || !lng) {
        throw new CustomError('Latitude and longitude are required', 400);
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = radius ? parseFloat(radius) : 5000;
      const forceRefresh = force === true;

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new CustomError('Invalid coordinates provided', 400);
      }

      // Get fresh data from OSM
      const searchParams: LocationSearchParams = {
        lat: latitude,
        lng: longitude,
        radius: searchRadius,
        limit: 100
      };

      const freshLocations = await LocationService.findNearbyLocations(searchParams);

      let updatedCount = 0;
      let newCount = 0;

      // Process each location
      for (const location of freshLocations) {
        try {
          const existingLocation = await LocationModel.findOne({ osmId: location.osmId });
          
          if (existingLocation) {
            // Simple update instead of custom methods
            await LocationModel.updateOne(
              { osmId: location.osmId },
              { $set: location }
            );
            updatedCount++;
          } else {
            await LocationModel.create(location);
            newCount++;
          }
        } catch (error) {
          console.error(`Error processing location ${location.osmId}:`, error);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Location data refreshed successfully',
        stats: {
          processed: freshLocations.length,
          updated: updatedCount,
          new: newCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up corrupted location data
   */
  static async cleanupCorruptedLocations(req: Request, res: Response): Promise<void> {
    try {
      await LocationService.cleanupCorruptedLocations();
      res.json({ 
        success: true, 
        message: 'Corrupted locations cleaned up successfully' 
      });
    } catch (error) {
      console.error('Error cleaning up corrupted locations:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clean up corrupted locations' 
      });
    }
  }

  /**
   * Clean up duplicate locations based on OSM ID
   */
  static async cleanupDuplicateLocations(req: Request, res: Response): Promise<void> {
    try {
      await LocationService.cleanupDuplicateLocations();
      res.json({ 
        success: true, 
        message: 'Duplicate locations cleaned up successfully' 
      });
    } catch (error) {
      console.error('Error cleaning up duplicate locations:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clean up duplicate locations' 
      });
    }
  }

  /**
   * Check location data health
   * GET /api/locations/health
   */
  static async checkLocationHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await LocationService.checkLocationDataHealth();
      
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }
}