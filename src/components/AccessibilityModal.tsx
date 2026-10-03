import React, { useState, useEffect } from 'react';
import { X, Accessibility, Check, RotateCcw, Eye, ShieldCheck, Footprints, ArrowDownUp } from 'lucide-react';
import { AccessibilityPreferences } from '../types';
import { DEFAULT_PREFERENCES } from '../services/storageService';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AccessibilityPreferences;
  onApply: (prefs: AccessibilityPreferences) => void;
  onReset: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onApply,
  onReset
}) => {
  const [localPrefs, setLocalPrefs] = useState<AccessibilityPreferences>(preferences);

  useEffect(() => {
    if (isOpen) {
      setLocalPrefs(preferences);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggle = (key: keyof AccessibilityPreferences) => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApply = () => {
    onApply(localPrefs);
    onClose();
  };

  const handleReset = () => {
    setLocalPrefs({ ...DEFAULT_PREFERENCES });
    onReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500 text-slate-950 font-bold">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Accessibility & Mobility Preferences</h2>
              <p className="text-xs text-slate-500">Route planning adapts directly to your physical & sensory requirements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close accessibility dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Mobility */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Mobility & Transit Access</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.stepFree}
                  onChange={() => toggle('stepFree')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Step-free route</span>
                  <span className="text-[11px] text-slate-500">Avoids staircases and curbs; prioritizes level boarding.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.wheelchairAccessible}
                  onChange={() => toggle('wheelchairAccessible')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Wheelchair accessible</span>
                  <span className="text-[11px] text-slate-500">Restricts to low-floor buses, elevators & wide fare gates.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.avoidStairs}
                  onChange={() => toggle('avoidStairs')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Avoid stairs</span>
                  <span className="text-[11px] text-slate-500">Filters routes requiring pedestrian foot-bridge stairs.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.elevatorRequired}
                  onChange={() => toggle('elevatorRequired')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Elevator required</span>
                  <span className="text-[11px] text-slate-500">Requires verified operational elevators at all metro stations.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none sm:col-span-2">
                <input
                  type="checkbox"
                  checked={localPrefs.reduceWalking}
                  onChange={() => toggle('reduceWalking')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Reduce walking distance</span>
                  <span className="text-[11px] text-slate-500">Prioritizes stops within 300m and doorstep transit options.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Vision & Interface */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vision & Sensory</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.largerText}
                  onChange={() => toggle('largerText')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Larger text sizing</span>
                  <span className="text-[11px] text-slate-500">Enhance typography scale for easier readability.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.highContrast}
                  onChange={() => toggle('highContrast')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">High contrast mode</span>
                  <span className="text-[11px] text-slate-500">Enforces sharp 7:1 contrast on all map lines and text.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.simplifiedInstructions}
                  onChange={() => toggle('simplifiedInstructions')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Simplified instructions</span>
                  <span className="text-[11px] text-slate-500">Plain step-by-step guidance without transit jargon.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPrefs.reduceMotion}
                  onChange={() => toggle('reduceMotion')}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Reduce motion</span>
                  <span className="text-[11px] text-slate-500">Disables animations and map camera glides.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
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
              <span>Apply Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
