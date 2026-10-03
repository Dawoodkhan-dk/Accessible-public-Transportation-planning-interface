import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Locate, Bus, Train, Building, Layers } from 'lucide-react';
import { LocationItem, LocationType } from '../types';
import { GeocodingService } from '../services/geocodingService';
import { SearchFilterType } from '../types/transitDatabase';

interface LocationSearchProps {
  label: string;
  placeholder: string;
  value: LocationItem | null;
  onChange: (location: LocationItem | null) => void;
  onUseCurrentLocation?: () => void;
  isCurrentLocationLoading?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onUseCurrentLocation,
  isCurrentLocationLoading,
  error,
  autoFocus
}) => {
  const [query, setQuery] = useState(value ? value.name : '');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<SearchFilterType>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal text state with incoming value
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    } else {
      setQuery('');
    }
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search using Unified Transit Database
  useEffect(() => {
    if (!query.trim() || (value && query === value.name)) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const items = await GeocodingService.searchLocations(query, filterType);
        setResults(items);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, value, filterType]);

  const handleSelect = (item: LocationItem) => {
    setQuery(item.name);
    onChange(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setResults([]);
    setIsOpen(false);
  };

  const getTypeIcon = (type: LocationType) => {
    switch (type) {
      case 'bus_stop':
        return <Bus className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'metro_station':
        return <Train className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'landmark':
        return <Building className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const getTypeBadge = (type: LocationType) => {
    switch (type) {
      case 'bus_stop':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Bus className="w-3 h-3 text-blue-600" />
            Bus Stop
          </span>
        );
      case 'metro_station':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Train className="w-3 h-3 text-purple-600" />
            Metro Station
          </span>
        );
      case 'landmark':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Building className="w-3 h-3 text-amber-600" />
            Landmark
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            Address
          </span>
        );
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold tracking-wider uppercase text-slate-700 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${label === 'FROM' ? 'bg-teal-500' : 'bg-rose-500'}`} />
          {label}
        </label>
        {onUseCurrentLocation && !value && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isCurrentLocationLoading}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Detect starting point using device GPS"
          >
            <Locate className={`w-3.5 h-3.5 ${isCurrentLocationLoading ? 'animate-spin' : ''}`} />
            <span>{isCurrentLocationLoading ? 'Detecting...' : 'Use current location'}</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (value && e.target.value !== value.name) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-10 pr-10 py-3 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear location"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {/* Quick Filter Switcher */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Transit
            </button>
            <button
              type="button"
              onClick={() => setFilterType('bus_stop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'bus_stop'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Bus className="w-3 h-3" />
              Bus Stops
            </button>
            <button
              type="button"
              onClick={() => setFilterType('metro_station')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'metro_station'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Train className="w-3 h-3" />
              Metro Stations
            </button>
          </div>

          {isLoading && (
            <div className="p-4 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              Scanning TGSRTC & Hyderabad Metro database...
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim().length > 0 && (
            <div className="p-5 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">No transport stop or station found for "{query}".</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching a nearby junction (e.g. Mehdipatnam, Ameerpet, Koti, Secunderabad, Miyapur, Charminar).
              </p>
            </div>
          )}

          {!isLoading &&
            results.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-3 hover:bg-teal-50/70 border-b border-slate-100 last:border-b-0 flex items-start justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 mt-0.5 shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.address}</p>
                    {item.landmark && (
                      <p className="text-[10px] text-teal-700 font-medium truncate mt-0.5">
                        {item.landmark}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 pt-0.5">{getTypeBadge(item.type)}</div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
