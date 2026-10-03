/**
 * WAYFIND Phase 1 — Comprehensive Hyderabad Public Transport Database Schemas
 * Authoritative GTFS and Structured Transit Definitions for TGSRTC and HMRL
 */

export type TransitEntityType =
  | 'BUS_STOP'
  | 'METRO_STATION'
  | 'INTERCHANGE'
  | 'TERMINAL'
  | 'LANDMARK';

export type TransportDataType =
  | 'OFFICIAL'
  | 'SCHEDULED'
  | 'ESTIMATED'
  | 'DEMO'
  | 'LIVE';

export interface Agency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang: string;
  agency_phone?: string;
  attribution: string;
}

export interface BusStopRecord {
  id: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  code?: string;
  latitude: number;
  longitude: number;
  locationType: 'stop' | 'station' | 'entrance';
  parentStationId?: string;
  zoneId?: string;
  agencyId: 'TGSRTC';
  wheelchairAccessible: boolean;
  stepFree: boolean;
  ramp: boolean;
  shelter: boolean;
  seating: boolean;
  lighting: boolean;
  source: string;
  dataSource: string;
  dataType: TransportDataType;
  lastUpdated: string;
  servedRoutes: string[]; // List of route numbers e.g. ["8A", "1Z", "189M"]
  locality?: string;
}

export interface BusRouteRecord {
  id: string;
  sourceId: string;
  routeNumber: string;
  routeName: string;
  agencyId: 'TGSRTC';
  direction: '0' | '1' | 'Up' | 'Down';
  origin: string;
  destination: string;
  orderedStopIds: string[]; // Ordered stop IDs representing official stop sequence
  frequencyMinutes: number;
  operatingHours: {
    firstBus: string;
    lastBus: string;
  };
  transportType: 'Bus' | 'Metro Express' | 'Deluxe' | 'Ordinary';
  baseFare: number;
  shapeCoordinates: [number, number][]; // [lat, lng] shape points
  accessibility: {
    lowFloorBus: boolean;
    wheelchairRamp: boolean;
    audioVisualAnnouncements: boolean;
  };
  source: string;
  dataType: TransportDataType;
  lastUpdated: string;
}

export interface BusTripRecord {
  tripId: string;
  routeId: string;
  serviceId: string;
  tripHeadsign: string;
  directionId: number;
  shapeId?: string;
  wheelchairAccessible: boolean;
}

export interface BusStopTimeRecord {
  tripId: string;
  stopId: string;
  stopSequence: number;
  arrivalTime: string;
  departureTime: string;
  pickupType?: number;
  dropOffType?: number;
}

export interface BusShapeRecord {
  shapeId: string;
  coordinates: [number, number][];
}

export interface BusFareRecord {
  fareId: string;
  serviceType: 'Ordinary' | 'Metro Express' | 'Deluxe';
  minDistanceKm: number;
  maxDistanceKm: number;
  fareAmount: number;
  currency: string;
  rulesDescription: string;
  source: string;
  lastUpdated: string;
  dataType: TransportDataType;
}

export interface MetroStationRecord {
  id: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  status?: 'OPERATING' | 'PLANNED' | 'PROPOSED' | 'CLOSED' | 'UNKNOWN';
  latitude: number;
  longitude: number;
  lineIds: ('Red' | 'Blue' | 'Green')[];
  sequenceByLine: Record<string, number>;
  interchange: boolean;
  interchangeLines?: ('Red' | 'Blue' | 'Green')[];
  terminal: boolean;
  elevator: boolean;
  escalator: boolean;
  stairs: boolean;
  ramp: boolean;
  wheelchairAccessible: boolean;
  stepFree: boolean;
  tactilePaving: boolean;
  platforms: string[];
  facilities: string[];
  busConnections: string[];
  lastMileConnections: string[];
  source: string;
  dataType: TransportDataType;
  lastUpdated: string;
}

export interface MetroLineRecord {
  id: 'Red' | 'Blue' | 'Green';
  name: string;
  corridorName: string;
  color: string;
  status: 'OPERATING' | 'PLANNED' | 'PROPOSED' | 'CLOSED' | 'UNKNOWN';
  orderedStationIds: string[];
  origin: string;
  destination: string;
  totalStations: number;
  operationalLengthKm: number;
  operatingHours: {
    firstTrain: string;
    lastTrain: string;
    frequencyMinutes: number;
  };
  interchangeStations: string[];
  routeGeometry: [number, number][];
  source: string;
  lastUpdated: string;
}

export interface MetroScheduleRecord {
  stationId: string;
  lineId: 'Red' | 'Blue' | 'Green';
  direction: string;
  firstTrain: string;
  lastTrain: string;
  peakFrequencyMinutes: number;
  offPeakFrequencyMinutes: number;
}

export interface MetroFareRecord {
  stageId: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  fareAmount: number;
  currency: string;
  rulesDescription: string;
  source: string;
  lastUpdated: string;
}

export interface TransportConnectionRecord {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromType: TransitEntityType;
  toType: TransitEntityType;
  mode: 'walk' | 'transfer';
  distanceMeters: number;
  walkingTimeMinutes: number;
  transferWindowMinutes: number;
  stepFree: boolean;
  elevatorAvailable: boolean;
  notes: string;
  source: string;
  dataType: TransportDataType;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  publisher: string;
  datasetVersion: string;
  retrievedAt: string;
  lastUpdated: string;
  license: string;
  url: string;
  status: 'ACTIVE_VERIFIED' | 'STABLE_MIRROR';
}

export interface DataQualityReport {
  timestamp: string;
  totalBusStops: number;
  totalBusRoutes: number;
  totalMetroStations: number;
  totalMetroLines: number;
  totalInterchanges: number;
  totalTrips: number;
  totalStopTimes: number;
  totalShapes: number;
  totalFareRecords: number;
  totalConnections: number;
  validation: {
    validCoordinatesCount: number;
    invalidCoordinatesCount: number;
    validNamesCount: number;
    missingNamesCount: number;
    brokenRouteRelationshipsCount: number;
    duplicateRecordsMerged: number;
    allChecksPassed: boolean;
  };
  sources: DataSourceInfo[];
}

export interface UnifiedSearchResult {
  id: string;
  sourceId: string;
  name: string;
  type: TransitEntityType;
  latitude: number;
  longitude: number;
  locality: string;
  address: string;
  subtitle: string;
  linesOrRoutes: string[];
  interchange?: boolean;
  wheelchairAccessible?: boolean;
  stepFree?: boolean;
  source: string;
  score: number;
}

export type SearchFilterType = 'all' | 'bus_stop' | 'metro_station' | 'landmark';
