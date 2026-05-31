import React, { useState } from "react";
import { LocationPoint, Vehicle } from "../types";
import { VEHICLES } from "../data/mockData";
import PlaceSearchInput from "./PlaceSearchInput";
import { 
  ArrowUpDown, 
  Route, 
  Loader2,
  Coins,
  CreditCard,
  Sparkles,
  FileText,
  Box,
  Armchair,
  HardHat,
  Bot,
  Zap,
  CheckCircle,
  ShieldAlert
} from "lucide-react";

interface BookingFormProps {
  pickup: LocationPoint;
  onSelectPickup: (loc: LocationPoint) => void;
  dropoff: LocationPoint;
  onSelectDropoff: (loc: LocationPoint) => void;
  cargoDescription: string;
  onChangeCargoDescription: (desc: string) => void;
  cargoWeight: number;
  onChangeCargoWeight: (weight: number) => void;
  selectedVehicleId: string;
  onApplyAISuggestions: (vehicleId: string, weight: number, crewSuggest: 'none' | 'driver' | 'driver-helper', category: string) => void;
  onSubmitBooking: () => void;
  isSearching: boolean;
  distanceKm: number;
  paymentMethod: 'cash_pickup' | 'cash_drop' | 'online';
  onChangePaymentMethod: (method: 'cash_pickup' | 'cash_drop' | 'online') => void;
}

export default function BookingForm({
  pickup,
  onSelectPickup,
  dropoff,
  onSelectDropoff,
  cargoDescription,
  onChangeCargoDescription,
  cargoWeight,
  onChangeCargoWeight,
  selectedVehicleId,
  onApplyAISuggestions,
  onSubmitBooking,
  isSearching,
  distanceKm,
  paymentMethod,
  onChangePaymentMethod
}: BookingFormProps) {
  // AI Co-Pilot States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState("");

  const handleSwapAddresses = () => {
    const originalPickup = pickup;
    onSelectPickup(dropoff);
    onSelectDropoff(originalPickup);
  };

  // Call Server-side Google Gemini 3.5-flash Cargo Analyzer
  const handleAICoPilotAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAIAnalyzing(true);
    setAiError("");
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/analyze-cargo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargoDescription: aiPrompt })
      });

      if (!res.ok) {
        throw new Error(`Server returned error badge ${res.status}`);
      }

      const data = await res.json();
      if (data && data.success) {
        setAiResult(data);
      } else {
        throw new Error(data?.error || "Invalid AI Response format");
      }
    } catch (err: any) {
      console.error("AI Cargo Dispatch analysis error:", err);
      setAiError("Unable to reach Gemini Analyzer. Heuristics fallback offline.");
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Apply analyzed configuration instantly
  const handleApplyAIRecommended = () => {
    if (!aiResult) return;
    
    // Normalize helper string back to our types
    const recHelper = aiResult.helperRecommendation?.toLowerCase() || "";
    let finalHelper: 'none' | 'driver' | 'driver-helper' = 'none';
    if (recHelper.includes("driver + 1") || recHelper.includes("driver + 2") || recHelper.includes("helper") || recHelper.includes("loader")) {
      finalHelper = 'driver-helper';
    } else if (recHelper.includes("driver only") || recHelper.includes("driver loading") || recHelper.includes("assist")) {
      finalHelper = 'driver';
    }

    // Direct Apply
    onChangeCargoDescription(aiPrompt);
    onChangeCargoWeight(aiResult.weightEstimate || 50);
    onApplyAISuggestions(
      aiResult.suggestedVehicleId || "8ftace",
      aiResult.weightEstimate || 50,
      finalHelper,
      aiResult.category || "General Goods"
    );

    // Reset indicator
    setAiResult((prev: any) => ({ ...prev, applied: true }));
  };

  return (
    <div id="booking-form" className="space-y-6">
      
      {/* 2. ROUTE COORDINATES INPUT CARD */}
      <div className="bg-slate-50 p-4 sm:p-5 border border-slate-100 rounded-[24px] space-y-4">
        <div className="flex justify-between items-center px-0.5">
          <h3 className="text-xs font-bold text-slate-705 uppercase tracking-wider flex items-center gap-1.5">
            <Route className="w-4 h-4 text-orange-500 shrink-0" />
            Specify Route Coordinates
          </h3>
          {distanceKm > 0 && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-100/60 px-2.5 py-0.5 rounded-full font-mono animate-pulse">
              📍 Trip Total: {distanceKm} km
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 relative">
          {/* Pickup Input Column */}
          <div className="flex-1 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-emerald-500 rounded-r-md pointer-events-none" />
            <PlaceSearchInput
              label="Point of Pickup Address"
              value={pickup}
              onChange={onSelectPickup}
              placeholder="Search Mumbai route nodes..."
              excludeLocationId={dropoff.id}
            />
          </div>

          {/* Swap Trigger Button */}
          <button
            type="button"
            onClick={handleSwapAddresses}
            className="md:self-end self-center bg-slate-105 hover:bg-orange-500 text-slate-655 hover:text-white cursor-pointer px-3 py-2.5 rounded-xl text-xs flex items-center justify-center transition border border-slate-200 hover:border-orange-600 shadow-sm md:-mb-0.5 h-10.5 active:scale-95 duration-100 shrink-0"
            title="Swap Addresses"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Dropoff Input Column */}
          <div className="flex-1 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-rose-500 rounded-r-md pointer-events-none" />
            <PlaceSearchInput
              label="Point of Destination Address"
              value={dropoff}
              onChange={onSelectDropoff}
              placeholder="Search destination venue complex..."
              excludeLocationId={pickup.id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-500 border-t border-slate-100 pt-3 pl-1 leading-snug">
          <div>
            <span className="font-extrabold text-emerald-600 block sm:inline">P/u Address:</span> {pickup.address}
          </div>
          <div className="border-t sm:border-t-0 border-slate-100/50 pt-1.5 sm:pt-0">
            <span className="font-extrabold text-rose-600 block sm:inline">Drop Address:</span> {dropoff.address}
          </div>
        </div>
      </div>

      {/* 4. CORE CARGO STATS MANUAL OVERRIDES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase block mb-1.5 pl-1">
            Direct Weight Override (kg)
          </label>
          <div className="flex items-center gap-3 bg-white border-2 border-slate-100 p-3 rounded-xl shadow-sm">
            <input
              type="range"
              min="1"
              max="1500"
              value={cargoWeight}
              onChange={(e) => onChangeCargoWeight(Number(e.target.value))}
              className="flex-1 accent-orange-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <span className="text-xs font-black text-slate-800 font-mono w-16 text-right">
              {cargoWeight} kg
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 uppercase block mb-1.5 pl-1">
            Commodity Class
          </label>
          <input
            type="text"
            value={cargoDescription}
            onChange={(e) => onChangeCargoDescription(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition shadow-sm"
            placeholder="E.g., Cartons or shifting stock"
          />
        </div>
      </div>

      {/* 5. PAYMENT METHODS SELECTOR PANEL */}
      <div className="bg-slate-50 p-4.5 border border-slate-100 rounded-[24px] space-y-3 shadow-inner">
        <div className="flex justify-between items-center pr-1 flex-wrap gap-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block pl-0.5">
            Choose Delivery Payment Method
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Commission: 20% platform cut</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Cash At Pickup */}
          <button
            type="button"
            onClick={() => onChangePaymentMethod('cash_pickup')}
            className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-left cursor-pointer transition ${
              paymentMethod === 'cash_pickup'
                ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg flex items-center justify-center ${
                paymentMethod === 'cash_pickup' ? 'bg-orange-50 text-orange-500 animate-pulse' : 'bg-slate-100 text-slate-500'
              }`}>
                <Coins className="w-4 h-4" />
              </span>
              <span className="text-xs font-black text-slate-800">Cash at Pickup</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed font-sans">
              Driver collects full cash fare at loading. Commission deducts from partner wallet on safe delivery.
            </p>
          </button>

          {/* Cash At Dropoff */}
          <button
            type="button"
            onClick={() => onChangePaymentMethod('cash_drop')}
            className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-left cursor-pointer transition ${
              paymentMethod === 'cash_drop'
                ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg flex items-center justify-center ${
                paymentMethod === 'cash_drop' ? 'bg-orange-50 text-emerald-650 animate-pulse font-bold' : 'bg-slate-100 text-slate-500'
              }`}>
                <Coins className="w-4 h-4 text-emerald-600" />
              </span>
              <span className="text-xs font-black text-slate-805 text-slate-800">Cash at Drop-off</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed font-sans">
              Rider collects cash from receiver at destination venue. Commission deducts on completion.
            </p>
          </button>

          {/* Online Payment */}
          <button
            type="button"
            onClick={() => onChangePaymentMethod('online')}
            className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-left cursor-pointer transition ${
              paymentMethod === 'online'
                ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg flex items-center justify-center ${
                paymentMethod === 'online' ? 'bg-orange-50 text-orange-500 animate-pulse' : 'bg-slate-100 text-slate-500'
              }`}>
                <CreditCard className="w-4 h-4 text-orange-500" />
              </span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                Online Prepaid
                <span className="bg-orange-500 text-white font-extrabold text-[8px] px-1.5 py-0.2 rounded leading-none uppercase scale-90">
                  Prepaid
                </span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed font-sans">
              Instant secure UPI gateway escrow verification. Net rider pay gets credited instantly on delivery.
            </p>
          </button>
        </div>
      </div>

      {/* 6. DISPATCH ACTION BOX */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmitBooking}
          disabled={isSearching || !distanceKm}
          className="w-full py-4.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-orange-100 hover:shadow-orange-200 transform transition-transform active:scale-[0.98] text-xs sm:text-sm tracking-widest uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-orange-950/20"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Broadcasting Dispatch To Nearby Partners...
            </>
          ) : (
            <>
              Book Ride & Dispatch Partner (Est. ₹
              {Math.round(
                (VEHICLES.find(v => v.id === selectedVehicleId)?.baseFare || 200) + 
                (distanceKm * (VEHICLES.find(v => v.id === selectedVehicleId)?.ratePerKm || 12))
              )}
              )
            </>
          )}
        </button>
      </div>
    </div>
  );
}
