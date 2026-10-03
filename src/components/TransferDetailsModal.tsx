import React from 'react';
import { X, Shuffle, Check, Footprints, Clock, ShieldCheck, AlertCircle, MapPin } from 'lucide-react';
import { JourneySegment } from '../types';

interface TransferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: JourneySegment | null;
}

export const TransferDetailsModal: React.FC<TransferDetailsModalProps> = ({
  isOpen,
  onClose,
  segment
}) => {
  if (!isOpen || !segment) return null;

  const transferWindowMin = segment.durationMinutes + 4; // Transfer walk + wait window
  const bufferRisk =
    transferWindowMin >= 7 ? 'Comfortable' : transferWindowMin >= 4 ? 'Moderate' : 'Short Transfer';

  const riskBadgeColor =
    bufferRisk === 'Comfortable'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : bufferRisk === 'Moderate'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Transfer Visualization</h2>
              <p className="text-xs text-slate-500">Connection window & platform navigation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close transfer dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
              TRANSFER HUB
            </span>
            <h3 className="text-base font-bold text-slate-900">{segment.from.name}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Transferring to: <span className="font-semibold text-slate-800">{segment.to.name}</span>
            </p>
          </div>

          {/* Transfer Timing Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                WALK TIME
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {segment.durationMinutes} min
              </span>
              <span className="text-[10px] text-slate-500 block">{segment.distanceMeters}m distance</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                TRANSFER WINDOW
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {transferWindowMin} min
              </span>
              <span className="text-[10px] text-slate-500 block">Total connection</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                BUFFER RISK
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${riskBadgeColor}`}>
                {bufferRisk}
              </span>
            </div>
          </div>

          {/* Navigation Instructions */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span>Concourse Guidance</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              {segment.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Accessibility status */}
          <div className="p-3 rounded-xl border border-slate-200 bg-teal-50/50 flex items-center gap-2.5 text-xs text-teal-900">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <span className="font-bold">Step-free corridor verified:</span>{' '}
              {segment.accessibility.notes || 'Grade-level concourse crossing without stairs.'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
