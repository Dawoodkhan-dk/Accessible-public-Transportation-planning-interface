import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Marker, Popup, LngLatBounds, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ZoomIn, ZoomOut, Maximize2, Locate, AlertCircle } from 'lucide-react';
import { JourneyOption, JourneySegment, LocationItem } from '../types';

// Configure MapLibre GL Web Worker bundle path for Vite
try {
  if (typeof setWorkerUrl === 'function' && maplibreWorkerUrl) {
    setWorkerUrl(maplibreWorkerUrl);
  }
} catch (err) {
  // Ignore if already configured
}

interface TransitMapProps {
  origin: LocationItem | null;
  destination: LocationItem | null;
  selectedJourney: JourneyOption | null;
  onSelectStop?: (stopName: string) => void;
  onSelectStation?: (stationName: string) => void;
  onSelectTransfer?: (segment: JourneySegment) => void;
}

// OpenFreeMap Liberty Vector Style (No API key, No token, No watermarks)
const OPENFREEMAP_LIBERTY_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Hyderabad central coordinates [lng, lat]
const HYDERABAD_CENTER: [number, number] = [78.4744, 17.3850];
const INITIAL_ZOOM = 11.5;

export const TransitMap: React.FC<TransitMapProps> = ({
  origin,
  destination,
  selectedJourney,
  onSelectStop,
  onSelectStation,
  onSelectTransfer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userLocationMarkerRef = useRef<Marker | null>(null);
  const isMapLoadedRef = useRef<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Helper to determine route segment color
  const getSegmentColor = (segment: JourneySegment): string => {
    switch (segment.mode) {
      case 'walk':
        return '#0d9488'; // Teal
      case 'metro':
        if (segment.routeName.toLowerCase().includes('blue')) return '#2563eb';
        if (segment.routeName.toLowerCase().includes('green')) return '#059669';
        return '#ef4444'; // Red Line
      case 'auto':
        return '#d97706'; // Amber
      case 'cab':
        return '#4f46e5'; // Indigo
      case 'bus':
      default:
        return '#1d4ed8'; // TGSRTC Bus Royal Blue
    }
  };

  // Safe removal of layers and sources
  const clearMapRouteLayers = (map: Map) => {
    const layerIds = [
      'wayfind-route-casing',
      'wayfind-route-walk',
      'wayfind-route-transit'
    ];
    layerIds.forEach(id => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    });

    if (map.getSource('wayfind-active-journey')) {
      map.removeSource('wayfind-active-journey');
    }
  };

  // Safe cleanup of DOM markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // 1. Initialize MapLibre GL Map with OpenFreeMap Liberty style
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = new Map({
        container: mapContainerRef.current,
        style: OPENFREEMAP_LIBERTY_STYLE,
        center: HYDERABAD_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: { compact: true }
      });

      map.on('load', () => {
        isMapLoadedRef.current = true;
        // Trigger layer and marker update once map style is fully loaded
        updateMapContent();
      });

      map.on('error', (e: { error?: { message?: string }; message?: string }) => {
        // Extract only safe primitive string message to avoid circular structure errors in iframe console
        const errorMsg = e?.error?.message || e?.message || 'Tile or network event';
        console.warn(`MapLibre event notice: ${errorMsg}`);
      });

      mapInstanceRef.current = map;
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      console.error(`MapLibre initialization notice: ${errStr}`);
      setMapError('Interactive map temporarily unavailable.');
    }

    return () => {
      clearMarkers();
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      isMapLoadedRef.current = false;
    };
  }, []);

  // 2. Synchronize route, markers, and bounds whenever journey/origin/destination changes
  const updateMapContent = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;

    // A. Clean up previous markers and route layers completely
    clearMarkers();
    clearMapRouteLayers(map);

    const bounds = new LngLatBounds();
    let hasPoints = false;

    // Helper: Create Distinct Marker DOM elements
    // 1. START Marker (Distinct Teal badge with Flag / A)
    const createStartMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'wayfind-map-marker flex flex-col items-center';
      el.innerHTML = `
        <div style="background-color: #0d9488; color: #ffffff; padding: 4px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; display: flex; items-center; gap: 4px; box-shadow: 0 4px 10px rgba(13,148,136,0.4); border: 2px solid #ffffff;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          <span>START</span>
        </div>
        <div style="width: 2px; height: 8px; background-color: #0d9488;"></div>
      `;
      return el;
    };

    // 2. DESTINATION Marker (Distinct Crimson badge with Pin / B)
    const createDestMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'wayfind-map-marker flex flex-col items-center';
      el.innerHTML = `
        <div style="background-color: #e11d48; color: #ffffff; padding: 4px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; display: flex; items-center; gap: 4px; box-shadow: 0 4px 10px rgba(225,29,72,0.4); border: 2px solid #ffffff;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>DESTINATION</span>
        </div>
        <div style="width: 2px; height: 8px; background-color: #e11d48;"></div>
      `;
      return el;
    };

    // 3. BUS STOP Marker (TGSRTC Blue circular badge)
    const createBusStopMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'wayfind-map-marker';
      el.innerHTML = `
        <div style="background-color: #1d4ed8; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff;" title="TGSRTC Bus Stop">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C18.1 6.7 17.1 6 16 6H8c-1.1 0-2.1.7-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
        </div>
      `;
      return el;
    };

    // 4. METRO STATION Marker (Purple / Metro 'M' rounded square)
    const createMetroStationMarkerElement = (lineName: string) => {
      const el = document.createElement('div');
      el.className = 'wayfind-map-marker';
      const bgColor = lineName.toLowerCase().includes('blue')
        ? '#2563eb'
        : lineName.toLowerCase().includes('green')
        ? '#059669'
        : '#dc2626';

      el.innerHTML = `
        <div style="background-color: ${bgColor}; width: 26px; height: 26px; border-radius: 6px; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 13px;" title="Hyderabad Metro">
          M
        </div>
      `;
      return el;
    };

    // 5. TRANSFER Point Marker (Amber badge with Transfer/Shuffle icon)
    const createTransferMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'wayfind-map-marker flex flex-col items-center';
      el.innerHTML = `
        <div style="background-color: #f59e0b; color: #ffffff; padding: 3px 6px; border-radius: 9999px; font-weight: 700; font-size: 10px; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 8px rgba(245,158,11,0.5); border: 2px solid #ffffff;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
          <span>TRANSFER</span>
        </div>
      `;
      return el;
    };

    // B. Place Origin Marker if set
    if (origin) {
      const lngLat: [number, number] = [origin.longitude, origin.latitude];
      bounds.extend(lngLat);
      hasPoints = true;

      const originPopup = new Popup({ offset: 25, closeButton: true })
        .setHTML(`
          <div style="font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Start: ${origin.name}</div>
            <div style="color: #64748b; font-size: 11px;">${origin.address}</div>
          </div>
        `);

      const originMarker = new Marker({
        element: createStartMarkerElement(),
        anchor: 'bottom'
      })
        .setLngLat(lngLat)
        .setPopup(originPopup)
        .addTo(map);

      markersRef.current.push(originMarker);
    }

    // C. Place Destination Marker if set
    if (destination) {
      const lngLat: [number, number] = [destination.longitude, destination.latitude];
      bounds.extend(lngLat);
      hasPoints = true;

      const destPopup = new Popup({ offset: 25, closeButton: true })
        .setHTML(`
          <div style="font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Destination: ${destination.name}</div>
            <div style="color: #64748b; font-size: 11px;">${destination.address}</div>
          </div>
        `);

      const destMarker = new Marker({
        element: createDestMarkerElement(),
        anchor: 'bottom'
      })
        .setLngLat(lngLat)
        .setPopup(destPopup)
        .addTo(map);

      markersRef.current.push(destMarker);
    }

    // D. Render Selected Journey Geometry & Markers ONLY when a journey exists
    if (selectedJourney && selectedJourney.segments && selectedJourney.segments.length > 0) {
      const validSegments = selectedJourney.segments.filter(
        seg => seg.geometry && seg.geometry.length >= 2
      );

      if (validSegments.length > 0) {
        // Build GeoJSON features for each segment
        // Convert [lat, lng] to MapLibre GeoJSON coordinates [lng, lat]
        const features = validSegments.map(seg => {
          const coords = seg.geometry.map(pt => [pt[1], pt[0]]);
          coords.forEach(c => {
            bounds.extend(c as [number, number]);
            hasPoints = true;
          });

          return {
            type: 'Feature' as const,
            properties: {
              id: seg.id,
              mode: seg.mode,
              routeName: seg.routeName,
              color: getSegmentColor(seg),
              isWalk: seg.mode === 'walk',
              durationMinutes: seg.durationMinutes,
              distanceMeters: seg.distanceMeters,
              departureTime: seg.departureTime,
              arrivalTime: seg.arrivalTime
            },
            geometry: {
              type: 'LineString' as const,
              coordinates: coords
            }
          };
        });

        const geojsonData = {
          type: 'FeatureCollection' as const,
          features
        };

        // Add GeoJSON Source
        map.addSource('wayfind-active-journey', {
          type: 'geojson',
          data: geojsonData
        });

        // 1. Casing Layer (Subtle halo for road and transit contrast)
        map.addLayer({
          id: 'wayfind-route-casing',
          type: 'line',
          source: 'wayfind-active-journey',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': [
              'case',
              ['==', ['get', 'isWalk'], true],
              5,
              8
            ],
            'line-opacity': 0.95
          }
        });

        // 2. Transit / Vehicle Layer (Bus, Metro, Auto, Cab - solid vibrant line)
        map.addLayer({
          id: 'wayfind-route-transit',
          type: 'line',
          source: 'wayfind-active-journey',
          filter: ['!=', ['get', 'isWalk'], true],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 5.5,
            'line-opacity': 0.95
          }
        });

        // 3. Walking Layer (Dashed teal path)
        map.addLayer({
          id: 'wayfind-route-walk',
          type: 'line',
          source: 'wayfind-active-journey',
          filter: ['==', ['get', 'isWalk'], true],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0d9488',
            'line-width': 3.5,
            'line-dasharray': [2, 2.5],
            'line-opacity': 0.9
          }
        });

        // E. Add Intermediate Node & Transfer Markers
        selectedJourney.segments.forEach((seg, index) => {
          // Check if this segment represents a transfer point
          const isTransfer = seg.mode === 'transfer' || (index > 0 && selectedJourney.segments[index - 1].mode !== seg.mode);

          const fromLngLat: [number, number] = [seg.from.coordinates[1], seg.from.coordinates[0]];

          if (isTransfer) {
            // TRANSFER Marker
            const transferEl = createTransferMarkerElement();
            const transferPopup = new Popup({ offset: 20, closeButton: true })
              .setHTML(`
                <div style="font-size: 12px; line-height: 1.4; padding: 2px;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                    <span style="background-color: #fef3c7; color: #b45309; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px;">TRANSFER POINT</span>
                  </div>
                  <div style="font-weight: 700; color: #0f172a;">${seg.from.name}</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Next: ${seg.routeName} (${seg.departureTime})</div>
                  <div style="color: #64748b; font-size: 11px;">Duration: ${seg.durationMinutes} min · Buffer included</div>
                  <button id="btn-transfer-${seg.id}" style="margin-top: 8px; width: 100%; background-color: #f59e0b; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
                    View Transfer Details
                  </button>
                </div>
              `);

            transferPopup.on('open', () => {
              const btn = document.getElementById(`btn-transfer-${seg.id}`);
              if (btn && onSelectTransfer) {
                btn.onclick = () => onSelectTransfer(seg);
              }
            });

            transferEl.onclick = () => {
              if (onSelectTransfer) onSelectTransfer(seg);
            };

            const transferMarker = new Marker({
              element: transferEl,
              anchor: 'center'
            })
              .setLngLat(fromLngLat)
              .setPopup(transferPopup)
              .addTo(map);

            markersRef.current.push(transferMarker);
          } else if (seg.mode === 'metro') {
            // METRO STATION Marker
            const metroEl = createMetroStationMarkerElement(seg.routeName);
            const metroPopup = new Popup({ offset: 16, closeButton: true })
              .setHTML(`
                <div style="font-size: 12px; line-height: 1.4; padding: 2px;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                    <span style="background-color: #ede9fe; color: #6d28d9; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px;">METRO STATION</span>
                  </div>
                  <div style="font-weight: 700; color: #0f172a;">${seg.from.name}</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Line: ${seg.routeName}</div>
                  <div style="color: #64748b; font-size: 11px;">Departure: ${seg.departureTime}</div>
                  <button id="btn-metro-${seg.id}" style="margin-top: 8px; width: 100%; background-color: #7c3aed; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
                    View Metro Details
                  </button>
                </div>
              `);

            metroPopup.on('open', () => {
              const btn = document.getElementById(`btn-metro-${seg.id}`);
              if (btn && onSelectStation) {
                btn.onclick = () => onSelectStation(seg.from.name);
              }
            });

            metroEl.onclick = () => {
              if (onSelectStation) onSelectStation(seg.from.name);
            };

            const metroMarker = new Marker({
              element: metroEl,
              anchor: 'center'
            })
              .setLngLat(fromLngLat)
              .setPopup(metroPopup)
              .addTo(map);

            markersRef.current.push(metroMarker);
          } else if (seg.mode === 'bus') {
            // BUS STOP Marker
            const busEl = createBusStopMarkerElement();
            const busPopup = new Popup({ offset: 16, closeButton: true })
              .setHTML(`
                <div style="font-size: 12px; line-height: 1.4; padding: 2px;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                    <span style="background-color: #dbeafe; color: #1e40af; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px;">TGSRTC BUS STOP</span>
                  </div>
                  <div style="font-weight: 700; color: #0f172a;">${seg.from.name}</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Bus: ${seg.routeName}</div>
                  <div style="color: #64748b; font-size: 11px;">Departure: ${seg.departureTime}</div>
                  <button id="btn-bus-${seg.id}" style="margin-top: 8px; width: 100%; background-color: #1d4ed8; color: #ffffff; border: none; padding: 5px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer;">
                    View Stop Details
                  </button>
                </div>
              `);

            busPopup.on('open', () => {
              const btn = document.getElementById(`btn-bus-${seg.id}`);
              if (btn && onSelectStop) {
                btn.onclick = () => onSelectStop(seg.from.name);
              }
            });

            busEl.onclick = () => {
              if (onSelectStop) onSelectStop(seg.from.name);
            };

            const busMarker = new Marker({
              element: busEl,
              anchor: 'center'
            })
              .setLngLat(fromLngLat)
              .setPopup(busPopup)
              .addTo(map);

            markersRef.current.push(busMarker);
          }
        });
      }
    }

    // F. Fit bounds smoothly if valid points exist
    if (hasPoints && !bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15,
        duration: 900
      });
    }
  }, [origin, destination, selectedJourney, onSelectStop, onSelectStation, onSelectTransfer]);

  // Trigger update whenever journey or coordinates change
  useEffect(() => {
    updateMapContent();
  }, [updateMapContent]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersRef.current.length > 0 || (selectedJourney && selectedJourney.segments.length > 0)) {
      const bounds = new LngLatBounds();
      if (origin) bounds.extend([origin.longitude, origin.latitude]);
      if (destination) bounds.extend([destination.longitude, destination.latitude]);
      if (selectedJourney) {
        selectedJourney.segments.forEach(s => {
          s.geometry?.forEach(pt => bounds.extend([pt[1], pt[0]]));
        });
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 15,
          duration: 700
        });
        return;
      }
    }

    // Default: Reset to Hyderabad overview
    map.flyTo({
      center: HYDERABAD_CENTER,
      zoom: INITIAL_ZOOM,
      duration: 800
    });
  };

  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude];

        if (!userLocationMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'flex items-center justify-center';
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(14, 165, 233, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <span style="position: relative; width: 16px; height: 16px; border-radius: 50%; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></span>
            </div>
          `;
          userLocationMarkerRef.current = new Marker({
            element: el,
            anchor: 'center'
          })
            .setLngLat(userLngLat)
            .addTo(map);
        } else {
          userLocationMarkerRef.current.setLngLat(userLngLat);
        }

        map.flyTo({
          center: userLngLat,
          zoom: 14,
          duration: 800
        });
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation warning:', error.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      {/* Map Error Fallback */}
      {mapError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-6 text-center z-20">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-slate-800">{mapError}</p>
          <p className="text-xs text-slate-500 mt-1">
            Transit timetable and route calculation continue to work normally.
          </p>
        </div>
      ) : null}

      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFitBounds}
          className="p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs"
          title="Fit route to screen / Reset view"
          aria-label="Fit route to screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          className={`p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-xs ${
            isLocating ? 'animate-pulse text-sky-600' : ''
          }`}
          title="Locate me"
          aria-label="Locate me"
        >
          <Locate className="w-4 h-4" />
        </button>
      </div>

      {/* Legend & Attribution Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-xs text-[11px] text-slate-700 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Walk</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-blue-600 rounded" />
          <span>TGSRTC Bus</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-red-500 rounded" />
          <span>Metro</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-amber-500 rounded" />
          <span>Auto / Cab</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Transfer</span>
        </span>
      </div>
    </div>
  );
};
