import { TRAFFIC_SEGMENTS } from '../data/transitData';
import { TrafficSegment } from '../types';

export class TrafficService {
  /**
   * Returns traffic delay and condition for a given segment and time of day
   */
  static getTrafficImpact(
    fromName: string,
    toName: string,
    departureTime: string
  ): {
    level: 'Light' | 'Moderate' | 'Heavy' | 'Severe';
    delayMinutes: number;
    source: 'Demo Traffic' | 'Traffic Estimate';
  } {
    // Check known recorded segments
    const matched = TRAFFIC_SEGMENTS.find(
      s =>
        (s.fromName.toLowerCase().includes(fromName.toLowerCase()) ||
          fromName.toLowerCase().includes(s.fromName.toLowerCase())) &&
        (s.toName.toLowerCase().includes(toName.toLowerCase()) ||
          toName.toLowerCase().includes(s.toName.toLowerCase()))
    );

    // Parse hour from departureTime (HH:mm)
    const [hourStr] = departureTime.split(':');
    const hour = parseInt(hourStr || '9', 10);
    const isPeakHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);

    if (matched) {
      const peakBonus = isPeakHour ? 3 : 0;
      return {
        level: isPeakHour && matched.trafficLevel === 'Moderate' ? 'Heavy' : matched.trafficLevel,
        delayMinutes: matched.delayMinutes + peakBonus,
        source: 'Demo Traffic'
      };
    }

    // Default estimate based on time of day
    if (isPeakHour) {
      return {
        level: 'Moderate',
        delayMinutes: 5,
        source: 'Traffic Estimate'
      };
    }

    return {
      level: 'Light',
      delayMinutes: 2,
      source: 'Traffic Estimate'
    };
  }
}
