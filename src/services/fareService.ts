export interface FareBreakdownItem {
  id: string;
  operator: string;
  mode: string;
  category: string;
  routeOrService: string;
  distanceKm: number;
  amountMin: number;
  amountMax: number;
  currency: string;
  type: 'Official' | 'Estimated' | 'Free';
  ruleDescription: string;
}

export class FareService {
  /**
   * Calculates official TGSRTC bus fare based on distance
   */
  static calculateBusFare(distanceMeters: number, isExpress = false): number {
    const km = distanceMeters / 1000;
    if (isExpress) {
      if (km <= 5) return 25;
      if (km <= 10) return 30;
      if (km <= 18) return 35;
      if (km <= 25) return 40;
      return 45;
    }

    if (km <= 3) return 15;
    if (km <= 7) return 20;
    if (km <= 12) return 25;
    if (km <= 20) return 30;
    return 35;
  }

  /**
   * Calculates official Hyderabad Metro Rail (HMRL) fare based on distance
   */
  static calculateMetroFare(distanceMeters: number): number {
    const km = distanceMeters / 1000;
    if (km <= 2) return 20;
    if (km <= 4) return 25;
    if (km <= 6) return 30;
    if (km <= 9) return 35;
    if (km <= 12) return 40;
    if (km <= 15) return 45;
    if (km <= 18) return 50;
    if (km <= 21) return 55;
    return 60;
  }

  /**
   * Calculates Auto-rickshaw estimated fare range (Telangana meter tariff)
   */
  static calculateAutoFare(distanceMeters: number): { min: number; max: number } {
    const km = distanceMeters / 1000;
    // Base ₹30 for first 1.5 km, ₹15/km thereafter
    const base = 30;
    const additionalKm = Math.max(0, km - 1.5);
    const computed = Math.round(base + additionalKm * 15);
    return {
      min: Math.max(30, Math.round(computed * 0.95)),
      max: Math.round(computed * 1.25)
    };
  }

  /**
   * Calculates Cab estimated fare range (AC Sedan / Hatchback with traffic factor)
   */
  static calculateCabFare(distanceMeters: number, trafficDelayMin = 0): { min: number; max: number } {
    const km = distanceMeters / 1000;
    // Base ₹100 for first 3 km, ₹22/km + ₹2/min traffic delay
    const base = 100;
    const additionalKm = Math.max(0, km - 3);
    const computed = Math.round(base + additionalKm * 22 + trafficDelayMin * 2);
    return {
      min: Math.max(120, Math.round(computed * 0.95)),
      max: Math.round(computed * 1.35)
    };
  }
}
