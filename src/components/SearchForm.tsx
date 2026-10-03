import React from 'react';
import { ArrowUpDown, Clock, Accessibility, Sparkles, Navigation } from 'lucide-react';
import { LocationItem, TimePlanningConfig, AccessibilityPreferences } from '../types';
import { LocationSearch } from './LocationSearch';

interface SearchFormProps {
  origin: LocationItem | null;
  destination: LocationItem | null;
  onOriginChange: (loc: LocationItem | null) => void;
  onDestinationChange: (loc: LocationItem | null) => void;
  onSwapLocations: () => void;
  onUseCurrentLocation: () => void;
  isDetectingLocation: boolean;
  timeConfig: TimePlanningConfig;
  onOpenTimeModal: () => void;
  preferences: AccessibilityPreferences;
  onOpenAccessibilityModal: () => void;
  onFindRoute: () => void;
  isSearching: boolean;
  onSelectPreset: (fromName: string, toName: string) => void;
  validationError?: string | null;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwapLocations,
  onUseCurrentLocation,
  isDetectingLocation,
  timeConfig,
  onOpenTimeModal,
  preferences,
  onOpenAccessibilityModal,
  onFindRoute,
  isSearching,
  onSelectPreset,
  validationError
}) => {
  const activePrefCount = [
    preferences.stepFree,
    preferences.wheelchairAccessible,
    preferences.avoidStairs,
    preferences.elevatorRequired,
    preferences.reduceWalking
  ].filter(Boolean).length;

  const getTimeLabel = () => {
    if (timeConfig.mode === 'now') return 'Leave now';
    if (timeConfig.mode === 'depart_at') return `Depart at ${timeConfig.targetTime}`;
    return `Arrive by ${timeConfig.targetTime}`;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 transition-all">
      {/* Search Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Move through the city with confidence.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Plan clearer, more accessible journeys across buses, metro, autos and cabs.
        </p>
      </div>

      {/* Input Fields Container with Swap Button */}
      <div className="relative space-y-3">
        <LocationSearch
          label="FROM"
          placeholder="Search starting station, landmark, or address..."
          value={origin}
          onChange={onOriginChange}
          onUseCurrentLocation={onUseCurrentLocation}
          isCurrentLocationLoading={isDetectingLocation}
        />

        {/* Swap Button */}
        <div className="flex justify-end sm:absolute sm:right-4 sm:top-[68px] z-10 my-1 sm:my-0">
          <button
            type="button"
            onClick={onSwapLocations}
            className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Swap starting point and destination"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="sm:hidden">Swap</span>
          </button>
        </div>

        <LocationSearch
          label="TO"
          placeholder="Search destination station, neighborhood, or address..."
          value={destination}
          onChange={onDestinationChange}
        />
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
          {validationError}
        </div>
      )}

      {/* Filters & Preferences Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Selector Button */}
          <button
            type="button"
            onClick={onOpenTimeModal}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{getTimeLabel()}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {/* Accessibility & Preferences Button */}
          <button
            type="button"
            onClick={onOpenAccessibilityModal}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activePrefCount > 0
                ? 'border-teal-400 bg-teal-50 text-teal-900 font-bold'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 text-teal-600" />
            <span>Accessibility</span>
            {activePrefCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-200 text-teal-900">
                {activePrefCount}
              </span>
            )}
          </button>
        </div>

        {/* Primary CTA: FIND MY ROUTE */}
        <button
          type="button"
          onClick={onFindRoute}
          disabled={isSearching}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSearching ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Searching Transit Network...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>FIND MY ROUTE</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Demo Examples (Not selected on load, but available for quick 1-click test) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Demonstrations
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectPreset('Chandrayangutta', 'Koti')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            Chandrayangutta ➔ Koti (Bus 100)
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('Ameerpet', 'Secunderabad Railway Station')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            Ameerpet ➔ Secunderabad (Blue Line)
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('Mehdipatnam', 'Gachibowli')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            Mehdipatnam ➔ Gachibowli (Bus 216)
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('Koti', 'Patancheru')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            Koti ➔ Patancheru (Bus 218)
          </button>
        </div>
      </div>
    </div>
  );
};
