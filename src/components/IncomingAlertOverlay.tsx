import React, { useState, useEffect, useRef } from "react";
import { DeliveryOrder, Driver } from "../types";
import { 
  BellRing, X, Compass, CheckCircle2, ChevronRight, AlertTriangle, 
  MapPin, Volume2, VolumeX, ShieldAlert, Navigation, IndianRupee,
  Briefcase, Package, ArrowRight, ShieldCheck, Route, Clock
} from "lucide-react";
import { calculateDistance } from "../data/mockData";

interface IncomingAlertOverlayProps {
  activeDriver: Driver | null;
  searchingOrders: DeliveryOrder[];
  onAccept: (orderId: string, driver: Driver) => void;
  onDecline: (orderId: string, driverId: string) => void;
  allSkippedOrderIds: { [driverId: string]: string[] };
  isSuspended: boolean;
  drivers: Driver[];
}

export default function IncomingAlertOverlay({
  activeDriver,
  searchingOrders,
  onAccept,
  onDecline,
  allSkippedOrderIds,
  isSuspended,
  drivers
}: IncomingAlertOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [showSkippedPopup, setShowSkippedPopup] = useState(false);
  const [skippedOrderIdLabel, setSkippedOrderIdLabel] = useState("");
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<any>(null);
  const currentOrderIdRef = useRef<string | null>(null);

  // 1. Find first searching order that has NOT been skipped where activeDriver is the closest available driver
  const searching = searchingOrders.filter(o => o.status === "searching");

  let pingableOrder: DeliveryOrder | null = null;
  let activeDriverDistanceKm = 0;

  if (activeDriver && !activeDriver.isOffline && !isSuspended && searching.length > 0) {
    for (const order of searching) {
      // Is this order skipped by the active driver?
      const isAlreadySkippedByActive = (allSkippedOrderIds[activeDriver.id] || []).includes(order.id);
      if (isAlreadySkippedByActive) continue;

      // Find all eligible (not suspended, not skipped, not offline) drivers in the system
      const availableDrivers = drivers.filter(d => {
        const isDrvSuspended = d.suspendedUntil
          ? new Date(d.suspendedUntil).getTime() > Date.now()
          : false;
        const isDrvSkipped = (allSkippedOrderIds[d.id] || []).includes(order.id);
        const isDrvOffline = d.isOffline === true;
        return !isDrvSuspended && !isDrvSkipped && !isDrvOffline;
      });

      if (availableDrivers.length === 0) continue;

      // Sort drivers by distance to order.pickup
      const sortedDrivers = [...availableDrivers].map(d => {
        const dist = calculateDistance(d.currentLat, d.currentLng, order.pickup.lat, order.pickup.lng);
        return { driver: d, distance: dist };
      }).sort((a, b) => a.distance - b.distance);

      const closest = sortedDrivers[0];

      if (closest && closest.driver.id === activeDriver.id) {
        pingableOrder = order;
        activeDriverDistanceKm = closest.distance;
        break;
      }
    }
  }

  // Restart 10-second timer whenever the order changes
  useEffect(() => {
    if (pingableOrder) {
      if (currentOrderIdRef.current !== pingableOrder.id) {
        currentOrderIdRef.current = pingableOrder.id;
        setTimeLeft(10);
      }
    } else {
      currentOrderIdRef.current = null;
    }
  }, [pingableOrder?.id]);

  // Handle countdown tick
  useEffect(() => {
    if (!pingableOrder) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (activeDriver) {
            triggerDecline(pingableOrder!.id, activeDriver.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pingableOrder?.id, activeDriver?.id]);

  // Handle Synth Ringtone
  useEffect(() => {
    if (!pingableOrder || isMuted) {
      stopRingtone();
      return;
    }

    startRingtone();

    return () => {
      stopRingtone();
    };
  }, [pingableOrder?.id, isMuted]);

  const startRingtone = () => {
    try {
      stopRingtone();
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      audioCtxRef.current = new AudioCtxClass();
      let isBeep = true;

      soundIntervalRef.current = setInterval(() => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Safe carrier beep sounds (580Hz / 820Hz)
        osc.type = "sine";
        osc.frequency.setValueAtTime(isBeep ? 580 : 820, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        isBeep = !isBeep;
      }, 450);
    } catch (e) {
      console.warn("Ringtone synth blocked:", e);
    }
  };

  const stopRingtone = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const triggerDecline = (orderId: string, driverId: string) => {
    setSkippedOrderIdLabel(orderId.slice(4, 9).toUpperCase());
    setShowSkippedPopup(true);
    onDecline(orderId, driverId);
  };

  const triggerAccept = (orderId: string, driver: Driver) => {
    stopRingtone();
    onAccept(orderId, driver);
  };

  // If order was skipped: Draw Screenshot 3 Pop-up
  if (showSkippedPopup) {
    return (
      <div id="skipped-order-popup-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-[35px] max-w-xs w-full p-6 text-center shadow-2xl relative overflow-hidden animate-scaleIn space-y-5">
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#ff3b5c]/5 rounded-full"></div>
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-orange-500/5 rounded-full"></div>

          {/* Courier Box illustration markup */}
          <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full flex items-center justify-center border border-orange-500/10 shadow-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
              <Package className="w-8 h-8 animate-bounce text-orange-400 stroke-[1.5]" />
            </div>
            {/* Flying action lines representing swift shipment */}
            <div className="absolute top-6 right-4 w-4 h-0.5 bg-orange-400 rounded-full opacity-60"></div>
            <div className="absolute top-10 right-2 w-3.5 h-0.5 bg-orange-400 rounded-full opacity-60"></div>
            <div className="absolute bottom-8 left-3 w-5 h-0.5 bg-orange-400 rounded-full opacity-60"></div>
          </div>

          <div className="space-y-1">
            <h3 className="font-sans font-black text-white text-lg tracking-tight">Order Skipped!</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">ID: #{skippedOrderIdLabel || "MATCH"}</p>
            <p className="text-xs text-slate-300 leading-normal font-sans">
              Booking match was automatically routed back to options feed. Choose "Go Offline" to block dispatches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSkippedPopup(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-2.5 rounded-2xl shadow-lg shadow-orange-950/30 transition text-xs uppercase tracking-widest cursor-pointer mt-1"
          >
            Ok
          </button>
        </div>
      </div>
    );
  }

  if (!pingableOrder || !activeDriver) return null;

  const appCut = Math.round(pingableOrder.totalPrice * 0.2);
  const netEarnings = Math.round(pingableOrder.totalPrice * 0.8);

  return (
    <div id="incoming-order-overlay" className="fixed bottom-6 right-6 z-50 max-w-[360px] w-full bg-[#0a0f1d] text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-slideIn">
      {/* Dynamic orange visual tracking band */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 animate-pulse"></div>

      <div className="p-5 space-y-4">
        {/* Header bar alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <div className="flex items-center gap-1.5 leading-none">
              <BellRing className="w-4 h-4 text-orange-400 animate-bounce" />
              <p className="text-[9.5px] font-black uppercase tracking-widest text-orange-400 font-sans">
                Incoming Shipping Alert
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 select-none">
            {/* Audio configuration check */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title={isMuted ? "Unmute sound chime" : "Mute sound chime"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
            </button>

            {/* Close / Skip button */}
            <button
              onClick={() => triggerDecline(pingableOrder!.id, activeDriver.id)}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-rose-950 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. TOP SECTION: Huge Price & Light Green indicator info label */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-850 relative">
          
          {/* Radial Countdown Timer widget */}
          <div className="absolute top-3.5 right-3.5">
            <div className="relative w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-full">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray={81.6}
                  strokeDashoffset={81.6 - (81.6 * timeLeft) / 10}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="font-mono text-[10px] font-black text-orange-400 animate-pulse">{timeLeft}s</span>
            </div>
          </div>

          {/* Large display Price */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#94a3b8] block">Rider Net Pay</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-white font-sans tracking-tight">₹{netEarnings}</span>
              <span className="text-xs text-[#a1a1aa] font-medium strike-through line-through">₹{pingableOrder.totalPrice}</span>
            </div>
            
            {/* Light Green distance indicator text */}
            <p className="text-[11.5px] font-extrabold text-[#34d399] leading-none pt-1">
              • Pickup {activeDriverDistanceKm > 0 ? activeDriverDistanceKm.toFixed(1) : "3.3"} km away
            </p>
          </div>

          {/* Cargo Category specification */}
          <div className="mt-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800/60 text-[10.5px] text-slate-350 leading-relaxed font-sans">
            Package: <span className="font-black text-slate-100">{pingableOrder.cargoCategory}</span> • {pingableOrder.weightEstimate} kg payload
          </div>
        </div>

        {/* 2. MIDDLE SECTION: Vertical Route Track */}
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/80 flex gap-3.5">
          {/* Vertical track line columns */}
          <div className="flex flex-col items-center py-2 shrink-0 select-none">
            {/* Green pickup dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] ring-4 ring-[#10b981]/25"></div>
            {/* Grey vertical dotted bar line */}
            <div className="w-0.5 flex-1 border-l-2 border-dotted border-slate-700 my-1"></div>
            {/* Red dropoff dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] ring-4 ring-[#ef4444]/25"></div>
          </div>

          {/* Addresses and coordinates */}
          <div className="flex-1 space-y-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-450 text-[#10b981] font-mono leading-none block">PICKUP SITE</span>
              <p className="font-extrabold text-slate-205 text-slate-200 line-clamp-1">{pingableOrder.pickup.name}</p>
            </div>
            <div className="space-y-0.5 pt-0.5">
              <span className="text-[8.5px] uppercase font-black tracking-widest text-rose-450 text-[#ef4444] font-mono leading-none block">DROPOFF SITE</span>
              <p className="font-extrabold text-slate-205 text-slate-200 line-clamp-1">{pingableOrder.dropoff.name}</p>
            </div>
          </div>
        </div>

        {/* Warning notification limit threshold checks */}
        {activeDriver.cancellationsToday && activeDriver.cancellationsToday > 0 ? (
          <div className="flex items-center gap-1.5 p-2 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10px] text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="leading-tight">
              Notice: You have <strong>{activeDriver.cancellationsToday}/3 cancellations</strong> today.
            </span>
          </div>
        ) : null}

        {/* 3. BUTTONS: Beautiful Animated Slide accepting chevron button */}
        <div id="slide-acceptor-container" className="pt-1.5">
          <button
            type="button"
            onClick={() => triggerAccept(pingableOrder!.id, activeDriver)}
            className="group relative w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-orange-600 rounded-[20px] font-black text-slate-950 uppercase tracking-widest text-xs flex items-center justify-center overflow-hidden transition active:scale-95 shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            {/* Sliding background glow effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 translate-x-[-100%] group-hover:animate-shimmer"></div>

            {/* Double chevron left handle that slides right on hover */}
            <div className="absolute left-4 flex gap-0.5 text-slate-950 transition-all duration-300 transform group-hover:translate-x-1.5">
              <Compass className="w-4 h-4 animate-spin-slow shrink-0" />
            </div>

            <span className="mx-auto leading-none text-slate-950 block select-none">
              Accept Contract
            </span>

            <div className="absolute right-4 flex gap-1 items-center transition-transform duration-300 transform group-hover:translate-x-1">
              <span className="text-[10px] font-black">{timeLeft}s</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => triggerDecline(pingableOrder!.id, activeDriver.id)}
            className="w-full text-center text-slate-500 hover:text-slate-300 text-[10.5px] font-black block pt-2 cursor-pointer transition uppercase tracking-widest"
          >
            Decline match
          </button>
        </div>

      </div>
    </div>
  );
}
