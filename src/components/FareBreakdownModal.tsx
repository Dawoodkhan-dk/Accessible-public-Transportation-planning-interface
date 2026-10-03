import React from 'react';
import { X, Receipt, Check, Bus, Train, Bike, Car, Footprints, ShieldCheck } from 'lucide-react';
import { JourneyOption } from '../types';

interface FareBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: JourneyOption;
}

export const FareBreakdownModal: React.FC<FareBreakdownModalProps> = ({
  isOpen,
  onClose,
  journey
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Itemized Fare Breakdown</h2>
              <p className="text-xs text-slate-500">Transparent multi-operator pricing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close fare breakdown"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Operator Fare Cards */}
          <div className="space-y-2.5">
            {journey.segments.map(seg => {
              return (
                <div
                  key={seg.id}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                      {seg.mode === 'bus' && <Bus className="w-4 h-4 text-blue-600" />}
                      {seg.mode === 'metro' && <Train className="w-4 h-4 text-purple-600" />}
                      {seg.mode === 'auto' && <Bike className="w-4 h-4 text-amber-600" />}
                      {seg.mode === 'cab' && <Car className="w-4 h-4 text-indigo-600" />}
                      {seg.mode === 'walk' && <Footprints className="w-4 h-4 text-teal-600" />}
                      {seg.mode === 'transfer' && <Bus className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{seg.routeName}</p>
                      <p className="text-[11px] text-slate-500">
                        {seg.distanceMeters > 0 ? `${(seg.distanceMeters / 1000).toFixed(1)} km · ` : ''}
                        {seg.source} Data
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      {seg.fare === 0 ? 'Free' : `₹${seg.fare}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {seg.fare === 0 ? 'Walk' : 'Tariff'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dark Total Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                TOTAL ESTIMATED COST
              </span>
              <p className="text-xs text-teal-400">Single ticket journey across all operators</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xl font-bold text-teal-300">
                {journey.fare.type === 'Free'
                  ? '₹0 (Free)'
                  : journey.fare.min === journey.fare.max
                  ? `₹${journey.fare.min}`
                  : `₹${journey.fare.min}–₹${journey.fare.max}`}
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">
                {journey.fare.type} Calculation
              </span>
            </div>
          </div>

          {/* Fare Computation Rules */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Fare Computation Rules</h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>
                <span className="font-semibold text-slate-800">TGSRTC Buses:</span> Official distance-stage fare charts (Ordinary ₹15–₹35, Metro Express ₹20–₹45).
              </li>
              <li>
                <span className="font-semibold text-slate-800">Hyderabad Metro:</span> Verified HMRL distance stages starting from ₹20 up to ₹60 maximum.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Auto-Rickshaw:</span> Official Telangana state meter tariff (₹30 for first 1.5 km, ₹15/km thereafter).
              </li>
              <li>
                <span className="font-semibold text-slate-800">AC Cabs:</span> Estimated app-based tariff with dynamic traffic wait time included.
              </li>
              <li>
                <span className="font-semibold text-slate-800">Pedestrian Walking:</span> Always free (₹0).
              </li>
            </ul>
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
            className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
