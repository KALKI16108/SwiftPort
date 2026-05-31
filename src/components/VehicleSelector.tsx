import React from "react";
import { Vehicle } from "../types";
import { VEHICLES } from "../data/mockData";
import { Bike, Truck, Bus, Grid, CheckCircle2, User, Users, ShieldCheck, Zap, Info } from "lucide-react";

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  cargoWeight: number;
  labourType: 'none' | 'driver' | 'driver-helper';
  onSelectLabour: (type: 'none' | 'driver' | 'driver-helper') => void;
  distanceKm: number;
}

export default function VehicleSelector({
  selectedVehicleId,
  onSelectVehicle,
  cargoWeight,
  labourType,
  onSelectLabour,
  distanceKm
}: VehicleSelectorProps) {

  // Dynamic Lucide helper
  const renderVehicleIcon = (icon: string) => {
    switch (icon) {
      case "Bike":
        return <Bike className="w-5 h-5 text-orange-500" />;
      case "Truck":
        return <Truck className="w-5 h-5 text-orange-500" />;
      case "Bus":
        return <Bus className="w-5 h-5 text-orange-500" />;
      case "Grid":
        return <Grid className="w-5 h-5 text-orange-500" />;
      default:
        return <Truck className="w-5 h-5 text-orange-500" />;
    }
  };

  // Get current proximity/status text for aesthetic highlight
  const getProximityText = (id: string) => {
    switch (id) {
      case "2wheeler":
        return "⚡ Ultra Fast • 2 mins away";
      case "3wheeler":
        return "🔥 High Efficiency • 4 mins away";
      case "8ftace":
        return "📦 Most Popular • 6 mins away";
      case "pickup":
        return "💪 Industrial Bulky • 9 mins away";
      default:
        return "● Connected";
    }
  };

  // Get badges to match Photo Aesthetics
  const getTagBadge = (id: string) => {
    switch (id) {
      case "2wheeler":
        return { text: "Express", bg: "bg-orange-100 text-orange-700 border-orange-250" };
      case "3wheeler":
        return { text: "Value Shifter", bg: "bg-emerald-100 text-emerald-700 border-emerald-250" };
      case "8ftace":
        return { text: "Bulky Pro", bg: "bg-purple-100 text-purple-700 border-purple-255" };
      case "pickup":
        return { text: "Heavy Fleet", bg: "bg-blue-100 text-blue-700 border-blue-250" };
      default:
        return { text: "Commercial", bg: "bg-slate-100 text-slate-700 border-slate-205" };
    }
  };

  const calculateCost = (vehicle: Vehicle) => {
    const travelFare = vehicle.baseFare + (distanceKm * vehicle.ratePerKm);
    let labourCost = 0;
    if (labourType === 'driver') labourCost = 250;
    if (labourType === 'driver-helper') labourCost = 750;
    return Math.round(travelFare + labourCost);
  };

  return (
    <div id="vehicle-selector" className="space-y-6">
      
      {/* VEHICLE COMPARISON GRID */}
      <div>
        <div className="flex items-center justify-between mb-1.5 pl-1 flex-wrap gap-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest block">
            Select Commercial Utility Fleet
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Mumbai Regional Rates Applied</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-4 pl-1 leading-normal font-sans">
          Compare physical cargo specifications. Real-time proximity coordinates simulate actual nearby matches.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VEHICLES.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            const isOverweight = cargoWeight > v.maxWeight;
            const approxTotal = calculateCost(v);
            const badge = getTagBadge(v.id);

            // Calculate weight burden utilization percentage
            const utilizationPercent = Math.min(100, Math.round((cargoWeight / v.maxWeight) * 100));

            return (
              <button
                key={v.id}
                id={`vehicle-card-${v.id}`}
                type="button"
                onClick={() => !isOverweight && onSelectVehicle(v.id)}
                disabled={isOverweight}
                className={`text-left p-4.5 rounded-[22px] border-2 transition-all duration-200 relative flex flex-col justify-between cursor-pointer group scale-inherit ${
                  isSelected 
                    ? "bg-orange-50/50 border-orange-500 shadow-lg shadow-orange-100/50" 
                    : isOverweight
                      ? "bg-slate-105 opacity-40 border-slate-100 cursor-not-allowed select-none"
                      : "bg-white border-slate-100 hover:border-orange-300 hover:bg-slate-55/40 hover:bg-slate-50/55"
                }`}
              >
                {/* Selector Status Check Badge */}
                {isSelected && (
                  <span className="absolute top-4 right-4 text-orange-500">
                    <CheckCircle2 className="w-5 h-5 fill-white animate-scaleIn" />
                  </span>
                )}

                <div className="w-full">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`p-2.5 rounded-xl transition ${isSelected ? 'bg-orange-100 text-orange-600' : 'bg-slate-150 bg-slate-100 text-slate-500'}`}>
                      {renderVehicleIcon(v.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-slate-800 text-sm tracking-tight leading-none">{v.name}</h4>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded-md font-extrabold uppercase border leading-none font-sans ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 mt-1 block font-semibold leading-none">{getProximityText(v.id)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[42px] mb-3 font-sans">
                    {v.description}
                  </p>
                </div>

                {/* CAPACITY LEVEL UTILS */}
                {!isOverweight && (
                  <div className="w-full space-y-1 mt-1 mb-3 bg-slate-100/50 p-2 rounded-xl text-[9px] text-slate-500">
                    <div className="flex justify-between font-mono font-medium leading-none">
                      <span>Payload Burden:</span>
                      <span className={`${utilizationPercent >= 85 ? 'text-orange-600 font-bold' : 'text-slate-600'}`}>{cargoWeight}kg / {v.maxWeight}kg ({utilizationPercent}%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${utilizationPercent >= 85 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${utilizationPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* RECEIPT METADATA AND COST LIMITS */}
                <div className="border-t border-slate-100 pt-3.5 mt-1 flex justify-between items-center text-xs w-full">
                  <div className="text-slate-450 text-[10.5px] leading-tight font-sans">
                    <p>Flatbed Dim: <span className="font-mono text-slate-700 font-bold">{v.dims}</span></p>
                    <p>Weight Max: <span className="text-slate-700 font-bold">Max {v.capacity}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium font-mono leading-none">Sim Fare</p>
                    <p className="text-base font-black text-slate-800 tracking-tight leading-normal">
                      ₹{approxTotal}
                    </p>
                  </div>
                </div>

                {isOverweight && (
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-100/95 rounded-2xl flex items-center justify-center p-3 select-none z-10 transition animate-fadeIn">
                    <div className="text-center flex flex-col items-center gap-1.5">
                      <ShieldCheck className="w-6 h-6 text-indigo-400" />
                      <span className="text-xs text-slate-500 font-black tracking-tight mt-1">Exceeds Carrying Capacity Limit</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">Cargo ({cargoWeight}kg) &gt; Limit ({v.maxWeight}kg)</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOADING ASSISTANT / HELPER CREWS SELECTOR */}
      <div className="border-t border-slate-150 border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-1.5 pl-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Loading Assistant & Crew Helpers
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Commission: 0% extra cut</span>
        </div>
        <p className="text-[11px] text-slate-500 mb-4 pl-1 leading-normal font-sans">
          Specify physical labor requirements. Helper rates are paid directly as part of the total gross driver payout earnings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option: None */}
          <button
            type="button"
            onClick={() => onSelectLabour('none')}
            className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between items-center h-28 ${
              labourType === 'none'
                ? "bg-orange-50 border-orange-500 shadow ring-1 ring-orange-500 text-orange-700 font-bold"
                : "bg-white border-slate-100 text-slate-500 hover:border-orange-300 hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${labourType === 'none' ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <span className="text-xs block font-bold text-slate-800 leading-none">No Helpers</span>
              <span className="text-[10px] block font-mono text-slate-400 mt-1.5">₹0 (Self-load)</span>
            </div>
          </button>

          {/* Option: Driver Helper */}
          <button
            type="button"
            onClick={() => onSelectLabour('driver')}
            disabled={selectedVehicleId === "2wheeler"}
            className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col justify-between items-center h-28 ${
              selectedVehicleId === "2wheeler"
                ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-50 text-slate-300"
                : labourType === 'driver'
                  ? "bg-orange-50 border-orange-500 shadow ring-1 ring-orange-500 text-orange-700 font-bold cursor-pointer"
                  : "bg-white border-slate-100 text-slate-500 hover:border-orange-300 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <User className={`w-5 h-5 ${labourType === 'driver' ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <span className="text-xs block font-bold text-slate-850 text-slate-800 leading-none">Driver aid</span>
              <span className="text-[10px] block font-mono font-bold text-orange-550 text-orange-600 mt-1.5">+₹250</span>
            </div>
          </button>

          {/* Option: Driver + Loader Crew */}
          <button
            type="button"
            onClick={() => onSelectLabour('driver-helper')}
            disabled={selectedVehicleId === "2wheeler" || selectedVehicleId === "3wheeler"}
            className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col justify-between items-center h-28 ${
              selectedVehicleId === "2wheeler" || selectedVehicleId === "3wheeler"
                ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-50 text-slate-300"
                : labourType === 'driver-helper'
                  ? "bg-orange-50 border-orange-500 shadow ring-1 ring-orange-500 text-orange-700 font-bold cursor-pointer"
                  : "bg-white border-slate-100 text-slate-500 hover:border-orange-300 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            <Users className={`w-5 h-5 ${labourType === 'driver-helper' ? 'text-orange-500' : 'text-slate-400'}`} />
            <div>
              <span className="text-xs block font-bold text-slate-850 text-slate-800 leading-none">Driver + helper</span>
              <span className="text-[10px] block font-mono font-bold text-orange-550 text-orange-600 mt-1.5">+₹750</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
