import React from 'react';
import { RouteSortFilter } from '../types';
import { Zap, Shuffle, PiggyBank, Footprints, ShieldCheck, Layers } from 'lucide-react';

interface RouteFiltersProps {
  activeFilter: RouteSortFilter;
  onFilterChange: (filter: RouteSortFilter) => void;
  counts: {
    total: number;
    fastest: number;
    fewestTransfers: number;
    lowestFare: number;
    leastWalking: number;
    accessible: number;
  };
}

export const RouteFilters: React.FC<RouteFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  const tabs: { id: RouteSortFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Options', icon: <Layers className="w-3.5 h-3.5" />, count: counts.total },
    { id: 'fastest', label: 'Fastest', icon: <Zap className="w-3.5 h-3.5" />, count: counts.fastest },
    { id: 'fewest_transfers', label: 'Fewest Transfers', icon: <Shuffle className="w-3.5 h-3.5" />, count: counts.fewestTransfers },
    { id: 'lowest_fare', label: 'Lowest Fare', icon: <PiggyBank className="w-3.5 h-3.5" />, count: counts.lowestFare },
    { id: 'least_walking', label: 'Least Walking', icon: <Footprints className="w-3.5 h-3.5" />, count: counts.leastWalking },
    { id: 'accessible', label: 'Step-Free', icon: <ShieldCheck className="w-3.5 h-3.5" />, count: counts.accessible }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onFilterChange(tab.id)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer border ${
            activeFilter === tab.id
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeFilter === tab.id ? 'bg-slate-700 text-teal-300' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};
