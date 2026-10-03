import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Check, ArrowRight } from 'lucide-react';
import { TimePlanningConfig, TimeMode } from '../types';

interface TimeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimePlanningConfig;
  onApply: (newConfig: TimePlanningConfig) => void;
}

export const TimeSelectorModal: React.FC<TimeSelectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onApply
}) => {
  const [mode, setMode] = useState<TimeMode>(config.mode);
  const [targetDate, setTargetDate] = useState<string>(config.targetDate);
  const [targetTime, setTargetTime] = useState<string>(config.targetTime);

  useEffect(() => {
    if (isOpen) {
      setMode(config.mode);
      setTargetDate(config.targetDate);
      setTargetTime(config.targetTime);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      mode,
      targetDate,
      targetTime
    });
    onClose();
  };

  const handleResetToNow = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    setMode('now');
    setTargetTime(timeStr);
    setTargetDate(dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Departure & Arrival Planning</h2>
              <p className="text-xs text-slate-500">Calculate schedules, waiting buffers & traffic impact</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('now')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'now'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leave now
            </button>
            <button
              type="button"
              onClick={() => setMode('depart_at')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'depart_at'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Depart at
            </button>
            <button
              type="button"
              onClick={() => setMode('arrive_by')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'arrive_by'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arrive by
            </button>
          </div>

          {/* Description for Arrive By */}
          {mode === 'arrive_by' && (
            <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-xs text-teal-900">
              <span className="font-semibold block mb-0.5">Deadline Arrival Intelligence:</span>
              WAYFIND will reverse-calculate your exact <span className="font-bold">Leave By</span> departure time, factoring in walking distance, timetable frequencies, transfer windows, and road traffic buffers.
            </div>
          )}

          {/* Time & Date pickers */}
          {mode !== 'now' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={targetTime}
                    onChange={e => setTargetTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Travel Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'now' && (
            <div className="py-4 text-center">
              <p className="text-sm font-semibold text-slate-800">
                Planning for immediate departure
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Using current local time with live service schedules and active traffic delays.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToNow}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Reset to Now
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Time</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
