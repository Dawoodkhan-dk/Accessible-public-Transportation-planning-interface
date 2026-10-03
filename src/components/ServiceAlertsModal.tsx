import React from 'react';
import { X, AlertTriangle, Check, ShieldAlert, Navigation, ArrowRight } from 'lucide-react';
import { ServiceAlert } from '../types';

interface ServiceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ServiceAlert[];
}

export const ServiceAlertsModal: React.FC<ServiceAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Transit Service Alerts</h2>
              <p className="text-xs text-slate-500">Live operational advisories & accessibility impact</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close alerts dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <ShieldAlert className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-800">All transit corridors operating smoothly</p>
              <p className="text-xs text-slate-500 mt-1">No active disruptions or elevator outages on this journey.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    {alert.severity}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>
                    <span className="font-bold text-slate-900">What: </span>
                    {alert.what}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">Where: </span>
                    {alert.where} ({alert.locationName})
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">When: </span>
                    {alert.when}
                  </p>
                  <p>
                    <span className="font-bold text-slate-900">Who is affected: </span>
                    {alert.whoIsAffected}
                  </p>
                </div>

                {/* Calming, clear alternative */}
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recommended Alternative: </span>
                    {alert.alternative}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Understood</span>
          </button>
        </div>
      </div>
    </div>
  );
};
