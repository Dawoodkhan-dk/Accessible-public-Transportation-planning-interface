import React, { useState, useEffect } from 'react';
import {
  LocationItem,
  JourneyOption,
  JourneySegment,
  TimePlanningConfig,
  AccessibilityPreferences,
  RouteSortFilter,
  BusStop,
  MetroStation
} from './types';
import { StorageService, DEFAULT_PREFERENCES } from './services/storageService';
import { RoutingService } from './services/routingService';
import { GeocodingService } from './services/geocodingService';
import { AlertService } from './services/alertService';
import { TransitDataService } from './services/transitDataService';

// Components
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { RouteFilters } from './components/RouteFilters';
import { RouteCard } from './components/RouteCard';
import { JourneySummary } from './components/JourneySummary';
import { JourneyTimeline } from './components/JourneyTimeline';
import { TransitMap } from './components/TransitMap';
import { TimeSelectorModal } from './components/TimeSelectorModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { FareBreakdownModal } from './components/FareBreakdownModal';
import { TransferDetailsModal } from './components/TransferDetailsModal';
import { StopDetailsModal } from './components/StopDetailsModal';
import { MetroStationDetailsModal } from './components/MetroStationDetailsModal';
import { ServiceAlertsModal } from './components/ServiceAlertsModal';
import { UsabilityTestPanel } from './components/UsabilityTestPanel';
import { DatabaseQualityModal } from './components/DatabaseQualityModal';

export default function App() {
  // --- APPLICATION STATE (STARTS COMPLETELY EMPTY ON FIRST LOAD AS REQUIRED) ---
  const [origin, setOrigin] = useState<LocationItem | null>(null);
  const [destination, setDestination] = useState<LocationItem | null>(null);
  const [routeResults, setRouteResults] = useState<JourneyOption[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<JourneyOption | null>(null);
  const [activeFilter, setActiveFilter] = useState<RouteSortFilter>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Time Planning State (Defaults to 'now')
  const [timeConfig, setTimeConfig] = useState<TimePlanningConfig>(() => {
    const now = new Date();
    return {
      mode: 'now',
      targetDate: now.toISOString().split('T')[0],
      targetTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    };
  });

  // Accessibility Preferences (Loaded from persistent StorageService)
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() =>
    StorageService.getPreferences()
  );

  // Modals Visibility (ALL START FALSE ON FIRST LOAD AS REQUIRED)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isFareModalOpen, setIsFareModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isMetroModalOpen, setIsMetroModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isUsabilityPanelOpen, setIsUsabilityPanelOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  // Modal Context State
  const [activeTransferSegment, setActiveTransferSegment] = useState<JourneySegment | null>(null);
  const [activeStop, setActiveStop] = useState<BusStop | null>(null);
  const [activeStation, setActiveStation] = useState<MetroStation | null>(null);

  // Active Alerts count
  const allAlerts = AlertService.getAllAlerts();

  // Apply sensory accessibility classnames to HTML
  useEffect(() => {
    if (preferences.largerText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }

    if (preferences.highContrast) {
      document.documentElement.classList.add('contrast-125');
    } else {
      document.documentElement.classList.remove('contrast-125');
    }
  }, [preferences]);

  // Handler: Swap Locations
  const handleSwapLocations = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    setOrigin(prevDest);
    setDestination(prevOrigin);
    setValidationError(null);
  };

  // Handler: Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError('Geolocation is not supported in this browser. Please enter origin manually.');
      return;
    }

    setIsDetectingLocation(true);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const loc = await GeocodingService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setOrigin(loc);
        } catch {
          setValidationError('Could not reverse geocode your location. Please enter origin manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      err => {
        setIsDetectingLocation(false);
        setValidationError('Location access denied or unavailable. Please type your starting point.');
      },
      { timeout: 8000 }
    );
  };

  // Handler: Find Route
  const handleFindRoute = () => {
    if (!origin) {
      setValidationError('Please enter a starting location.');
      return;
    }
    if (!destination) {
      setValidationError('Please enter a destination.');
      return;
    }
    if (origin.latitude === destination.latitude && origin.longitude === destination.longitude) {
      setValidationError('Origin and destination are identical. Please choose a different destination.');
      return;
    }

    setValidationError(null);
    setIsSearching(true);

    // Save to recent searches
    StorageService.addRecentSearch(origin.name, destination.name);

    setTimeout(() => {
      try {
        const journeys = RoutingService.calculateJourneys({
          origin,
          destination,
          timePlanning: timeConfig,
          accessibilityPreferences: preferences
        });

        setRouteResults(journeys);
        if (journeys.length > 0) {
          // Select first option by default
          setSelectedJourney(journeys[0]);
        } else {
          setSelectedJourney(null);
        }
      } catch (e) {
        setValidationError('An error occurred calculating transit paths. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Handler: Select Preset Demonstrations
  const handleSelectPreset = async (fromName: string, toName: string) => {
    setValidationError(null);
    const fromResults = await GeocodingService.searchLocations(fromName);
    const toResults = await GeocodingService.searchLocations(toName);

    if (fromResults.length > 0 && toResults.length > 0) {
      const fromLoc = fromResults[0];
      const toLoc = toResults[0];
      setOrigin(fromLoc);
      setDestination(toLoc);

      // Auto-calculate for preset convenience
      setIsSearching(true);
      setTimeout(() => {
        const journeys = RoutingService.calculateJourneys({
          origin: fromLoc,
          destination: toLoc,
          timePlanning: timeConfig,
          accessibilityPreferences: preferences
        });
        setRouteResults(journeys);
        setSelectedJourney(journeys[0] || null);
        setIsSearching(false);
      }, 250);
    }
  };

  // Handler: Reset Entire Search
  const handleResetSearch = () => {
    setOrigin(null);
    setDestination(null);
    setRouteResults([]);
    setSelectedJourney(null);
    setValidationError(null);
    setActiveFilter('all');
  };

  // Filtered Route Results
  const filteredJourneys = routeResults.filter(journey => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'fastest') return journey.tags.includes('FASTEST');
    if (activeFilter === 'fewest_transfers') return journey.tags.includes('FEWEST TRANSFERS') || journey.transfersCount === 0;
    if (activeFilter === 'lowest_fare') return journey.tags.includes('LOWEST FARE');
    if (activeFilter === 'least_walking') return journey.tags.includes('LEAST WALKING');
    if (activeFilter === 'accessible') return journey.accessibility.stepFree;
    return true;
  });

  const filterCounts = {
    total: routeResults.length,
    fastest: routeResults.filter(j => j.tags.includes('FASTEST')).length,
    fewestTransfers: routeResults.filter(j => j.tags.includes('FEWEST TRANSFERS') || j.transfersCount === 0).length,
    lowestFare: routeResults.filter(j => j.tags.includes('LOWEST FARE')).length,
    leastWalking: routeResults.filter(j => j.tags.includes('LEAST WALKING')).length,
    accessible: routeResults.filter(j => j.accessibility.stepFree).length
  };

  // Stop Details Trigger
  const handleOpenStopDetails = (stopName: string) => {
    const stops = TransitDataService.getAllBusStops();
    const found = stops.find(s => s.stopName.toLowerCase().includes(stopName.toLowerCase()) || stopName.toLowerCase().includes(s.stopName.toLowerCase()));
    if (found) {
      setActiveStop(found);
      setIsStopModalOpen(true);
    } else {
      // Check metro station
      const stations = TransitDataService.getAllMetroStations();
      const stn = stations.find(s => s.stationName.toLowerCase().includes(stopName.toLowerCase()) || stopName.toLowerCase().includes(s.stationName.toLowerCase()));
      if (stn) {
        setActiveStation(stn);
        setIsMetroModalOpen(true);
      }
    }
  };

  // Station Details Trigger
  const handleOpenStationDetails = (stationName: string) => {
    const stations = TransitDataService.getAllMetroStations();
    const found = stations.find(s => s.stationName.toLowerCase().includes(stationName.toLowerCase()) || stationName.toLowerCase().includes(s.stationName.toLowerCase()));
    if (found) {
      setActiveStation(found);
      setIsMetroModalOpen(true);
    }
  };

  // Transfer Details Trigger
  const handleOpenTransferDetails = (segment: JourneySegment) => {
    setActiveTransferSegment(segment);
    setIsTransferModalOpen(true);
  };

  // Run Scenario from Usability Panel
  const handleRunScenario = async (scenarioId: number) => {
    if (scenarioId === 1) {
      // Chandrayangutta to Secunderabad (dynamic transfer at Koti)
      await handleSelectPreset('Chandrayangutta', 'Secunderabad Railway Station');
    } else if (scenarioId === 2) {
      // Avoid stairs & Step-free
      const newPrefs = { ...preferences, stepFree: true, avoidStairs: true };
      setPreferences(newPrefs);
      StorageService.savePreferences(newPrefs);
      await handleSelectPreset('Ameerpet', 'Secunderabad Railway Station');
    } else if (scenarioId === 3) {
      // Transfer point analysis
      await handleSelectPreset('Chandrayangutta', 'Secunderabad Railway Station');
      setTimeout(() => {
        const transferSeg = selectedJourney?.segments.find(s => s.mode === 'transfer');
        if (transferSeg) {
          setActiveTransferSegment(transferSeg);
          setIsTransferModalOpen(true);
        }
      }, 500);
    } else if (scenarioId === 4) {
      // Total fare breakdown
      await handleSelectPreset('Chandrayangutta', 'Koti');
      setTimeout(() => {
        setIsFareModalOpen(true);
      }, 500);
    } else if (scenarioId === 5) {
      // Walking distance to stop
      await handleSelectPreset('Chandrayangutta', 'Koti');
    } else if (scenarioId === 6) {
      // Next bus schedule
      await handleSelectPreset('Chandrayangutta', 'Koti');
    } else if (scenarioId === 7) {
      // Metro alternative
      await handleSelectPreset('Ameerpet', 'Secunderabad Railway Station');
    } else if (scenarioId === 8) {
      // Arrive-by 10:00 AM
      setTimeConfig({
        mode: 'arrive_by',
        targetDate: new Date().toISOString().split('T')[0],
        targetTime: '10:00'
      });
      await handleSelectPreset('Mehdipatnam', 'Gachibowli');
    } else if (scenarioId === 9) {
      // Traffic impact
      await handleSelectPreset('Mehdipatnam', 'Gachibowli');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
        onOpenUsabilityTest={() => setIsUsabilityPanelOpen(true)}
        onOpenDatabaseQuality={() => setIsDatabaseModalOpen(true)}
        alertsCount={allAlerts.length}
        accessibilityActive={preferences.stepFree || preferences.wheelchairAccessible || preferences.avoidStairs}
        onResetSearch={handleResetSearch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Layout Grid: Left Search & Results, Right Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Search Form + Route Cards / Journey Details (5 or 6 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            {/* Search Card */}
            <SearchForm
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwapLocations={handleSwapLocations}
              onUseCurrentLocation={handleUseCurrentLocation}
              isDetectingLocation={isDetectingLocation}
              timeConfig={timeConfig}
              onOpenTimeModal={() => setIsTimeModalOpen(true)}
              preferences={preferences}
              onOpenAccessibilityModal={() => setIsAccessibilityModalOpen(true)}
              onFindRoute={handleFindRoute}
              isSearching={isSearching}
              onSelectPreset={handleSelectPreset}
              validationError={validationError}
            />

            {/* Results Section (Only rendered after user searches) */}
            {routeResults.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Segmented Filter Tabs */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Route Options ({filteredJourneys.length})
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    TGSRTC Bus · Metro · Auto · Cab
                  </span>
                </div>

                <RouteFilters
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  counts={filterCounts}
                />

                {/* Route Cards List */}
                <div className="space-y-3">
                  {filteredJourneys.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                      No routes match the selected filter. Try selecting "All Options".
                    </div>
                  ) : (
                    filteredJourneys.map(journey => (
                      <RouteCard
                        key={journey.id}
                        journey={journey}
                        isSelected={selectedJourney?.id === journey.id}
                        onSelect={setSelectedJourney}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Empty State Instructions when no search performed yet */}
            {routeResults.length === 0 && !isSearching && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Plan your journey across Hyderabad
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your origin and destination above, or pick one of the suggested demonstrations to compare direct government buses, Hyderabad Metro Red/Blue lines, point-to-point autos, and walking connections.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Real TGSRTC Timetables</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Step-Free Routing</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Itemized Fares</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Deadline Arrival Planning</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map + Selected Journey Details */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            {/* Map Canvas */}
            <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px]">
              <TransitMap
                origin={origin}
                destination={destination}
                selectedJourney={selectedJourney}
                onSelectStop={handleOpenStopDetails}
                onSelectStation={handleOpenStationDetails}
                onSelectTransfer={handleOpenTransferDetails}
              />
            </div>

            {/* Selected Journey Details (Timeline, Summary & Transfers) */}
            {selectedJourney && origin && destination && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                {/* Journey Summary Banner */}
                <JourneySummary
                  journey={selectedJourney}
                  origin={origin}
                  destination={destination}
                  onOpenFareModal={() => setIsFareModalOpen(true)}
                  onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
                />

                {/* Vertical Timeline */}
                <JourneyTimeline
                  journey={selectedJourney}
                  onOpenTransferDetails={handleOpenTransferDetails}
                  onOpenStopDetails={handleOpenStopDetails}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- ALL MODALS WITH REAL BUTTON HANDLERS --- */}
      {/* 1. Time Planning Modal */}
      <TimeSelectorModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        config={timeConfig}
        onApply={newConfig => {
          setTimeConfig(newConfig);
          // If search was already made, recalculate
          if (origin && destination) {
            const updated = RoutingService.calculateJourneys({
              origin,
              destination,
              timePlanning: newConfig,
              accessibilityPreferences: preferences
            });
            setRouteResults(updated);
            setSelectedJourney(updated[0] || null);
          }
        }}
      />

      {/* 2. Accessibility Preferences Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        preferences={preferences}
        onApply={newPrefs => {
          setPreferences(newPrefs);
          StorageService.savePreferences(newPrefs);
          // If search was already made, recalculate
          if (origin && destination) {
            const updated = RoutingService.calculateJourneys({
              origin,
              destination,
              timePlanning: timeConfig,
              accessibilityPreferences: newPrefs
            });
            setRouteResults(updated);
            setSelectedJourney(updated[0] || null);
          }
        }}
        onReset={() => {
          const reset = StorageService.resetPreferences();
          setPreferences(reset);
        }}
      />

      {/* 3. Itemized Fare Breakdown Modal */}
      {selectedJourney && (
        <FareBreakdownModal
          isOpen={isFareModalOpen}
          onClose={() => setIsFareModalOpen(false)}
          journey={selectedJourney}
        />
      )}

      {/* 4. Transfer Details Modal */}
      <TransferDetailsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        segment={activeTransferSegment}
      />

      {/* 5. Bus Stop Details Modal */}
      <StopDetailsModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        stop={activeStop}
      />

      {/* 6. Metro Station Details Modal */}
      <MetroStationDetailsModal
        isOpen={isMetroModalOpen}
        onClose={() => setIsMetroModalOpen(false)}
        station={activeStation}
      />

      {/* 7. Service Alerts Modal */}
      <ServiceAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={allAlerts}
      />

      {/* 8. Usability Testing Suite */}
      <UsabilityTestPanel
        isOpen={isUsabilityPanelOpen}
        onClose={() => setIsUsabilityPanelOpen(false)}
        onRunScenario={handleRunScenario}
      />

      {/* 9. Database Quality Audit Modal */}
      <DatabaseQualityModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 WAYFIND Transit. Built for accessible urban mobility across TGSRTC buses, HMRL Metro, and pedestrian networks.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setIsDatabaseModalOpen(true)}
              className="hover:text-teal-700 transition-colors cursor-pointer font-semibold text-slate-800"
            >
              Transit Database Audit
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsUsabilityPanelOpen(true)}
              className="hover:text-teal-700 transition-colors cursor-pointer"
            >
              Usability Suite
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsAlertsModalOpen(true)}
              className="hover:text-teal-700 transition-colors cursor-pointer"
            >
              Transit Alerts
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsAccessibilityModalOpen(true)}
              className="hover:text-teal-700 transition-colors cursor-pointer"
            >
              Accessibility Specs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
