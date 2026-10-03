import { BusStop, MetroStation, BusRoute, TrafficSegment, ServiceAlert, LocationItem } from '../types';

export const HYDERABAD_LOCATIONS: LocationItem[] = [
  {
    id: 'loc-charminar',
    name: 'Charminar',
    address: 'Charminar Road, Old City, Hyderabad 500002',
    latitude: 17.3616,
    longitude: 78.4747,
    type: 'landmark',
    landmark: 'Historical Monument & Bazaars',
    locality: 'Old City, Hyderabad'
  },
  {
    id: 'loc-koti',
    name: 'Koti',
    address: 'Koti Bus Station, Sultan Bazar, Hyderabad 500095',
    latitude: 17.3824,
    longitude: 78.4870,
    type: 'bus_stop',
    landmark: 'Koti Women’s College & Commercial Hub',
    locality: 'Central Hyderabad'
  },
  {
    id: 'loc-mehdipatnam',
    name: 'Mehdipatnam',
    address: 'Mehdipatnam Bus Depot & Junction, Hyderabad 500028',
    latitude: 17.3916,
    longitude: 78.4398,
    type: 'bus_stop',
    landmark: 'Mehdipatnam Rythu Bazar & Depot',
    locality: 'South-West Hyderabad'
  },
  {
    id: 'loc-moinabad',
    name: 'Moinabad',
    address: 'Moinabad Town Center, Chevella Road, Rangareddy 501504',
    latitude: 17.3235,
    longitude: 78.2778,
    type: 'neighborhood',
    landmark: 'Chilkur Balaji Cross / Moinabad Junction',
    locality: 'Rangareddy District'
  },
  {
    id: 'loc-gachibowli',
    name: 'Gachibowli',
    address: 'Gachibowli Junction / Stadium, Hyderabad 500032',
    latitude: 17.4401,
    longitude: 78.3489,
    type: 'neighborhood',
    landmark: 'Gachibowli Flyover & Financial District Hub',
    locality: 'Cyberabad IT Corridor'
  },
  {
    id: 'loc-hitec-city',
    name: 'HITEC City',
    address: 'Cyber Towers, Madhapur, Hyderabad 500081',
    latitude: 17.4504,
    longitude: 78.3808,
    type: 'metro_station',
    landmark: 'Cyber Towers & Mindspace IT Park',
    locality: 'Madhapur'
  },
  {
    id: 'loc-ameerpet',
    name: 'Ameerpet',
    address: 'Ameerpet Metro Interchange, Hyderabad 500016',
    latitude: 17.4375,
    longitude: 78.4483,
    type: 'metro_station',
    landmark: 'Red & Blue Line Metro Interchange',
    locality: 'Ameerpet Crossroads'
  },
  {
    id: 'loc-secunderabad',
    name: 'Secunderabad Railway Station',
    address: 'Station Road, Secunderabad 500003',
    latitude: 17.4344,
    longitude: 78.5016,
    type: 'landmark',
    landmark: 'South Central Railway HQ & Transit Hub',
    locality: 'Secunderabad'
  },
  {
    id: 'loc-nampally',
    name: 'Nampally (Hyderabad Station)',
    address: 'Station Road, Nampally, Hyderabad 500001',
    latitude: 17.3920,
    longitude: 78.4697,
    type: 'metro_station',
    landmark: 'Hyderabad Deccan Station & Exhibition Grounds',
    locality: 'Nampally'
  },
  {
    id: 'loc-mgbs',
    name: 'MGBS (Mahatma Gandhi Bus Station)',
    address: 'Imlibun Island, Gowliguda, Hyderabad 500012',
    latitude: 17.3776,
    longitude: 78.4795,
    type: 'metro_station',
    landmark: 'Inter-state Bus Terminus & Metro Interchange',
    locality: 'Imlibun'
  },
  {
    id: 'loc-dilsukhnagar',
    name: 'Dilsukhnagar',
    address: 'Main Road, Dilsukhnagar, Hyderabad 500060',
    latitude: 17.3688,
    longitude: 78.5247,
    type: 'metro_station',
    landmark: 'Dilsukhnagar Bus Stand & Metro Station',
    locality: 'East Hyderabad'
  },
  {
    id: 'loc-lb-nagar',
    name: 'LB Nagar',
    address: 'LB Nagar Ring Road Junction, Hyderabad 500074',
    latitude: 17.3457,
    longitude: 78.5522,
    type: 'metro_station',
    landmark: 'Metro Red Line Terminal & Vijayawada Highway',
    locality: 'LB Nagar'
  },
  {
    id: 'loc-miyapur',
    name: 'Miyapur',
    address: 'Miyapur Metro Station, NH 65, Hyderabad 500049',
    latitude: 17.4968,
    longitude: 78.3614,
    type: 'metro_station',
    landmark: 'Metro Red Line Terminal & Bus Depot',
    locality: 'North-West Hyderabad'
  },
  {
    id: 'loc-raidurg',
    name: 'Raidurg (HITEC City Terminal)',
    address: 'Mindspace Junction, Raidurg, Hyderabad 500081',
    latitude: 17.4398,
    longitude: 78.3768,
    type: 'metro_station',
    landmark: 'Blue Line Metro Terminal near Knowledge City',
    locality: 'Financial District'
  },
  {
    id: 'loc-lakdikapul',
    name: 'Lakdikapul',
    address: 'Lakdikapul Junction, Hyderabad 500004',
    latitude: 17.4042,
    longitude: 78.4608,
    type: 'metro_station',
    landmark: 'Saifabad & Secretariat Road',
    locality: 'Central Hyderabad'
  },
  {
    id: 'loc-jubilee-hills',
    name: 'Jubilee Hills Check Post',
    address: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    latitude: 17.4305,
    longitude: 78.4075,
    type: 'metro_station',
    landmark: 'Peddamma Temple & Commercial Corridor',
    locality: 'Jubilee Hills'
  },
  {
    id: 'loc-shamshabad',
    name: 'Shamshabad (RGIA Outer)',
    address: 'Shamshabad Town, Hyderabad 501218',
    latitude: 17.2605,
    longitude: 78.4239,
    type: 'neighborhood',
    landmark: 'Airport Approach & ORR Junction',
    locality: 'South Hyderabad'
  }
];

export const BUS_STOPS: Record<string, BusStop> = {
  'stop-charminar': {
    stopId: 'stop-charminar',
    stopName: 'Charminar Bus Stop',
    latitude: 17.3622,
    longitude: 78.4740,
    servedRoutes: ['8A', '1Z', '189M', '2M', '9M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-afzalgunj': {
    stopId: 'stop-afzalgunj',
    stopName: 'Afzalgunj Bus Station',
    latitude: 17.3735,
    longitude: 78.4770,
    servedRoutes: ['8A', '1Z', '2M', '189M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-koti-womens-college': {
    stopId: 'stop-koti-womens-college',
    stopName: 'Koti Women’s College Bus Stop',
    latitude: 17.3810,
    longitude: 78.4855,
    servedRoutes: ['8A', '1Z', '2M', '127K'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-koti': {
    stopId: 'stop-koti',
    stopName: 'Koti Bus Terminus',
    latitude: 17.3828,
    longitude: 78.4868,
    servedRoutes: ['8A', '1Z', '127K', '218', '222', '2M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-puranapul': {
    stopId: 'stop-puranapul',
    stopName: 'Puranapul Bridge Bus Stop',
    latitude: 17.3685,
    longitude: 78.4612,
    servedRoutes: ['189M', '94R'],
    accessibility: {
      wheelchairAccessible: false,
      stepFree: false,
      ramp: false,
      shelter: true,
      seating: false,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-bahadurpura': {
    stopId: 'stop-bahadurpura',
    stopName: 'Bahadurpura Junction Stop',
    latitude: 17.3610,
    longitude: 78.4520,
    servedRoutes: ['189M', '94R'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-mehdipatnam': {
    stopId: 'stop-mehdipatnam',
    stopName: 'Mehdipatnam Bus Terminal & Depot',
    latitude: 17.3918,
    longitude: 78.4402,
    servedRoutes: ['189M', '288D', '222', '5K', '49M', '113M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-attapur': {
    stopId: 'stop-attapur',
    stopName: 'Attapur Pillar 120 Stop',
    latitude: 17.3712,
    longitude: 78.4230,
    servedRoutes: ['288D', '189M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-appa-junction': {
    stopId: 'stop-appa-junction',
    stopName: 'APPA Junction (Outer Ring Road)',
    latitude: 17.3480,
    longitude: 78.3680,
    servedRoutes: ['288D'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-chilkur-cross': {
    stopId: 'stop-chilkur-cross',
    stopName: 'Chilkur Balaji Cross Roads',
    latitude: 17.3360,
    longitude: 78.3180,
    servedRoutes: ['288D'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: false,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-moinabad': {
    stopId: 'stop-moinabad',
    stopName: 'Moinabad Main Stop',
    latitude: 17.3238,
    longitude: 78.2785,
    servedRoutes: ['288D'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-nampally': {
    stopId: 'stop-nampally',
    stopName: 'Nampally Station Bus Stop',
    latitude: 17.3925,
    longitude: 78.4705,
    servedRoutes: ['127K', '218', '222', '8A'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-tolichowki': {
    stopId: 'stop-tolichowki',
    stopName: 'Tolichowki Cross Road Bus Stop',
    latitude: 17.4080,
    longitude: 78.4110,
    servedRoutes: ['222', '127K'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'stop-gachibowli': {
    stopId: 'stop-gachibowli',
    stopName: 'Gachibowli Outer Ring Road Stop',
    latitude: 17.4410,
    longitude: 78.3495,
    servedRoutes: ['222', '127K', '113M'],
    accessibility: {
      wheelchairAccessible: true,
      stepFree: true,
      ramp: true,
      shelter: true,
      seating: true,
      lighting: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  }
};

export const BUS_ROUTES: Record<string, BusRoute> = {
  'route-8a': {
    routeId: 'route-8a',
    routeNumber: '8A',
    routeName: 'Charminar to Secunderabad via Koti',
    agency: 'TGSRTC',
    direction: 'Up',
    origin: 'Charminar',
    destination: 'Secunderabad',
    stops: ['stop-charminar', 'stop-afzalgunj', 'stop-koti-womens-college', 'stop-koti'],
    frequencyMinutes: 8,
    operatingHours: { start: '05:00', end: '23:30' },
    baseFare: 20,
    coordinates: [
      [17.3622, 78.4740], // Charminar
      [17.3670, 78.4755], // Nayapul
      [17.3735, 78.4770], // Afzalgunj
      [17.3770, 78.4820], // Putlibowli
      [17.3810, 78.4855], // Koti Women's College
      [17.3828, 78.4868]  // Koti Terminus
    ],
    accessibility: {
      lowFloorBus: true,
      wheelchairRamp: true,
      audioVisualAnnouncements: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'route-1z': {
    routeId: 'route-1z',
    routeNumber: '1Z',
    routeName: 'Charminar to Secunderabad (Express)',
    agency: 'TGSRTC',
    direction: 'Up',
    origin: 'Charminar',
    destination: 'Secunderabad',
    stops: ['stop-charminar', 'stop-afzalgunj', 'stop-koti'],
    frequencyMinutes: 12,
    operatingHours: { start: '05:30', end: '23:00' },
    baseFare: 25,
    coordinates: [
      [17.3622, 78.4740],
      [17.3735, 78.4770],
      [17.3828, 78.4868]
    ],
    accessibility: {
      lowFloorBus: true,
      wheelchairRamp: true,
      audioVisualAnnouncements: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'route-189m': {
    routeId: 'route-189m',
    routeNumber: '189M',
    routeName: 'Charminar to Mehdipatnam',
    agency: 'TGSRTC',
    direction: 'Up',
    origin: 'Charminar',
    destination: 'Mehdipatnam',
    stops: ['stop-charminar', 'stop-puranapul', 'stop-bahadurpura', 'stop-mehdipatnam'],
    frequencyMinutes: 10,
    operatingHours: { start: '05:15', end: '23:15' },
    baseFare: 25,
    coordinates: [
      [17.3622, 78.4740], // Charminar
      [17.3685, 78.4612], // Puranapul
      [17.3610, 78.4520], // Bahadurpura
      [17.3760, 78.4450], // Karwan
      [17.3918, 78.4402]  // Mehdipatnam
    ],
    accessibility: {
      lowFloorBus: true,
      wheelchairRamp: true,
      audioVisualAnnouncements: false
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'route-288d': {
    routeId: 'route-288d',
    routeNumber: '288D',
    routeName: 'Mehdipatnam to Moinabad / Chevella',
    agency: 'TGSRTC',
    direction: 'Down',
    origin: 'Mehdipatnam',
    destination: 'Moinabad',
    stops: ['stop-mehdipatnam', 'stop-attapur', 'stop-appa-junction', 'stop-chilkur-cross', 'stop-moinabad'],
    frequencyMinutes: 15,
    operatingHours: { start: '05:45', end: '22:30' },
    baseFare: 35,
    coordinates: [
      [17.3918, 78.4402], // Mehdipatnam
      [17.3712, 78.4230], // Attapur
      [17.3590, 78.3980], // Himayat Sagar
      [17.3480, 78.3680], // APPA Junction
      [17.3360, 78.3180], // Chilkur Cross
      [17.3238, 78.2785]  // Moinabad
    ],
    accessibility: {
      lowFloorBus: false,
      wheelchairRamp: false,
      audioVisualAnnouncements: false
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  },
  'route-222': {
    routeId: 'route-222',
    routeNumber: '222',
    routeName: 'Koti to Gachibowli via Mehdipatnam',
    agency: 'TGSRTC',
    direction: 'Up',
    origin: 'Koti',
    destination: 'Gachibowli',
    stops: ['stop-koti', 'stop-nampally', 'stop-mehdipatnam', 'stop-tolichowki', 'stop-gachibowli'],
    frequencyMinutes: 12,
    operatingHours: { start: '05:30', end: '23:00' },
    baseFare: 40,
    coordinates: [
      [17.3828, 78.4868], // Koti
      [17.3925, 78.4705], // Nampally
      [17.3918, 78.4402], // Mehdipatnam
      [17.4080, 78.4110], // Tolichowki
      [17.4250, 78.3850], // Shaikpet Dargah
      [17.4410, 78.3495]  // Gachibowli
    ],
    accessibility: {
      lowFloorBus: true,
      wheelchairRamp: true,
      audioVisualAnnouncements: true
    },
    source: 'TGSRTC',
    lastUpdated: '2026-09-15'
  }
};

export const METRO_STATIONS: Record<string, MetroStation> = {
  'stn-mgbs': {
    stationId: 'stn-mgbs',
    stationName: 'MGBS (Mahatma Gandhi Bus Station)',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.3776,
    longitude: 78.4795,
    interchangeWith: ['Green'],
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:00', lastTrain: '23:00', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards Miyapur)', 'Platform 2 (towards LB Nagar)', 'Platform 3 (Green towards JBS)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-nampally': {
    stationId: 'stn-nampally',
    stationName: 'Nampally',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.3920,
    longitude: 78.4697,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:05', lastTrain: '23:05', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards Miyapur)', 'Platform 2 (towards LB Nagar)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-lakdikapul': {
    stationId: 'stn-lakdikapul',
    stationName: 'Lakdikapul',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.4042,
    longitude: 78.4608,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:08', lastTrain: '23:08', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards Miyapur)', 'Platform 2 (towards LB Nagar)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-ameerpet': {
    stationId: 'stn-ameerpet',
    stationName: 'Ameerpet (Interchange Hub)',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.4375,
    longitude: 78.4483,
    interchangeWith: ['Blue'],
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:00', lastTrain: '23:15', frequencyMinutes: 4 },
    platforms: [
      'Level 1: Red Line (Miyapur ↔ LB Nagar)',
      'Level 2: Blue Line (Nagole ↔ Raidurg)'
    ],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-madhapur': {
    stationId: 'stn-madhapur',
    stationName: 'Madhapur',
    line: 'Blue',
    lineColor: '#3b82f6',
    latitude: 17.4425,
    longitude: 78.3980,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:15', lastTrain: '23:10', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards Raidurg)', 'Platform 2 (towards Nagole)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-hitec-city': {
    stationId: 'stn-hitec-city',
    stationName: 'HITEC City',
    line: 'Blue',
    lineColor: '#3b82f6',
    latitude: 17.4504,
    longitude: 78.3808,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:20', lastTrain: '23:15', frequencyMinutes: 4 },
    platforms: ['Platform 1 (towards Raidurg)', 'Platform 2 (towards Nagole)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-raidurg': {
    stationId: 'stn-raidurg',
    stationName: 'Raidurg (Terminal)',
    line: 'Blue',
    lineColor: '#3b82f6',
    latitude: 17.4398,
    longitude: 78.3768,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:22', lastTrain: '23:20', frequencyMinutes: 4 },
    platforms: ['Platform 1 (Arrival / Departure)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-parade-ground': {
    stationId: 'stn-parade-ground',
    stationName: 'Parade Ground / Secunderabad West',
    line: 'Blue',
    lineColor: '#3b82f6',
    latitude: 17.4420,
    longitude: 78.5020,
    interchangeWith: ['Green'],
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:00', lastTrain: '23:10', frequencyMinutes: 5 },
    platforms: ['Blue Line (Nagole ↔ Raidurg)', 'Green Line (JBS ↔ MGBS)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-lb-nagar': {
    stationId: 'stn-lb-nagar',
    stationName: 'LB Nagar (Red Line Terminal)',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.3457,
    longitude: 78.5522,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:00', lastTrain: '23:00', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards Miyapur)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  },
  'stn-miyapur': {
    stationId: 'stn-miyapur',
    stationName: 'Miyapur (Red Line Terminal)',
    line: 'Red',
    lineColor: '#ef4444',
    latitude: 17.4968,
    longitude: 78.3614,
    accessibility: {
      elevator: true,
      escalator: true,
      stairs: true,
      ramp: true,
      wheelchairAccessible: true,
      stepFree: true,
      tactilePaving: true
    },
    operatingHours: { firstTrain: '06:00', lastTrain: '23:00', frequencyMinutes: 5 },
    platforms: ['Platform 1 (towards LB Nagar)'],
    source: 'HMRL',
    lastUpdated: '2026-09-15'
  }
};

export const METRO_LINE_COORDINATES: Record<'Red' | 'Blue' | 'Green', [number, number][]> = {
  Red: [
    [17.4968, 78.3614], // Miyapur
    [17.4820, 78.3900], // KPHB
    [17.4650, 78.4200], // Bharat Nagar
    [17.4375, 78.4483], // Ameerpet (Interchange)
    [17.4180, 78.4550], // Punjagutta
    [17.4042, 78.4608], // Lakdikapul
    [17.3920, 78.4697], // Nampally
    [17.3776, 78.4795], // MGBS
    [17.3688, 78.5247], // Dilsukhnagar
    [17.3457, 78.5522]  // LB Nagar
  ],
  Blue: [
    [17.4398, 78.3768], // Raidurg
    [17.4504, 78.3808], // HITEC City
    [17.4425, 78.3980], // Madhapur
    [17.4305, 78.4075], // Jubilee Hills
    [17.4375, 78.4483], // Ameerpet (Interchange)
    [17.4400, 78.4700], // Begumpet
    [17.4420, 78.5020], // Parade Ground
    [17.4344, 78.5016], // Secunderabad East
    [17.4100, 78.5600]  // Nagole
  ],
  Green: [
    [17.4510, 78.4980], // JBS Parade Ground
    [17.4200, 78.4950], // RTC X Roads
    [17.3850, 78.4890], // Sultan Bazar
    [17.3776, 78.4795]  // MGBS
  ]
};

export const TRAFFIC_SEGMENTS: TrafficSegment[] = [
  {
    segmentId: 'traf-charminar-koti',
    fromName: 'Charminar',
    toName: 'Koti',
    trafficLevel: 'Moderate',
    delayMinutes: 5,
    averageSpeedKmh: 18,
    source: 'Demo Traffic',
    dataType: 'Demo',
    lastUpdated: '2026-10-03 04:30'
  },
  {
    segmentId: 'traf-charminar-mehdipatnam',
    fromName: 'Charminar',
    toName: 'Mehdipatnam',
    trafficLevel: 'Moderate',
    delayMinutes: 6,
    averageSpeedKmh: 20,
    source: 'Demo Traffic',
    dataType: 'Demo',
    lastUpdated: '2026-10-03 04:30'
  },
  {
    segmentId: 'traf-mehdipatnam-moinabad',
    fromName: 'Mehdipatnam',
    toName: 'Moinabad',
    trafficLevel: 'Light',
    delayMinutes: 2,
    averageSpeedKmh: 42,
    source: 'Demo Traffic',
    dataType: 'Demo',
    lastUpdated: '2026-10-03 04:30'
  },
  {
    segmentId: 'traf-mehdipatnam-gachibowli',
    fromName: 'Mehdipatnam',
    toName: 'Gachibowli',
    trafficLevel: 'Heavy',
    delayMinutes: 10,
    averageSpeedKmh: 16,
    source: 'Demo Traffic',
    dataType: 'Demo',
    lastUpdated: '2026-10-03 04:30'
  },
  {
    segmentId: 'traf-ameerpet-secunderabad',
    fromName: 'Ameerpet',
    toName: 'Secunderabad',
    trafficLevel: 'Moderate',
    delayMinutes: 4,
    averageSpeedKmh: 22,
    source: 'Demo Traffic',
    dataType: 'Demo',
    lastUpdated: '2026-10-03 04:30'
  }
];

export const SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'alert-ameerpet-lift',
    title: 'Ameerpet Station Elevator Maintenance',
    severity: 'warning',
    mode: 'metro',
    affectedLineOrRoute: 'Red & Blue Interchange',
    locationName: 'Ameerpet Metro Station',
    what: 'Elevator #2 connecting Concourse Level to Blue Line Platform 1 is undergoing routine inspection.',
    where: 'Gate B Concourse, Ameerpet Metro Station',
    when: '08:00 AM – 14:00 PM, Today',
    whoIsAffected: 'Wheelchair users and step-free travelers transferring between Red and Blue Lines.',
    alternative: 'Station marshals are available to assist via Staff Lift #4 located near Customer Care Gate D.',
    active: true
  },
  {
    id: 'alert-koti-roadwork',
    title: 'Pavement Upgrade near Koti Women’s College',
    severity: 'info',
    mode: 'bus',
    affectedLineOrRoute: 'TGSRTC Bus Routes 8A, 1Z, 2M',
    locationName: 'Koti Women’s College Bus Bay',
    what: 'Temporary pedestrian ramp reroute due to smart footway widening.',
    where: 'Koti Bus Stop Entry Bay 2',
    when: 'Active through weekend',
    whoIsAffected: 'Pedestrians walking to Koti Bus Station from Sultan Bazar.',
    alternative: 'Use Gate 1 ramp entrance 40 meters south with level zero-grade access.',
    active: true
  },
  {
    id: 'alert-mehdipatnam-flyover',
    title: 'Mehdipatnam PVNR Expressway Morning Flow',
    severity: 'info',
    mode: 'auto',
    affectedLineOrRoute: 'Pillar 1 to 50 Corridor',
    locationName: 'Mehdipatnam Rythu Bazar Cross',
    what: 'Moderate morning vehicular volume towards Airport and Financial District.',
    where: 'Mehdipatnam Junction Underpass',
    when: 'Peak Hours 08:30 AM – 11:00 AM',
    whoIsAffected: 'Surface auto-rickshaws and cabs.',
    alternative: 'Estimated road journey time incorporates +6 to +8 minutes buffer.',
    active: true
  }
];
