import React from 'react';
import { X, Train, Check, MapPin, ShieldCheck, Clock, Layers, ArrowRight } from 'lucide-react';
import { MetroStation } from '../types';

interface MetroStationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: MetroStation | null;
}

export const MetroStationDetailsModal: React.FC<MetroStationDetailsModalProps> = ({
  isOpen,
  onClose,
  station
}) => {
  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl text-white font-bold"
              style={{ backgroundColor: station.lineColor }}
            >
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{station.stationName}</h2>
              <p className="text-xs text-slate-500">
                Hyderabad Metro Rail ({station.line} Line
                {station.interchangeWith ? ` · Interchange: ${station.interchangeWith.join(', ')}` : ''})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close station details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Operating hours & Frequency */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                OPERATING HOURS
              </span>
              <p className="text-xs font-bold text-slate-800 font-mono">
                {station.operatingHours.firstTrain} – {station.operatingHours.lastTrain}
              </p>
              <span className="text-[10px] text-slate-500">Daily passenger service</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                TRAIN FREQUENCY
              </span>
              <p className="text-xs font-bold text-slate-800 font-mono">
                Every {station.operatingHours.frequencyMinutes} min
              </p>
              <span className="text-[10px] text-slate-500">Peak hour headway</span>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Platform Configuration
            </h4>
            <div className="space-y-1.5">
              {station.platforms.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: station.lineColor }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Facilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Accessibility Facilities
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${station.accessibility.elevator ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={station.accessibility.elevator ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Elevators to Platforms
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${station.accessibility.escalator ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={station.accessibility.escalator ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Bi-directional Escalators
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${station.accessibility.stepFree ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={station.accessibility.stepFree ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Step-free Level Boarding
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${station.accessibility.tactilePaving ? 'text-teal-600' : 'text-slate-300'}`} />
                <span className={station.accessibility.tactilePaving ? 'font-semibold text-slate-900' : 'text-slate-400'}>
                  Tactile Paving Guidance
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
