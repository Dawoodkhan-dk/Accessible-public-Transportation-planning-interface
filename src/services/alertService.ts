import { SERVICE_ALERTS } from '../data/transitData';
import { ServiceAlert } from '../types';

export class AlertService {
  static getAllAlerts(): ServiceAlert[] {
    return SERVICE_ALERTS.filter(a => a.active);
  }

  static getAlertsForJourney(segmentNames: string[]): ServiceAlert[] {
    const active = this.getAllAlerts();
    return active.filter(alert =>
      segmentNames.some(
        name =>
          name.toLowerCase().includes(alert.locationName.toLowerCase()) ||
          alert.locationName.toLowerCase().includes(name.toLowerCase()) ||
          alert.affectedLineOrRoute.toLowerCase().includes(name.toLowerCase())
      )
    );
  }
}
