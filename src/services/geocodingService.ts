import { LocationItem, LocationType } from '../types';
import { UnifiedSearchService } from './unifiedSearchService';
import { SearchFilterType } from '../types/transitDatabase';
import { TransportDatabaseService } from './transportDatabaseService';

const cache = new Map<string, LocationItem[]>();

export class GeocodingService {
  /**
   * Search unified public transit database (TGSRTC bus stops & HMRL metro stations)
   * with typo tolerance, prefix matching, and ranking
   */
  static async searchLocations(
    query: string,
    filter: SearchFilterType = 'all'
  ): Promise<LocationItem[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const cacheKey = `${filter}:${cleanQuery.toLowerCase()}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    // 1. Search Unified Public Transport Database
    const unifiedResults = UnifiedSearchService.search(cleanQuery, filter, 12);

    if (unifiedResults.length > 0) {
      const locationItems: LocationItem[] = unifiedResults.map(item => {
        let locType: LocationType = 'address';
        if (item.type === 'BUS_STOP') locType = 'bus_stop';
        else if (item.type === 'METRO_STATION' || item.type === 'INTERCHANGE' || item.type === 'TERMINAL') {
          locType = 'metro_station';
        }

        return {
          id: item.id,
          name: item.name,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          type: locType,
          landmark: item.subtitle,
          locality: item.locality
        };
      });

      cache.set(cacheKey, locationItems);
      return locationItems;
    }

    // 2. Fallback to OpenStreetMap Nominatim for general addresses outside the transit network
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery + ', Hyderabad'
      )}&limit=5&bounded=1&viewbox=78.15,17.15,78.70,17.65`;

      const res = await fetch(endpoint, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WAYFIND-Transit-Planner/1.0'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const osmResults: LocationItem[] = data.map((item: { place_id: number; display_name: string; lat: string; lon: string; type: string }) => ({
            id: `osm-${item.place_id}`,
            name: item.display_name.split(',')[0],
            address: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            type: 'address',
            locality: 'Hyderabad & Surrounds'
          }));
          cache.set(cacheKey, osmResults);
          return osmResults;
        }
      }
    } catch {
      // Quiet fallback
    }

    return [];
  }

  /**
   * Reverse geocodes coordinates to closest known transit stop or station
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<LocationItem> {
    TransportDatabaseService.initialize();
    const allStops = TransportDatabaseService.getAllBusStops();
    const allMetro = TransportDatabaseService.getAllMetroStations();

    let closest: { name: string; lat: number; lng: number; type: LocationType; address: string } | null = null;
    let minDistance = Infinity;

    // Check metro first
    for (const stn of allMetro) {
      const dist = Math.hypot(stn.latitude - latitude, stn.longitude - longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          name: stn.name,
          lat: stn.latitude,
          lng: stn.longitude,
          type: 'metro_station',
          address: `${stn.name}, Hyderabad Metro Rail`
        };
      }
    }

    // Check bus stops
    for (const stop of allStops) {
      const dist = Math.hypot(stop.latitude - latitude, stop.longitude - longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = {
          name: stop.name,
          lat: stop.latitude,
          lng: stop.longitude,
          type: 'bus_stop',
          address: `${stop.name}, TGSRTC Bus Network`
        };
      }
    }

    if (closest && minDistance < 0.01) {
      return {
        id: `current-near-${closest.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: `Current Location (near ${closest.name})`,
        address: `Detected GPS location near ${closest.name}, Hyderabad`,
        latitude,
        longitude,
        type: closest.type,
        locality: 'Detected GPS Position'
      };
    }

    return {
      id: `gps-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
      name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      address: `Near coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Hyderabad`,
      latitude,
      longitude,
      type: 'address',
      locality: 'Detected GPS'
    };
  }
}
