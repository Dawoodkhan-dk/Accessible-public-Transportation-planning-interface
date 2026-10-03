import React from 'react';
import {
  MapPin,
  Bus,
  Train,
  Bike,
  Car,
  Footprints,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Shuffle
} from 'lucide-react';
import { JourneyOption, JourneySegment, TransportMode } from '../types';

interface JourneyTimelineProps {
  journey: JourneyOption;
  onOpenTransferDetails: (segment: JourneySegment) => void;
  onOpenStopDetails: (stopName: string) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  journey,
  onOpenTransferDetails,
  onOpenStopDetails
}) => {
  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'bus':
        return <Bus className="w-4 h-4 text-blue-600" />;
      case 'metro':
        return <Train className="w-4 h-4 text-purple-600" />;
      case 'auto':
        return <Bike className="w-4 h-4 text-amber-600" />;
      case 'cab':
        return <Car className="w-4 h-4 text-indigo-600" />;
      case 'transfer':
        return <Shuffle className="w-4 h-4 text-purple-600" />;
      default:
        return <Footprints className="w-4 h-4 text-teal-600" />;
    }
  };

  const getSegmentHeaderBg = (mode: TransportMode) => {
    switch (mode) {
      case 'bus':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'metro':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'auto':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'cab':
        return 'bg-indigo-50 border-indigo-200 text-indigo-900';
      case 'transfer':
        return 'bg-purple-50/80 border-purple-200 text-purple-900';
      default:
        return 'bg-teal-50/60 border-teal-200 text-teal-900';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Step-by-Step Journey Timeline</h3>
          <p className="text-xs text-slate-500">Real-time scheduled stages, connection windows & accessible instructions</p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
          {journey.segments.length} Stages
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {journey.segments.map((segment, index) => {
          const isFirst = index === 0;
          const isLast = index === journey.segments.length - 1;
          const isTransfer = segment.mode === 'transfer';

          return (
            <div key={segment.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${
                  isFirst
                    ? 'border-teal-500 text-teal-600'
                    : isLast
                    ? 'border-rose-500 text-rose-600'
                    : isTransfer
                    ? 'border-purple-500 text-purple-600'
                    : 'border-slate-400 text-slate-600'
                }`}
              >
                {getModeIcon(segment.mode)}
              </div>

              {/* Segment Card */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40">
                {/* Time & Route Name Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {segment.departureTime}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {segment.from.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-600">
                      {segment.durationMinutes} min
                    </span>
                    {segment.fare > 0 && (
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        ₹{segment.fare}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Mode Badge */}
                <div className={`p-2.5 rounded-lg border text-xs font-medium mb-3 flex items-center justify-between ${getSegmentHeaderBg(segment.mode)}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold truncate">{segment.routeName}</span>
                    {segment.routeNumber && (
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 bg-white/80 rounded border border-current">
                        No. {segment.routeNumber}
                      </span>
                    )}
                  </div>

                  {/* If transfer, offer detailed transfer button */}
                  {isTransfer && (
                    <button
                      type="button"
                      onClick={() => onOpenTransferDetails(segment)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Transfer Details</span>
                    </button>
                  )}

                  {/* If bus or metro, clickable stop info */}
                  {(segment.mode === 'bus' || segment.mode === 'metro') && (
                    <button
                      type="button"
                      onClick={() => onOpenStopDetails(segment.from.name)}
                      className="text-xs text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Stop Details</span>
                    </button>
                  )}
                </div>

                {/* Turn-by-turn / Transit Instructions */}
                <ul className="text-xs text-slate-600 space-y-1 pl-1">
                  {segment.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-1">›</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>

                {/* Accessibility & Traffic Meta for this segment */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    {segment.accessibility.stepFree ? (
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Step-free boarding</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Boarding steps required</span>
                      </span>
                    )}

                    {segment.traffic && segment.traffic.delayMinutes > 0 && (
                      <span className="text-amber-700 font-medium">
                        +{segment.traffic.delayMinutes}m traffic delay ({segment.traffic.level})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                    <span>Arrives {segment.to.name} at {segment.arrivalTime}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
