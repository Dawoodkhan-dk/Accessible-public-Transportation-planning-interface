import React from 'react';
import { Bus, Train, Car, Bike, Footprints, Clock, ArrowRight, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { JourneyOption, TransportMode } from '../types';

interface RouteCardProps {
  journey: JourneyOption;
  isSelected: boolean;
  onSelect: (journey: JourneyOption) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ journey, isSelected, onSelect }) => {
  const getModeIcon = () => {
    switch (journey.modeCategory) {
      case 'Direct Bus':
      case 'Multimodal':
        return <Bus className="w-5 h-5 text-blue-600" />;
      case 'Metro':
        return <Train className="w-5 h-5 text-purple-600" />;
      case 'Auto':
        return <Bike className="w-5 h-5 text-amber-600" />;
      case 'Cab':
        return <Car className="w-5 h-5 text-indigo-600" />;
      default:
        return <Footprints className="w-5 h-5 text-teal-600" />;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'FASTEST':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'DIRECT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'FEWEST TRANSFERS':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'LOWEST FARE':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'ACCESSIBLE':
        return 'text-teal-800 bg-teal-100/70 border-teal-300';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(journey)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-left relative ${
        isSelected
          ? 'bg-teal-50/40 border-teal-500 shadow-md ring-2 ring-teal-500/20'
          : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Title, Tags & Duration */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            {getModeIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{journey.title}</h3>
              {journey.transfersCount === 0 && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                  0 transfers
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{journey.modeCategory}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{journey.departureTime} → {journey.arrivalTime}</span>
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-base font-bold font-mono text-slate-900 block">
            {journey.totalDurationMinutes} min
          </span>
          <span className="text-[11px] text-slate-500 block">
            {journey.fare.type === 'Free'
              ? 'Free'
              : journey.fare.min === journey.fare.max
              ? `₹${journey.fare.min} (${journey.fare.type})`
              : `₹${journey.fare.min}–₹${journey.fare.max} (Est)`}
          </span>
        </div>
      </div>

      {/* Characteristic Badges */}
      <div className="flex flex-wrap items-center gap-1.5 my-2">
        {journey.tags.map(tag => (
          <span
            key={tag}
            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getTagColor(
              tag
            )}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Metrics Row: Walk, Transfers, Traffic, Accessibility */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          {journey.walkingDurationMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-slate-400" />
              <span>{journey.walkingDurationMinutes} min walk ({journey.walkingDistanceMeters}m)</span>
            </span>
          )}

          {journey.trafficDelayMinutes > 0 && (
            <span className="flex items-center gap-1 text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>+{journey.trafficDelayMinutes} min traffic</span>
            </span>
          )}

          {journey.accessibility.stepFree && (
            <span className="flex items-center gap-1 text-teal-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Step-free</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-teal-700 font-semibold text-xs ml-auto">
          <span>{isSelected ? 'Selected' : 'View Details'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
