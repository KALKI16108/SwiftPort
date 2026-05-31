import React, { useState } from "react";
import { Driver, DeliveryOrder } from "../types";
import { 
  Menu, HelpCircle, Bell, Compass, TrendingUp, CreditCard, 
  AlertCircle, Gift, ShieldCheck, ArrowRight, Clock, Star, 
  MapPin, Navigation, CheckSquare, ShieldAlert, X , AlertTriangle, IndianRupee
} from "lucide-react";

interface SwiftPortPhoneMockupProps {
  activeDriver: Driver | null;
  pendingOrders: DeliveryOrder[];
  todayEarnings: number;
  onAcceptOrder: (orderId: string, customDriver?: Driver) => void;
  onUpdateStatus: (orderId: string, status: DeliveryOrder['status']) => void;
  onCancelOrder: (orderId: string, driverId: string) => void;
  isSuspended: boolean;
  getSuspensionTimeRemaining: (suspendedUntilStr: string) => string;
  onLiftSuspension: (driverId: string) => void;
  updateActiveDriver: (fields: Record<string, any>) => void;
  setConsoleTab: (tab: "active" | "onboard" | "payouts" | "earnings" | "profile" | "admin") => void;
  setToastMessage: (msg: string) => void;
}

export default function SwiftPortPhoneMockup({
  activeDriver,
  pendingOrders,
  todayEarnings,
  onAcceptOrder,
  onUpdateStatus,
  onCancelOrder,
  isSuspended,
  getSuspensionTimeRemaining,
  onLiftSuspension,
  updateActiveDriver,
  setConsoleTab,
  setToastMessage,
}: SwiftPortPhoneMockupProps) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeInput, setRechargeInput] = useState<string>("500");
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [showTxHistory, setShowTxHistory] = useState(false);

  // Calculate wallet balance display values
  const balance = activeDriver?.walletBalance ?? 0;
  const isLowBalance = balance < 100;

  // Find any active/ongoing accepted order for this driver that they have to deliver
  const activeOngoingOrder = pendingOrders.find(
    o => o.driver?.id === activeDriver?.id && ["assigned", "loaded", "in_transit"].includes(o.status)
  );

  return (
    <div id="swiftport-phone-mockup" className="relative mx-auto max-w-[390px] w-full bg-[#f8fafc] text-slate-800 rounded-[50px] border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col min-h-[780px] ring-1 ring-slate-800/50 font-sans">
      
      {/* 1. Phone Top Notch Speaker / Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-40 flex items-center justify-center">
        <div className="w-2 h-2 bg-slate-800 rounded-full mr-2"></div>
        <div className="w-10 h-1 bg-slate-950 rounded-full"></div>
      </div>

      {/* 2. Top Status Bar */}
      <div className="bg-slate-950 text-slate-350 text-[11px] px-6 pt-3 pb-1.5 flex justify-between items-center font-semibold font-mono z-20 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <span>12:24</span>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded-sm leading-none">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[10px]">5G</span>
          {/* Signal Indicator rails */}
          <div className="flex items-end gap-0.5 h-2.5">
            <div className="w-[2px] h-[3px] bg-emerald-400 rounded-sm"></div>
            <div className="w-[2px] h-[5px] bg-emerald-400 rounded-sm"></div>
            <div className="w-[2px] h-[7px] bg-emerald-400 rounded-sm"></div>
            <div className="w-[2px] h-[9px] bg-emerald-400 rounded-sm"></div>
          </div>
          {/* Battery level indicator */}
          <div className="flex items-center gap-0.5 bg-slate-900 px-1.5 py-0.5 rounded text-[9.5px] border border-slate-800 leading-none">
            <span>54%</span>
            <span className="text-[9px] text-yellow-500 font-bold">⚡</span>
          </div>
        </div>
      </div>

      {/* 3. Driver App Top Navigation Bar */}
      <div className="bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-850 shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* Hamburger Menu icon */}
          <div className="p-1.5 bg-slate-900 text-slate-300 rounded-xl border border-slate-800">
            <Menu className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-1 py-0.5 rounded-sm tracking-tighter leading-none">
                10 YRS
              </span>
              <span className="font-black text-xs tracking-tight text-white uppercase font-sans">
                SwiftPort
              </span>
            </div>
          </div>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center gap-1.5">
          {/* Headset Customer Support Icon */}
          <button
            type="button"
            onClick={() => setConsoleTab("profile")}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
            title="Rider Helpdesk Support Channels"
          >
            <HelpCircle className="w-4.5 h-4.5 text-orange-400" />
          </button>
          {/* Notifications Bell icon */}
          <button
            type="button"
            onClick={() => setConsoleTab("payouts")}
            className="relative p-1.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
            title="App Notifications panel"
          >
            <Bell className="w-4.5 h-4.5 text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          </button>
          
          {/* Circular avatar representation */}
          <div className="w-7 h-7 rounded-lg ring-1 ring-slate-800 overflow-hidden shrink-0 border border-slate-700 ml-1">
            <img 
              src={activeDriver?.avatar || "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=120&auto=format&fit=crop"} 
              className="w-full h-full object-cover" 
              alt="Avatar Profile" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* 4. Phone Screen Content (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc] text-slate-800 flex flex-col pb-6">
        
        {/* A. Profile banner card with Active Driver */}
        <div className="bg-white border-b border-slate-100 p-4 shrink-0 shadow-sm">
          <div className="bg-gradient-to-r from-slate-50 to-orange-50/20 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm bg-slate-100">
                  <img 
                    src={activeDriver?.avatar} 
                    className="w-full h-full object-cover" 
                    alt={activeDriver?.name} 
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Online pulsating dot indicator */}
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${activeDriver?.isOffline ? "bg-slate-400" : "bg-emerald-500"}`}>
                  {!activeDriver?.isOffline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  )}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-slate-800 text-sm leading-tight">
                    {activeDriver?.name || "Partner Account"}
                  </h4>
                  <span className="bg-yellow-50 text-yellow-700 font-bold text-[9.5px] px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-0.5">
                    ★ {activeDriver?.rating || 4.9}
                  </span>
                </div>
                <p className="text-[10.5px] font-mono text-slate-500 leading-none">
                  {activeDriver?.vehicleDetails || "Scooter"} • {activeDriver?.vehicleNumber || "MH-CW-6716"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConsoleTab("profile")}
              className="text-[10.5px] font-extrabold text-blue-600 hover:text-blue-700 cursor-pointer uppercase tracking-wider"
            >
              VIEW PROFILE
            </button>
          </div>
        </div>

        {/* B. Today's Earning row */}
        <div 
          onClick={() => setConsoleTab("earnings")}
          className="bg-white border-b border-slate-100 py-3.5 px-4.5 flex justify-between items-center text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition active:bg-slate-100 hover:text-slate-800 shadow-sm shrink-0"
        >
          <span className="font-sans text-[11px] uppercase tracking-wider text-slate-505 text-slate-500">Today's Earning</span>
          <div className="flex items-center gap-1 font-mono text-slate-800 text-md font-black">
            <span>₹{todayEarnings}</span>
            <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Offline Overlay Banner if Rider goes offline */}
        {activeDriver?.isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-start gap-2 animate-fadeIn shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Offline Mode Active:</strong> You won't receive newly routed dispatch matching signals. Toggle the bottom slider to resume.
            </p>
          </div>
        )}

        {/* OR: If Suspended, draw suspension alert */}
        {isSuspended && activeDriver && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-xs text-rose-800 space-y-2 animate-fadeIn shrink-0">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wide">🚨 System Suspension Enforced</p>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                  Matches frozen for 1 hour for exceeding cancellation limits.
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1.5 flex items-center gap-1">
                  <Clock className="w-3" /> Remaining: <span className="text-rose-800 font-bold">{getSuspensionTimeRemaining(activeDriver.suspendedUntil!)}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onLiftSuspension(activeDriver.id)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded-xl text-[10px] cursor-pointer shadow-sm uppercase tracking-wide transition"
            >
              ⚡ Override Cooldown penalty
            </button>
          </div>
        )}

        {/* C. Interactive Wallet Card */}
        <div className="p-4 shrink-0">
          <div className="bg-[#121c2e] text-white p-4.5 rounded-3xl relative shadow-md overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-6 -mt-6"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9.5px] text-slate-400 uppercase font-mono tracking-wider">Wallet Balance</span>
                <div className="flex items-baseline mt-1 gap-1">
                  {balance < 0 ? (
                    <span className="text-2xl font-black text-rose-500 font-mono">
                      - ₹{Math.abs(balance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{balance.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[9.5px] text-slate-500 font-bold">INR</span>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setShowRecharge(prev => !prev)}
                className="flex items-center gap-1 bg-[#ff3b5c]/10 hover:bg-[#ff3b5c]/25 border border-[#ff3b5c]/20 text-[#ff3b5c] font-black text-[11px] px-3.5 py-1.5 rounded-full transition active:scale-95 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Recharge
              </button>
            </div>

            {/* Dynamic Interactive Wallet Recharge Dialogue */}
            {showRecharge && (
              <div className="mt-4 border-t border-slate-800 pt-3.5 space-y-3 animate-fadeIn">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">Simulate Direct Top-up</span>
                <div className="flex gap-1.5">
                  {["200", "500", "1500"].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeInput(amt)}
                      className={`bg-slate-900 border text-[10px] font-bold py-1 px-3 rounded-lg text-slate-300 transition active:scale-95 cursor-pointer ${rechargeInput === amt ? "border-orange-500 text-orange-400" : "border-slate-800"}`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={rechargeInput}
                    onChange={e => setRechargeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-400"
                    placeholder="Enter amount"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const amount = parseInt(rechargeInput, 10);
                      if (isNaN(amount) || amount <= 0) {
                        setToastMessage("Invalid recharge entry!");
                        setTimeout(() => setToastMessage(""), 2000);
                        return;
                      }
                      updateActiveDriver({ walletBalance: balance + amount });
                      setShowRecharge(false);
                      setToastMessage(`₹${amount} Added Successfully!`);
                      setTimeout(() => setToastMessage(""), 3000);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black px-4 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Low Balance Warning panel under Card */}
          {isLowBalance && (
            <div className="mt-2.5 bg-[#fdf2f4] border border-[#fdd2d8] text-[#a42c3d] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>Low balance recharge now</span>
            </div>
          )}

          {/* Collapsible Wallet History Passbook within Mobile screen */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setShowTxHistory(prev => !prev)}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200/60 p-2.5 rounded-2xl text-[10px] font-black text-slate-700 transition cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Rider Wallet Passbook History ({activeDriver?.walletTransactions?.length || 0})
              </span>
              <span className="text-slate-400 text-xs font-mono">{showTxHistory ? '▲' : '▼'}</span>
            </button>

            {showTxHistory && (
              <div className="mt-2 bg-white border border-slate-100 rounded-2xl p-2.5 space-y-2 max-h-[140px] overflow-y-auto animate-fadeIn select-none shadow-sm">
                {(!activeDriver?.walletTransactions || activeDriver.walletTransactions.length === 0) ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-2">No transactions in passbook history.</p>
                ) : (
                  activeDriver.walletTransactions.map((tx, idx) => {
                    const isDebit = tx.amount < 0;
                    return (
                      <div key={`${tx.id || 'tx'}_${idx}`} className="flex justify-between items-start gap-2.5 text-[10px] border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0 pt-1">
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="font-bold text-slate-800 leading-tight truncate">{tx.desc}</p>
                          <span className="text-[8px] text-slate-400 font-mono block">{tx.timestamp}</span>
                        </div>
                        <span className={`font-mono font-black shrink-0 ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isDebit ? '' : '+'}{tx.amount}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* D. Porter Rewards Program banner */}
        <div className="px-4 pb-3 shrink-0">
          <div className="bg-gradient-to-r from-indigo-950 via-[#16133a] to-slate-950 text-white rounded-2xl p-4 flex items-center justify-between border border-indigo-900/50 relative overflow-hidden shadow-sm">
            <div className="space-y-0.5 relative z-10 max-w-[200px]">
              <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider leading-none inline-block">
                Rewards Program
              </span>
              <h5 className="font-extrabold text-xs text-slate-100 mt-1">Porter Rewards Program</h5>
              <p className="text-[10px] text-slate-400 leading-normal">
                Earn daily bonus cards, scratch wins, and high multiplier cuts!
              </p>
            </div>
            
            <div className="w-12 h-12 bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-500/25 relative z-10 hover:scale-105 transition">
              <Gift className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* E. Active Ongoing Trip Tracker Sheet (Dynamic Slide-Up inside Phone Screen) */}
        {activeOngoingOrder ? (
          <div className="mx-4 mb-4 bg-white border border-orange-200 rounded-3xl p-4 shadow-md space-y-3.5 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-orange-50 pb-2.5">
              <div>
                <span className="text-[9px] font-mono bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-md font-bold">
                  ACTIVE MATCH #{activeOngoingOrder.id.slice(4, 9).toUpperCase()}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Cargo Category: <span className="text-orange-600 font-bold">{activeOngoingOrder.cargoCategory}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block leading-tight">Net Pay (80%)</span>
                <span className="text-sm font-black text-emerald-600 font-mono">₹{Math.round(activeOngoingOrder.totalPrice * 0.8)}</span>
              </div>
            </div>

            {/* Travel Path */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex gap-1.5 items-start">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                <p className="text-slate-700 font-bold truncate"><strong>Pick:</strong> {activeOngoingOrder.pickup.name}</p>
              </div>
              <div className="w-0.5 h-3 border-l-2 border-dotted border-slate-300 ml-1"></div>
              <div className="flex gap-1.5 items-start">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                <p className="text-slate-700 font-bold truncate"><strong>Drop:</strong> {activeOngoingOrder.dropoff.name}</p>
              </div>
            </div>

            {/* Step trigger button */}
            <div className="space-y-2">
              {activeOngoingOrder.status === "assigned" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(activeOngoingOrder.id, "loaded")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer transition shadow-sm text-center block uppercase tracking-wider"
                >
                  Confirm Cargo Loaded Check
                </button>
              )}

              {activeOngoingOrder.status === "loaded" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(activeOngoingOrder.id, "in_transit")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer transition shadow-md shadow-orange-100 text-center block uppercase tracking-wider animate-pulse"
                >
                  Start Cargo Shifting Transit
                </button>
              )}

              {activeOngoingOrder.status === "in_transit" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(activeOngoingOrder.id, "delivered")}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer transition shadow-md shadow-emerald-100 text-center block uppercase tracking-wider"
                >
                  Verify Handover complete
                </button>
              )}

              {/* Cancel forfeit triggers */}
              {cancelOrderId === activeOngoingOrder.id ? (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl space-y-1.5 text-[10.5px] text-rose-800 text-left">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 fill-rose-500 text-white" />
                    Forfeit contract warning!
                  </p>
                  <p className="text-rose-700 leading-snug">
                    Cancelling forfeits ₹150 penalty penalty debited from your driver passbook wallet balance. Use with discretion.
                  </p>
                  <div className="flex gap-2 justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => setCancelOrderId(null)}
                      className="bg-white border border-slate-200 font-bold px-2 py-1 rounded-lg text-slate-700 cursor-pointer"
                    >
                      Hold order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCancelOrder(activeOngoingOrder.id, activeDriver?.id || "");
                        setCancelOrderId(null);
                        setToastMessage("Match Forfeited. ¥150 penalty applied.");
                        setTimeout(() => setToastMessage(""), 3000);
                      }}
                      className="bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      Forfeit
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCancelOrderId(activeOngoingOrder.id)}
                  className="w-full text-center text-rose-600 hover:text-rose-800 hover:underline text-[10.5px] font-bold block pt-1 cursor-pointer"
                >
                  Forfeit Accepted Contract (Apply penalty)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* F. Plain Noticeboard when no job is active */
          <div className="px-4 pb-4 shrink-0">
            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 pl-1 mb-2">Noticeboard</h5>
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-4.5 border border-indigo-900/30 relative overflow-hidden space-y-3.5">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1 max-w-[240px]">
                  <span className="text-[8px] bg-blue-500/20 text-blue-300 border border-blue-400/25 px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-block">
                    Standard safety
                  </span>
                  <h4 className="text-md font-black tracking-tight text-white leading-tight font-sans">
                    आपकी सुरक्षा सबसे पहले
                  </h4>
                  <p className="text-[10px] text-slate-350 leading-normal leading-relaxed">
                    Live transit coverage of up to ₹1,00,000 provided automatically for courier transport operators during dispatches.
                  </p>
                </div>
                <div className="w-10 h-10 bg-indigo-900/40 rounded-xl flex items-center justify-center border border-indigo-500/15 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400 rounded-full shrink-0"></div>
            </div>
          </div>
        )}

      </div>

      {/* 5. Online/Offline capsule button stickied at bottom */}
      <div className="p-4 pt-2.5 border-t border-slate-100 bg-white sticky bottom-0 z-30 shrink-0 select-none shadow-inner">
        <button
          type="button"
          onClick={() => {
            const nextOffline = !activeDriver?.isOffline;
            updateActiveDriver({ isOffline: nextOffline });
            setToastMessage(nextOffline ? `${activeDriver?.name || "Rider"} goes Offline` : `${activeDriver?.name || "Rider"} is now Online!`);
            setTimeout(() => setToastMessage(""), 2500);
          }}
          className={`relative w-full py-3.5 px-4.5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md ${
            activeDriver?.isOffline
              ? "bg-[#ffffff] text-emerald-600 border border-emerald-400 hover:bg-emerald-50/20 shadow-emerald-100/50"
              : "bg-[#ffffff] text-[#ff3b5c] border border-[#ff3b5c] hover:bg-[#ff3b5c]/5 shadow-rose-100/50"
          }`}
        >
          {/* Circular double chevrons slider icon */}
          <div 
            className={`absolute left-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow ${
              activeDriver?.isOffline ? "bg-emerald-500 left-[calc(100%-2.25rem)] rotate-180" : "bg-[#ff3b5c]"
            }`}
          >
            <ArrowRight className="w-4.5 h-4.5" />
          </div>
          <span className="mx-auto leading-none">
            {activeDriver?.isOffline ? "GO ONLINE" : "GO OFFLINE"}
          </span>
        </button>
      </div>

    </div>
  );
}

// Chevron helper
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      className={props.className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
