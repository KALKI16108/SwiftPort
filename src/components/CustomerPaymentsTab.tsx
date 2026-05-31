import React from "react";
import { PlusCircle } from "lucide-react";

interface CustomerPaymentsTabProps {
  customerSession: any;
  topupValue: number;
  setTopupValue: (val: number) => void;
  setIsTopupModalOpen: (val: boolean) => void;
  walletTransactions: any[];
}

export default function CustomerPaymentsTab({
  customerSession,
  topupValue,
  setTopupValue,
  setIsTopupModalOpen,
  walletTransactions
}: CustomerPaymentsTabProps) {
  return (
    <div id="customer-payments-tab" className="space-y-6 max-w-4xl mx-auto text-left animate-fadeIn">
      
      {/* Balance passbook card */}
      <div className="bg-gradient-to-tr from-slate-900 via-[#0c3e9e] to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-52 border border-slate-800">
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/5 rounded-full translate-x-10 translate-y-10 border border-white/5 pointer-events-none"></div>
        <div className="absolute right-12 bottom-12 w-28 h-28 bg-white/5 rounded-full border border-white/10 pointer-events-none"></div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-300 font-mono">SWIFTPORT COURIER CREDITS</span>
            <h3 className="text-md font-bold mt-1 text-white">Virtual Secure Wallet</h3>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase tracking-wider text-slate-200 font-mono">
            🛡️ Sandbox Active
          </div>
        </div>

        <div>
          <p className="text-xs text-indigo-200">Current available settlement balance</p>
          <p className="text-3xl font-black font-mono text-amber-450 mt-1 text-yellow-400">₹{customerSession?.walletBalance || 0}</p>
        </div>

        <div className="flex justify-between items-center text-[10px] text-indigo-200 border-t border-white/10 pt-3.5 font-mono">
          <span>Account linked: {customerSession?.phone}</span>
          <span>Claimed promo credit savings: {customerSession?.couponApplied ? "₹200 Applied" : "None"}</span>
        </div>
      </div>

      {/* TOP UP SANDBOX TRIGGER PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 text-left">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800">Direct Virtual Balance Topup</h3>
          <p className="text-xs text-slate-500">Add sandbox money utilizing our UPI Express simulator helper overlays.</p>
        </div>

        {/* Quick Select Chips */}
        <div className="grid grid-cols-4 gap-2">
          {[150, 500, 1000, 2500].map((v) => (
            <button
              key={`chip-${v}`}
              type="button"
              onClick={() => setTopupValue(v)}
              className={`py-2 rounded-xl text-xs font-mono font-black border transition cursor-pointer ${
                topupValue === v 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
              }`}
            >
              +₹{v}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-3 text-left">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400 font-mono">₹</span>
            <input
              type="number"
              value={topupValue}
              onChange={(e) => setTopupValue(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-mono text-xs font-black text-slate-850"
              placeholder="Enter custom deposit credits"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsTopupModalOpen(true)}
            className="px-6 bg-orange-500 hover:bg-orange-650 text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border-none shadow-md inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Top Up Wallet
          </button>
        </div>
      </div>

      {/* WALLET TRANSACTIONS STATEMENT LEDGER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 text-left">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 font-mono">Credits Transaction Statement</h3>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {walletTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 italic text-center">No transactions registered yet in this session.</p>
          ) : (
            walletTransactions.map((tx, idx) => (
              <div key={`tx-row-${tx.id}-${idx}`} className="py-3 flex justify-between items-center text-xs">
                <div className="text-left">
                  <p className="font-bold text-slate-800">{tx.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tx.timestamp} &bull; ID: {tx.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`font-mono font-black ${tx.isCredit ? "text-emerald-600" : "text-rose-500"}`}>
                  {tx.isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
