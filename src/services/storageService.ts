import { AccessibilityPreferences } from '../types';

export interface SavedJourneyRecord {
  id: string;
  title: string;
  originName: string;
  destinationName: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  modeCategory: string;
  fareMin: number;
  fareMax: number;
  durationMinutes: number;
  savedAt: string;
}

const PREFERENCES_KEY = 'wayfind_accessibility_preferences';
const SAVED_JOURNEYS_KEY = 'wayfind_saved_journeys';
const RECENT_SEARCHES_KEY = 'wayfind_recent_searches';

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  stepFree: false,
  wheelchairAccessible: false,
  avoidStairs: false,
  elevatorRequired: false,
  reduceWalking: false,
  largerText: false,
  highContrast: false,
  screenReaderOptimized: false,
  simplifiedInstructions: false,
  reduceMotion: false
};

export class StorageService {
  // --- PREFERENCES CRUD ---
  static getPreferences(): AccessibilityPreferences {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (!raw) return { ...DEFAULT_PREFERENCES };
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static savePreferences(prefs: AccessibilityPreferences): boolean {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      return true;
    } catch {
      return false;
    }
  }

  static resetPreferences(): AccessibilityPreferences {
    try {
      localStorage.removeItem(PREFERENCES_KEY);
    } catch {
      // ignore
    }
    return { ...DEFAULT_PREFERENCES };
  }

  // --- SAVED JOURNEYS CRUD ---
  static getSavedJourneys(): SavedJourneyRecord[] {
    try {
      const raw = localStorage.getItem(SAVED_JOURNEYS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static createSavedJourney(record: Omit<SavedJourneyRecord, 'id' | 'savedAt'>): SavedJourneyRecord | null {
    try {
      const list = this.getSavedJourneys();
      const newRecord: SavedJourneyRecord = {
        ...record,
        id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        savedAt: new Date().toISOString()
      };
      list.unshift(newRecord);
      localStorage.setItem(SAVED_JOURNEYS_KEY, JSON.stringify(list));
      return newRecord;
    } catch {
      return null;
    }
  }

  static deleteSavedJourney(id: string): boolean {
    try {
      const list = this.getSavedJourneys().filter(item => item.id !== id);
      localStorage.setItem(SAVED_JOURNEYS_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }

  // --- RECENT SEARCHES ---
  static getRecentSearches(): { from: string; to: string }[] {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static addRecentSearch(from: string, to: string): void {
    try {
      let list = this.getRecentSearches();
      list = list.filter(item => !(item.from === from && item.to === to));
      list.unshift({ from, to });
      if (list.length > 5) list = list.slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  static clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  }
}
