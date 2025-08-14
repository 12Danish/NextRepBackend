import mongoose, { Document, Schema } from 'mongoose';

// Generic model for all types of fitness locations
export interface ILocation extends Document {
  osmId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude] - GeoJSON format
  };
  type: 'gym' | 'studio' | 'crossfit' | 'pool' | 'martial-arts';
  amenities: string[];
  phone?: string;
  website?: string;
  openingHours?: string;
  tags?: Record<string, any>; // Store original OSM tags for reference
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  osmId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  // GeoJSON Point for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coordinates: number[]) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['gym', 'studio', 'crossfit', 'pool', 'martial-arts'],
    trim: true,
    index: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        try {
          new URL(url);
          return true;
        } catch {
          return /^https?:\/\/.+/.test(url);
        }
      },
      message: 'Invalid website URL format'
    }
  },
  openingHours: {
    type: String,
    trim: true
  },
  tags: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
LocationSchema.index({ location: '2dsphere' });

// Create text index for search functionality
LocationSchema.index({ 
  name: 'text', 
  address: 'text',
  amenities: 'text'
}, {
  weights: {
    name: 10,
    amenities: 5,
    address: 1
  }
});

// Compound indexes for common queries
LocationSchema.index({ type: 1, location: '2dsphere' });
LocationSchema.index({ type: 1, name: 1 });
LocationSchema.index({ lastUpdated: 1 });

// Pre-save middleware to set location coordinates
LocationSchema.pre('save', function(this: ILocation) {
  // Ensure location.coordinates is set correctly [lng, lat]
  if (this.lat && this.lng) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat] // GeoJSON format: [longitude, latitude]
    };
  }
});

// Pre-update middleware for findOneAndUpdate
LocationSchema.pre(['findOneAndUpdate', 'updateOne'], function() {
  const update = this.getUpdate() as any;
  if (update.lat && update.lng) {
    update.location = {
      type: 'Point',
      coordinates: [update.lng, update.lat]
    };
    update.lastUpdated = new Date();
  }
});

// Static methods for geospatial queries
LocationSchema.statics.findNearby = function(
  longitude: number,
  latitude: number,
  maxDistanceMeters: number = 5000,
  type?: string
) {
  const query: any = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  };

  if (type) {
    query.type = type;
  }

  return this.find(query);
};

LocationSchema.statics.findWithinRadius = function(
  longitude: number,
  latitude: number,
  radiusMeters: number,
  type?: string
) {
  const query: any = {
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusMeters / 6371000] // radius in radians
      }
    }
  };

  if (type) {
    query.type = type;
  }

  return this.find(query);
};

LocationSchema.statics.searchByText = function(searchText: string, options: any = {}) {
  const { type, limit = 20, near } = options;
  
  const query: any = { $text: { $search: searchText } };
  
  if (type) {
    query.type = type;
  }

  let mongoQuery = this.find(query, { score: { $meta: 'textScore' } })
                       .sort({ score: { $meta: 'textScore' } });

  if (near) {
    mongoQuery = mongoQuery.hint({ location: '2dsphere' });
  }

  return mongoQuery.limit(limit);
};

// Virtual for distance calculation (can be used in aggregation)
LocationSchema.virtual('distanceFromPoint').get(function(this: ILocation) {
  // This will be populated by aggregation pipeline when needed
  return (this as any).distance;
});

// Method to check if location data is stale (older than 7 days)
LocationSchema.methods.isStale = function(this: ILocation): boolean {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.lastUpdated < sevenDaysAgo;
};

// Method to update location data
LocationSchema.methods.updateLocationData = function(this: ILocation, osmData: any) {
  this.name = osmData.name || this.name;
  this.address = osmData.address || this.address;
  this.phone = osmData.phone || this.phone;
  this.website = osmData.website || this.website;
  this.openingHours = osmData.openingHours || this.openingHours;
  this.amenities = osmData.amenities || this.amenities;
  this.tags = osmData.tags || this.tags;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Add interface for static methods
interface ILocationModel extends mongoose.Model<ILocation> {
  findNearby(longitude: number, latitude: number, maxDistanceMeters?: number, type?: string): mongoose.Query<ILocation[], ILocation>;
  findWithinRadius(longitude: number, latitude: number, radiusMeters: number, type?: string): mongoose.Query<ILocation[], ILocation>;
  searchByText(searchText: string, options?: any): mongoose.Query<ILocation[], ILocation>;
}

// Export the model with custom interface
export default mongoose.model<ILocation, ILocationModel>('Location', LocationSchema);

// Helper function to create aggregation pipeline for nearby search with distance
export const createNearbyAggregationPipeline = (
  longitude: number,
  latitude: number,
  maxDistanceMeters: number,
  type?: string,
  searchText?: string,
  limit: number = 20
) => {
  const pipeline: any[] = [];

  // Geospatial search stage
  pipeline.push({
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      distanceField: 'distance',
      maxDistance: maxDistanceMeters,
      spherical: true,
      distanceMultiplier: 1 // distance in meters
    }
  });

  // Filter by type if specified
  if (type) {
    pipeline.push({
      $match: { type }
    });
  }

  // Text search filter if specified
  if (searchText) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { address: { $regex: searchText, $options: 'i' } },
          { amenities: { $in: [new RegExp(searchText, 'i')] } }
        ]
      }
    });
  }

  // Add formatted distance field
  pipeline.push({
    $addFields: {
      distanceFormatted: {
        $cond: {
          if: { $lt: ['$distance', 1000] },
          then: { $concat: [{ $toString: { $round: ['$distance', 0] } }, 'm'] },
          else: { $concat: [{ $toString: { $round: [{ $divide: ['$distance', 1000] }, 1] } }, 'km'] }
        }
      }
    }
  });

  // Sort by distance and limit results
  pipeline.push({ $sort: { distance: 1 } });
  pipeline.push({ $limit: limit });

  return pipeline;
};