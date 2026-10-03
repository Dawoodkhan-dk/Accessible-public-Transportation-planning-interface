import React from 'react';
import { X, Bus, Check, MapPin, ShieldCheck, Clock, Wind, Armchair, Sun } from 'lucide-react';
import { BusStop } from '../types';

interface StopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: BusStop | null;
}

export const StopDetailsModal: React.FC<StopDetailsModalProps> = ({
  isOpen,
  onClose,
  stop
}) => {
  if (!isOpen || !stop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{stop.stopName}</h2>
              <p className="text-xs text-slate-500">TGSRTC Bus Stop Details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close stop details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Coordinates & Source */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
            </span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {stop.source} Verified
            </span>
          </div>

          {/* Served Routes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Served TGSRTC Routes
            </h4>
            <div className="flex flex-wrap gap-2">
              {stop.servedRoutes.map(rt => (
                <span
                  key={rt}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold font-mono text-xs flex items-center gap-1"
                >
                  <Bus className="w-3 h-3 text-blue-600" />
                  Route {rt}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities & Accessibility */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Station Facilities & Accessibility
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${stop.accessibility.wheelchairAccessible ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={stop.accessibility.wheelchairAccessible ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Wheelchair Ramp
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Wind className={`w-4 h-4 ${stop.accessibility.shelter ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={stop.accessibility.shelter ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Weather Shelter
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Armchair className={`w-4 h-4 ${stop.accessibility.seating ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={stop.accessibility.seating ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Seating Available
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Sun className={`w-4 h-4 ${stop.accessibility.lighting ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={stop.accessibility.lighting ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Evening Lighting
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
