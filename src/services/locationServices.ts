import LocationModel, { ILocation } from '../models/LocationModel';
import { CustomError } from '../utils/customError';

export interface LocationSearchParams {
  lat: number;
  lng: number;
  radius?: number; // in meters, default 5000 (5km)
  type?: 'gym' | 'studio' | 'crossfit' | 'pool' | 'martial-arts';
  searchQuery?: string;
  limit?: number;
}

export interface LocationWithDistance extends ILocation {
  distance: number; // in meters
  distanceFormatted: string;
}

export class LocationService {
  private static readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  private static readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  /**
   * Find nearby fitness locations within specified radius
   */
  static async findNearbyLocations(params: LocationSearchParams): Promise<LocationWithDistance[]> {
    try {
      const { lat, lng, radius = 10000, type, searchQuery, limit = 20 } = params;

      // Validate coordinates
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new CustomError('Invalid coordinates provided', 400);
      }

      // Validate radius
      if (radius < 100 || radius > 50000) {
        throw new CustomError('Radius must be between 100m and 50km', 400);
      }

      // Validate limit
      if (limit < 1 || limit > 100) {
        throw new CustomError('Limit must be between 1 and 100', 400);
      }

      // Try to get cached results first
      let locations = await this.getCachedLocations(lat, lng, radius, type);

      // If no cached results or not enough, fetch from OSM
      if (locations.length < Math.min(5, limit * 0.3)) {
        const osmLocations = await this.fetchLocationsFromOSM(
          this.buildOptimizedOverpassQuery(lat, lng, radius, type, searchQuery)
        );

        if (osmLocations.length > 0) {
          
          const processedLocations = await this.processOSMLocations(
            osmLocations,
            lat,
            lng,
            searchQuery,
            limit
          );

          // Save to database for future caching
          await this.saveLocationsToDatabase(processedLocations);

          // Combine cached and fresh results
          const allLocations = [...locations, ...processedLocations];
          locations = this.processLocationsWithDistance(allLocations, lat, lng, searchQuery, limit);
        } 
      } else {
        // Use cached results with distance calculation
        locations = this.processLocationsWithDistance(locations, lat, lng, searchQuery, limit);
      }

      return locations as LocationWithDistance[];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Build optimized Overpass query for specific location types
   */
  private static buildOptimizedOverpassQuery(
    lat: number, 
    lng: number, 
    radius: number, 
    type?: string,
    searchQuery?: string
  ): string {
    const tagQueries = this.getTagQueriesForType(type);
    
    let query = `[out:json][timeout:${this.REQUEST_TIMEOUT / 1000}];(`;
    
    // Add queries for each tag combination
    tagQueries.forEach(tagQuery => {
      query += `\n  ${tagQuery}(around:${radius},${lat},${lng});`;
    });
    
    query += `\n);\n`;
    query += `out body;\n`;
    query += `>;\n`;
    query += `out skel qt;`;
    
    return query;
  }

  /**
   * Get tag queries for specific location types
   */
  private static getTagQueriesForType(type?: string): string[] {
    const baseQueries = [
      'node["amenity"="fitness_centre"]',
      'node["leisure"="fitness_centre"]',
      'node["sport"="fitness_centre"]',
      'way["amenity"="fitness_centre"]',
      'way["leisure"="fitness_centre"]',
      'way["sport"="fitness_centre"]'
    ];

    if (!type || type === 'all') {
      return baseQueries;
    }

    const typeSpecificQueries: Record<string, string[]> = {
      'gym': [
        'node["amenity"="gym"]',
        'way["amenity"="gym"]',
        'node["leisure"="gym"]',
        'way["leisure"="gym"]'
      ],
      'studio': [
        'node["amenity"="yoga"]',
        'way["amenity"="yoga"]',
        'node["amenity"="dance"]',
        'way["amenity"="dance"]',
        'node["amenity"="pilates"]',
        'way["amenity"="pilates"]'
      ],
      'crossfit': [
        'node["name"~"crossfit",i]',
        'way["name"~"crossfit",i]',
        'node["brand"="CrossFit"]',
        'way["brand"="CrossFit"]'
      ],
      'pool': [
        'node["leisure"="swimming_pool"]',
        'way["leisure"="swimming_pool"]',
        'node["amenity"="swimming_pool"]',
        'way["amenity"="swimming_pool"]'
      ],
      'martial-arts': [
        'node["sport"="martial_arts"]',
        'way["sport"="martial_arts"]',
        'node["name"~"karate|boxing|judo|taekwondo|kung fu|jiu jitsu",i]',
        'way["name"~"karate|boxing|judo|taekwondo|kung fu|jiu jitsu",i]'
      ]
    };

    return typeSpecificQueries[type] || baseQueries;
  }

  /**
   * Fetch locations from OpenStreetMap Overpass API
   */
  private static async fetchLocationsFromOSM(query: string): Promise<any[]> {
    try {
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      
      const data = await response.json();
      
      return this.parseOSMResponse(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new CustomError('Request timeout - OSM API took too long to respond', 408);
      }
      throw new CustomError('Failed to fetch locations from OSM', 500);
    }
  }

  /**
   * Parse OSM API response and extract location data
   */
  private static parseOSMResponse(data: any): any[] {
    const locations: any[] = [];
    const elements = data.elements || [];

    elements.forEach((element: any) => {
      if (element.type === 'node' && element.lat && element.lon) {
        const location = this.extractLocationData(element);
        if (location) {
          locations.push(location);
        }
      } else if (element.type === 'way' && element.center) {
        const location = this.extractLocationData(element);
        if (location) {
          locations.push(location);
        }
      }
    });

    return locations;
  }

  /**
   * Extract location data from OSM element
   */
  private static extractLocationData(element: any): any | null {
    if (!this.isFitnessLocation(element.tags)) {
      return null;
    }

    const coords = this.extractCoordinates(element);
    if (!coords.lat || !coords.lng) {
      return null;
    }

    return {
      osmId: element.id.toString(),
      name: this.extractName(element.tags),
      address: this.buildAddress(element.tags),
      lat: coords.lat,
      lng: coords.lng,
      type: this.categorizeLocation(element.tags),
      amenities: this.extractAmenities(element.tags),
      phone: element.tags.phone || element.tags['contact:phone'],
      website: element.tags.website || element.tags['contact:website'],
      openingHours: element.tags.opening_hours,
      tags: element.tags
      // The location field will be automatically set by Mongoose pre-save middleware
    };
  }

  /**
   * Extract coordinates from OSM element
   */
  private static extractCoordinates(element: any): { lat?: number; lng?: number } {
    if (element.lat && element.lon) {
      return { lat: element.lat, lng: element.lon };
    }
    
    if (element.center) {
      return { lat: element.center.lat, lng: element.center.lon };
    }

    return {};
  }

  /**
   * Check if OSM element represents a fitness location
   */
  private static isFitnessLocation(tags: any): boolean {
    if (!tags) return false;

    const fitnessKeywords = [
      'fitness_centre', 'gym', 'fitness', 'workout', 'exercise',
      'yoga', 'pilates', 'dance', 'martial_arts', 'swimming_pool',
      'crossfit', 'boxing', 'karate', 'judo', 'taekwondo'
    ];

    return fitnessKeywords.some(keyword => 
      tags.amenity === keyword || 
      tags.leisure === keyword || 
      tags.sport === keyword ||
      (tags.name && tags.name.toLowerCase().includes(keyword))
    );
  }

  /**
   * Extract name from OSM tags
   */
  private static extractName(tags: any): string {
    if (tags.name) {
      return tags.name;
    }

    if (tags.brand) {
      return tags.brand;
    }

    return this.generateDefaultName(tags);
  }

  /**
   * Process OSM locations and add distance calculations
   */
  private static async processOSMLocations(
    osmLocations: any[],
    lat: number,
    lng: number,
    searchQuery?: string,
    limit: number = 20
  ): Promise<LocationWithDistance[]> {
    // Filter by search query if provided
    let filteredLocations = osmLocations;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredLocations = osmLocations.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query)
      );
    }

    // Calculate distances and sort
    const locationsWithDistance = filteredLocations.map(location => ({
      ...location,
      distance: this.calculateDistance(lat, lng, location.lat, location.lng),
      distanceFormatted: this.formatDistance(
        this.calculateDistance(lat, lng, location.lat, location.lng)
      )
    }));

    // Sort by distance and limit results
    return locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  /**
   * Get cached locations from database
   */
  private static async getCachedLocations(
    lat: number,
    lng: number,
    radius: number,
    type?: string
  ): Promise<ILocation[]> {
    try {
      const query: any = {
        lat: { $gte: lat - 0.1, $lte: lat + 0.1 },
        lng: { $gte: lng - 0.1, $lte: lng + 0.1 }
      };

      if (type && type !== 'all') {
        query.type = type;
      }

      
      const results = await LocationModel.find(query).limit(50);
      
      return results;
    } catch (error) {
      return [];
    }
  }

  /**
   * Process locations and add distance calculations
   */
  private static processLocationsWithDistance(
    locations: ILocation[],
    lat: number,
    lng: number,
    searchQuery?: string,
    limit: number = 20
  ): LocationWithDistance[] {
    // Filter by search query if provided
    let filteredLocations = locations;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query)
      );
    }

    // Calculate distances and sort
    const locationsWithDistance = filteredLocations.map(location => {
      // Handle both Mongoose documents and plain objects
      const locationData = typeof location.toObject === 'function' ? location.toObject() : location;
      
      return {
        ...locationData,
        distance: this.calculateDistance(lat, lng, location.lat, location.lng),
        distanceFormatted: this.formatDistance(
          this.calculateDistance(lat, lng, location.lat, location.lng)
        )
      };
    });

    // Sort by distance and limit results
    return locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  /**
   * Generate default name from OSM tags
   */
  private static generateDefaultName(tags: any): string {
    if (tags.amenity) {
      return tags.amenity.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }

    if (tags.leisure) {
      return tags.leisure.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }

    if (tags.sport) {
      return tags.sport.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }

    return 'Fitness Location';
  }

  /**
   * Build address from OSM tags
   */
  private static buildAddress(tags: any): string {
    const addressParts = [];

    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
    if (tags['addr:street']) addressParts.push(tags['addr:street']);
    if (tags['addr:city']) addressParts.push(tags['addr:city']);
    if (tags['addr:postcode']) addressParts.push(tags['addr:postcode']);
    if (tags['addr:country']) addressParts.push(tags['addr:country']);

    if (addressParts.length === 0) {
      return 'Address not available';
    }

    return addressParts.join(', ');
  }

  /**
   * Categorize location based on OSM tags
   */
  private static categorizeLocation(tags: any): 'gym' | 'studio' | 'crossfit' | 'pool' | 'martial-arts' {
    // Check for swimming pools first (most specific)
    // Look for explicit pool tags and name-based detection
    if (tags.amenity === 'swimming_pool' || 
        tags.leisure === 'swimming_pool' ||
        tags.sport === 'swimming' ||
        (tags.name && (
          tags.name.toLowerCase().includes('swimming pool') ||
          tags.name.toLowerCase().includes('pool') ||
          tags.name.toLowerCase().includes('aquatic') ||
          tags.name.toLowerCase().includes('aquatics')
        ))) {
      return 'pool';
    }

    // Check for CrossFit (very specific)
    if (tags.name && (
      tags.name.toLowerCase().includes('crossfit') ||
      tags.name.toLowerCase().includes('cross fit') ||
      tags.name.toLowerCase().includes('cf ')
    )) {
      return 'crossfit';
    }

    // Check for martial arts (very specific)
    if (tags.sport === 'martial_arts' || 
        tags.amenity === 'martial_arts' ||
        (tags.name && (
          /karate|boxing|judo|taekwondo|kung fu|jiu jitsu|martial|mma|ufc|kickboxing|muay thai/i.test(tags.name)
        ))) {
      return 'martial-arts';
    }

    // Check for studios (yoga, dance, pilates, etc.)
    if (tags.amenity === 'yoga' || 
        tags.amenity === 'dance' || 
        tags.amenity === 'pilates' ||
        tags.leisure === 'yoga' ||
        tags.leisure === 'dance' ||
        (tags.name && (
          /yoga|dance|pilates|zumba|spinning|barre|ballet|contemporary|hip hop|jazz/i.test(tags.name)
        ))) {
      return 'studio';
    }

    // Check for fitness centers and gyms
    if (tags.amenity === 'fitness_centre' || 
        tags.leisure === 'fitness_centre' ||
        tags.sport === 'fitness' ||
        (tags.name && (
          /gym|fitness|workout|exercise|health club|athletic club|sports club/i.test(tags.name)
        ))) {
      return 'gym';
    }

    // Default to gym for general fitness locations
    return 'gym';
  }

  /**
   * Extract amenities from OSM tags
   */
  private static extractAmenities(tags: any): string[] {
    const amenities: string[] = [];
    const amenityMap: Record<string, string> = {
      'fitness_centre': 'Fitness Centre',
      'gym': 'Gym',
      'swimming_pool': 'Swimming Pool',
      'sauna': 'Sauna',
      'parking': 'Parking',
      'childcare': 'Childcare',
      'personal_trainer': 'Personal Trainer',
      'group_classes': 'Group Classes',
      'yoga': 'Yoga',
      'dance': 'Dance',
      'martial_arts': 'Martial Arts',
      'boxing': 'Boxing',
      'crossfit': 'CrossFit',
      'pilates': 'Pilates',
      'zumba': 'Zumba',
      'spinning': 'Spinning',
      'treadmill': 'Treadmill',
      'weights': 'Weights',
      'cardio': 'Cardio Equipment',
      'changing_room': 'Changing Room',
      'leisure': 'Leisure Activities',
      'sport': 'Sports Facilities'
    };

    // Check all tag values for amenities
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string' && amenityMap[value]) {
        amenities.push(amenityMap[value]);
      }
      if (amenityMap[key] && (value === 'yes' || value === true)) {
        amenities.push(amenityMap[key]);
      }
    }

    // Add specific amenities based on tags
    if (tags.leisure === 'fitness_centre') {
      amenities.push('Fitness Centre');
    }
    if (tags.amenity === 'fitness_centre') {
      amenities.push('Fitness Centre');
    }
    if (tags.opening_hours) {
      amenities.push('Scheduled Hours');
    }
    if (tags.phone) {
      amenities.push('Phone Available');
    }
    if (tags.website) {
      amenities.push('Website Available');
    }

    return [...new Set(amenities)]; // Remove duplicates
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Validate if coordinates are valid numbers within proper ranges
   */
  private static isValidCoordinate(lat: number, lng: number): boolean {
    return typeof lat === 'number' && 
           typeof lng === 'number' && 
           !isNaN(lat) && 
           !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  /**
   * Format distance for display
   */
  private static formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }

  /**
   * Save locations to database for caching
   */
  private static async saveLocationsToDatabase(locations: any[]): Promise<void> {
    try {
      let savedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const location of locations) {
        try {
          // Clean the location data to avoid geo index issues
          const cleanLocation = { ...location };
          
          // Remove problematic fields that might cause geo index issues
          delete cleanLocation._id;
          delete cleanLocation.__v;
          
          // Validate coordinates before saving
          if (!LocationService.isValidCoordinate(cleanLocation.lat, cleanLocation.lng)) {
            skippedCount++;
            continue;
          }
          
          // Check if location already exists and compare classification
          const existingLocation = await LocationModel.findOne({ osmId: location.osmId });
          
          if (existingLocation) {
            // Location exists - check if classification has changed
            if (existingLocation.type !== cleanLocation.type) {
              updatedCount++;
            } else {
              savedCount++;
              continue;
            }
          }           
          // The location field will be automatically set by Mongoose pre-save middleware
          // based on lat and lng values
          
          await LocationModel.findOneAndUpdate(
            { osmId: location.osmId },
            { 
              $set: {
                ...cleanLocation,
                lastUpdated: new Date(),
                classificationUpdated: new Date() // Track when classification was last updated
              }
            },
            { upsert: true, new: true }
          );
          
          if (!existingLocation) {
            savedCount++;
          }
        } catch (error) {
          console.error(` Error saving location ${location.osmId}:`, error);
          errorCount++;
        }
      }
      
    } catch (error) {
      console.error('Error saving locations to database:', error);
    }
  }

  /**
   * Clean up duplicate locations based on OSM ID
   * This ensures each location appears only once, even if it was previously misclassified
   */
  static async cleanupDuplicateLocations(): Promise<void> {
    try {
      
      // Find all locations grouped by OSM ID
      const duplicateGroups = await LocationModel.aggregate([
        {
          $group: {
            _id: '$osmId',
            count: { $sum: 1 },
            locations: { $push: '$$ROOT' }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);


      for (const group of duplicateGroups) {
        const { osmId, locations } = group;
        
        // Sort by lastUpdated to keep the most recent classification
        const sortedLocations = locations.sort((a: any, b: any) => {
          const dateA = a.lastUpdated || a.createdAt || new Date(0);
          const dateB = b.lastUpdated || b.createdAt || new Date(0);
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        // Keep the most recent entry and remove the rest
        const [keepLocation, ...duplicateLocations] = sortedLocations;
        
        
        // Remove duplicate entries
        for (const duplicate of duplicateLocations) {
          await LocationModel.deleteOne({ _id: duplicate._id });
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate locations:', error);
    }
  }

  /**
   * Clean up corrupted location data in the database
   */
  static async cleanupCorruptedLocations(): Promise<void> {
    try {
      // Find documents with invalid location coordinates
      const corruptedLocations = await LocationModel.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': { $size: 0 } },
          { 'location.coordinates': { $elemMatch: { $type: 'missing' } } },
          { 'location.coordinates': { $elemMatch: { $not: { $type: 'number' } } } },
          { 'location.coordinates': [] }, // Empty array
          { 'location.coordinates': { $type: 'missing' } } // Missing field
        ]
      });


      for (const location of corruptedLocations) {
        try {
          // If lat/lng are valid, fix the location field
          if (LocationService.isValidCoordinate(location.lat, location.lng)) {
            // Use findOneAndUpdate to trigger the pre-update middleware
            await LocationModel.findOneAndUpdate(
              { _id: location._id },
              {
                $set: {
                  lat: location.lat,
                  lng: location.lng,
                  lastUpdated: new Date()
                }
              },
              { new: true }
            );
          } else {
            // If coordinates are invalid, remove the document
            await LocationModel.deleteOne({ _id: location._id });
          }
        } catch (error) {
          console.error(`Error fixing corrupted location ${location._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up corrupted locations:', error);
    }
  }

  /**
   * Check the health of location data in the database
   */
  static async checkLocationDataHealth(): Promise<{
    total: number;
    corrupted: number;
    healthy: number;
    issues: string[];
  }> {
    try {
      const total = await LocationModel.countDocuments();
      const corrupted = await LocationModel.countDocuments({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': { $size: 0 } },
          { 'location.coordinates': { $elemMatch: { $type: 'missing' } } },
          { 'location.coordinates': { $elemMatch: { $not: { $type: 'number' } } } },
          { 'location.coordinates': [] },
          { 'location.coordinates': { $type: 'missing' } }
        ]
      });

      const healthy = total - corrupted;
      const issues: string[] = [];

      if (corrupted > 0) {
        issues.push(`${corrupted} documents have corrupted location data`);
      }

      if (total === 0) {
        issues.push('No location documents found in database');
      }

      return {
        total,
        corrupted,
        healthy,
        issues
      };
    } catch (error) {
      console.error('Error checking location data health:', error);
      throw error;
    }
  }
}