import { BusStop, MetroStation, BusRoute } from '../types';
import { TransportDatabaseService } from './transportDatabaseService';
import { RoadRoutingService } from './roadRoutingService';

export class TransitDataService {
  static getBusStop(stopId: string): BusStop | undefined {
    const raw = TransportDatabaseService.getBusStopById(stopId);
    if (!raw) return undefined;
    return {
      stopId: raw.id,
      stopName: raw.name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      servedRoutes: raw.servedRoutes,
      accessibility: {
        wheelchairAccessible: raw.wheelchairAccessible,
        stepFree: raw.stepFree,
        ramp: raw.ramp,
        shelter: raw.shelter,
        seating: raw.seating,
        lighting: raw.lighting
      },
      source: 'TGSRTC',
      lastUpdated: raw.lastUpdated
    };
  }

  static getMetroStation(stationId: string): MetroStation | undefined {
    const raw = TransportDatabaseService.getMetroStationById(stationId);
    if (!raw) return undefined;
    const line = raw.lineIds[0] || 'Red';
    const lineColor = line === 'Red' ? '#ef4444' : line === 'Blue' ? '#3b82f6' : '#10b981';

    return {
      stationId: raw.id,
      stationName: raw.name,
      line,
      lineColor,
      latitude: raw.latitude,
      longitude: raw.longitude,
      interchangeWith: raw.interchangeLines,
      accessibility: {
        elevator: raw.elevator,
        escalator: raw.escalator,
        stairs: raw.stairs,
        ramp: raw.ramp,
        wheelchairAccessible: raw.wheelchairAccessible,
        stepFree: raw.stepFree,
        tactilePaving: raw.tactilePaving
      },
      operatingHours: {
        firstTrain: '06:00',
        lastTrain: '23:00',
        frequencyMinutes: 4.5
      },
      platforms: raw.platforms,
      source: 'HMRL',
      lastUpdated: raw.lastUpdated
    };
  }

  static getBusRoute(routeId: string): BusRoute | undefined {
    const raw = TransportDatabaseService.getBusRouteById(routeId);
    if (!raw) return undefined;
    return {
      routeId: raw.id,
      routeNumber: raw.routeNumber,
      routeName: raw.routeName,
      agency: 'TGSRTC',
      direction: raw.direction === '0' || raw.direction === 'Up' ? 'Up' : 'Down',
      origin: raw.origin,
      destination: raw.destination,
      stops: raw.orderedStopIds,
      frequencyMinutes: raw.frequencyMinutes,
      operatingHours: {
        start: raw.operatingHours.firstBus,
        end: raw.operatingHours.lastBus
      },
      baseFare: raw.baseFare,
      coordinates: raw.shapeCoordinates,
      accessibility: raw.accessibility,
      source: 'TGSRTC',
      lastUpdated: raw.lastUpdated
    };
  }

  static getAllBusStops(): BusStop[] {
    return TransportDatabaseService.getAllBusStops().map(raw => ({
      stopId: raw.id,
      stopName: raw.name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      servedRoutes: raw.servedRoutes,
      accessibility: {
        wheelchairAccessible: raw.wheelchairAccessible,
        stepFree: raw.stepFree,
        ramp: raw.ramp,
        shelter: raw.shelter,
        seating: raw.seating,
        lighting: raw.lighting
      },
      source: 'TGSRTC',
      lastUpdated: raw.lastUpdated
    }));
  }

  static getAllMetroStations(): MetroStation[] {
    return TransportDatabaseService.getAllMetroStations().map(raw => {
      const line = raw.lineIds[0] || 'Red';
      const lineColor = line === 'Red' ? '#ef4444' : line === 'Blue' ? '#3b82f6' : '#10b981';
      return {
        stationId: raw.id,
        stationName: raw.name,
        line,
        lineColor,
        latitude: raw.latitude,
        longitude: raw.longitude,
        interchangeWith: raw.interchangeLines,
        accessibility: {
          elevator: raw.elevator,
          escalator: raw.escalator,
          stairs: raw.stairs,
          ramp: raw.ramp,
          wheelchairAccessible: raw.wheelchairAccessible,
          stepFree: raw.stepFree,
          tactilePaving: raw.tactilePaving
        },
        operatingHours: {
          firstTrain: '06:00',
          lastTrain: '23:00',
          frequencyMinutes: 4.5
        },
        platforms: raw.platforms,
        source: 'HMRL',
        lastUpdated: raw.lastUpdated
      };
    });
  }

  static getAllBusRoutes(): BusRoute[] {
    return TransportDatabaseService.getAllBusRoutes().map(raw => ({
      routeId: raw.id,
      routeNumber: raw.routeNumber,
      routeName: raw.routeName,
      agency: 'TGSRTC',
      direction: raw.direction === '0' || raw.direction === 'Up' ? 'Up' : 'Down',
      origin: raw.origin,
      destination: raw.destination,
      stops: raw.orderedStopIds,
      frequencyMinutes: raw.frequencyMinutes,
      operatingHours: {
        start: raw.operatingHours.firstBus,
        end: raw.operatingHours.lastBus
      },
      baseFare: raw.baseFare,
      coordinates: raw.shapeCoordinates,
      accessibility: raw.accessibility,
      source: 'TGSRTC',
      lastUpdated: raw.lastUpdated
    }));
  }

  /**
   * Find nearest bus stop to given coordinates from complete TGSRTC stop inventory
   */
  static findNearestBusStop(lat: number, lon: number): { stop: BusStop; distanceMeters: number } {
    const stops = this.getAllBusStops();
    let nearest = stops[0];
    let minDistance = Infinity;

    for (const stop of stops) {
      const dist = RoadRoutingService.calculateDistanceMeters(lat, lon, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = stop;
      }
    }

    return { stop: nearest, distanceMeters: minDistance };
  }

  /**
   * Find all candidate bus stops within walking distance of given coordinates
   */
  static findNearbyBusStops(
    lat: number,
    lon: number,
    maxRadiusMeters: number = 2000,
    limit: number = 6
  ): { stop: BusStop; distanceMeters: number }[] {
    const stops = this.getAllBusStops();
    const ranked = stops
      .map(stop => ({
        stop,
        distanceMeters: RoadRoutingService.calculateDistanceMeters(lat, lon, stop.latitude, stop.longitude)
      }))
      .filter(item => item.distanceMeters <= maxRadiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    if (ranked.length === 0) {
      return [this.findNearestBusStop(lat, lon)];
    }
    return ranked.slice(0, limit);
  }

  /**
   * Find nearest metro station to given coordinates from complete HMRL station inventory
   */
  static findNearestMetroStation(lat: number, lon: number): { station: MetroStation; distanceMeters: number } {
    const stations = this.getAllMetroStations();
    let nearest = stations[0];
    let minDistance = Infinity;

    for (const station of stations) {
      const dist = RoadRoutingService.calculateDistanceMeters(lat, lon, station.latitude, station.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = station;
      }
    }

    return { station: nearest, distanceMeters: minDistance };
  }

  /**
   * Find candidate metro stations within walking distance of given coordinates
   */
  static findNearbyMetroStations(
    lat: number,
    lon: number,
    maxRadiusMeters: number = 2000,
    limit: number = 4
  ): { station: MetroStation; distanceMeters: number }[] {
    const stations = this.getAllMetroStations();
    const ranked = stations
      .map(station => ({
        station,
        distanceMeters: RoadRoutingService.calculateDistanceMeters(lat, lon, station.latitude, station.longitude)
      }))
      .filter(item => item.distanceMeters <= maxRadiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return ranked.slice(0, limit);
  }

  /**
   * Find direct bus routes between two stops or locations
   */
  static findDirectBusRoutes(originStopId: string, destStopId: string): BusRoute[] {
    const allRoutes = this.getAllBusRoutes();
    return allRoutes.filter(route => {
      const originIdx = route.stops.indexOf(originStopId);
      const destIdx = route.stops.indexOf(destStopId);
      return originIdx !== -1 && destIdx !== -1 && originIdx !== destIdx;
    });
  }
}
