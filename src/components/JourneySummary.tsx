import React, { useState } from 'react';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Share2,
  Footprints,
  Shuffle
} from 'lucide-react';
import { JourneyOption, LocationItem } from '../types';
import { StorageService } from '../services/storageService';

interface JourneySummaryProps {
  journey: JourneyOption;
  origin: LocationItem;
  destination: LocationItem;
  onOpenFareModal: () => void;
  onOpenAlertsModal: () => void;
  onBackToOptions?: () => void;
}

export const JourneySummary: React.FC<JourneySummaryProps> = ({
  journey,
  origin,
  destination,
  onOpenFareModal,
  onOpenAlertsModal,
  onBackToOptions
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJourney = () => {
    StorageService.createSavedJourney({
      title: `${origin.name} ➔ ${destination.name}`,
      originName: origin.name,
      destinationName: destination.name,
      originLat: origin.latitude,
      originLng: origin.longitude,
      destLat: destination.latitude,
      destLng: destination.longitude,
      modeCategory: journey.modeCategory,
      fareMin: journey.fare.min,
      fareMax: journey.fare.max,
      durationMinutes: journey.totalDurationMinutes
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800">
      {/* Top Bar with Back action and Save/Fare buttons */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {onBackToOptions && (
            <button
              type="button"
              onClick={onBackToOptions}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Return to route list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-200">Selected Route</h2>
            <p className="text-xs text-teal-400 font-semibold">{origin.name} ➔ {destination.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFareModal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect itemized multi-operator tariff breakdown"
          >
            <Receipt className="w-3.5 h-3.5 text-teal-400" />
            <span>Fare Details</span>
          </button>

          <button
            type="button"
            onClick={handleSaveJourney}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-teal-500 text-slate-950 border-teal-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Save this itinerary to device memory"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Departure / Arrival Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            LEAVE BY
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-teal-300">
            {journey.recommendedLeaveTime}
          </span>
          <span className="text-[10px] text-slate-400 block">Departure window</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            ARRIVE
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-white">
            {journey.arrivalTime}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {journey.bufferMinutes ? `+${journey.bufferMinutes}m buffer included` : 'Estimated destination arrival'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            TOTAL TIME
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-white">
            {journey.totalDurationMinutes} MIN
          </span>
          <span className="text-[10px] text-slate-400 block">
            {journey.trafficDelayMinutes > 0 ? `+${journey.trafficDelayMinutes}m traffic` : 'Normal transit flow'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            ESTIMATED FARE
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-teal-300">
            {journey.fare.type === 'Free'
              ? 'Free'
              : journey.fare.min === journey.fare.max
              ? `₹${journey.fare.min}`
              : `₹${journey.fare.min}–₹${journey.fare.max}`}
          </span>
          <span className="text-[10px] text-slate-400 block">{journey.fare.type} tariff</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Shuffle className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">{journey.transfersCount}</span>
            <span>{journey.transfersCount === 1 ? 'transfer' : 'transfers'}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">{journey.walkingDurationMinutes} min</span>
            <span>walk ({journey.walkingDistanceMeters}m)</span>
          </span>

          {journey.accessibility.stepFree ? (
            <span className="flex items-center gap-1.5 text-teal-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Step-Free Route</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Entry stairs required</span>
            </span>
          )}
        </div>

        {journey.alerts.length > 0 && (
          <button
            type="button"
            onClick={onOpenAlertsModal}
            className="text-xs text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2.5 py-1 rounded-lg hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{journey.alerts.length} Service Alert active</span>
          </button>
        )}
      </div>
    </div>
  );
};
