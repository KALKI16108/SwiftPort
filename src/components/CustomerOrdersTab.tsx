import React from "react";
import { LocationPoint, DeliveryOrder, Driver, ChatMessage } from "../types";
import DriverChat from "./DriverChat";
import MapVisualization from "./MapVisualization";
import { Grid, Compass, Plus, Info, Navigation } from "lucide-react";

interface CustomerOrdersTabProps {
  orders: DeliveryOrder[];
  activeOrders: DeliveryOrder[];
  currentActiveOrder: DeliveryOrder | null;
  setSelectedActiveOrderId: (val: string | null) => void;
  setCancelConfirmOrder: (order: DeliveryOrder) => void;
  handleAddChatMessage: (chat: ChatMessage) => void;
  drivers: Driver[];
  gstinDetails: { gstin: string; businessName: string };
  setActiveTab: (val: string) => void;
}

export default function CustomerOrdersTab({
  orders,
  activeOrders,
  currentActiveOrder,
  setSelectedActiveOrderId,
  setCancelConfirmOrder,
  handleAddChatMessage,
  drivers,
  gstinDetails,
  setActiveTab
}: CustomerOrdersTabProps) {
  return (
    <div id="customer-orders-tab" className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-5.5 rounded-3xl shadow-sm flex justify-between items-center gap-4 flex-wrap text-left">
        <div>
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
            Active Shipments & Statements
          </h2>
          <p className="text-xs text-slate-500">Track current parallel drivers and check previous digital receipt statements.</p>
        </div>
        
        {activeOrders.length === 0 && orders.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("book")}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl transition cursor-pointer border-none shadow flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Shipment Dispatch
          </button>
        )}
      </div>

      {/* If zero total orders overall in database */}
      {orders.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto shadow-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Grid className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-sm">No Orders Found</h3>
            <p className="text-xs text-slate-500">You haven't booked any logistics deliveries yet in this session.</p>
          </div>
          <button
            onClick={() => setActiveTab("book")}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black tracking-wide transition border-none cursor-pointer shadow-md inline-flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Book Your First Courier</span>
          </button>
        </div>
      )}

      {/* MULTI-TRIP DASHBOARD */}
      {activeOrders.length > 0 && (
        <div id="multi-trip-dashboard" className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="font-mono text-[10px] font-bold text-orange-400 uppercase tracking-widest animate-pulse">Multi-Trip Dashboard</span>
            </div>
            <h3 className="text-sm font-black text-white">Live Shipments Selector</h3>
            <p className="text-[10px] text-slate-400">
              You can run up to 5 concurrent active orders. Toggle any tab below to track live GPS route coordinates or chat.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeOrders.map((order, idx) => {
              const isSelected = currentActiveOrder?.id === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedActiveOrderId(order.id)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border-2 cursor-pointer ${
                    isSelected 
                      ? "bg-orange-500 border-orange-600 text-white shadow-md scale-102" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    order.status === 'searching' ? 'bg-yellow-400 animate-pulse' :
                    order.status === 'assigned' ? 'bg-indigo-400' :
                    'bg-emerald-400 animate-pulse'
                  }`} />
                  <span className="font-mono text-[11px]">Trip #{activeOrders.length - idx}</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded bg-black/40 text-slate-200">
                    {order.status === 'searching' ? 'Matching' :
                     order.status === 'assigned' ? 'Accepted' :
                     order.status === 'loaded' ? 'Loaded' :
                     order.status === 'in_transit' ? 'In Transit' :
                     order.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED ACTIVE TRIP MONITOR PANELS */}
      {activeOrders.length > 0 && currentActiveOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active trip specs */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl text-left animate-fadeIn">
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      TRIP STATUS
                    </span>
                    <span className="text-[10px] ml-1.5 text-slate-500 font-medium">
                      Dispatched {currentActiveOrder.createdAt}
                    </span>
                  </div>
                  <h2 className="text-md font-bold text-slate-800 mt-2 font-sans flex items-center gap-1.5">
                    {currentActiveOrder.status === 'searching' ? "Broadcasting dispatch signal..." : "Your Shipment is Active"}
                  </h2>
                </div>

                <button
                  onClick={() => setCancelConfirmOrder(currentActiveOrder)}
                  className="text-xs bg-rose-50 hover:bg-rose-500 hover:text-white transition px-3 py-2 text-rose-650 border border-rose-200 rounded-xl cursor-pointer font-bold duration-150 active:scale-95"
                >
                  Cancel Order
                </button>
              </div>

              {/* Milestones tracker */}
              <div className="grid grid-cols-4 gap-2 relative z-10 select-none">
                <div className="absolute top-3.5 left-10 right-10 h-0.5 bg-slate-200 -z-10"></div>
                
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    currentActiveOrder.status === 'searching' 
                      ? "bg-orange-500 text-white animate-pulse font-extrabold" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] block font-semibold text-slate-500 mt-1">Pending</span>
                </div>

                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    currentActiveOrder.status === 'assigned' 
                      ? "bg-orange-500 text-white font-extrabold shadow-md shadow-orange-200" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] block font-semibold text-slate-500 mt-1">Matched</span>
                </div>

                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    currentActiveOrder.status === 'in_transit' || currentActiveOrder.status === 'loaded' 
                      ? "bg-orange-500 text-white font-extrabold shadow-md shadow-orange-200" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] block font-semibold text-slate-500 mt-1">Transit</span>
                </div>

                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                    currentActiveOrder.status === 'delivered' 
                      ? "bg-orange-400 text-white" 
                      : "bg-slate-200 text-slate-500"
                  }`}>
                    4
                  </div>
                  <span className="text-[10px] block font-semibold text-slate-500 mt-1">Arrived</span>
                </div>
              </div>

              {/* Driver info */}
              {currentActiveOrder.status !== "searching" && currentActiveOrder.driver && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-300 rounded-xl flex items-center justify-center text-white text-md font-black">
                      {currentActiveOrder.driver.name[0]}
                    </div>
                    <div className="text-left font-sans text-xs">
                      <p className="font-extrabold text-slate-800">{currentActiveOrder.driver.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">⭐ {currentActiveOrder.driver.rating || "5.0"} rating &bull; {currentActiveOrder.driver.tripsCount || 12} finished trips</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0">
                    <p className="text-left md:text-right font-mono text-[10px] text-slate-500 leading-normal">
                      Vehicle: <strong className="text-slate-800">{currentActiveOrder.driver.vehicleDetails || currentActiveOrder.vehicle.name}</strong>
                      <br />
                      Plate: <strong className="text-orange-600 font-bold">{currentActiveOrder.driver.vehicleNumber}</strong>
                    </p>
                    <div className="bg-orange-50 text-orange-700 px-3 py-1 bg-gradient-to-b from-orange-50 to-amber-100 rounded-lg text-center shadow-xs border border-orange-200">
                      <span className="text-[8px] font-bold select-none uppercase block text-slate-400 font-mono">OTP CODE</span>
                      <span className="font-mono text-sm font-black tracking-widest">{currentActiveOrder.id.slice(4, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup & Destination nodes view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold mb-1 font-mono">Pickup Hub</span>
                  <span className="font-black text-slate-850 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {currentActiveOrder.pickup.name}
                  </span>
                  <p className="text-[10.5px] mt-1 text-slate-500 pl-3.5 truncate">{currentActiveOrder.pickup.address}</p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3.5 md:pt-0 md:pl-4">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold mb-1 font-mono">Dropoff Hub</span>
                  <span className="font-black text-slate-850 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {currentActiveOrder.dropoff.name}
                  </span>
                  <p className="text-[10.5px] mt-1 text-slate-500 pl-3.5 truncate">{currentActiveOrder.dropoff.address}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-900 text-white px-4.5 py-3 rounded-2xl text-xs font-mono">
                <span>Total Booking Cost Payload:</span>
                <span className="font-black text-orange-450 font-mono text-sm">₹{currentActiveOrder.totalPrice}</span>
              </div>
            </div>

            {/* Chat */}
            <DriverChat 
              activeOrder={currentActiveOrder}
              onAddChatMessage={handleAddChatMessage}
            />
          </div>

          {/* Right hand tracking map */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-550 uppercase tracking-widest pl-1 block font-mono">Live Transit Blueprint</label>
              <MapVisualization activeOrder={currentActiveOrder} driversList={drivers} />
            </div>

            <div className="p-4 bg-orange-50 border border-orange-120 text-orange-850 text-[10.5px] rounded-2xl flex items-start gap-2.5 text-left">
              <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-extrabold text-slate-900">SwiftPort Live Dispatch Matcher</p>
                <p className="text-slate-650 mt-0.5">
                  Our dispatcher leverages Mumbai pathing models and live transit factors. Once accepted by partner networks, their coordinates are updated on your Map.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* HISTORIC RECEIPTS ACCORDION/LIST */}
      {orders.length > 0 && (
        <div className="space-y-4 max-w-4xl mx-auto pt-4 text-left">
          <div className="bg-white border border-slate-200 p-5.5 rounded-3xl shadow-lg">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1 uppercase tracking-wide font-mono">
               Order Activity Ledger
            </h2>
            <p className="text-xs text-slate-500">Historical delivery receipts and statements. Click any receipt to claim tax refunds or download invoices.</p>
          </div>

          <div className="space-y-4 font-sans">
            {orders.map((order, idx) => (
              <div 
                key={`historic-${order.id}-${idx}`}
                className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-orange-300 transition shadow-sm animate-fadeIn"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 pb-3 mb-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-semibold">
                        ID: {order.id.slice(4, 12).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {order.createdAt}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-2 font-sans">
                      Transport: <span className="text-orange-600 font-bold">{order.cargoCategory}</span> via {order.vehicle.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-150" 
                        : order.status === 'cancelled'
                          ? "bg-rose-50 text-rose-600 border border-rose-150"
                          : "bg-orange-50 text-orange-600 border border-orange-150"
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-md font-black text-slate-800 mt-1.5 font-mono">₹{order.totalPrice}</p>
                    {order.status === 'delivered' && (
                      <div className="text-[9.5px] text-slate-500 font-medium space-y-0.5 mt-1">
                        <p>Driver payout: <span className="font-bold text-emerald-600">₹{Math.round(order.totalPrice * 0.8)}</span></p>
                        <p>App Profit: <span className="font-black text-indigo-600">₹{Math.round(order.totalPrice * 0.2)}</span></p>
                        {order.driverRating && (
                          <div className="flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-slate-100">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider font-mono mr-1">Your Rating:</span>
                            <span className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-3 h-3 ${i < (order.driverRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Route detail row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold leading-none mb-1">Pickup</span>
                    <span className="font-semibold text-slate-800">{order.pickup.name}</span>
                    <p className="text-slate-500 text-[10.5px] truncate mt-0.5">{order.pickup.address}</p>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-2.5 md:pt-0 md:pl-4">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold leading-none mb-1">Destination</span>
                    <span className="font-semibold text-orange-600">{order.dropoff.name}</span>
                    <p className="text-slate-500 text-[10.5px] truncate mt-0.5">{order.dropoff.address}</p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex justify-between items-center text-xs text-slate-600 leading-relaxed text-left flex-wrap gap-2">
                  <span>Cargo details: <span className="italic text-slate-800">"{order.cargoDescription}"</span></span>
                  <div className="flex gap-2 items-center">
                    <span className="shrink-0 font-mono text-slate-500 font-semibold bg-slate-50 px-2.5 py-0.5 rounded border border-slate-100">
                      {order.distanceKm} km trip
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`📄 INVOICE FOR BOOKING #${order.id.slice(4, 12).toUpperCase()}\n-----------------------------\nLegal Entity: SwiftPort Intra-City Limited\nDate: ${order.createdAt}\nGSTIN Category: ${gstinDetails.gstin || "N/A - ORGANIC CONSUMER"}\nBusiness name: ${gstinDetails.businessName || "Siddhant Pitale (Individual)"}\n-----------------------------\nBase fare: ₹${order.basePrice}\nDistance cargo weight adjustments: ₹${order.distancePrice}\nLabor help: ₹${order.labourPrice}\nTotal Fare: ₹${order.totalPrice}\nPayment Settle Status: Settled via ${order.paymentMethod === 'online' ? 'Online Credits Wallet (Paid)' : 'Cash'}\n-----------------------------\nThank you for choosing SwiftPort!`);
                      }}
                      className="bg-slate-105 bg-slate-105 hover:bg-slate-200 text-slate-700 bg-slate-100 rounded-[8px] font-bold text-[10.5px] px-3.5 py-1.5 border-none cursor-pointer border border-slate-200"
                    >
                      Invoicing details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
