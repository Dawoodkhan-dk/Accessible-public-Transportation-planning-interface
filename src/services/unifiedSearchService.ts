import {
  UnifiedSearchResult,
  SearchFilterType,
  TransitEntityType
} from '../types/transitDatabase';
import { TransportDatabaseService } from './transportDatabaseService';

export class UnifiedSearchService {
  private static searchIndex: UnifiedSearchResult[] = [];
  private static isIndexed = false;

  /**
   * Builds the indexed search catalog from TGSRTC bus stops and HMRL metro stations
   */
  private static buildIndex() {
    if (this.isIndexed) return;

    TransportDatabaseService.initialize();
    const index: UnifiedSearchResult[] = [];

    // 1. Index ONLY OPERATING Hyderabad Metro Stations (HMRL)
    const metroStations = TransportDatabaseService.getAllMetroStations();
    metroStations.forEach(stn => {
      // Exclude planned/proposed or non-operating stations; specifically enforce no fictional Charminar metro station
      if (stn.status && stn.status !== 'OPERATING') return;
      if (stn.name.toLowerCase().includes('charminar')) return;

      const type: TransitEntityType = stn.interchange
        ? 'INTERCHANGE'
        : stn.terminal
        ? 'TERMINAL'
        : 'METRO_STATION';

      index.push({
        id: stn.id,
        sourceId: stn.sourceId,
        name: stn.name,
        type,
        latitude: stn.latitude,
        longitude: stn.longitude,
        locality: `${stn.lineIds.join(' & ')} Line${stn.interchange ? ' · Interchange Hub' : ''}`,
        address: `${stn.name}, Hyderabad Metro Rail (${stn.lineIds.join('/')} Line)`,
        subtitle: `Metro Station · ${stn.lineIds.join(', ')} Line${stn.interchange ? ' (Interchange)' : ''}`,
        linesOrRoutes: stn.lineIds.map(l => `${l} Line`),
        interchange: stn.interchange,
        wheelchairAccessible: stn.wheelchairAccessible,
        stepFree: stn.stepFree,
        source: stn.source,
        score: 0
      });
    });

    // 2. Index Authentic TGSRTC Bus Stops
    const busStops = TransportDatabaseService.getAllBusStops();
    busStops.forEach(stop => {
      index.push({
        id: stop.id,
        sourceId: stop.sourceId,
        name: stop.name,
        type: 'BUS_STOP',
        latitude: stop.latitude,
        longitude: stop.longitude,
        locality: stop.locality || 'TGSRTC Bus Network',
        address: `${stop.name}, Greater Hyderabad Transit Network`,
        subtitle: `TGSRTC Bus Stop · Serves: ${stop.servedRoutes.slice(0, 4).join(', ')}${stop.servedRoutes.length > 4 ? '...' : ''}`,
        linesOrRoutes: stop.servedRoutes,
        wheelchairAccessible: stop.wheelchairAccessible,
        stepFree: stop.stepFree,
        source: stop.source,
        score: 0
      });
    });

    // 3. Index Major Public Landmarks (explicitly classified as LANDMARK, not transit stations)
    const landmarks: { id: string; name: string; lat: number; lng: number; locality: string; desc: string }[] = [
      {
        id: 'lmk-charminar',
        name: 'Charminar',
        lat: 17.3616,
        lng: 78.4747,
        locality: 'Old City, Hyderabad',
        desc: 'Historical Monument · Public Bus connectivity via Charminar Bus Stop (No Operating Metro)'
      },
      {
        id: 'lmk-golconda',
        name: 'Golconda Fort',
        lat: 17.3833,
        lng: 78.4011,
        locality: 'Golconda',
        desc: 'Historical Fortress · Bus connectivity via Golconda Fort Stop'
      },
      {
        id: 'lmk-birla-mandir',
        name: 'Birla Mandir',
        lat: 17.4062,
        lng: 78.4691,
        locality: 'Naubat Pahad / Saifabad',
        desc: 'Landmark Temple · Near Lakdikapul'
      },
      {
        id: 'lmk-salar-jung',
        name: 'Salar Jung Museum',
        lat: 17.3713,
        lng: 78.4804,
        locality: 'Darulshifa',
        desc: 'National Museum · Bus connectivity via Afzalgunj & Nayapul'
      },
      {
        id: 'lmk-tank-bund',
        name: 'Hussain Sagar / Tank Bund',
        lat: 17.4239,
        lng: 78.4738,
        locality: 'Necklace Road',
        desc: 'Urban Lake Promenade'
      }
    ];

    landmarks.forEach(lm => {
      index.push({
        id: lm.id,
        sourceId: `LMK-${lm.name.toUpperCase().replace(/\s+/g, '-')}`,
        name: lm.name,
        type: 'LANDMARK',
        latitude: lm.lat,
        longitude: lm.lng,
        locality: lm.locality,
        address: `${lm.name}, ${lm.locality}, Hyderabad`,
        subtitle: `Landmark · ${lm.desc}`,
        linesOrRoutes: [],
        wheelchairAccessible: true,
        stepFree: true,
        source: 'City Directory',
        score: 0
      });
    });

    this.searchIndex = index;
    this.isIndexed = true;
  }

  /**
   * Levenshtein Distance for typo tolerance
   */
  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Fast, typo-tolerant, ranked transit search across Hyderabad bus stops & metro stations
   */
  static search(
    query: string,
    filter: SearchFilterType = 'all',
    maxResults = 15
  ): UnifiedSearchResult[] {
    const rawQuery = query.trim();
    if (!rawQuery) return [];

    this.buildIndex();

    const normalizedQuery = rawQuery.toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

    const matches: UnifiedSearchResult[] = [];

    for (const item of this.searchIndex) {
      // Apply type filter if requested
      if (filter === 'bus_stop' && item.type !== 'BUS_STOP') continue;
      if (
        filter === 'metro_station' &&
        item.type !== 'METRO_STATION' &&
        item.type !== 'INTERCHANGE' &&
        item.type !== 'TERMINAL'
      ) {
        continue;
      }

      const itemName = item.name.toLowerCase();
      const itemLocality = item.locality.toLowerCase();
      const itemAddress = item.address.toLowerCase();

      let score = 0;

      // 1. Exact Match
      if (itemName === normalizedQuery) {
        score += 150;
      }
      // 2. Prefix Match on Name
      else if (itemName.startsWith(normalizedQuery)) {
        score += 100;
      }
      // 3. Substring Match on Name
      else if (itemName.includes(normalizedQuery)) {
        score += 70;
      }
      // 4. Token Matching
      else {
        const allTokensMatch = queryTokens.every(
          q => itemName.includes(q) || itemLocality.includes(q) || itemAddress.includes(q)
        );
        if (allTokensMatch) {
          score += 50;
        } else {
          // 5. Typo-Tolerant / Fuzzy Match for queries of 4+ characters
          if (normalizedQuery.length >= 4) {
            const words = itemName.split(/\s+/);
            for (const word of words) {
              if (word.length >= 4) {
                const dist = this.levenshtein(normalizedQuery, word);
                if (dist <= 2) {
                  score += Math.max(10, 40 - dist * 10);
                  break;
                }
              }
            }
          }
        }
      }

      // Check routes / lines matching
      const matchesRoute = item.linesOrRoutes.some(r => r.toLowerCase() === normalizedQuery);
      if (matchesRoute) score += 35;

      // Boost interchanges and terminals slightly for prominence
      if (item.type === 'INTERCHANGE') score += 5;
      if (item.type === 'TERMINAL') score += 3;

      if (score > 0) {
        matches.push({
          ...item,
          score
        });
      }
    }

    // Sort by relevance score descending
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, maxResults);
  }

  /**
   * Retrieves single transit node by ID
   */
  static getById(id: string): UnifiedSearchResult | undefined {
    this.buildIndex();
    return this.searchIndex.find(item => item.id === id);
  }

  /**
   * Quick total statistics
   */
  static getIndexStatistics() {
    this.buildIndex();
    return {
      totalEntities: this.searchIndex.length,
      busStopsCount: this.searchIndex.filter(i => i.type === 'BUS_STOP').length,
      metroStationsCount: this.searchIndex.filter(i => i.type !== 'BUS_STOP').length
    };
  }
}
