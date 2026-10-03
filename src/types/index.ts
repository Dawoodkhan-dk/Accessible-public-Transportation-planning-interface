export type TransportMode = 'bus' | 'metro' | 'auto' | 'cab' | 'walk' | 'transfer';

export type LocationType = 'bus_stop' | 'metro_station' | 'landmark' | 'neighborhood' | 'address';

export interface LocationItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  landmark?: string;
  locality?: string;
}

export interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  servedRoutes: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    stepFree: boolean;
    ramp: boolean;
    shelter: boolean;
    seating: boolean;
    lighting: boolean;
  };
  source: 'TGSRTC' | 'Estimated' | 'Demo';
  lastUpdated: string;
}

export interface MetroStation {
  stationId: string;
  stationName: string;
  line: 'Red' | 'Blue' | 'Green';
  lineColor: string;
  latitude: number;
  longitude: number;
  interchangeWith?: ('Red' | 'Blue' | 'Green')[];
  accessibility: {
    elevator: boolean;
    escalator: boolean;
    stairs: boolean;
    ramp: boolean;
    wheelchairAccessible: boolean;
    stepFree: boolean;
    tactilePaving: boolean;
  };
  operatingHours: {
    firstTrain: string;
    lastTrain: string;
    frequencyMinutes: number;
  };
  platforms: string[];
  alerts?: string[];
  source: 'HMRL' | 'Estimated' | 'Demo';
  lastUpdated: string;
}

export interface BusRoute {
  routeId: string;
  routeNumber: string;
  routeName: string;
  agency: 'TGSRTC';
  direction: 'Up' | 'Down';
  origin: string;
  destination: string;
  stops: string[]; // stopIds in order
  frequencyMinutes: number;
  operatingHours: {
    start: string;
    end: string;
  };
  baseFare: number;
  coordinates: [number, number][]; // [lat, lng] shape
  accessibility: {
    lowFloorBus: boolean;
    wheelchairRamp: boolean;
    audioVisualAnnouncements: boolean;
  };
  source: 'TGSRTC' | 'Estimated' | 'Demo';
  lastUpdated: string;
}

export interface TrafficSegment {
  segmentId: string;
  fromName: string;
  toName: string;
  trafficLevel: 'Light' | 'Moderate' | 'Heavy' | 'Severe';
  delayMinutes: number;
  averageSpeedKmh: number;
  source: 'Demo Traffic' | 'Traffic Estimate';
  dataType: 'Demo' | 'Estimated';
  lastUpdated: string;
}

export interface ServiceAlert {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'alert';
  mode: TransportMode;
  affectedLineOrRoute: string;
  locationName: string;
  what: string;
  where: string;
  when: string;
  whoIsAffected: string;
  alternative: string;
  active: boolean;
}

export interface JourneySegment {
  id: string;
  mode: TransportMode;
  routeNumber?: string;
  routeName: string;
  from: {
    name: string;
    coordinates: [number, number];
    time: string;
  };
  to: {
    name: string;
    coordinates: [number, number];
    time: string;
  };
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  distanceMeters: number;
  fare: number;
  fareLabel?: string;
  geometry: [number, number][]; // [lat, lng] points
  traffic?: {
    level: 'Light' | 'Moderate' | 'Heavy' | 'Severe';
    delayMinutes: number;
  };
  accessibility: {
    stepFree: boolean;
    wheelchair: boolean;
    elevator: boolean;
    ramp: boolean;
    stairsRequired: boolean;
    notes?: string;
  };
  instructions: string[];
  intermediateStops?: string[];
  stopCount?: number;
  source: 'TGSRTC' | 'HMRL' | 'Estimated' | 'Demo';
}

export interface JourneyOption {
  id: string;
  title: string;
  modeCategory: 'Direct Bus' | 'Metro' | 'Multimodal' | 'Auto' | 'Cab' | 'Walk';
  departureTime: string;
  arrivalTime: string;
  totalDurationMinutes: number;
  baseDurationMinutes: number;
  trafficDelayMinutes: number;
  walkingDurationMinutes: number;
  walkingDistanceMeters: number;
  waitingDurationMinutes: number;
  transferDurationMinutes: number;
  transfersCount: number;
  fare: {
    min: number;
    max: number;
    currency: string;
    type: 'Official' | 'Estimated' | 'Free';
    description: string;
  };
  traffic: {
    overallLevel: 'Light' | 'Moderate' | 'Heavy' | 'Severe';
    totalDelayMinutes: number;
    source: 'Demo Traffic' | 'Traffic Estimate';
  };
  accessibility: {
    stepFree: boolean;
    wheelchairAccessible: boolean;
    avoidStairs: boolean;
    elevatorAvailable: boolean;
    notes: string[];
  };
  segments: JourneySegment[];
  alerts: ServiceAlert[];
  recommendedLeaveTime: string;
  bufferMinutes?: number;
  tags: ('DIRECT' | 'FASTEST' | 'FEWEST TRANSFERS' | 'LOWEST FARE' | 'LEAST WALKING' | 'ACCESSIBLE')[];
}

export type TimeMode = 'now' | 'depart_at' | 'arrive_by';

export interface TimePlanningConfig {
  mode: TimeMode;
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:mm
}

export interface AccessibilityPreferences {
  stepFree: boolean;
  wheelchairAccessible: boolean;
  avoidStairs: boolean;
  elevatorRequired: boolean;
  reduceWalking: boolean;
  largerText: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  simplifiedInstructions: boolean;
  reduceMotion: boolean;
}

export type RouteSortFilter = 'all' | 'fastest' | 'fewest_transfers' | 'lowest_fare' | 'least_walking' | 'accessible';
