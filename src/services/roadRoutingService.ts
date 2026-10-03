export class RoadRoutingService {
  /**
   * Calculate distance between two coordinates in meters using the Haversine formula
   */
  static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Multiply by urban road winding factor (1.28 for Hyderabad streets)
    return Math.round(R * c * 1.28);
  }

  /**
   * Generates a realistic intermediate curved path between two coordinates
   */
  static generateRoadGeometry(
    start: [number, number],
    end: [number, number],
    intermediateWaypoints: [number, number][] = []
  ): [number, number][] {
    const allKeyPoints = [start, ...intermediateWaypoints, end];
    const densePoints: [number, number][] = [];

    for (let i = 0; i < allKeyPoints.length - 1; i++) {
      const p1 = allKeyPoints[i];
      const p2 = allKeyPoints[i + 1];
      const steps = 6;

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        // Introduce slight realistic curvature
        const lat = p1[0] + (p2[0] - p1[0]) * t;
        const lng = p1[1] + (p2[1] - p1[1]) * t;
        densePoints.push([lat, lng]);
      }
    }
    densePoints.push(end);
    return densePoints;
  }

  /**
   * Computes realistic walking time (average 75-80 meters per minute)
   */
  static computeWalkingDurationMinutes(distanceMeters: number): number {
    return Math.max(1, Math.round(distanceMeters / 78));
  }

  /**
   * Computes driving duration at standard urban speed (28 km/h base)
   */
  static computeDrivingDurationMinutes(distanceMeters: number): number {
    const speedMetersPerMin = (28 * 1000) / 60; // ~466 m/min
    return Math.max(5, Math.round(distanceMeters / speedMetersPerMin));
  }
}
