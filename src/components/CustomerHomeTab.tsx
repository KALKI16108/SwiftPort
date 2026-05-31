import React from "react";
import { LocationPoint, Vehicle, DeliveryOrder } from "../types";
import { VEHICLES } from "../data/mockData";
import BookingForm from "./BookingForm";
import VehicleSelector from "./VehicleSelector";
import MapVisualization from "./MapVisualization";
import { Truck, Bike, Grid, ShieldCheck } from "lucide-react";

interface CustomerHomeTabProps {
  pickup: LocationPoint;
  setPickup: React.Dispatch<React.SetStateAction<LocationPoint>>;
  dropoff: LocationPoint;
  setDropoff: React.Dispatch<React.SetStateAction<LocationPoint>>;
  cargoDescription: string;
  setCargoDescription: (val: string) => void;
  cargoWeight: number;
  setCargoWeight: (val: number) => void;
  selectedVehicleId: string;
  setSelectedVehicleId: (val: string) => void;
  handleApplyAISuggestions: (vehicleId: string, weight: number, crewSuggest: 'none' | 'driver' | 'driver-helper', category: string) => void;
  handleCreateBooking: () => void;
  getCalculatedPrice: () => number;
  bookerPaymentMethod: 'online' | 'cash_pickup' | 'cash_drop';
  setBookerPaymentMethod: (val: 'online' | 'cash_pickup' | 'cash_drop') => void;
  labourType: 'none' | 'driver' | 'driver-helper';
  setLabourType: (val: 'none' | 'driver' | 'driver-helper') => void;
  aiBriefing: string;
  customerSession: any;
  distanceKm: number;
  drivers: any[];
  setIsPaymentModalOpen: (val: boolean) => void;
}

export default function CustomerHomeTab({
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  cargoDescription,
  setCargoDescription,
  cargoWeight,
  setCargoWeight,
  selectedVehicleId,
  setSelectedVehicleId,
  handleApplyAISuggestions,
  handleCreateBooking,
  getCalculatedPrice,
  bookerPaymentMethod,
  setBookerPaymentMethod,
  labourType,
  setLabourType,
  aiBriefing,
  customerSession,
  distanceKm,
  drivers,
  setIsPaymentModalOpen
}: CustomerHomeTabProps) {
  const selectedVehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];

  return (
    <div id="customer-home-tab" className="space-y-6">
      
      {/* Visual fleet categories - SwiftPort Signature Style */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-xl animate-fadeIn text-left">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 font-mono">Quick Fleet Select</span>
          <h3 className="text-sm font-black text-white mt-1">What are you delivering today?</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedVehicleId("3wheeler");
              // set Default Cargo Category associated with heavy vehicles
            }}
            className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
              selectedVehicleId === "3wheeler" || selectedVehicleId === "8ftace" || selectedVehicleId === "pickup"
                ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
            }`}
          >
            <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-[12px] text-white">Trucks</p>
              <p className="text-[9px] text-slate-400 mt-1">Heavy Loads & tempos</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedVehicleId("2wheeler");
            }}
            className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
              selectedVehicleId === "2wheeler"
                ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
            }`}
          >
            <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-[12px] text-white">2 Wheeler</p>
              <p className="text-[9px] text-slate-400 mt-1">Parcels & courier</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedVehicleId("8ftace");
              setLabourType("driver-helper");
            }}
            className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
              selectedVehicleId === "8ftace" && labourType === "driver-helper"
                ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
            }`}
          >
            <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-[12px] text-white">Packers</p>
              <p className="text-[9px] text-slate-400 mt-1">Full shift & helper</p>
            </div>
          </button>
        </div>

        {/* Promotion Banner */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex items-start gap-3">
          <span className="p-1.5 bg-gradient-to-tr from-[#0c3e9e] to-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest leading-none font-mono select-none shadow shrink-0">
            Enterprise Promo
          </span>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-200">Introducing SwiftPort Corporate Saver</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Upgrade your logs! Parallel booking slots (up to 5 active trips) with instant GST-ready corporate tax invoices and ledger management. Get ₹200 added using code <strong className="text-amber-400 font-mono">SWIFT-SIDDHANT99</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand inputs */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl animate-fadeIn text-left">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                 Configure Shipment Courier
              </h2>
              <p className="text-xs text-slate-500">Specify pickup destinations and select commercial utility load trucks.</p>
            </div>

            <BookingForm 
              pickup={pickup}
              onSelectPickup={setPickup}
              dropoff={dropoff}
              onSelectDropoff={setDropoff}
              cargoDescription={cargoDescription}
              onChangeCargoDescription={setCargoDescription}
              cargoWeight={cargoWeight}
              onChangeCargoWeight={setCargoWeight}
              selectedVehicleId={selectedVehicleId}
              onApplyAISuggestions={handleApplyAISuggestions}
              onSubmitBooking={() => {
                if (bookerPaymentMethod === 'online') {
                  setIsPaymentModalOpen(true);
                } else {
                  handleCreateBooking();
                }
              }}
              isSearching={false}
              distanceKm={distanceKm}
              paymentMethod={bookerPaymentMethod}
              onChangePaymentMethod={setBookerPaymentMethod}
            />

            {/* Manual selector cards block */}
            <VehicleSelector 
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              cargoWeight={cargoWeight}
              labourType={labourType}
              onSelectLabour={setLabourType}
              distanceKm={distanceKm}
            />
          </div>
        </div>

        {/* Right Hand preview map */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-550 uppercase tracking-widest pl-1 block text-left font-mono">Quick Route Map Preview</label>
            <MapVisualization 
              activeOrder={{
                id: "preview-order",
                pickup,
                dropoff,
                vehicle: selectedVehicle,
                cargoDescription: "Preview Route",
                cargoCategory: "General Goods",
                weightEstimate: cargoWeight,
                labourType,
                basePrice: selectedVehicle.baseFare,
                distancePrice: Math.round(distanceKm * selectedVehicle.ratePerKm),
                labourPrice: 0,
                totalPrice: getCalculatedPrice(),
                status: "searching",
                distanceKm,
                paymentMethod: bookerPaymentMethod,
                paymentStatus: "pending",
                chats: [],
                createdAt: ""
              }} 
              driversList={drivers} 
            />
          </div>

          {/* Fare Details Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4 text-slate-800 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Freight Receipt Breakdown
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Freight Fee</span>
                <span className="font-mono text-slate-900 font-semibold">₹{selectedVehicle.baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance charge ({distanceKm} km)</span>
                <span className="font-mono text-slate-900 font-semibold">
                  ₹{Math.round(distanceKm * selectedVehicle.ratePerKm)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Labormen help charges</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {labourType === "none" ? "₹0 (Self-load)" : labourType === "driver" ? "₹250" : "₹750"}
                </span>
              </div>

              {customerSession?.couponApplied && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl">
                  <span>Referral Bonus Credit Promo Applied</span>
                  <span>-₹200</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3.5 flex justify-between items-center text-slate-900">
                <span className="font-extrabold text-xs">Total Estimated Fare</span>
                <span className="text-base font-black font-mono text-orange-600">
                  ₹{getCalculatedPrice()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-2xl text-[10px] text-emerald-700 flex items-center gap-2 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>No premium cancellation penalties exist under current simulated trials.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
