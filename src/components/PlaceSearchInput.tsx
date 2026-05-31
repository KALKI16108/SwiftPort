import React, { useState, useEffect, useRef } from "react";
import { LocationPoint } from "../types";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Search, MapPin, Loader2 } from "lucide-react";
import { LOCATIONS } from "../data/mockData";

interface PlaceSearchInputProps {
  label: string;
  value: LocationPoint;
  onChange: (loc: LocationPoint) => void;
  placeholder: string;
  excludeLocationId?: string;
  icon?: string;
}

export default function PlaceSearchInput({
  label,
  value,
  onChange,
  placeholder,
  excludeLocationId
}: PlaceSearchInputProps) {
  const [query, setQuery] = useState(value.name);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const placesLib = useMapsLibrary("places");
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoderService, setGeocoderService] = useState<google.maps.Geocoder | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if value changes externally (such as Swap button trigger)
  useEffect(() => {
    setQuery(value.name);
  }, [value]);

  // Hook up Autocomplete and Geocoder standard services once Places library is ready
  useEffect(() => {
    if (!placesLib) return;
    try {
      setAutocompleteService(new google.maps.places.AutocompleteService());
      setGeocoderService(new google.maps.Geocoder());
    } catch (err) {
      console.error("Failed to initialize Google Maps search services:", err);
    }
  }, [placesLib]);

  // Retrieve input autocomplete predictions with debounce
  useEffect(() => {
    if (!query || query === value.name) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // 1. Initial filter over Mumbai presets
      const presetsFiltered = LOCATIONS.filter(loc => 
        loc.id !== excludeLocationId &&
        (loc.name.toLowerCase().includes(query.toLowerCase()) || 
         loc.address.toLowerCase().includes(query.toLowerCase()))
      ).map(loc => ({
        id: loc.id,
        isPreset: true,
        displayName: loc.name,
        formattedAddress: loc.address,
        lat: loc.lat,
        lng: loc.lng
      }));

      // 2. Query Google Places Autocomplete if available
      if (autocompleteService) {
        setIsLoading(true);
        autocompleteService.getPlacePredictions(
          {
            input: query,
            // Bias suggestions towards Mumbai region for relevance
            locationBias: new google.maps.LatLngBounds(
              { lat: 18.90, lng: 72.75 }, 
              { lat: 19.30, lng: 73.10 }
            )
          },
          (predictions, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const googleSuggestions = predictions.map(p => ({
                id: p.place_id,
                isPreset: false,
                displayName: p.structured_formatting.main_text,
                formattedAddress: p.description,
                placeId: p.place_id
              }));
              setSuggestions([...presetsFiltered, ...googleSuggestions]);
            } else {
              setSuggestions(presetsFiltered);
            }
          }
        );
      } else {
        setSuggestions(presetsFiltered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, autocompleteService, excludeLocationId, value.name]);

  // Handle outside click to collapse results list
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSuggestionSelect = async (sug: any) => {
    setIsOpen(false);
    if (sug.isPreset) {
      onChange({
        id: sug.id,
        name: sug.displayName,
        address: sug.formattedAddress,
        lat: sug.lat,
        lng: sug.lng
      });
      setQuery(sug.displayName);
    } else {
      setIsLoading(true);
      if (geocoderService) {
        geocoderService.geocode({ placeId: sug.placeId }, (results, status) => {
          setIsLoading(false);
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const loc = results[0].geometry.location;
            const fullLoc: LocationPoint = {
              id: "custom_" + sug.placeId,
              name: sug.displayName,
              address: results[0].formatted_address,
              lat: loc.lat(),
              lng: loc.lng()
            };
            onChange(fullLoc);
            setQuery(sug.displayName);
          }
        });
      }
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 space-y-1">
      <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            if (!query || query === value.name) {
              const presetsFiltered = LOCATIONS.filter(l => l.id !== excludeLocationId).map(l => ({
                id: l.id,
                isPreset: true,
                displayName: l.name,
                formattedAddress: l.address,
                lat: l.lat,
                lng: l.lng
              }));
              setSuggestions(presetsFiltered);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border-2 border-slate-100 rounded-xl pl-9 pr-8 p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((sug, idx) => (
            <button
              key={`${sug.id}-${idx}`}
              type="button"
              onClick={() => handleSuggestionSelect(sug)}
              className="w-full text-left p-3 hover:bg-orange-50/50 transition-colors flex items-start gap-2.5 text-xs text-left cursor-pointer"
            >
              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${sug.isPreset ? "text-orange-500" : "text-sky-500"}`} />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  {sug.displayName}
                  {sug.isPreset && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 uppercase font-black">
                      Preset
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {sug.formattedAddress}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
