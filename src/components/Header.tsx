import React from 'react';
import { Compass, Accessibility, AlertTriangle, CheckSquare, Database, Navigation } from 'lucide-react';

interface HeaderProps {
  onOpenAccessibility: () => void;
  onOpenAlerts: () => void;
  onOpenUsabilityTest: () => void;
  onOpenDatabaseQuality: () => void;
  alertsCount: number;
  accessibilityActive: boolean;
  onResetSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAccessibility,
  onOpenAlerts,
  onOpenUsabilityTest,
  onOpenDatabaseQuality,
  alertsCount,
  accessibilityActive,
  onResetSearch
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetSearch}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg p-1 cursor-pointer"
            title="Return to search screen"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 group-hover:bg-teal-500/30 transition-colors">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                WAYFIND
                <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                  Transit
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={onResetSearch}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-teal-400" />
            Plan Journey
          </button>
          <button
            type="button"
            onClick={onOpenDatabaseQuality}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-400" />
            Transit Database
          </button>
          <button
            type="button"
            onClick={onOpenAccessibility}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Accessibility className="w-4 h-4 text-teal-400" />
            Step-Free & Access
          </button>
          <button
            type="button"
            onClick={onOpenAlerts}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Service Alerts
            {alertsCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {alertsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDatabaseQuality}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-800 text-teal-300 border-slate-700 hover:bg-slate-750 hover:text-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Inspect comprehensive TGSRTC & Metro database quality audit"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Database Audit</span>
          </button>

          <button
            type="button"
            onClick={onOpenAccessibility}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              accessibilityActive
                ? 'bg-teal-500 text-slate-950 border-teal-400 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
            title="Configure mobility and vision accessibility preferences"
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Accessibility</span>
            {accessibilityActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
          </button>

          <button
            type="button"
            onClick={onOpenUsabilityTest}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open Usability Testing Scenarios"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Usability Suite</span>
          </button>
        </div>
      </div>
    </header>
  );
};
