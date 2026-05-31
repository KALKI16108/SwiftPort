import React from "react";
import { LogOut, Building, Check, Heart, MapPin, Trash2, Share2 } from "lucide-react";
import { LOCATIONS } from "../data/mockData";

interface CustomerProfileTabProps {
  customerSession: any;
  setCustomerSession: React.Dispatch<React.SetStateAction<any>>;
  setCurrentRole: (val: string | null) => void;
  setActiveTab: (val: string) => void;
  gstinDetails: { gstin: string; businessName: string };
  setGstinDetails: React.Dispatch<React.SetStateAction<{ gstin: string; businessName: string }>>;
  savedAddresses: any[];
  setSavedAddresses: React.Dispatch<React.SetStateAction<any[]>>;
  setPickup: React.Dispatch<React.SetStateAction<any>>;
}

export default function CustomerProfileTab({
  customerSession,
  setCustomerSession,
  setCurrentRole,
  setActiveTab,
  gstinDetails,
  setGstinDetails,
  savedAddresses,
  setSavedAddresses,
  setPickup
}: CustomerProfileTabProps) {
  return (
    <div id="customer-profile-tab" className="space-y-6 max-w-4xl mx-auto text-left animate-fadeIn">
      
      {/* User Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-md flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-300 text-white rounded-full flex items-center justify-center font-black text-lg shadow-sm font-sans select-none border-3 border-orange-50">
            {customerSession?.name ? customerSession.name.split(" ").map((n: string) => n[0]).join("") : "S"}
          </div>
          <div className="text-left">
            <h3 className="font-black text-base text-slate-800 flex items-center gap-1.5 leading-none">
              <span>{customerSession?.name || "Siddhant Pitale"}</span>
              <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-black font-sans uppercase">
                Premium client
              </span>
            </h3>
            <p className="text-xs text-slate-450 mt-1.5">{customerSession?.email || "siddhant@example.com"} &bull; Registered Member</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCustomerSession(null);
            setCurrentRole(null);
            setActiveTab("book");
          }}
          className="px-3.5 py-2 bg-rose-55 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* GST COMPLIANCE SAVER WIDGET */}
      <div className="p-5.5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 text-left">
        <div>
          <span className="text-[10px] text-orange-600 font-black tracking-widest block font-mono uppercase">enterprise settings</span>
          <h3 className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-orange-500" />
            GST Invoicing Details
          </h3>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            Registered commercial corporations can save their GST details. All future invoices will contain these parameters for claiming tax refunds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">GSTIN Number (15 Digits)</label>
            <input
              type="text"
              placeholder="e.g. 27AAPCS1414P1Z4"
              maxLength={15}
              value={gstinDetails.gstin}
              onChange={(e) => setGstinDetails(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:outline-orange-500 rounded-xl font-mono text-xs font-bold text-slate-800"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Legal Corporation Name</label>
            <input
              type="text"
              placeholder="e.g. Pitale Logistics Pvt Ltd"
              value={gstinDetails.businessName}
              onChange={(e) => setGstinDetails(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:outline-orange-500 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        {gstinDetails.gstin && gstinDetails.gstin.length === 15 && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verified Corporate Channel! Invoices settled using online credits will be routed as GST compliant.</span>
          </div>
        )}
      </div>

      {/* SAVED ADDRESSES & DELIVERY HUBS CHECKLIST */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 text-left">
        <div className="flex justify-between items-center gap-4 flex-wrap border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Heart className="w-4.5 h-4.5 text-orange-500 fill-orange-500" />
            Saved Shipment Hubs
          </h3>
          <button
            type="button"
            onClick={() => {
              const label = prompt("Enter a descriptive name for this address (e.g. Kurla Stockroom):");
              if (!label) return;
              const address = prompt("Enter the complete physical address details:");
              if (!address) return;
              setSavedAddresses(prev => [
                ...prev,
                { id: `adr_${Date.now()}`, name: label.trim(), address: address.trim() }
              ]);
            }}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow transition text-center"
          >
            + Add Address Hub
          </button>
        </div>

        <div className="space-y-3">
          {savedAddresses.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 italic text-center">No stored addresses yet. Add one above for quick bookings.</p>
          ) : (
            savedAddresses.map((adr) => (
              <div key={adr.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-start gap-4">
                <div className="text-left space-y-1">
                  <p className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-550" />
                    {adr.name}
                  </p>
                  <p className="text-[10.5px] text-slate-500 leading-normal">{adr.address}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetLoc = LOCATIONS.find(l => adr.address.toLowerCase().includes(l.name.toLowerCase()));
                      if (targetLoc) {
                        setPickup(targetLoc);
                        alert(`Pickup coordinator successfully updated to ${targetLoc.name}! Ready to dispatch in the Home tab.`);
                      } else {
                        alert(`Ready to book for: ${adr.address}`);
                      }
                      setActiveTab("book");
                    }}
                    className="px-3 py-1.5 bg-orange-100 hover:bg-orange-500 hover:text-white transition rounded-lg text-[10px] font-bold text-orange-700 cursor-pointer border-none"
                  >
                    Book Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove "${adr.name}" from your stored hubs?`)) {
                        setSavedAddresses(prev => prev.filter(x => x.id !== adr.id));
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Credentials */}
      <div className="text-center font-mono text-[9px] text-slate-400">
         SwiftPort Intra-city Delivery Network &bull; Version 2026.1.0 &bull; Licensed Sandbox Core Engine
      </div>

    </div>
  );
}
