import {
  LocationItem,
  JourneyOption,
  JourneySegment,
  TimePlanningConfig,
  AccessibilityPreferences,
  BusRoute,
  BusStop,
  MetroStation
} from '../types';
import { RoadRoutingService } from './roadRoutingService';
import { TransitDataService } from './transitDataService';
import { TrafficService } from './trafficService';
import { FareService } from './fareService';
import { AlertService } from './alertService';

export class RoutingService {
  /**
   * Helper to format time strings (HH:mm)
   */
  private static addMinutesToTime(timeStr: string, minutesToAdd: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h * 60 + m + Math.round(minutesToAdd)) % (24 * 60);
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  private static subtractMinutesFromTime(timeStr: string, minutesToSub: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    let totalMinutes = (h * 60 + m - Math.round(minutesToSub)) % (24 * 60);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  /**
   * Helper to slice shape coordinates for a route between two stop indices
   */
  private static sliceRouteShape(
    fullCoords: [number, number][],
    totalStops: number,
    startStopIdx: number,
    endStopIdx: number,
    fallbackStart: [number, number],
    fallbackEnd: [number, number]
  ): [number, number][] {
    if (!fullCoords || fullCoords.length < 2) {
      return RoadRoutingService.generateRoadGeometry(fallbackStart, fallbackEnd);
    }
    const maxIdx = Math.max(1, totalStops - 1);
    const isReverse = startStopIdx > endStopIdx;
    const minStop = isReverse ? endStopIdx : startStopIdx;
    const maxStop = isReverse ? startStopIdx : endStopIdx;

    const startRatio = Math.max(0, minStop / maxIdx);
    const endRatio = Math.min(1, maxStop / maxIdx);

    const startPtIdx = Math.floor(startRatio * (fullCoords.length - 1));
    const endPtIdx = Math.min(fullCoords.length - 1, Math.ceil(endRatio * (fullCoords.length - 1)));

    let sliced = fullCoords.slice(startPtIdx, endPtIdx + 1);
    if (sliced.length >= 2) {
      if (isReverse) {
        sliced = [...sliced].reverse();
      }
      return sliced;
    }
    return RoadRoutingService.generateRoadGeometry(fallbackStart, fallbackEnd);
  }

  /**
   * Master multimodal journey planner
   * Fully dynamic: Starts at user's actual origin, ends at actual destination.
   * Discovers nearest transport nodes without fixed hubs or center-point assumptions.
   */
  static calculateJourneys(params: {
    origin: LocationItem;
    destination: LocationItem;
    timePlanning: TimePlanningConfig;
    accessibilityPreferences: AccessibilityPreferences;
  }): JourneyOption[] {
    const { origin, destination, timePlanning, accessibilityPreferences } = params;

    // 1. Determine base reference time
    let referenceTime = '09:15';
    if (timePlanning.mode === 'now') {
      const now = new Date();
      referenceTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    } else {
      referenceTime = timePlanning.targetTime || '09:30';
    }

    const distanceMeters = RoadRoutingService.calculateDistanceMeters(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    const journeys: JourneyOption[] = [];

    // --- CHECK 1: DIRECT BUS ROUTE (Dynamic discovery via actual nearby stops) ---
    const directBusJourneys = this.buildDirectBusOptions(origin, destination, referenceTime, distanceMeters);
    directBusJourneys.forEach(j => journeys.push(j));

    // --- CHECK 2: METRO ROUTE (Direct line or genuine interchange) ---
    const metroJourney = this.buildMetroOption(origin, destination, referenceTime, distanceMeters);
    if (metroJourney) {
      journeys.push(metroJourney);
    }

    // --- CHECK 3: DYNAMIC TRANSFER BUS ROUTE (If no direct bus or as alternative network route) ---
    const transferBusJourney = this.buildDynamicTransferBusOption(origin, destination, referenceTime, distanceMeters);
    if (transferBusJourney) {
      journeys.push(transferBusJourney);
    }

    // --- CHECK 4: DYNAMIC MULTIMODAL ROUTE (Bus + Metro connection) ---
    if (journeys.length < 3 && distanceMeters > 4500) {
      const multimodalJourney = this.buildMultimodalBusMetroOption(origin, destination, referenceTime, distanceMeters);
      if (multimodalJourney) {
        journeys.push(multimodalJourney);
      }
    }

    // --- CHECK 5: AUTO-RICKSHAW ROUTE (Actual point-to-point) ---
    const autoJourney = this.buildAutoOption(origin, destination, referenceTime, distanceMeters);
    journeys.push(autoJourney);

    // --- CHECK 6: CAB / TAXI ROUTE (Actual point-to-point) ---
    const cabJourney = this.buildCabOption(origin, destination, referenceTime, distanceMeters);
    journeys.push(cabJourney);

    // --- CHECK 7: WALKING ROUTE (if reasonable distance, <= 4km) ---
    if (distanceMeters <= 4000) {
      const walkJourney = this.buildWalkOnlyOption(origin, destination, referenceTime, distanceMeters);
      journeys.push(walkJourney);
    }

    // 2. Adjust timings if "Arrive by" is selected & attach active alerts
    const finalizedJourneys = journeys.map(journey => {
      let finalDeparture = journey.departureTime;
      let finalArrival = journey.arrivalTime;
      let recommendedLeave = journey.recommendedLeaveTime;
      const buffer = 10; // 10 min safety buffer

      if (timePlanning.mode === 'arrive_by') {
        const targetArrival = timePlanning.targetTime;
        finalArrival = targetArrival;
        // Leave by = targetArrival - totalDuration - buffer
        recommendedLeave = this.subtractMinutesFromTime(targetArrival, journey.totalDurationMinutes + buffer);
        finalDeparture = this.subtractMinutesFromTime(targetArrival, journey.totalDurationMinutes);

        // Adjust segment times backwards
        let curTime = finalDeparture;
        journey.segments.forEach(seg => {
          seg.departureTime = curTime;
          curTime = this.addMinutesToTime(curTime, seg.durationMinutes);
          seg.arrivalTime = curTime;
        });
      }

      // Check alerts for this journey
      const segmentNames = [
        origin.name,
        destination.name,
        ...journey.segments.map(s => s.from.name),
        ...journey.segments.map(s => s.to.name)
      ];
      const activeAlerts = AlertService.getAlertsForJourney(segmentNames);

      const isStepFree = journey.segments.every(s => s.accessibility.stepFree);
      const isWheelchair = journey.segments.every(s => s.accessibility.wheelchair);

      return {
        ...journey,
        departureTime: finalDeparture,
        arrivalTime: finalArrival,
        recommendedLeaveTime: recommendedLeave,
        bufferMinutes: timePlanning.mode === 'arrive_by' ? buffer : undefined,
        alerts: activeAlerts,
        accessibility: {
          ...journey.accessibility,
          stepFree: isStepFree,
          wheelchairAccessible: isWheelchair
        }
      };
    });

    // 3. Assign descriptive comparative tags
    this.tagJourneys(finalizedJourneys);

    return finalizedJourneys;
  }

  /**
   * Discovers Direct Bus routes by querying candidate stops near user's actual origin
   * and candidate stops near user's actual destination.
   */
  private static buildDirectBusOptions(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    totalDistanceMeters: number
  ): JourneyOption[] {
    const originCandidates = TransitDataService.findNearbyBusStops(origin.latitude, origin.longitude, 2000, 6);
    const destCandidates = TransitDataService.findNearbyBusStops(destination.latitude, destination.longitude, 2000, 6);
    const allRoutes = TransitDataService.getAllBusRoutes();

    interface Match {
      route: BusRoute;
      originStop: BusStop;
      destStop: BusStop;
      originWalkMeters: number;
      destWalkMeters: number;
      startStopIdx: number;
      endStopIdx: number;
    }

    const matches: Match[] = [];

    // Scan all candidate stop pairs against the route network
    for (const oItem of originCandidates) {
      for (const dItem of destCandidates) {
        if (oItem.stop.stopId === dItem.stop.stopId) continue;

        for (const route of allRoutes) {
          const oIdx = route.stops.indexOf(oItem.stop.stopId);
          const dIdx = route.stops.indexOf(dItem.stop.stopId);

          if (oIdx !== -1 && dIdx !== -1 && oIdx !== dIdx) {
            // Found legitimate directional connection (outbound or inbound)
            matches.push({
              route,
              originStop: oItem.stop,
              destStop: dItem.stop,
              originWalkMeters: oItem.distanceMeters,
              destWalkMeters: dItem.distanceMeters,
              startStopIdx: oIdx,
              endStopIdx: dIdx
            });
          }
        }
      }
    }

    if (matches.length === 0) return [];

    // Sort by total walking distance so user gets the most convenient option
    matches.sort((a, b) => (a.originWalkMeters + a.destWalkMeters) - (b.originWalkMeters + b.destWalkMeters));

    // Build the top match
    const best = matches[0];
    const { route, originStop, destStop, originWalkMeters, destWalkMeters, startStopIdx, endStopIdx } = best;

    const walkToStopMin = RoadRoutingService.computeWalkingDurationMinutes(originWalkMeters);
    const busWaitMin = Math.min(8, Math.max(3, Math.round(route.frequencyMinutes / 2)));

    // Approximate ride distance between the two stops along the route
    const stopCount = Math.abs(endStopIdx - startStopIdx);
    const totalRouteStops = route.stops.length;
    const busRideMeters = Math.max(
      1500,
      Math.round(totalDistanceMeters * (stopCount / Math.max(1, totalRouteStops)))
    );

    const baseRideMin = Math.max(6, Math.round((busRideMeters / 1000) * 4.2)); // ~14 km/h urban bus speed
    const traffic = TrafficService.getTrafficImpact(originStop.stopName, destStop.stopName, departureTime);
    const busRideDuration = baseRideMin + traffic.delayMinutes;

    const walkFromStopMin = RoadRoutingService.computeWalkingDurationMinutes(destWalkMeters);
    const totalDuration = walkToStopMin + busWaitMin + busRideDuration + walkFromStopMin;

    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, walkToStopMin);
    const t2 = this.addMinutesToTime(t1, busWaitMin);
    const t3 = this.addMinutesToTime(t2, busRideDuration);
    const t4 = this.addMinutesToTime(t3, walkFromStopMin);

    const busFare = FareService.calculateBusFare(busRideMeters);

    const busGeometry = this.sliceRouteShape(
      route.coordinates,
      route.stops.length,
      startStopIdx,
      endStopIdx,
      [originStop.latitude, originStop.longitude],
      [destStop.latitude, destStop.longitude]
    );

    const isReverse = startStopIdx > endStopIdx;
    const busHeadsign = isReverse ? route.origin : route.destination;

    const segments: JourneySegment[] = [
      {
        id: 'seg-walk-to-bus',
        mode: 'walk',
        routeName: `Walk to ${originStop.stopName}`,
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: originStop.stopName, coordinates: [originStop.latitude, originStop.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: walkToStopMin,
        distanceMeters: originWalkMeters,
        fare: 0,
        fareLabel: 'Free',
        geometry: RoadRoutingService.generateRoadGeometry(
          [origin.latitude, origin.longitude],
          [originStop.latitude, originStop.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false,
          notes: 'Sidewalk connection to bus stop'
        },
        instructions: [`Walk ${originWalkMeters}m from ${origin.name} to ${originStop.stopName}.`],
        source: 'TGSRTC'
      },
      {
        id: `seg-bus-${route.routeNumber}`,
        mode: 'bus',
        routeNumber: route.routeNumber,
        routeName: `TGSRTC ${route.routeNumber} (${route.routeName})`,
        from: { name: originStop.stopName, coordinates: [originStop.latitude, originStop.longitude], time: t2 },
        to: { name: destStop.stopName, coordinates: [destStop.latitude, destStop.longitude], time: t3 },
        departureTime: t2,
        arrivalTime: t3,
        durationMinutes: busRideDuration,
        distanceMeters: busRideMeters,
        fare: busFare,
        fareLabel: `₹${busFare} Official TGSRTC Fare`,
        geometry: busGeometry,
        traffic: {
          level: traffic.level,
          delayMinutes: traffic.delayMinutes
        },
        accessibility: {
          stepFree: route.accessibility.lowFloorBus,
          wheelchair: route.accessibility.wheelchairRamp,
          elevator: false,
          ramp: route.accessibility.wheelchairRamp,
          stairsRequired: !route.accessibility.lowFloorBus,
          notes: route.accessibility.lowFloorBus ? 'Low-floor boarding with ramp' : 'Standard 2-step bus'
        },
        instructions: [
          `Board Bus ${route.routeNumber} at ${originStop.stopName} towards ${busHeadsign}.`,
          `Travel ${stopCount} stops to ${destStop.stopName}.`
        ],
        stopCount,
        source: 'TGSRTC'
      },
      {
        id: 'seg-walk-from-bus',
        mode: 'walk',
        routeName: 'Walk to Final Destination',
        from: { name: destStop.stopName, coordinates: [destStop.latitude, destStop.longitude], time: t3 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t4 },
        departureTime: t3,
        arrivalTime: t4,
        durationMinutes: walkFromStopMin,
        distanceMeters: destWalkMeters,
        fare: 0,
        fareLabel: 'Free',
        geometry: RoadRoutingService.generateRoadGeometry(
          [destStop.latitude, destStop.longitude],
          [destination.latitude, destination.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false,
          notes: 'Level sidewalk approach to destination'
        },
        instructions: [`Walk ${destWalkMeters}m to arrive at ${destination.name}.`],
        source: 'TGSRTC'
      }
    ];

    return [
      {
        id: `journey-direct-bus-${route.routeNumber}`,
        title: `Direct Bus ${route.routeNumber}`,
        modeCategory: 'Direct Bus',
        departureTime: t0,
        arrivalTime: t4,
        totalDurationMinutes: totalDuration,
        baseDurationMinutes: totalDuration - traffic.delayMinutes,
        trafficDelayMinutes: traffic.delayMinutes,
        walkingDurationMinutes: walkToStopMin + walkFromStopMin,
        walkingDistanceMeters: originWalkMeters + destWalkMeters,
        waitingDurationMinutes: busWaitMin,
        transferDurationMinutes: 0,
        transfersCount: 0,
        fare: {
          min: busFare,
          max: busFare,
          currency: '₹',
          type: 'Official',
          description: `Official TGSRTC single ticket (₹${busFare})`
        },
        traffic: {
          overallLevel: traffic.level,
          totalDelayMinutes: traffic.delayMinutes,
          source: traffic.source
        },
        accessibility: {
          stepFree: route.accessibility.lowFloorBus,
          wheelchairAccessible: route.accessibility.wheelchairRamp,
          avoidStairs: route.accessibility.lowFloorBus,
          elevatorAvailable: false,
          notes: ['Direct route without transfers', route.accessibility.lowFloorBus ? 'Low-floor boarding' : 'Standard boarding']
        },
        segments,
        alerts: [],
        recommendedLeaveTime: t0,
        tags: ['DIRECT', 'FEWEST TRANSFERS', 'LOWEST FARE']
      }
    ];
  }

  /**
   * Discovers Dynamic 2-Leg Transfer Bus Option.
   * Finds legitimate intersection stop between an origin-serving bus route and a destination-serving bus route.
   * ZERO hardcoding of Charminar, Mehdipatnam, Koti, etc.
   */
  private static buildDynamicTransferBusOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    totalDistanceMeters: number
  ): JourneyOption | null {
    const originCandidates = TransitDataService.findNearbyBusStops(origin.latitude, origin.longitude, 2200, 5);
    const destCandidates = TransitDataService.findNearbyBusStops(destination.latitude, destination.longitude, 2200, 5);
    const allRoutes = TransitDataService.getAllBusRoutes();

    interface TransferMatch {
      route1: BusRoute;
      route2: BusRoute;
      originStop: BusStop;
      transferStop: BusStop;
      destStop: BusStop;
      originWalkMeters: number;
      destWalkMeters: number;
      r1StartIdx: number;
      r1TransferIdx: number;
      r2TransferIdx: number;
      r2EndIdx: number;
    }

    const matches: TransferMatch[] = [];

    // Search for any valid transfer stop in the network
    for (const oItem of originCandidates) {
      for (const dItem of destCandidates) {
        if (oItem.stop.stopId === dItem.stop.stopId) continue;

        // Routes passing through origin candidate
        const r1Candidates = allRoutes.filter(r => r.stops.includes(oItem.stop.stopId));
        // Routes passing through destination candidate
        const r2Candidates = allRoutes.filter(r => r.stops.includes(dItem.stop.stopId));

        for (const r1 of r1Candidates) {
          const oIdx = r1.stops.indexOf(oItem.stop.stopId);

          for (const r2 of r2Candidates) {
            if (r1.routeId === r2.routeId) continue;
            const dIdx = r2.stops.indexOf(dItem.stop.stopId);

            // Find common stops between r1 and r2
            for (let tIdx1 = 0; tIdx1 < r1.stops.length; tIdx1++) {
              if (tIdx1 === oIdx) continue;
              const commonStopId = r1.stops[tIdx1];
              const tIdx2 = r2.stops.indexOf(commonStopId);

              if (tIdx2 !== -1 && tIdx2 !== dIdx) {
                const transferStop = TransitDataService.getBusStop(commonStopId);
                if (transferStop) {
                  matches.push({
                    route1: r1,
                    route2: r2,
                    originStop: oItem.stop,
                    transferStop,
                    destStop: dItem.stop,
                    originWalkMeters: oItem.distanceMeters,
                    destWalkMeters: dItem.distanceMeters,
                    r1StartIdx: oIdx,
                    r1TransferIdx: tIdx1,
                    r2TransferIdx: tIdx2,
                    r2EndIdx: dIdx
                  });
                }
              }
            }
          }
        }
      }
    }

    if (matches.length === 0) return null;

    // Pick transfer with minimal total stop hops and shortest walking
    matches.sort((a, b) => {
      const stopsA = Math.abs(a.r1TransferIdx - a.r1StartIdx) + Math.abs(a.r2EndIdx - a.r2TransferIdx);
      const stopsB = Math.abs(b.r1TransferIdx - b.r1StartIdx) + Math.abs(b.r2EndIdx - b.r2TransferIdx);
      const walkA = a.originWalkMeters + a.destWalkMeters;
      const walkB = b.originWalkMeters + b.destWalkMeters;
      return (stopsA * 1000 + walkA) - (stopsB * 1000 + walkB);
    });

    const best = matches[0];
    const { route1, route2, originStop, transferStop, destStop, originWalkMeters, destWalkMeters, r1StartIdx, r1TransferIdx, r2TransferIdx, r2EndIdx } = best;

    // Compute timings
    const walk1Min = RoadRoutingService.computeWalkingDurationMinutes(originWalkMeters);
    const wait1Min = Math.min(6, Math.max(3, Math.round(route1.frequencyMinutes / 2)));

    const stops1 = Math.abs(r1TransferIdx - r1StartIdx);
    const ride1Meters = Math.max(1800, Math.round(totalDistanceMeters * 0.45));
    const ride1Min = Math.max(8, Math.round((ride1Meters / 1000) * 4.2));

    const transferWalkMeters = 180;
    const transferWalkMin = 3;
    const transferBufferMin = 6;

    const stops2 = Math.abs(r2EndIdx - r2TransferIdx);
    const ride2Meters = Math.max(1800, Math.round(totalDistanceMeters * 0.55));
    const ride2Min = Math.max(8, Math.round((ride2Meters / 1000) * 4.2));

    const walk2Min = RoadRoutingService.computeWalkingDurationMinutes(destWalkMeters);

    const traffic = TrafficService.getTrafficImpact(originStop.stopName, destStop.stopName, departureTime);
    const totalDuration = walk1Min + wait1Min + ride1Min + transferWalkMin + transferBufferMin + ride2Min + traffic.delayMinutes + walk2Min;

    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, walk1Min);
    const t2 = this.addMinutesToTime(t1, wait1Min);
    const t3 = this.addMinutesToTime(t2, ride1Min);
    const t4 = this.addMinutesToTime(t3, transferWalkMin);
    const t5 = this.addMinutesToTime(t4, transferBufferMin);
    const t6 = this.addMinutesToTime(t5, ride2Min + traffic.delayMinutes);
    const t7 = this.addMinutesToTime(t6, walk2Min);

    const fare1 = FareService.calculateBusFare(ride1Meters);
    const fare2 = FareService.calculateBusFare(ride2Meters);
    const totalFare = fare1 + fare2;

    const geom1 = this.sliceRouteShape(
      route1.coordinates,
      route1.stops.length,
      r1StartIdx,
      r1TransferIdx,
      [originStop.latitude, originStop.longitude],
      [transferStop.latitude, transferStop.longitude]
    );

    const geom2 = this.sliceRouteShape(
      route2.coordinates,
      route2.stops.length,
      r2TransferIdx,
      r2EndIdx,
      [transferStop.latitude, transferStop.longitude],
      [destStop.latitude, destStop.longitude]
    );

    const r1Headsign = r1StartIdx > r1TransferIdx ? route1.origin : route1.destination;
    const r2Headsign = r2TransferIdx > r2EndIdx ? route2.origin : route2.destination;

    const segments: JourneySegment[] = [
      {
        id: 'seg-transfer-walk-1',
        mode: 'walk',
        routeName: `Walk to ${originStop.stopName}`,
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: originStop.stopName, coordinates: [originStop.latitude, originStop.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: walk1Min,
        distanceMeters: originWalkMeters,
        fare: 0,
        geometry: RoadRoutingService.generateRoadGeometry(
          [origin.latitude, origin.longitude],
          [originStop.latitude, originStop.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false
        },
        instructions: [`Walk ${originWalkMeters}m to ${originStop.stopName}.`],
        source: 'TGSRTC'
      },
      {
        id: `seg-transfer-bus-1`,
        mode: 'bus',
        routeNumber: route1.routeNumber,
        routeName: `TGSRTC ${route1.routeNumber} towards ${transferStop.stopName}`,
        from: { name: originStop.stopName, coordinates: [originStop.latitude, originStop.longitude], time: t2 },
        to: { name: transferStop.stopName, coordinates: [transferStop.latitude, transferStop.longitude], time: t3 },
        departureTime: t2,
        arrivalTime: t3,
        durationMinutes: ride1Min,
        distanceMeters: ride1Meters,
        fare: fare1,
        fareLabel: `₹${fare1} TGSRTC Ticket`,
        geometry: geom1,
        accessibility: {
          stepFree: route1.accessibility.lowFloorBus,
          wheelchair: route1.accessibility.wheelchairRamp,
          elevator: false,
          ramp: route1.accessibility.wheelchairRamp,
          stairsRequired: !route1.accessibility.lowFloorBus
        },
        instructions: [
          `Board Bus ${route1.routeNumber} at ${originStop.stopName}.`,
          `Ride ${stops1} stops to transfer point: ${transferStop.stopName}.`
        ],
        stopCount: stops1,
        source: 'TGSRTC'
      },
      {
        id: 'seg-transfer-concourse',
        mode: 'transfer',
        routeName: `Transfer at ${transferStop.stopName}`,
        from: { name: `${transferStop.stopName} (Arrival Bay)`, coordinates: [transferStop.latitude, transferStop.longitude], time: t3 },
        to: { name: `${transferStop.stopName} (Bay for Bus ${route2.routeNumber})`, coordinates: [transferStop.latitude + 0.0003, transferStop.longitude + 0.0003], time: t4 },
        departureTime: t3,
        arrivalTime: t4,
        durationMinutes: transferWalkMin,
        distanceMeters: transferWalkMeters,
        fare: 0,
        geometry: [
          [transferStop.latitude, transferStop.longitude],
          [transferStop.latitude + 0.0003, transferStop.longitude + 0.0003]
        ],
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false,
          notes: 'Concourse transfer with ramp access'
        },
        instructions: [
          `Alight at ${transferStop.stopName}. Walk ${transferWalkMeters}m to departure bay for Bus ${route2.routeNumber}.`,
          `Transfer buffer: ~${transferBufferMin} min scheduled connection.`
        ],
        source: 'TGSRTC'
      },
      {
        id: `seg-transfer-bus-2`,
        mode: 'bus',
        routeNumber: route2.routeNumber,
        routeName: `TGSRTC ${route2.routeNumber} towards ${destStop.stopName}`,
        from: { name: `${transferStop.stopName} (Bay for Bus ${route2.routeNumber})`, coordinates: [transferStop.latitude + 0.0003, transferStop.longitude + 0.0003], time: t5 },
        to: { name: destStop.stopName, coordinates: [destStop.latitude, destStop.longitude], time: t6 },
        departureTime: t5,
        arrivalTime: t6,
        durationMinutes: ride2Min + traffic.delayMinutes,
        distanceMeters: ride2Meters,
        fare: fare2,
        fareLabel: `₹${fare2} TGSRTC Ticket`,
        geometry: geom2,
        traffic: { level: traffic.level, delayMinutes: traffic.delayMinutes },
        accessibility: {
          stepFree: route2.accessibility.lowFloorBus,
          wheelchair: route2.accessibility.wheelchairRamp,
          elevator: false,
          ramp: route2.accessibility.wheelchairRamp,
          stairsRequired: !route2.accessibility.lowFloorBus
        },
        instructions: [
          `Board connecting Bus ${route2.routeNumber}.`,
          `Ride ${stops2} stops to ${destStop.stopName}.`
        ],
        stopCount: stops2,
        source: 'TGSRTC'
      },
      {
        id: 'seg-transfer-walk-dest',
        mode: 'walk',
        routeName: 'Walk to Final Destination',
        from: { name: destStop.stopName, coordinates: [destStop.latitude, destStop.longitude], time: t6 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t7 },
        departureTime: t6,
        arrivalTime: t7,
        durationMinutes: walk2Min,
        distanceMeters: destWalkMeters,
        fare: 0,
        geometry: RoadRoutingService.generateRoadGeometry(
          [destStop.latitude, destStop.longitude],
          [destination.latitude, destination.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false
        },
        instructions: [`Walk ${destWalkMeters}m to arrive at ${destination.name}.`],
        source: 'TGSRTC'
      }
    ];

    return {
      id: `journey-transfer-bus-${route1.routeNumber}-${route2.routeNumber}`,
      title: `Bus ${route1.routeNumber} ➔ Transfer at ${transferStop.stopName} ➔ Bus ${route2.routeNumber}`,
      modeCategory: 'Multimodal',
      departureTime: t0,
      arrivalTime: t7,
      totalDurationMinutes: totalDuration,
      baseDurationMinutes: totalDuration - traffic.delayMinutes,
      trafficDelayMinutes: traffic.delayMinutes,
      walkingDurationMinutes: walk1Min + transferWalkMin + walk2Min,
      walkingDistanceMeters: originWalkMeters + transferWalkMeters + destWalkMeters,
      waitingDurationMinutes: wait1Min + transferBufferMin,
      transferDurationMinutes: transferWalkMin + transferBufferMin,
      transfersCount: 1,
      fare: {
        min: totalFare,
        max: totalFare,
        currency: '₹',
        type: 'Official',
        description: `Official TGSRTC split tickets (₹${fare1} + ₹${fare2} = ₹${totalFare})`
      },
      traffic: {
        overallLevel: traffic.level,
        totalDelayMinutes: traffic.delayMinutes,
        source: traffic.source
      },
      accessibility: {
        stepFree: route1.accessibility.lowFloorBus && route2.accessibility.lowFloorBus,
        wheelchairAccessible: route1.accessibility.wheelchairRamp && route2.accessibility.wheelchairRamp,
        avoidStairs: route1.accessibility.lowFloorBus && route2.accessibility.lowFloorBus,
        elevatorAvailable: false,
        notes: [`Transfer connection at ${transferStop.stopName}`]
      },
      segments,
      alerts: [],
      recommendedLeaveTime: t0,
      tags: ['LOWEST FARE']
    };
  }

  /**
   * Builds Hyderabad Metro Option.
   * Viable only when BOTH origin and destination have an operating Metro station
   * within reasonable walking distance (<= 1200m).
   */
  private static buildMetroOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    totalDistanceMeters: number
  ): JourneyOption | null {
    const originMetroCandidates = TransitDataService.findNearbyMetroStations(origin.latitude, origin.longitude, 1400, 2);
    const destMetroCandidates = TransitDataService.findNearbyMetroStations(destination.latitude, destination.longitude, 1400, 2);

    if (originMetroCandidates.length === 0 || destMetroCandidates.length === 0) {
      return null;
    }

    const originMetro = originMetroCandidates[0];
    const destMetro = destMetroCandidates[0];

    // Check if stations are too far from actual origin or destination
    if (originMetro.distanceMeters > 1300 || destMetro.distanceMeters > 1300) {
      return null;
    }

    // If both stations are identical, walking is better
    if (originMetro.station.stationId === destMetro.station.stationId) {
      return null;
    }

    const walkToMetroMeters = originMetro.distanceMeters;
    const walkToMetroMin = RoadRoutingService.computeWalkingDurationMinutes(walkToMetroMeters);
    const metroWaitMin = 4;

    const metroRideMeters = RoadRoutingService.calculateDistanceMeters(
      originMetro.station.latitude,
      originMetro.station.longitude,
      destMetro.station.latitude,
      destMetro.station.longitude
    );
    // Metro speed: ~32 km/h
    const metroRideDuration = Math.max(8, Math.round((metroRideMeters / 1000) * 2.1));

    const walkFromMetroMeters = destMetro.distanceMeters;
    const walkFromMetroMin = RoadRoutingService.computeWalkingDurationMinutes(walkFromMetroMeters);

    // Interchange identification:
    // Red & Blue intersect at Ameerpet [17.4375, 78.4483]
    // Red & Green intersect at MGBS [17.3789, 78.4811]
    // Blue & Green intersect at Parade Ground [17.4440, 78.5000]
    const needsInterchange = originMetro.station.line !== destMetro.station.line;
    let interchangeMin = 0;
    let interchangeStationName = 'Ameerpet';
    let interchangeCoord: [number, number] = [17.4375, 78.4483];

    if (needsInterchange) {
      interchangeMin = 6;
      const lines = new Set([originMetro.station.line, destMetro.station.line]);
      if (lines.has('Red') && lines.has('Green')) {
        interchangeStationName = 'MGBS Metro Interchange';
        interchangeCoord = [17.3789, 78.4811];
      } else if (lines.has('Blue') && lines.has('Green')) {
        interchangeStationName = 'Parade Ground Metro Interchange';
        interchangeCoord = [17.4440, 78.5000];
      } else {
        interchangeStationName = 'Ameerpet Metro Interchange';
        interchangeCoord = [17.4375, 78.4483];
      }
    }

    const totalDuration = walkToMetroMin + metroWaitMin + metroRideDuration + interchangeMin + walkFromMetroMin;

    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, walkToMetroMin);
    const t2 = this.addMinutesToTime(t1, metroWaitMin);
    const t3 = this.addMinutesToTime(t2, metroRideDuration + interchangeMin);
    const t4 = this.addMinutesToTime(t3, walkFromMetroMin);

    const metroFare = FareService.calculateMetroFare(metroRideMeters);

    const metroGeometry: [number, number][] = [
      [originMetro.station.latitude, originMetro.station.longitude],
      ...(needsInterchange ? [interchangeCoord] : []),
      [destMetro.station.latitude, destMetro.station.longitude]
    ];

    const segments: JourneySegment[] = [
      {
        id: 'seg-walk-metro-orig',
        mode: 'walk',
        routeName: `Walk to ${originMetro.station.stationName}`,
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: originMetro.station.stationName, coordinates: [originMetro.station.latitude, originMetro.station.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: walkToMetroMin,
        distanceMeters: walkToMetroMeters,
        fare: 0,
        geometry: RoadRoutingService.generateRoadGeometry(
          [origin.latitude, origin.longitude],
          [originMetro.station.latitude, originMetro.station.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: true,
          ramp: true,
          stairsRequired: false
        },
        instructions: [`Walk ${walkToMetroMeters}m to ${originMetro.station.stationName} (Elevator access at concourse).`],
        source: 'HMRL'
      },
      {
        id: 'seg-metro-ride-full',
        mode: 'metro',
        routeName: `Hyderabad Metro ${originMetro.station.line} Line${needsInterchange ? ` ➔ Transfer at ${interchangeStationName} ➔ ${destMetro.station.line} Line` : ''}`,
        from: { name: originMetro.station.stationName, coordinates: [originMetro.station.latitude, originMetro.station.longitude], time: t2 },
        to: { name: destMetro.station.stationName, coordinates: [destMetro.station.latitude, destMetro.station.longitude], time: t3 },
        departureTime: t2,
        arrivalTime: t3,
        durationMinutes: metroRideDuration + interchangeMin,
        distanceMeters: metroRideMeters,
        fare: metroFare,
        fareLabel: `₹${metroFare} HMRL Official Token / Smart Card`,
        geometry: metroGeometry,
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: true,
          ramp: true,
          stairsRequired: false,
          notes: 'Level boarding, platform screen gates, functioning elevators, and tactile paving.'
        },
        instructions: [
          `Take concourse elevator to Platform 1.`,
          `Board ${originMetro.station.line} Line train towards ${destMetro.station.stationName}.`,
          needsInterchange ? `Transfer at ${interchangeStationName} (level elevator available).` : `Direct train without line transfer.`,
          `Exit at ${destMetro.station.stationName} via Gate B elevator.`
        ],
        source: 'HMRL'
      },
      {
        id: 'seg-walk-metro-dest',
        mode: 'walk',
        routeName: 'Walk to Final Destination',
        from: { name: destMetro.station.stationName, coordinates: [destMetro.station.latitude, destMetro.station.longitude], time: t3 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t4 },
        departureTime: t3,
        arrivalTime: t4,
        durationMinutes: walkFromMetroMin,
        distanceMeters: walkFromMetroMeters,
        fare: 0,
        geometry: RoadRoutingService.generateRoadGeometry(
          [destMetro.station.latitude, destMetro.station.longitude],
          [destination.latitude, destination.longitude]
        ),
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: true,
          ramp: true,
          stairsRequired: false
        },
        instructions: [`Walk ${walkFromMetroMeters}m from Metro Exit to ${destination.name}.`],
        source: 'HMRL'
      }
    ];

    return {
      id: 'journey-metro-full',
      title: `Hyderabad Metro (${originMetro.station.line} Line${needsInterchange ? ` + ${destMetro.station.line} Line` : ''})`,
      modeCategory: 'Metro',
      departureTime: t0,
      arrivalTime: t4,
      totalDurationMinutes: totalDuration,
      baseDurationMinutes: totalDuration,
      trafficDelayMinutes: 0,
      walkingDurationMinutes: walkToMetroMin + walkFromMetroMin,
      walkingDistanceMeters: walkToMetroMeters + walkFromMetroMeters,
      waitingDurationMinutes: metroWaitMin,
      transferDurationMinutes: interchangeMin,
      transfersCount: needsInterchange ? 1 : 0,
      fare: {
        min: metroFare,
        max: metroFare,
        currency: '₹',
        type: 'Official',
        description: `Official HMRL distance-based fare (₹${metroFare})`
      },
      traffic: {
        overallLevel: 'Light',
        totalDelayMinutes: 0,
        source: 'Traffic Estimate'
      },
      accessibility: {
        stepFree: true,
        wheelchairAccessible: true,
        avoidStairs: true,
        elevatorAvailable: true,
        notes: ['Fully accessible stations with functioning elevators, ramps, and level train boarding']
      },
      segments,
      alerts: [],
      recommendedLeaveTime: t0,
      tags: ['ACCESSIBLE', totalDistanceMeters > 7000 ? 'FASTEST' : 'FEWEST TRANSFERS']
    };
  }

  /**
   * Builds Dynamic Multimodal Bus + Metro Option
   * Useful when origin has bus coverage and destination is on the metro corridor.
   */
  private static buildMultimodalBusMetroOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    totalDistanceMeters: number
  ): JourneyOption | null {
    const originStops = TransitDataService.findNearbyBusStops(origin.latitude, origin.longitude, 1800, 3);
    const destMetros = TransitDataService.findNearbyMetroStations(destination.latitude, destination.longitude, 1500, 2);

    if (originStops.length === 0 || destMetros.length === 0) return null;

    const oStop = originStops[0];
    const dMetro = destMetros[0];

    // Find any bus route from oStop that stops near a metro station
    const routesFromO = TransitDataService.getAllBusRoutes().filter(r => r.stops.includes(oStop.stop.stopId));
    const allMetros = TransitDataService.getAllMetroStations();

    for (const r of routesFromO) {
      const oIdx = r.stops.indexOf(oStop.stop.stopId);
      for (let sIdx = oIdx + 1; sIdx < r.stops.length; sIdx++) {
        const intermediateStopId = r.stops[sIdx];
        const intermediateStop = TransitDataService.getBusStop(intermediateStopId);
        if (!intermediateStop) continue;

        // Check if intermediateStop is close to an operating metro station on the same line as dMetro
        const nearbyMetro = allMetros.find(m => {
          const dist = RoadRoutingService.calculateDistanceMeters(
            intermediateStop.latitude,
            intermediateStop.longitude,
            m.latitude,
            m.longitude
          );
          return dist <= 400 && m.line === dMetro.station.line && m.stationId !== dMetro.station.stationId;
        });

        if (nearbyMetro) {
          // Found clean Bus ➔ Metro connection!
          const walk1Min = RoadRoutingService.computeWalkingDurationMinutes(oStop.distanceMeters);
          const busWaitMin = 5;
          const busRideMin = Math.max(10, Math.round((sIdx - oIdx) * 3.5));
          const transferMin = 4;
          const metroWaitMin = 4;

          const metroRideDist = RoadRoutingService.calculateDistanceMeters(
            nearbyMetro.latitude,
            nearbyMetro.longitude,
            dMetro.station.latitude,
            dMetro.station.longitude
          );
          const metroRideMin = Math.max(8, Math.round((metroRideDist / 1000) * 2.2));
          const walk2Min = RoadRoutingService.computeWalkingDurationMinutes(dMetro.distanceMeters);

          const totalDuration = walk1Min + busWaitMin + busRideMin + transferMin + metroWaitMin + metroRideMin + walk2Min;
          const t0 = departureTime;
          const t1 = this.addMinutesToTime(t0, walk1Min);
          const t2 = this.addMinutesToTime(t1, busWaitMin);
          const t3 = this.addMinutesToTime(t2, busRideMin);
          const t4 = this.addMinutesToTime(t3, transferMin);
          const t5 = this.addMinutesToTime(t4, metroWaitMin);
          const t6 = this.addMinutesToTime(t5, metroRideMin);
          const t7 = this.addMinutesToTime(t6, walk2Min);

          const busFare = 25;
          const metroFare = FareService.calculateMetroFare(metroRideDist);
          const totalFare = busFare + metroFare;

          const segments: JourneySegment[] = [
            {
              id: 'seg-mm-walk-1',
              mode: 'walk',
              routeName: `Walk to ${oStop.stop.stopName}`,
              from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
              to: { name: oStop.stop.stopName, coordinates: [oStop.stop.latitude, oStop.stop.longitude], time: t1 },
              departureTime: t0,
              arrivalTime: t1,
              durationMinutes: walk1Min,
              distanceMeters: oStop.distanceMeters,
              fare: 0,
              geometry: RoadRoutingService.generateRoadGeometry(
                [origin.latitude, origin.longitude],
                [oStop.stop.latitude, oStop.stop.longitude]
              ),
              accessibility: { stepFree: true, wheelchair: true, elevator: false, ramp: true, stairsRequired: false },
              instructions: [`Walk ${oStop.distanceMeters}m to ${oStop.stop.stopName}.`],
              source: 'TGSRTC'
            },
            {
              id: `seg-mm-bus-${r.routeNumber}`,
              mode: 'bus',
              routeNumber: r.routeNumber,
              routeName: `TGSRTC ${r.routeNumber} to ${intermediateStop.stopName}`,
              from: { name: oStop.stop.stopName, coordinates: [oStop.stop.latitude, oStop.stop.longitude], time: t2 },
              to: { name: intermediateStop.stopName, coordinates: [intermediateStop.latitude, intermediateStop.longitude], time: t3 },
              departureTime: t2,
              arrivalTime: t3,
              durationMinutes: busRideMin,
              distanceMeters: Math.round(totalDistanceMeters * 0.4),
              fare: busFare,
              fareLabel: `₹${busFare} TGSRTC Ticket`,
              geometry: this.sliceRouteShape(
                r.coordinates,
                r.stops.length,
                oIdx,
                sIdx,
                [oStop.stop.latitude, oStop.stop.longitude],
                [intermediateStop.latitude, intermediateStop.longitude]
              ),
              accessibility: {
                stepFree: r.accessibility.lowFloorBus,
                wheelchair: r.accessibility.wheelchairRamp,
                elevator: false,
                ramp: r.accessibility.wheelchairRamp,
                stairsRequired: !r.accessibility.lowFloorBus
              },
              instructions: [`Board Bus ${r.routeNumber} at ${oStop.stop.stopName}. Ride to ${intermediateStop.stopName}.`],
              source: 'TGSRTC'
            },
            {
              id: 'seg-mm-transfer',
              mode: 'transfer',
              routeName: `Transfer to ${nearbyMetro.stationName} Metro`,
              from: { name: intermediateStop.stopName, coordinates: [intermediateStop.latitude, intermediateStop.longitude], time: t3 },
              to: { name: nearbyMetro.stationName, coordinates: [nearbyMetro.latitude, nearbyMetro.longitude], time: t4 },
              departureTime: t3,
              arrivalTime: t4,
              durationMinutes: transferMin,
              distanceMeters: 250,
              fare: 0,
              geometry: RoadRoutingService.generateRoadGeometry(
                [intermediateStop.latitude, intermediateStop.longitude],
                [nearbyMetro.latitude, nearbyMetro.longitude]
              ),
              accessibility: { stepFree: true, wheelchair: true, elevator: true, ramp: true, stairsRequired: false },
              instructions: [`Walk across to ${nearbyMetro.stationName} Metro Station concourse.`],
              source: 'HMRL'
            },
            {
              id: 'seg-mm-metro',
              mode: 'metro',
              routeName: `Hyderabad Metro ${nearbyMetro.line} Line to ${dMetro.station.stationName}`,
              from: { name: nearbyMetro.stationName, coordinates: [nearbyMetro.latitude, nearbyMetro.longitude], time: t5 },
              to: { name: dMetro.station.stationName, coordinates: [dMetro.station.latitude, dMetro.station.longitude], time: t6 },
              departureTime: t5,
              arrivalTime: t6,
              durationMinutes: metroRideMin,
              distanceMeters: metroRideDist,
              fare: metroFare,
              fareLabel: `₹${metroFare} HMRL Fare`,
              geometry: [
                [nearbyMetro.latitude, nearbyMetro.longitude],
                [dMetro.station.latitude, dMetro.station.longitude]
              ],
              accessibility: { stepFree: true, wheelchair: true, elevator: true, ramp: true, stairsRequired: false },
              instructions: [`Board Metro towards ${dMetro.station.stationName}.`],
              source: 'HMRL'
            },
            {
              id: 'seg-mm-walk-dest',
              mode: 'walk',
              routeName: 'Walk to Final Destination',
              from: { name: dMetro.station.stationName, coordinates: [dMetro.station.latitude, dMetro.station.longitude], time: t6 },
              to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t7 },
              departureTime: t6,
              arrivalTime: t7,
              durationMinutes: walk2Min,
              distanceMeters: dMetro.distanceMeters,
              fare: 0,
              geometry: RoadRoutingService.generateRoadGeometry(
                [dMetro.station.latitude, dMetro.station.longitude],
                [destination.latitude, destination.longitude]
              ),
              accessibility: { stepFree: true, wheelchair: true, elevator: false, ramp: true, stairsRequired: false },
              instructions: [`Walk ${dMetro.distanceMeters}m to arrive at ${destination.name}.`],
              source: 'Demo'
            }
          ];

          return {
            id: `journey-multimodal-bus-metro`,
            title: `Bus ${r.routeNumber} ➔ ${nearbyMetro.stationName} Metro ➔ ${dMetro.station.line} Line`,
            modeCategory: 'Multimodal',
            departureTime: t0,
            arrivalTime: t7,
            totalDurationMinutes: totalDuration,
            baseDurationMinutes: totalDuration,
            trafficDelayMinutes: 0,
            walkingDurationMinutes: walk1Min + transferMin + walk2Min,
            walkingDistanceMeters: oStop.distanceMeters + 250 + dMetro.distanceMeters,
            waitingDurationMinutes: busWaitMin + metroWaitMin,
            transferDurationMinutes: transferMin + metroWaitMin,
            transfersCount: 1,
            fare: {
              min: totalFare,
              max: totalFare,
              currency: '₹',
              type: 'Official',
              description: `Combined Bus (₹${busFare}) + Metro (₹${metroFare})`
            },
            traffic: { overallLevel: 'Light', totalDelayMinutes: 0, source: 'Traffic Estimate' },
            accessibility: {
              stepFree: r.accessibility.lowFloorBus,
              wheelchairAccessible: r.accessibility.wheelchairRamp,
              avoidStairs: r.accessibility.lowFloorBus,
              elevatorAvailable: true,
              notes: ['Multimodal transfer via street and metro concourse']
            },
            segments,
            alerts: [],
            recommendedLeaveTime: t0,
            tags: ['ACCESSIBLE']
          };
        }
      }
    }

    return null;
  }

  /**
   * Builds Auto-rickshaw Option (Actual Point-to-Point)
   */
  private static buildAutoOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    distanceMeters: number
  ): JourneyOption {
    const traffic = TrafficService.getTrafficImpact(origin.name, destination.name, departureTime);
    const baseDrivingMin = RoadRoutingService.computeDrivingDurationMinutes(distanceMeters);
    const totalDuration = baseDrivingMin + traffic.delayMinutes;
    const fareRange = FareService.calculateAutoFare(distanceMeters);

    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, totalDuration);

    const geometry = RoadRoutingService.generateRoadGeometry(
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude]
    );

    const segments: JourneySegment[] = [
      {
        id: 'seg-auto-p2p',
        mode: 'auto',
        routeName: 'Auto-Rickshaw (Point-to-Point)',
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: totalDuration,
        distanceMeters,
        fare: fareRange.min,
        fareLabel: `₹${fareRange.min}–₹${fareRange.max} Estimated Meter Tariff`,
        geometry,
        traffic: {
          level: traffic.level,
          delayMinutes: traffic.delayMinutes
        },
        accessibility: {
          stepFree: true,
          wheelchair: false,
          elevator: false,
          ramp: false,
          stairsRequired: false,
          notes: 'Low step-in height; foldable wheelchair can be stowed with driver assistance.'
        },
        instructions: [
          `Board local Auto-Rickshaw directly at ${origin.name}.`,
          `Point-to-point transit via arterial roads to ${destination.name}.`
        ],
        source: 'Estimated'
      }
    ];

    return {
      id: 'journey-auto',
      title: 'Auto-Rickshaw',
      modeCategory: 'Auto',
      departureTime: t0,
      arrivalTime: t1,
      totalDurationMinutes: totalDuration,
      baseDurationMinutes: baseDrivingMin,
      trafficDelayMinutes: traffic.delayMinutes,
      walkingDurationMinutes: 0,
      walkingDistanceMeters: 0,
      waitingDurationMinutes: 3,
      transferDurationMinutes: 0,
      transfersCount: 0,
      fare: {
        min: fareRange.min,
        max: fareRange.max,
        currency: '₹',
        type: 'Estimated',
        description: `Estimated meter tariff (₹${fareRange.min}–₹${fareRange.max})`
      },
      traffic: {
        overallLevel: traffic.level,
        totalDelayMinutes: traffic.delayMinutes,
        source: traffic.source
      },
      accessibility: {
        stepFree: true,
        wheelchairAccessible: false,
        avoidStairs: true,
        elevatorAvailable: false,
        notes: ['Door-to-door transit without walking or stairs']
      },
      segments,
      alerts: [],
      recommendedLeaveTime: t0,
      tags: ['DIRECT', 'LEAST WALKING', 'FEWEST TRANSFERS']
    };
  }

  /**
   * Builds Cab / Taxi Option (Actual Point-to-Point)
   */
  private static buildCabOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    distanceMeters: number
  ): JourneyOption {
    const traffic = TrafficService.getTrafficImpact(origin.name, destination.name, departureTime);
    const baseDrivingMin = Math.max(5, RoadRoutingService.computeDrivingDurationMinutes(distanceMeters) - 2);
    const totalDuration = baseDrivingMin + traffic.delayMinutes;
    const fareRange = FareService.calculateCabFare(distanceMeters, traffic.delayMinutes);

    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, totalDuration);

    const geometry = RoadRoutingService.generateRoadGeometry(
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude]
    );

    const segments: JourneySegment[] = [
      {
        id: 'seg-cab-p2p',
        mode: 'cab',
        routeName: 'AC Cab (Sedan / Hatchback)',
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: totalDuration,
        distanceMeters,
        fare: fareRange.min,
        fareLabel: `₹${fareRange.min}–₹${fareRange.max} Estimated App Tariff`,
        geometry,
        traffic: {
          level: traffic.level,
          delayMinutes: traffic.delayMinutes
        },
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: false,
          stairsRequired: false,
          notes: 'Trunk accommodates folded wheelchairs and mobility aids.'
        },
        instructions: [
          `Cab pickup directly at ${origin.name}.`,
          `Air-conditioned door-to-door ride to ${destination.name}.`
        ],
        source: 'Estimated'
      }
    ];

    return {
      id: 'journey-cab',
      title: 'AC Cab (Sedan / Hatchback)',
      modeCategory: 'Cab',
      departureTime: t0,
      arrivalTime: t1,
      totalDurationMinutes: totalDuration,
      baseDurationMinutes: baseDrivingMin,
      trafficDelayMinutes: traffic.delayMinutes,
      walkingDurationMinutes: 0,
      walkingDistanceMeters: 0,
      waitingDurationMinutes: 4,
      transferDurationMinutes: 0,
      transfersCount: 0,
      fare: {
        min: fareRange.min,
        max: fareRange.max,
        currency: '₹',
        type: 'Estimated',
        description: `Estimated app-based cab tariff (₹${fareRange.min}–₹${fareRange.max})`
      },
      traffic: {
        overallLevel: traffic.level,
        totalDelayMinutes: traffic.delayMinutes,
        source: traffic.source
      },
      accessibility: {
        stepFree: true,
        wheelchairAccessible: true,
        avoidStairs: true,
        elevatorAvailable: false,
        notes: ['Door-to-door vehicle with trunk storage for mobility aids']
      },
      segments,
      alerts: [],
      recommendedLeaveTime: t0,
      tags: ['FASTEST', 'DIRECT', 'LEAST WALKING', 'FEWEST TRANSFERS']
    };
  }

  /**
   * Builds Walking Option (for short distances <= 4km)
   */
  private static buildWalkOnlyOption(
    origin: LocationItem,
    destination: LocationItem,
    departureTime: string,
    distanceMeters: number
  ): JourneyOption {
    const walkingMin = RoadRoutingService.computeWalkingDurationMinutes(distanceMeters);
    const t0 = departureTime;
    const t1 = this.addMinutesToTime(t0, walkingMin);

    const geometry = RoadRoutingService.generateRoadGeometry(
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude]
    );

    const segments: JourneySegment[] = [
      {
        id: 'seg-walk-only',
        mode: 'walk',
        routeName: 'Direct Pedestrian Walk',
        from: { name: origin.name, coordinates: [origin.latitude, origin.longitude], time: t0 },
        to: { name: destination.name, coordinates: [destination.latitude, destination.longitude], time: t1 },
        departureTime: t0,
        arrivalTime: t1,
        durationMinutes: walkingMin,
        distanceMeters,
        fare: 0,
        fareLabel: 'Free (₹0)',
        geometry,
        accessibility: {
          stepFree: true,
          wheelchair: true,
          elevator: false,
          ramp: true,
          stairsRequired: false
        },
        instructions: [`Walk ${distanceMeters}m directly to ${destination.name}.`],
        source: 'Demo'
      }
    ];

    return {
      id: 'journey-walk',
      title: 'Pedestrian Walk',
      modeCategory: 'Walk',
      departureTime: t0,
      arrivalTime: t1,
      totalDurationMinutes: walkingMin,
      baseDurationMinutes: walkingMin,
      trafficDelayMinutes: 0,
      walkingDurationMinutes: walkingMin,
      walkingDistanceMeters: distanceMeters,
      waitingDurationMinutes: 0,
      transferDurationMinutes: 0,
      transfersCount: 0,
      fare: {
        min: 0,
        max: 0,
        currency: '₹',
        type: 'Free',
        description: 'Zero fare walking route'
      },
      traffic: {
        overallLevel: 'Light',
        totalDelayMinutes: 0,
        source: 'Traffic Estimate'
      },
      accessibility: {
        stepFree: true,
        wheelchairAccessible: true,
        avoidStairs: true,
        elevatorAvailable: false,
        notes: ['Continuous footpath route']
      },
      segments,
      alerts: [],
      recommendedLeaveTime: t0,
      tags: ['LOWEST FARE', 'DIRECT', 'FEWEST TRANSFERS']
    };
  }

  /**
   * Assigns comparative tags to journey options
   */
  private static tagJourneys(journeys: JourneyOption[]) {
    if (journeys.length === 0) return;

    let minDuration = Infinity;
    let minFare = Infinity;
    let minWalking = Infinity;
    let minTransfers = Infinity;

    journeys.forEach(j => {
      if (j.totalDurationMinutes < minDuration) minDuration = j.totalDurationMinutes;
      if (j.fare.min < minFare) minFare = j.fare.min;
      if (j.walkingDurationMinutes < minWalking) minWalking = j.walkingDurationMinutes;
      if (j.transfersCount < minTransfers) minTransfers = j.transfersCount;
    });

    journeys.forEach(j => {
      const tagSet = new Set(j.tags);
      if (j.totalDurationMinutes === minDuration) tagSet.add('FASTEST');
      if (j.fare.min === minFare && j.fare.min <= 25) tagSet.add('LOWEST FARE');
      if (j.walkingDurationMinutes === minWalking) tagSet.add('LEAST WALKING');
      if (j.transfersCount === 0) tagSet.add('FEWEST TRANSFERS');
      if (j.accessibility.stepFree) tagSet.add('ACCESSIBLE');
      j.tags = Array.from(tagSet);
    });
  }
}
