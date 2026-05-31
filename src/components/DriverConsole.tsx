import React, { useState, useEffect } from "react";
import { DeliveryOrder, Driver, JoineeApplication, WithdrawalRequest } from "../types";
import { VEHICLES } from "../data/mockData";
import { 
  MapPin, Navigation, IndianRupee, Bell, AlertCircle, Play, 
  CheckSquare, Sparkles, TrendingUp, Compass, UserPlus, Lock, 
  CheckCircle, ShieldCheck, XCircle, CreditCard, Check, HelpCircle, 
  FileText, ArrowRight, LogIn, LogOut, CheckCircle2, ShieldAlert, Clock,
  ArrowDownToLine, CheckSquare2, Menu, X, ChevronRight, ChevronDown, History, User, Shield, Info, ArrowLeft, BookOpen, GraduationCap, Gift,
  UploadCloud, QrCode, Building, Eye, Copy, RefreshCw
} from "lucide-react";
import SwiftPortPhoneMockup from "./SwiftPortPhoneMockup";

interface DriverConsoleProps {
  pendingOrders: DeliveryOrder[];
  onAcceptOrder: (orderId: string, customDriver?: Driver) => void;
  onUpdateStatus: (orderId: string, status: DeliveryOrder['status']) => void;
  driversList: Driver[];
  setDriversList: React.Dispatch<React.SetStateAction<Driver[]>>;
  joinees: JoineeApplication[];
  setJoinees: React.Dispatch<React.SetStateAction<JoineeApplication[]>>;
  selectedDriverId: string;
  setSelectedDriverId: (id: string) => void;
  onCancelOrder: (orderId: string, driverId: string) => void;
  onLiftSuspension: (driverId: string) => void;
  withdrawalRequests: WithdrawalRequest[];
  onAddWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>) => void;
  onAdminActionWithdrawal: (requestId: string, action: 'approved' | 'rejected') => void;
  currentRoleMode?: 'rider' | 'admin';
  isRiderLoggedIn?: boolean;
  setIsRiderLoggedIn?: (val: boolean) => void;
  onLogout?: () => void;
  activeIncentive?: {
    targetTrips: number;
    rewardAmount: number;
    description: string;
    isActive: boolean;
  };
  onChangeIncentive?: (incentive: {
    targetTrips: number;
    rewardAmount: number;
    description: string;
    isActive: boolean;
  }) => void;
}

export default function DriverConsole({ 
  pendingOrders, 
  onAcceptOrder, 
  onUpdateStatus,
  driversList,
  setDriversList,
  joinees,
  setJoinees,
  selectedDriverId,
  setSelectedDriverId,
  onCancelOrder,
  onLiftSuspension,
  withdrawalRequests,
  onAddWithdrawalRequest,
  onAdminActionWithdrawal,
  currentRoleMode = 'rider',
  isRiderLoggedIn = false,
  setIsRiderLoggedIn,
  onLogout,
  activeIncentive = { targetTrips: 5, rewardAmount: 350, description: "Rush Hour special: Complete 5 transit consignments today to trigger a pocket-heavy bonus!", isActive: true },
  onChangeIncentive
}: DriverConsoleProps) {
  // Console Tab Controller: "active" | "onboard" | "payouts" | "earnings" | "profile" | "admin"
  const [consoleTab, setConsoleTab] = useState<"active" | "onboard" | "payouts" | "earnings" | "profile" | "admin">(() => {
    return currentRoleMode === "admin" ? "admin" : "active";
  });

  // State for non-Window.confirm Cancel & Forfeit option
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<string | null>(null);

  // States for live incentive configuration from Admin Panel
  const [editedIncentiveTrips, setEditedIncentiveTrips] = useState(activeIncentive.targetTrips);
  const [editedIncentiveReward, setEditedIncentiveReward] = useState(activeIncentive.rewardAmount);
  const [editedIncentiveDesc, setEditedIncentiveDesc] = useState(activeIncentive.description);
  const [editedIncentiveActive, setEditedIncentiveActive] = useState(activeIncentive.isActive);
  const [adminDriverSearch, setAdminDriverSearch] = useState("");
  const [campaignSuccessToast, setCampaignSuccessToast] = useState<string | null>(null);

  // Sync edits if activeIncentive changes
  useEffect(() => {
    setEditedIncentiveTrips(activeIncentive.targetTrips);
    setEditedIncentiveReward(activeIncentive.rewardAmount);
    setEditedIncentiveDesc(activeIncentive.description);
    setEditedIncentiveActive(activeIncentive.isActive);
  }, [activeIncentive]);

  const renderPerformanceTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Performance KPI Cards Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Total Fleet Size</span>
            <p className="text-2xl font-black text-slate-800">{driversList.length} Partners</p>
            <span className="text-[10px] text-slate-500 font-medium">100% Onboarded</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Active Now</span>
            <p className="text-2xl font-black text-blue-600">
              {driversList.filter(d => {
                const isBlocked = d.suspendedUntil ? new Date(d.suspendedUntil).getTime() > Date.now() : false;
                return !isBlocked;
              }).length} Online
            </p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">🟢 Dispatches Open</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Transit Completions</span>
            <p className="text-2xl font-black text-emerald-600">
              {driversList.reduce((sum, d) => sum + pendingOrders.filter(o => o.status === 'delivered' && o.driver?.id === d.id).length, 0)} Orders
            </p>
            <span className="text-[10px] text-slate-500 font-medium font-sans">Delivered Today</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Ledger Reserve Balance</span>
            <p className="text-2xl font-black text-slate-800">
              ₹{driversList.reduce((sum, d) => sum + (d.walletBalance || 0), 0)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium font-sans">Driver Passbook Sum</span>
          </div>
        </div>

        {/* SETUP INCENTIVE CONFIGURATION CONTROL PANEL (ADMIN CAN ALSO SETUP INCENTIVE FOR GIVING INCENTIVE ALERT) */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-150/40 border border-indigo-200 p-5 rounded-3xl space-y-4 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] bg-indigo-200 border border-indigo-300 text-indigo-850 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-700 animate-pulse" />
                Transit Incentive Rule Configurator
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">Configure Live Rider Daily Bonus Rules</h4>
              <p className="text-xs text-indigo-750 text-slate-650 leading-relaxed text-slate-500">
                Configure target dispatches and credit rates. When saved, this instantly triggers the **Incentive Alert banner** across all online partner console devices in real-time.
              </p>
            </div>

            {campaignSuccessToast && (
              <div className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-black tracking-wide animate-fadeIn col-span-12 shadow-sm my-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                <p>{campaignSuccessToast}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-605">Rule Broadcast:</span>
              <button
                type="button"
                onClick={() => {
                  const nextState = !editedIncentiveActive;
                  setEditedIncentiveActive(nextState);
                  if (onChangeIncentive) {
                    onChangeIncentive({
                      targetTrips: editedIncentiveTrips,
                      rewardAmount: editedIncentiveReward,
                      description: editedIncentiveDesc,
                      isActive: nextState
                    });
                  }
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider transition-all border cursor-pointer border-none ${
                  editedIncentiveActive 
                    ? 'bg-emerald-600 text-white shadow shadow-emerald-700/25' 
                    : 'bg-slate-200 text-slate-650 hover:bg-slate-300'
                }`}
              >
                {editedIncentiveActive ? "📢 ACTIVE & BROADCASTING" : "🛑 OFF / PAUSED"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest block pl-0.5">
                Incentive Campaign Label / Instructions Display
              </label>
              <input
                type="text"
                value={editedIncentiveDesc}
                onChange={(e) => setEditedIncentiveDesc(e.target.value)}
                className="w-full bg-white border border-slate-250 p-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="E.g., Complete 3 delivery operations from the grid to instantly grab an extra bonus!"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest block pl-0.5">
                Target Trips
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={editedIncentiveTrips}
                onChange={(e) => setEditedIncentiveTrips(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-slate-250 p-3 rounded-2xl text-xs font-black font-mono text-slate-800 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-505 uppercase tracking-widest block pl-0.5">
                Reward Cash (₹)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={editedIncentiveReward}
                onChange={(e) => setEditedIncentiveReward(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-255 p-3 rounded-2xl text-xs font-black font-mono text-slate-800 text-center focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1.5 justify-end">
            <button
              type="button"
              onClick={() => {
                const defDesc = "Daily Rush Special: Successfully deliver 3 items today and get ₹300 incentive bonus directly credited into your wallet ledger!";
                setEditedIncentiveTrips(3);
                setEditedIncentiveReward(300);
                setEditedIncentiveDesc(defDesc);
                setEditedIncentiveActive(true);
                if (onChangeIncentive) {
                  onChangeIncentive({
                    targetTrips: 3,
                    rewardAmount: 300,
                    description: defDesc,
                    isActive: true
                  });
                }
              }}
              className="px-3.5 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
            >
              Reset to Default Campaign
            </button>

            <button
              type="button"
              onClick={() => {
                setEditedIncentiveActive(true);
                if (onChangeIncentive) {
                  onChangeIncentive({
                    targetTrips: editedIncentiveTrips,
                    rewardAmount: editedIncentiveReward,
                    description: editedIncentiveDesc,
                    isActive: true
                  });
                  setCampaignSuccessToast(`📡 Incentive Campaign Saved & Dispatched Live to all partners! Target: ${editedIncentiveTrips} trips • Reward: ₹${editedIncentiveReward}`);
                  setTimeout(() => {
                    setCampaignSuccessToast(null);
                  }, 5000);
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 border-none"
            >
              <RefreshCw className="w-4 h-4" />
              Save & Dispatch Campaign Alert
            </button>
          </div>
        </div>

        {/* SEARCHABLE ACTIVE DRIVERS COMPLIANCE, PERFORMANCE, & WALLET LEDGER REGISTRY */}
        <div className="space-y-4 font-sans">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
              Registered Dispatch Fleet Performance logs
            </h4>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-xs shrink-0">
              <input
                type="text"
                value={adminDriverSearch}
                onChange={(e) => setAdminDriverSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 py-2.5 pl-8.5 pr-4 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                placeholder="Search partners by name, ID or mobile..."
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Performance details table mapping */}
          <div className="space-y-4">
            {driversList
              .filter(d => !adminDriverSearch || d.name.toLowerCase().includes(adminDriverSearch.toLowerCase()) || d.id.toLowerCase().includes(adminDriverSearch.toLowerCase()) || d.mobile.includes(adminDriverSearch))
              .map((driver, idx) => {
                const completedCount = pendingOrders.filter(o => o.status === "delivered" && o.driver?.id === driver.id).length;
                const suspensionActive = driver.suspendedUntil ? new Date(driver.suspendedUntil).getTime() > Date.now() : false;
                const driverWithdrawalClaims = withdrawalRequests.filter(w => w.driverId === driver.id);
                const cancellationCount = driver.cancellationsToday || 0;

                return (
                  <div key={`${driver.id}_${idx}`} className={`border p-5 rounded-3xl bg-white space-y-4 transition ${suspensionActive ? 'border-red-200 bg-red-50/10' : 'border-slate-205 bg-white hover:border-slate-350 shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-sm text-slate-800">{driver.name}</h5>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-205 px-1.5 py-0.2 rounded uppercase font-bold">
                            ID: {driver.id.toUpperCase()}
                          </span>
                          {suspensionActive ? (
                            <span className="text-[8.5px] bg-rose-100 border border-rose-225 text-rose-800 px-2 py-0.5 rounded font-black uppercase tracking-wider animate-pulse font-mono">
                              🚫 suspendedcompliance hold
                            </span>
                          ) : (
                            <span className="text-[8.5px] bg-emerald-100 border border-emerald-150 text-emerald-800 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                              🟢 good standingservice active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Contact: {driver.mobile} • Referral Code: <strong className="font-mono text-indigo-700 bg-indigo-50/20 border border-indigo-100 px-1 py-0.2 rounded text-[10px]">{driver.referralCode}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {suspensionActive ? (
                          <button
                            type="button"
                            onClick={() => onLiftSuspension(driver.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            🔓 Lift Suspension
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDriversList(prev => prev.map(d => {
                                if (d.id === driver.id) {
                                  return {
                                    ...d,
                                    suspendedUntil: new Date(Date.now() + 3600 * 1000).toLocaleString() // Suspend 1 hr
                                  };
                                }
                                return d;
                              }));
                              alert(`Driver ${driver.name} is placed on a-1 hour compliance suspension hold.`);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-220 text-rose-655 text-rose-600 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            ⚠️ Suspend Compliance Hold
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setDriversList(prev => prev.map(d => {
                              if (d.id === driver.id) {
                                  return {
                                    ...d,
                                    cancellationsToday: 0
                                  };
                              }
                              return d;
                            }));
                            alert(`Cancellation standings today is forgiven & reset for ${driver.name}`);
                          }}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-600 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="Reset daily cancellations standing"
                        >
                          😇 Forgive Cancellations
                        </button>
                      </div>
                    </div>

                    {/* Performance statistics metrics ledger logs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                        <span className="text-[9px] text-slate-400 block uppercase font-extrabold">Completed Trips Today</span>
                        <p className="font-extrabold text-slate-800 mt-1">{completedCount} delivered</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                        <span className="text-[9px] text-slate-400 block uppercase font-extrabold">Cancellation Rate</span>
                        <p className="font-extrabold text-rose-700 mt-1">{cancellationCount} / 3 cancelled</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <span className="text-[9px] text-slate-400 block uppercase font-extrabold">Wallet Cash Reserve</span>
                        <p className="font-black text-slate-900 mt-1">₹{driver.walletBalance || 0}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <span className="text-[9px] text-slate-400 block uppercase font-extrabold font-sans">Active Incentive Claimed</span>
                        <p className={`font-bold mt-1 ${driver.incentiveClaimedToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {driver.incentiveClaimedToday ? "🏆 YES (Claimed)" : "❌ NO"}
                        </p>
                      </div>
                    </div>

                    {/* Manual spot incentive bonus grant tools panel */}
                    <div className="bg-indigo-50/40 border border-indigo-150 p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-3 font-sans">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-indigo-650 text-indigo-600 shrink-0" />
                          Manual Fleet Manager Compliance Spot Incentive Rewards
                        </p>
                        <p className="text-[10px] text-slate-500">Award compliance bonus instantly. Added to the driver's wallet ledger with dedicated transaction record.</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setDriversList(prev => prev.map(d => {
                              if (d.id === driver.id) {
                                return {
                                  ...d,
                                  walletBalance: (d.walletBalance || 0) + 100,
                                  walletTransactions: [
                                    ...(d.walletTransactions || []),
                                    {
                                      id: `tx_spot_admin_${Date.now()}`,
                                      amount: 100,
                                      desc: "🎖️ Compliance spot reward awarded by Fleet operations manager",
                                      timestamp: new Date().toLocaleString(),
                                      type: 'incentive_credit'
                                    }
                                  ]
                                };
                              }
                              return d;
                            }));
                            alert(`₹100 spot incentive bonus granted successfully to ${driver.name}! Ledger transaction logged.`);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer border-none"
                        >
                          + Award ₹100 Spot
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setDriversList(prev => prev.map(d => {
                              if (d.id === driver.id) {
                                return {
                                  ...d,
                                  walletBalance: (d.walletBalance || 0) + 250,
                                  walletTransactions: [
                                    ...(d.walletTransactions || []),
                                    {
                                      id: `tx_spot_special_${Date.now()}`,
                                      amount: 250,
                                      desc: "🎖️ Performance special bonus awarded by Fleet operations manager",
                                      timestamp: new Date().toLocaleString(),
                                      type: 'incentive_credit'
                                    }
                                  ]
                                };
                              }
                              return d;
                            }));
                            alert(`₹250 performance special spot bonus granted successfully to ${driver.name}! Ledger transaction logged.`);
                          }}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-200 font-extrabold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          + Award ₹250 Special
                        </button>
                      </div>
                    </div>

                    {/* Outstanding Payout Claims specifically for this partner */}
                    {driverWithdrawalClaims.filter(w => w.status === 'pending').length > 0 && (
                      <div className="bg-orange-50/45 border border-orange-200 p-3.5 rounded-xl space-y-2.5 animate-fadeIn">
                        <span className="text-[9px] font-black tracking-widest text-orange-700 uppercase block">Pending Settlement Claims</span>
                        <div className="space-y-1.5">
                          {driverWithdrawalClaims
                            .filter(w => w.status === 'pending')
                            .map((wl, idx) => (
                              <div key={`${wl.id}_${idx}`} className="bg-white border border-orange-100 p-3 rounded-lg flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-extrabold text-slate-800 font-sans font-extrabold text-sm">₹{wl.amount} Cash-out via {wl.paymentType.toUpperCase()}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">UTR Claim ID: {wl.id.toUpperCase()}</p>
                                  {wl.paymentType === 'upi' ? (
                                    <p className="text-[10px] text-slate-650 font-mono">UPI Reference: {wl.upiId}</p>
                                  ) : (
                                    <p className="text-[10px] text-slate-650 font-mono">Bank: {wl.bankName} Account: {wl.accountNumber}</p>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onAdminActionWithdrawal(wl.id, 'rejected')}
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-220 text-rose-650 font-bold px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Reject & Refund
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => onAdminActionWithdrawal(wl.id, 'approved')}
                                    className="bg-emerald-600 hover:bg-emerald-505 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer border-none shadow"
                                  >
                                    Approve Payout
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  };

  // Navigation drawer visibility overlay
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Profile inline/modal state overrides
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(false);
  const [isEditingProfileOther, setIsEditingProfileOther] = useState(false);
  
  // Local profile temporary value holders
  const [editedBankAcc, setEditedBankAcc] = useState("");
  const [editedBankIFSC, setEditedBankIFSC] = useState("");
  const [editedBankName, setEditedBankName] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedMobile, setEditedMobile] = useState("");
  
  // System visual notification toast state
  const [toastMessage, setToastMessage] = useState("");

  // Onboarding registration form states
  const [applicantName, setApplicantName] = useState("");
  const [applicantVehicleId, setApplicantVehicleId] = useState("2wheeler");
  const [applicantPlate, setApplicantPlate] = useState("");
  const [applicantAadhaar, setApplicantAadhaar] = useState("");
  const [applicantDL, setApplicantDL] = useState("");
  const [applicantRC, setApplicantRC] = useState("");
  const [applicantReferredByCode, setApplicantReferredByCode] = useState("");
  const [assignedReferralCode, setAssignedReferralCode] = useState("");

  // Uploaded docs states (Base64 data / names)
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState("");
  const [dlFile, setDlFile] = useState<string | null>(null);
  const [dlFileName, setDlFileName] = useState("");
  const [rcFile, setRcFile] = useState<string | null>(null);
  const [rcFileName, setRcFileName] = useState("");

  // Multi-method payment states
  const [selectedPayMethod, setSelectedPayMethod] = useState<'card' | 'upi' | 'qr_code' | 'bank_transfer'>('card');
  const [paymentUpiId, setPaymentUpiId] = useState("");
  const [paymentBankRef, setPaymentBankRef] = useState("");
  
  // Payment gateway simulation states
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Driver Simulator Withdrawal Form States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"kyc" | "performance">("performance");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(300);
  const [withdrawType, setWithdrawType] = useState<'upi' | 'bank'>('upi');
  const [withdrawUpiId, setWithdrawUpiId] = useState("");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawIfsc, setWithdrawIfsc] = useState("");
  const [withdrawBankName, setWithdrawBankName] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [showRiderRecharge, setShowRiderRecharge] = useState(false);
  const [riderRechargeInput, setRiderRechargeInput] = useState<string>("500");

  // Local filter states for Payouts History Ledger Tab
  const [payoutFilterDriver, setPayoutFilterDriver] = useState<string>("all");
  const [payoutFilterStatus, setPayoutFilterStatus] = useState<string>("all");
  const [payoutSearchQuery, setPayoutSearchQuery] = useState<string>("");

  const handleCreateWithdrawalSubmit = (driver: Driver) => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setWithdrawError("Specify a valid withdrawal amount");
      return;
    }
    const currentBalance = driver.walletBalance || 0;
    if (withdrawAmount > currentBalance) {
      setWithdrawError(`Exceeds maximum available wallet balance of ₹${currentBalance}`);
      return;
    }

    if (withdrawType === 'upi') {
      if (!withdrawUpiId.trim()) {
        setWithdrawError("Please provide a valid destination UPI Address");
        return;
      }
      if (!withdrawUpiId.includes('@')) {
        setWithdrawError("UPI Address must contain an '@' symbol (e.g. name@okhdfc)");
        return;
      }
    } else {
      if (!withdrawAccount.trim() || !withdrawIfsc.trim() || !withdrawBankName.trim()) {
        setWithdrawError("Please provide all Bank details (Account, IFSC, and Bank name)");
        return;
      }
    }

    // Success! Clear error and dispatch up to parent state to register request
    setWithdrawError("");
    onAddWithdrawalRequest({
      driverId: driver.id,
      driverName: driver.name,
      amount: withdrawAmount,
      paymentType: withdrawType,
      upiId: withdrawType === 'upi' ? withdrawUpiId : undefined,
      accountNumber: withdrawType === 'bank' ? withdrawAccount : undefined,
      ifscCode: withdrawType === 'bank' ? withdrawIfsc : undefined,
      bankName: withdrawType === 'bank' ? withdrawBankName : undefined
    });

    // Reset fields and toggle open status
    setIsWithdrawOpen(false);
  };

  // Filter requests specifically for active simulated driver to display in their balance history
  const activeDriverRequests = withdrawalRequests.filter(req => req.driverId === (driversList.find(d => d.id === selectedDriverId) || driversList[0])?.id);

  // Admin login states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [previewingDoc, setPreviewingDoc] = useState<{ label: string; url: string; applicantName: string; documentNum: string } | null>(null);

  // Live timer for tracking suspension timeouts dynamically
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get active driver object
  const activeDriver = driversList.find(d => d.id === selectedDriverId) || driversList[0];

  // Dynamic field update function for saving bank, mobile, address, language details
  const updateActiveDriver = (updatedFields: Record<string, any>) => {
    if (!activeDriver) return;
    setDriversList((prev) =>
      prev.map((d) => (d.id === activeDriver.id ? { ...d, ...updatedFields } : d))
    );
    // Trigger toast alert
    setToastMessage("Changes saved successfully");
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Total Simulated Partner Net Revenue (after 20% App Commission)
  const COMMISSION_PCT = 0.20;
  const acceptedOrders = pendingOrders.filter(o => o.status !== "searching" && o.status !== "draft");
  const totalRevenue = acceptedOrders.reduce((sum, o) => {
    if (o.status === "delivered" && o.driver?.id === activeDriver?.id) {
      return sum + Math.round(o.totalPrice * (1 - COMMISSION_PCT));
    }
    return sum;
  }, 0);

  // Active driver check for suspension limits
  const isSuspended = activeDriver?.suspendedUntil
    ? new Date(activeDriver.suspendedUntil).getTime() > now
    : false;

  const getSuspensionTimeRemaining = (suspendedUntilStr: string) => {
    const diff = new Date(suspendedUntilStr).getTime() - now;
    if (diff <= 0) return "0s";
    const mins = Math.floor(diff / 60000);
    const secs = Math.ceil((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Document File Reader and Preset simulation helper
  const handleDocUpload = (
    docType: 'aadhaar' | 'dl' | 'rc',
    file: File | null,
    isPreset: boolean = false,
    presetUrl: string = "",
    presetName: string = ""
  ) => {
    if (isPreset) {
      if (docType === 'aadhaar') {
        setAadhaarFile(presetUrl || "PRESET_AADHAAR");
        setAadhaarFileName(presetName || "simulated_aadhaar_card.png");
      } else if (docType === 'dl') {
        setDlFile(presetUrl || "PRESET_DL");
        setDlFileName(presetName || "simulated_driving_license.png");
      } else {
        setRcFile(presetUrl || "PRESET_RC");
        setRcFileName(presetName || "simulated_rc_booklet.png");
      }
      return;
    }

    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (docType === 'aadhaar') {
          setAadhaarFile(reader.result);
          setAadhaarFileName(file.name);
        } else if (docType === 'dl') {
          setDlFile(reader.result);
          setDlFileName(file.name);
        } else {
          setRcFile(reader.result);
          setRcFileName(file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to instantly populate mock files and metadata for rapid testing
  const handleQuickDemoAutoFill = () => {
    const demoNames = ["Aravind Sharma", "Priya Patel", "Vikram Malhotra", "Sunita Rao", "Siddhant Pitale"];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    setApplicantName(randomName);
    setApplicantPlate(`MH-12-${['KW','EA','DF','ZX'][Math.floor(Math.random() * 4)]}-${8000 + Math.floor(Math.random() * 1999)}`);
    setApplicantAadhaar(Math.floor(100000000000 + Math.random() * 900000000000).toString());
    setApplicantDL(`DL-MH12-${Math.floor(1000000 + Math.random() * 8999999)}`);
    setApplicantRC(`RC-MH12-ID-${Math.floor(100000 + Math.random() * 899999)}`);
    
    // Set simulated document visualizations
    handleDocUpload('aadhaar', null, true, "PRESET_AADHAAR", "demo_aadhaar_card_scan.jpg");
    handleDocUpload('dl', null, true, "PRESET_DL", "demo_driving_license_front.jpg");
    handleDocUpload('rc', null, true, "PRESET_RC", "demo_rc_smartcard_permit.jpg");
  };

  // Handle new driver joining process
  const triggerOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPlate.trim() || !applicantAadhaar.trim() || !applicantDL.trim() || !applicantRC.trim()) {
      alert("Please complete all document details first.");
      return;
    }
    
    if (!aadhaarFile || !dlFile || !rcFile) {
      // Auto-fill files without blocking confirm dialog
      if (!aadhaarFile) {
        setAadhaarFile("PRESET_AADHAAR");
        setAadhaarFileName("simulated_aadhaar_card.png");
      }
      if (!dlFile) {
        setDlFile("PRESET_DL");
        setDlFileName("simulated_driving_license.png");
      }
      if (!rcFile) {
        setRcFile("PRESET_RC");
        setRcFileName("simulated_rc_booklet.png");
      }
    }
    setShowCheckout(true);
  };

  const handleProcessPayment = () => {
    // Validate depends on selected payment method
    let referenceString = "";
    
    if (selectedPayMethod === 'card') {
      if (!cardName || cardName.trim() === "" || !cardNumber || cardNumber.trim() === "") {
        alert("Please specify cardholder credentials.");
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        alert("Please enter a valid 16-digit Card Number.");
        return;
      }
      referenceString = `VISA *** ${cardNumber.slice(-4)}`;
    } else if (selectedPayMethod === 'upi') {
      if (!paymentUpiId.trim() || !paymentUpiId.includes('@')) {
        alert("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
        return;
      }
      referenceString = `UPI: ${paymentUpiId.trim()}`;
    } else if (selectedPayMethod === 'bank_transfer') {
      if (!paymentBankRef.trim()) {
        alert("Please fill in your Bank Transaction ID / Reference Receipt Number.");
        return;
      }
      referenceString = `Bank IMPS ID: ${paymentBankRef.trim()}`;
    } else if (selectedPayMethod === 'qr_code') {
      referenceString = `Scan QR Code GPay-TXN-${Math.floor(100000 + Math.random() * 899999)}`;
    }

    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      
      const assignedCode = `SWIFT-${applicantName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PART'}${Math.floor(100 + Math.random() * 899)}`;
      setAssignedReferralCode(assignedCode);

      // Save application with document and payment parameters
      const newApplication: JoineeApplication = {
        id: `join_${Date.now()}`,
        name: applicantName,
        vehicleNumber: applicantPlate.toUpperCase(),
        vehicleId: applicantVehicleId,
        aadhaarNum: applicantAadhaar,
        dlNum: applicantDL,
        rcNum: applicantRC,
        joiningFeePaid: true,
        documentStatus: "pending",
        submittedAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        aadhaarFile: aadhaarFile || undefined,
        dlFile: dlFile || undefined,
        rcFile: rcFile || undefined,
        paymentMethod: selectedPayMethod,
        paymentReference: referenceString,
        referralCode: assignedCode,
        referredByCode: applicantReferredByCode.trim().toUpperCase() || undefined
      };

      setJoinees(prev => [newApplication, ...prev]);
      setFormSubmitted(true);
    }, 1800);
  };

  // Reset applicant form
  const resetApplicantForm = () => {
    setApplicantName("");
    setApplicantPlate("");
    setApplicantAadhaar("");
    setApplicantDL("");
    setApplicantRC("");
    setApplicantReferredByCode("");
    setAssignedReferralCode("");
    setAadhaarFile(null);
    setAadhaarFileName("");
    setDlFile(null);
    setDlFileName("");
    setRcFile(null);
    setRcFileName("");
    setPaymentUpiId("");
    setPaymentBankRef("");
    setSelectedPayMethod('card');
    setShowCheckout(false);
    setPaymentSuccess(false);
    setFormSubmitted(false);
  };

  // Admin Verification Login
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdminLoggedIn(true);
      setAdminError("");
    } else {
      setAdminError("Invalid authorization code. Developer hint: enter 'admin123'");
    }
  };

  const handleAdminVerify = (joinId: string, status: 'verified' | 'rejected') => {
    // Update application
    setJoinees(prev => prev.map(j => {
      if (j.id === joinId) {
        return { ...j, documentStatus: status };
      }
      return j;
    }));

    // If verified, generate a new active Driver partner in systemic memory
    if (status === 'verified') {
      const app = joinees.find(j => j.id === joinId);
      if (app) {
        const matchingVehicle = VEHICLES.find(v => v.id === app.vehicleId) || VEHICLES[0];
        const newDriver: Driver = {
          id: `drv_${Date.now()}`,
          name: app.name,
          avatar: app.vehicleId === "2wheeler" 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=120&auto=format&fit=crop",
          rating: 5.0,
          tripsCount: 0,
          vehicleNumber: app.vehicleNumber,
          currentLat: 19.0760, // Central Mumbai
          currentLng: 72.8777,
          referralCode: app.referralCode,
          referredByCode: app.referredByCode,
          walletBalance: 150 // Initial starting deposit
        };

        setDriversList(prev => {
          let list = [...prev];
          // If they were referred by a code, find the referrer driver and add ₹250 wallet credit!
          if (app.referredByCode) {
            list = list.map(d => {
              if (d.referralCode && d.referralCode === app.referredByCode) {
                setToastMessage(`🎉 Referral Successful! ₹250 credited to ${d.name}'s wallet.`);
                setTimeout(() => setToastMessage(""), 4500);
                return {
                  ...d,
                  walletBalance: (d.walletBalance || 0) + 250
                };
              }
              return d;
            });
          }
          return [...list, newDriver];
        });
        
        setSelectedDriverId(newDriver.id); // Default to newly onboarded driver
      }
    }
  };

  return (
    <div id="driver-console" className="space-y-6 relative">
      
      {/* Toast Alert overlay notifications */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] bg-emerald-600 border border-emerald-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Sliding Navigation Drawer from Left (Porter Style Sidebar) */}
      {isDrawerOpen && (
        <>
          <div 
            onClick={() => setIsDrawerOpen(false)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[80] cursor-pointer"
          />
          <div className="fixed top-0 left-0 w-[290px] h-full bg-white shadow-2xl z-[90] flex flex-col p-6 overflow-y-auto animate-slideInLeft text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-500 text-sm tracking-widest uppercase">SWIFTPORT</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">DRIVER APP</span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition text-slate-500 hover:text-slate-900 border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile overview inside drawer */}
            {activeDriver && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-orange-400 border border-slate-800 shadow-sm relative">
                  {activeDriver.name.charAt(0)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{activeDriver.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{activeDriver.vehicleNumber}</p>
                </div>
              </div>
            )}

            {/* Drawer Items list matching Screenshot 3 */}
            <div className="space-y-2.5 flex-1">
              <button
                onClick={() => { setConsoleTab("earnings"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "earnings" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Earnings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setConsoleTab("payouts"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "payouts" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Ledger & Payouts</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setConsoleTab("active"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "active" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Jobs Board</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setConsoleTab("onboard"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "onboard" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Join Partner</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setConsoleTab("profile"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "profile" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Profile & Bank Details</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setConsoleTab("admin"); setIsDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${consoleTab === "admin" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Admin Verification</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="border-t border-slate-100 pt-3 mt-4 space-y-1">
                <div className="flex items-center gap-2.5 py-1 px-3 text-[10px] text-slate-400">
                  <GraduationCap className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Simulated Training Complete</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 px-3 text-[10px] text-slate-400">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  <span>Refer & Earn Code: <strong className="text-orange-500 font-mono">{activeDriver ? (activeDriver.referralCode || "SWIFTPORT500") : "SWIFTPORT500"}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 py-1 px-3 text-[10px] text-slate-400">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Privacy Policy Verified</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono">App Version 5.151.0</span>
            </div>
          </div>
        </>
      )}
      
      {/* Rider Header Bar with Hamburger and click-to-profile Rider name */}
      {currentRoleMode === 'rider' ? (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          {/* Three Lines Hamburger Menu */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white hover:text-orange-400 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0 border border-slate-700/60 active:scale-95 group"
            title="Open Rider Drawer Menu"
          >
            <Menu className="w-4 h-4 text-orange-400 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline text-slate-100 group-hover:text-orange-400">Menu</span>
          </button>

          {/* Clickable Rider Name profile entry */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Active Partner Profile</span>
              <button
                type="button"
                onClick={() => setConsoleTab("profile")}
                className="font-black text-slate-100 hover:text-orange-400 text-sm transition hover:underline cursor-pointer flex items-center gap-1.5 focus:outline-none justify-end w-full"
                title="Navigate to profile and identity settings"
              >
                <span>{activeDriver?.name || "Ramesh Shinde"}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-extrabold font-mono">
                  ★{activeDriver?.rating || "4.8"}
                </span>
              </button>
            </div>
            
            {activeDriver?.avatar ? (
              <button
                type="button"
                onClick={() => setConsoleTab("profile")}
                className="w-10 h-10 rounded-full border-2 border-orange-500/60 bg-slate-950 overflow-hidden shadow-md focus:outline-none cursor-pointer transition hover:scale-105 active:scale-95 relative"
                title="View partner documents"
              >
                <img 
                  referrerPolicy="no-referrer"
                  src={activeDriver.avatar} 
                  alt={activeDriver.name} 
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConsoleTab("profile")}
                className="w-10 h-10 rounded-full border-2 border-orange-500/60 bg-orange-500/10 flex items-center justify-center font-black text-orange-400 shrink-0 shadow-md transition hover:scale-105 active:scale-95"
              >
                {activeDriver ? activeDriver.name.charAt(0) : "R"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tab select switcher bar for Admin console */
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-250 p-1 rounded-xl bg-slate-200 border border-slate-350 shrink-0 select-none overflow-x-auto gap-1 flex-1">
            <button
              onClick={() => setConsoleTab("admin")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                consoleTab === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Admin Verification
              {joinees.some(j => j.documentStatus === "pending") && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => setConsoleTab("payouts")}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                consoleTab === "payouts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
              }`}
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />
              Approve Withdrawals
              {withdrawalRequests.some(w => w.status === "pending") && (
                <span className="bg-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full leading-none animate-pulse">
                  {withdrawalRequests.filter(w => w.status === "pending").length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: ACTIVE JOBS BOARD */}
      {consoleTab === "active" && (
        <div className="space-y-6">
          {/* Beautiful 2-column mobile and simulator admin board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Premium Simulated Mobile Smartphone Viewport */}
            {currentRoleMode !== 'rider' && (
              <div className="lg:col-span-5 xl:col-span-4 flex justify-center w-full">
                <SwiftPortPhoneMockup
                  activeDriver={activeDriver}
                  pendingOrders={pendingOrders}
                  todayEarnings={totalRevenue}
                  onAcceptOrder={onAcceptOrder}
                  onUpdateStatus={onUpdateStatus}
                  onCancelOrder={onCancelOrder}
                  isSuspended={isSuspended}
                  getSuspensionTimeRemaining={getSuspensionTimeRemaining}
                  onLiftSuspension={onLiftSuspension}
                  updateActiveDriver={updateActiveDriver}
                  setConsoleTab={setConsoleTab}
                  setToastMessage={setToastMessage}
                />
              </div>
            )}

            {/* Right Column: Simulator Desk Control Panel, Balance ledger and account utilities */}
            <div className={`${currentRoleMode === 'rider' ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'} space-y-6 w-full`}>
              {/* Account Switcher Widget */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg select-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/30 text-orange-400 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-100 text-sm">
                        {currentRoleMode === 'rider' ? "Rider Account Status" : "Simulator Desk Control Centre"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {currentRoleMode === 'rider' 
                          ? "Direct portal monitoring of your live wallet ledger and compliant active status." 
                          : "Switch between different mock drivers to observe real-time dispatch matching."}
                      </p>
                    </div>
                  </div>

                  {currentRoleMode !== 'rider' && (
                    <div className="bg-slate-800 border border-slate-700/60 p-2 rounded-2xl flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-400 uppercase tracking-wider font-extrabold shrink-0 pl-1">
                        Active Rider:
                      </span>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="bg-slate-950 text-orange-400 font-bold border border-slate-700 text-xs px-2.5 py-1 rounded-xl focus:outline-none cursor-pointer max-w-[210px]"
                      >
                        {driversList.map((d, idx) => (
                          <option key={`${d.id}_${idx}`} value={d.id}>
                            {d.name} ({d.vehicleNumber.slice(0, 8)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quick Info Alerts metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40 flex justify-between items-center gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Passbook Balance</span>
                      <p className={`text-xs sm:text-sm font-black mt-1 ${activeDriver && activeDriver.walletBalance < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-450 text-emerald-400'}`}>
                        ₹{activeDriver?.walletBalance ?? 0}
                      </p>
                    </div>
                    {activeDriver && (
                      <button
                        type="button"
                        onClick={() => setShowRiderRecharge(prev => !prev)}
                        className={`font-extrabold px-2 py-1 rounded-lg text-[9px] transition cursor-pointer shrink-0 leading-none ${
                          activeDriver.walletBalance < 0 
                            ? 'bg-rose-600 text-white hover:bg-rose-550' 
                            : 'bg-orange-500 text-white hover:bg-orange-450'
                        }`}
                      >
                        {showRiderRecharge ? "Close" : "Recharge"}
                      </button>
                    )}
                  </div>
                  <div className="bg-[#1e1b4b]/40 p-3 rounded-xl border border-indigo-900/30">
                    <span className="text-[9px] text-indigo-400 block uppercase font-bold tracking-wider">Today's Earnings</span>
                    <p className="text-sm font-black text-indigo-300 mt-1">₹{totalRevenue}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40 flex justify-between items-center gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Driver Status</span>
                      <p className="text-xs sm:text-xs font-black mt-1 text-[#ea580c]">
                        {activeDriver?.isOffline ? "⚪ Offline" : "🟢 Online"}
                      </p>
                    </div>
                    {activeDriver && (
                      <button
                        type="button"
                        onClick={() => updateActiveDriver({ isOffline: !activeDriver.isOffline })}
                        className={`font-black px-2 py-1 rounded-lg text-[9px] transition cursor-pointer shrink-0 leading-none ${
                          activeDriver.isOffline 
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                            : 'bg-[#ff3b5c] text-white hover:bg-red-650 hover:bg-red-500'
                        }`}
                      >
                        {activeDriver.isOffline ? 'Go Online' : 'Go Offline'}
                      </button>
                    )}
                  </div>
                  <div className="bg-[#450a0a]/30 p-3 rounded-xl border border-red-900/20">
                    <span className="text-[9px] text-red-400 block uppercase font-bold tracking-wider">Account Standing</span>
                    <p className="text-sm font-black mt-1 text-red-300">
                      {isSuspended ? "🔴 Blocked" : "🟢 Active"}
                    </p>
                  </div>
                </div>

                {/* Direct Integrated Interactive Wallet Recharge Segment */}
                {activeDriver && (showRiderRecharge || activeDriver.walletBalance < 0) && (
                  <div className="mt-4 p-4.5 bg-slate-950 border border-orange-500/20 rounded-2xl animate-fadeIn space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                          <CreditCard className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <span className="text-xs font-extrabold text-orange-400 uppercase tracking-widest">
                          {activeDriver.walletBalance < 0 ? "🚨 Negative Balance Top-up Required" : "Instant Wallet Recharge (Simulated)"}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Secure UPI Portal</span>
                    </div>

                    {activeDriver.walletBalance < 0 && (
                      <p className="text-[11px] text-rose-350 text-rose-400 leading-relaxed font-medium pl-1">
                        Your rider passbook balance has slipped below zero (<strong>₹{activeDriver.walletBalance}</strong>) which blocks active order assignment. Please enter an amount to instantly clear your outstanding balance.
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap pl-1 mb-1">
                      {["100", "250", "500", "1000"].map((amt) => (
                        <button
                          key={`recharge-${amt}`}
                          type="button"
                          onClick={() => setRiderRechargeInput(amt)}
                          className={`bg-slate-900 border text-[10px] font-bold py-1.5 px-3.5 rounded-xl transition cursor-pointer active:scale-95 ${
                            riderRechargeInput === amt 
                              ? "border-orange-500 text-orange-400" 
                              : "border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-slate-500 text-xs font-mono">₹</span>
                        <input
                          type="number"
                          value={riderRechargeInput}
                          onChange={(e) => setRiderRechargeInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-550/20 rounded-xl py-2 pl-7 pr-3 text-xs font-mono text-white focus:outline-none"
                          placeholder="Recharge Amount"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const amount = parseInt(riderRechargeInput, 10);
                          if (!amount || amount <= 0) {
                            if (setToastMessage) setToastMessage("Please enter a valid amount!");
                            return;
                          }
                          updateActiveDriver({
                            walletBalance: (activeDriver.walletBalance || 0) + amount,
                            walletTransactions: [
                              {
                                id: `tx_recharge_${Date.now()}`,
                                amount,
                                desc: `Dashboard UPI Wallet Recharge`,
                                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' today'
                              },
                              ...(activeDriver.walletTransactions || [])
                            ]
                          });
                          if (setToastMessage) {
                            setToastMessage(`Success! Recharged ₹${amount} into passbook wallet.`);
                          }
                          setShowRiderRecharge(false);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black px-4.5 py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer leading-none"
                      >
                        Recharge Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet payout and history panel */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-sm text-slate-850">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-500 animate-pulse" />
                      Partner Cash Payout Terminal
                    </h4>
                    <p className="text-xs text-slate-500">Request currency cash out from driver's available passbook ledger.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawAmount(activeDriver?.walletBalance && activeDriver.walletBalance > 0 ? Math.min(500, activeDriver.walletBalance) : 100);
                      setIsWithdrawOpen(prev => !prev);
                    }}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250 px-3 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1.5 cursor-pointer leading-none active:scale-95"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    {isWithdrawOpen ? "Close Panel" : "Request Payout"}
                  </button>
                </div>

                {isWithdrawOpen && activeDriver && (
                  <div className="p-4 bg-slate-50/60 border border-slate-150 rounded-2xl space-y-3.5 animate-fadeIn text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Amount (Max ₹{activeDriver.walletBalance || 0})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={activeDriver.walletBalance || 0}
                          value={withdrawAmount}
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value), activeDriver.walletBalance || 0);
                            setWithdrawAmount(val || 0);
                          }}
                          className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setWithdrawType("upi")}
                            className={`py-2 px-3 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${withdrawType === 'upi' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                            UPI Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setWithdrawType("bank")}
                            className={`py-2 px-3 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${withdrawType === 'bank' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                            Bank Account
                          </button>
                        </div>
                      </div>
                    </div>

                    {withdrawType === 'upi' ? (
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Destination UPI Handle</label>
                        <input
                          type="text"
                          value={withdrawUpiId}
                          onChange={(e) => setWithdrawUpiId(e.target.value)}
                          placeholder="e.g. upi@okhdfc"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Account No"
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono"
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code"
                          value={withdrawIfsc}
                          onChange={(e) => setWithdrawIfsc(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-none font-mono uppercase"
                        />
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={withdrawBankName}
                          onChange={(e) => setWithdrawBankName(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {withdrawError && <p className="text-[10.5px] text-red-500 font-semibold">⚠️ {withdrawError}</p>}

                    <button
                      type="button"
                      onClick={() => handleCreateWithdrawalSubmit(activeDriver)}
                      className="w-full bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl transition cursor-pointer text-center text-xs uppercase tracking-wider"
                    >
                      Process Simulated Withdrawal
                    </button>
                  </div>
                )}

                {/* activeDriverRequests logs */}
                {activeDriverRequests.length > 0 ? (
                  <div className="mt-3.5 space-y-2 max-h-28 overflow-y-auto pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Passbook withdrawal timeline</span>
                    {activeDriverRequests.map((req, idx) => (
                      <div key={`${req.id}-${idx}`} className="bg-slate-50 p-2.5 rounded-xl flex justify-between items-center text-[11px] border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-450 bg-slate-400"></span>
                          <span>Requested ₹{req.amount} via {req.paymentType}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-bold capitalize">
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No recent cash payouts requested from this driver's wallet passbook yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Active profile selector card */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl text-white hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/30 text-orange-400">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">Simulated Partner Desk</h3>
                  <p className="text-[11px] text-slate-400">View live shipping dispatches and update coordinates status.</p>
                </div>
              </div>

              {/* Selector to choose which courier you are riding as */}
              <div className="bg-slate-800 border border-slate-700/60 p-2.5 rounded-2xl flex items-center gap-2">
                <span className="text-[10px] text-slate-404 text-slate-400 uppercase tracking-widest font-black shrink-0 pl-1">
                  Active Driver:
                </span>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="bg-slate-950 text-orange-400 font-bold border border-slate-700 text-xs px-2 py-1 rounded-xl focus:outline-none cursor-pointer max-w-[180px]"
                >
                  {driversList.map((d, idx) => (
                    <option key={`${d.id}_${idx}`} value={d.id}>
                      {d.name} ({d.vehicleNumber.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Statistics overview */}
            {activeDriver && (
              <>
                <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 mt-4 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Courier Vehicle</span>
                    <p className="font-extrabold text-orange-400 overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">{activeDriver.vehicleNumber}</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Lifetime rating</span>
                    <p className="font-extrabold text-yellow-400 mt-0.5">★ {activeDriver.rating}</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Net Earnings (80%)</span>
                    <p className="font-black text-emerald-400 mt-0.5 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      {totalRevenue}
                    </p>
                    <span className="text-[8px] text-slate-400 block mt-0.5">(20% platform cut applied)</span>
                  </div>
                </div>

                {/* Suspension Active Badge or Cancellations Warning metrics */}
                {isSuspended ? (
                  <div className="mt-4 p-4 bg-rose-950/65 border border-rose-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-pulse">
                    <div className="flex gap-2.5 items-start">
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black uppercase tracking-wider text-rose-400">🚨 Temporary Partner Suspension Active</p>
                        <p className="text-[11px] text-rose-300 mt-0.5">
                          You are locked from accepting booking contracts for 1 hour for cancelling 3+ accepted matches.
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Cooldown Timer: <span className="font-bold text-rose-300">{getSuspensionTimeRemaining(activeDriver.suspendedUntil!)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLiftSuspension(activeDriver.id)}
                      className="shrink-0 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700 font-bold px-3 py-1.5 rounded-xl transition text-[10px] cursor-pointer"
                    >
                      ⚡ Bypass suspension
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-slate-950/40 border border-slate-800/50 rounded-2xl flex items-center justify-between gap-2 text-[10.5px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <p>
                        Daily Cancellation Standing: <span className="font-bold text-slate-200">{activeDriver.cancellationsToday || 0} / 3</span> accepted bookings cancelled.
                      </p>
                    </div>
                    <span className="text-[9px] bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40 text-[9px] uppercase font-mono text-slate-500">
                      Exceeding 3 limits sets 1-hour block penalty
                    </span>
                  </div>
                )}

                {/* Simulated Driver Wallet Balance and Withdraw option */}
                <div className="mt-5 border-t border-slate-800/80 pt-4 text-xs">
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/60 rounded-2xl p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                          Simulated Partner Wallet Balance
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-emerald-400 flex items-center">
                            <IndianRupee className="w-6 h-6 stroke-[3]" />
                            {activeDriver.walletBalance || 0}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">INR available</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Platform takes 20% commission on Cash orders (deducted from wallet) and pays out 80% on Online Orders (credited to wallet).
                        </p>
                      </div>

                      {/* Request cash payout button */}
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(activeDriver.walletBalance && activeDriver.walletBalance > 0 ? Math.min(500, activeDriver.walletBalance) : 0);
                          setIsWithdrawOpen(prev => !prev);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 active:scale-95"
                      >
                        <ArrowDownToLine className="w-4 h-4 shrink-0" />
                        {isWithdrawOpen ? "Close Payout Form" : "Request Payout"}
                      </button>
                    </div>

                    {/* Expandable withdrawal request form */}
                    {isWithdrawOpen && (
                      <div className="mt-4 border-t border-slate-800/80 pt-4 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <h5 className="font-extrabold text-slate-200 text-xs flex items-center gap-1.5">
                            🎁 Dispatch Withdrawal Request to Admin
                          </h5>
                          <span className="text-[8px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">New Form</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          The requested amount will be deducted from your wallet instantly and forwarded for Admin Verification. If the request is rejected, the amount is automatically refunded.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Withdraw Amount (Max ₹{activeDriver.walletBalance || 0})
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={activeDriver.walletBalance || 0}
                              value={withdrawAmount}
                              onChange={(e) => {
                                const val = Math.min(Number(e.target.value), activeDriver.walletBalance || 0);
                                setWithdrawAmount(val || 0);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                              placeholder="E.g. 500"
                            />
                            {withdrawError && (
                              <p className="text-[10px] text-rose-400 font-medium mt-1">⚠️ {withdrawError}</p>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Withdraw Method
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setWithdrawType('upi')}
                                className={`py-2 px-3 rounded-lg border text-center font-bold text-xs cursor-pointer transition ${
                                  withdrawType === 'upi'
                                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                UPI ID (Instant)
                              </button>
                              <button
                                type="button"
                                onClick={() => setWithdrawType('bank')}
                                className={`py-2 px-3 rounded-lg border text-center font-bold text-xs cursor-pointer transition ${
                                  withdrawType === 'bank'
                                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                Bank Transfer
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Fields based on type */}
                        {withdrawType === 'upi' ? (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Verify UPI Address String
                            </label>
                            <input
                              type="text"
                              value={withdrawUpiId}
                              onChange={(e) => setWithdrawUpiId(e.target.value)}
                              placeholder="e.g. name@okhdfcbank"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Bank Account Number
                              </label>
                              <input
                                type="text"
                                value={withdrawAccount}
                                onChange={(e) => setWithdrawAccount(e.target.value)}
                                placeholder="918020XXXXXXXX"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                IFSC Code
                              </label>
                              <input
                                type="text"
                                value={withdrawIfsc}
                                onChange={(e) => setWithdrawIfsc(e.target.value)}
                                placeholder="HDFC0000104"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                value={withdrawBankName}
                                onChange={(e) => setWithdrawBankName(e.target.value)}
                                placeholder="HDFC Bank"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCreateWithdrawalSubmit(activeDriver)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-3 rounded-xl transition text-xs shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer block text-center uppercase tracking-wider"
                        >
                          Submit Cash Transfer Request (₹{withdrawAmount})
                        </button>
                      </div>
                    )}

                    {/* Driver's personal withdrawal log history */}
                    {activeDriverRequests.length > 0 && (
                      <div className="mt-4 border-t border-slate-800/80 pt-3">
                        <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckSquare2 className="w-3.5 h-3.5 text-emerald-500" />
                          Your Payout Requests status logs
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {activeDriverRequests.map((req, idx) => (
                            <div key={`${req.id}_${idx}`} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center text-[11px] gap-2">
                              <div>
                                <p className="font-bold text-slate-200">
                                  ₹{req.amount} via {req.paymentType === 'upi' ? 'UPI' : 'Bank'}
                                </p>
                                <p className="text-[9px] text-slate-500 mt-0.5">
                                  Request ID: {req.id.toUpperCase()} • Created on {req.createdAt}
                                </p>
                                {req.paymentType === 'upi' ? (
                                  <p className="text-[9px] text-slate-400">UPI Address: {req.upiId}</p>
                                ) : (
                                  <p className="text-[9px] text-slate-400">
                                    Account: {req.accountNumber} ({req.bankName})
                                  </p>
                                )}
                              </div>

                              <div className="text-right">
                                <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  req.status === 'approved' 
                                    ? 'bg-emerald-950 text-emerald-405 text-emerald-400 border border-emerald-800/40' 
                                    : req.status === 'rejected' 
                                    ? 'bg-rose-950 text-rose-405 text-rose-400 border border-rose-800/40' 
                                    : 'bg-orange-950/80 text-orange-404 text-orange-400 border border-orange-850/40 animate-pulse'
                                }`}>
                                  {req.status}
                                </span>
                                {req.processedAt && (
                                  <p className="text-[8px] text-slate-500 font-mono mt-1">Settle: {req.processedAt}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collapsible Wallet Ledger History Panel matching 'DEDUCTION SHOULD ALSO BE SHOULD IN WALLET' */}
                    <div className="mt-4 border-t border-slate-800/80 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsLedgerOpen(prev => !prev)}
                        className="flex items-center justify-between w-full text-left text-[11px] font-bold text-slate-400 hover:text-slate-200 transition focus:outline-none cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-emerald-500" />
                          View Wallet Transaction Passbook ({activeDriver.walletTransactions?.length || 0} entries)
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isLedgerOpen ? 'rotate-90': ''}`} />
                      </button>

                      {isLedgerOpen && (
                        <div className="mt-2.5 max-h-[180px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/20">
                          {(!activeDriver.walletTransactions || activeDriver.walletTransactions.length === 0) ? (
                            <p className="text-[10px] text-slate-500 italic py-2 text-center">No transactions recorded in passbook ledger.</p>
                          ) : (
                            activeDriver.walletTransactions.map((tx, idx) => (
                              <div key={`${tx.id || 'tx'}_${idx}`} className="pt-2 flex justify-between items-start gap-3 text-[10.5px]">
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-200 leading-tight">{tx.desc}</p>
                                  <span className="text-[8.5px] text-slate-500 font-mono block">{tx.timestamp}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`font-mono font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-450 text-rose-400'}`}>
                                    {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                                  </span>
                                  <span className="text-[7.5px] text-slate-500 block uppercase font-mono tracking-wider">{tx.type.replace('_', ' ')}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time Rider Incentive Alert Dashboard Tracker */}
          {activeIncentive && activeIncentive.isActive && activeDriver && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-200/40 rounded-3xl p-5 shadow-sm space-y-3.5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black tracking-widest text-orange-700 uppercase flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-orange-500" />
                      Live Transit Incentive Alert
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">
                    Earn an extra <span className="text-emerald-600 font-black">₹{activeIncentive.rewardAmount}</span> bonus reward today!
                  </h4>
                  <p className="text-[11.5px] text-slate-650 leading-relaxed text-slate-600">
                    {activeIncentive.description}
                  </p>
                </div>
                <div className="bg-emerald-500 hover:scale-105 transition-transform text-white px-3.5 py-2.5 rounded-2xl text-center shrink-0 shadow-lg shadow-emerald-500/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-90">Bonus</span>
                  <span className="text-md font-black block font-mono">₹{activeIncentive.rewardAmount}</span>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const sessionCount = pendingOrders.filter(
                  o => o.status === 'delivered' && o.driver?.id === activeDriver.id
                ).length;
                const achieved = sessionCount >= activeIncentive.targetTrips;
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Your Completed Trips Today: {sessionCount} / {activeIncentive.targetTrips}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {achieved ? "Completed!" : `${Math.max(0, activeIncentive.targetTrips - sessionCount)} trips to go`}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          achieved 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : 'bg-gradient-to-r from-orange-400 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (sessionCount / activeIncentive.targetTrips) * 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Status Indicator */}
                    {achieved ? (
                      <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl text-center text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 mt-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        Congratulations! You have unlocked your ₹{activeIncentive.rewardAmount} incentive bonus (Dispatched to your wallet ledger).
                      </div>
                    ) : (
                      <p className="text-[10.5px] italic text-slate-500 pl-0.5 mt-1.5">
                        *Tip: Complete dispatches accepted from the board. Rates are calculated dynamically.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Pending Dispatches */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-2 pl-1">
              <Bell className="w-4 h-4 text-orange-500 shrink-0" />
              Live Shipments Near Your Selected Coordinates
            </h4>

            {pendingOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 space-y-2 shadow-sm">
                <TrendingUp className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold">No active cargo dispatches searching</p>
                <p className="text-xs text-slate-400">Go to **"Book & Track"** tab, request shipping cargo, and watch them appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order, idx) => {
                  const isSearching = order.status === "searching";
                  const isAssigned = order.status === "assigned" && order.driver?.id === activeDriver?.id;
                  const isLoaded = order.status === "loaded" && order.driver?.id === activeDriver?.id;
                  const isTransit = order.status === "in_transit" && order.driver?.id === activeDriver?.id;
                  const isDelivered = order.status === "delivered" && order.driver?.id === activeDriver?.id;

                  // Order accepted by a DIFFERENT driver
                  const isOtherDriverJob = order.status !== "searching" && order.driver && order.driver?.id !== activeDriver?.id;

                  if (isOtherDriverJob) {
                    return (
                      <div key={`other-drv-${order.id}-${idx}`} className="bg-slate-100 border border-slate-200 rounded-3xl p-4 opacity-60 text-xs text-slate-500">
                        <p className="font-medium">
                          Order #{order.id.slice(4, 9).toUpperCase()} was acquired by contract partner <span className="font-bold text-slate-700">{order.driver?.name}</span> ({order.status})
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={`drv-card-${order.id}-${idx}`}
                      className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-orange-300 hover:shadow-md transition text-slate-800"
                    >
                      <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3 mb-3.5 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-mono">
                              ORDER #{order.id.slice(4, 9).toUpperCase()}
                            </span>
                            <span className="text-[10px] bg-orange-50 text-orange-600 font-mono border border-orange-200 px-2 py-0.5 rounded-full font-bold">
                              {order.vehicle.name}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mt-1.5 font-sans">
                            Cargo Pack: <span className="text-orange-600 font-bold">{order.cargoCategory}</span> ({order.weightEstimate} kg payload)
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-medium">Net Payout (80%)</p>
                          <p className="text-md font-extrabold text-emerald-600 font-mono">
                            ₹{Math.round(order.totalPrice * (1 - COMMISSION_PCT))}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">₹{order.totalPrice} gross fare</span>
                          <span className="text-[8px] text-orange-600 block font-semibold">(20% profit cut)</span>
                        </div>
                      </div>

                      {/* Route specs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Source Pickup</p>
                          <p className="font-bold text-orange-600">{order.pickup.name}</p>
                          <p className="text-[11.5px] text-slate-500 truncate">{order.pickup.address}</p>
                        </div>
                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Destination Drop</p>
                          <p className="font-bold text-slate-800">{order.dropoff.name}</p>
                          <p className="text-[11.5px] text-slate-500 truncate">{order.dropoff.address}</p>
                        </div>
                      </div>

                      {/* Operational buttons */}
                      <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-450 font-medium">Job Journey:</span>
                          <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold capitalize text-[10px] ${
                            isSearching 
                            ? "bg-orange-50 text-orange-600 border border-orange-200" 
                            : isDelivered
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-150"
                            : "bg-slate-100 text-slate-655 text-slate-700 border border-slate-250"
                          }`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {isSearching && (
                            isSuspended ? (
                              <button
                                type="button"
                                disabled
                                className="bg-slate-700 text-slate-400 font-bold px-4 py-2 rounded-xl text-xs leading-none cursor-not-allowed flex items-center gap-1 opacity-70"
                              >
                                🚫 Accepting Blocked (Suspended)
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAcceptOrder(order.id, activeDriver)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2 rounded-xl text-xs leading-none transition-all flex items-center gap-1 shadow-md shadow-orange-100 hover:shadow-orange-200 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                Accept Contract as {activeDriver?.name || "Driver"}
                              </button>
                            )
                          )}

                          {isAssigned && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order.id, "loaded")}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs leading-none transition cursor-pointer shadow-sm"
                            >
                              <CheckSquare className="w-3.5 h-3.5 inline mr-1" />
                              Cargo Loaded (At Site)
                            </button>
                          )}

                          {isLoaded && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order.id, "in_transit")}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-4 py-2 rounded-xl text-xs leading-none transition-all shadow-md shadow-orange-100 hover:shadow-orange-200 cursor-pointer flex items-center gap-1"
                            >
                              <Navigation className="w-3.5 h-3.5 rotate-45 fill-white" />
                              Start Shifting Transit
                            </button>
                          )}

                          {isTransit && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(order.id, "delivered")}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs leading-none transition-all shadow-md shadow-emerald-100 hover:shadow-emerald-200 cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5 inline mr-1" />
                              Confirm Delivery Complete
                            </button>
                          )}

                          {(isAssigned || isLoaded || isTransit) && (
                            <div className="w-full">
                              {cancelConfirmOrderId === order.id ? (
                                <div className="bg-rose-50 border border-rose-250 p-3.5 rounded-2xl space-y-2 mt-2 animate-fadeIn text-left text-[11px] text-rose-800">
                                  <div className="flex items-start gap-1.5 font-bold">
                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <span>Are you absolutely sure you want to forfeit?</span>
                                  </div>
                                  <p className="text-rose-600 leading-snug pl-5">
                                    A penalty of <span className="font-extrabold text-rose-800">₹150</span> will be instantly deducted from your partner wallet balance for forfeiting an ongoing matched contract. (Current cancellations today: {activeDriver.cancellationsToday || 0}/3)
                                  </p>
                                  <div className="flex gap-2 justify-end pl-5">
                                    <button
                                      type="button"
                                      onClick={() => setCancelConfirmOrderId(null)}
                                      className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-205 cursor-pointer leading-none transition"
                                    >
                                      No, Keep Order
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onCancelOrder(order.id, activeDriver.id);
                                        setCancelConfirmOrderId(null);
                                      }}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-xl cursor-pointer leading-none transition shadow shadow-rose-100"
                                    >
                                      Yes, Cancel & Pay ₹150
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setCancelConfirmOrderId(order.id)}
                                  className="bg-rose-50 border border-rose-220 hover:bg-rose-100 text-rose-650 text-rose-600 font-bold px-3.5 py-2 rounded-xl text-xs leading-none transition cursor-pointer"
                                  title="Cancel accepted delivery contract with ₹150 forfeit penalty"
                                >
                                  🔴 Cancel & Forfeit
                                </button>
                              )}
                            </div>
                          )}

                          {isDelivered && (
                            <span className="text-emerald-650 font-bold text-xs flex items-center gap-1">
                              ✓ Delivery Payout Claimed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BECOME A COURIER PARTNER (ONBOARDING & FEES) */}
      {consoleTab === "onboard" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              Become an On-Demand Delivery Partner!
            </h3>
            <p className="text-xs text-slate-500 mt-1 pl-0.5 leading-relaxed">
              Submit your document details to enroll as a professional transport operator. To maintain service integrity and verify background documents of vehicle owners, new **driver/rider partners** are charged a one-time onboarding fee of **₹100**. Please note: this fee is strictly applicable **only to driver/rider accounts**; customers and shipping clients are completely exempt.
            </p>
          </div>

          {!formSubmitted ? (
            <form onSubmit={triggerOpenCheckout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 focus:outline-none transition-colors"
                    placeholder="Enter your first & last name"
                  />
                </div>

                {/* Desired Vehicle Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    Select Fleet Vehicle class
                  </label>
                  <select
                    value={applicantVehicleId}
                    onChange={(e) => setApplicantVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="2wheeler">2-Wheeler (Scooter / Scooterette)</option>
                    <option value="3wheeler">3-Wheeler (Cargo Ape Auto)</option>
                    <option value="8ftace">8ft Tata Ace (Mini Truck)</option>
                    <option value="pickup">Bolero Pickup (Heavy Commercial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Plate Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    License Plate / Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantPlate}
                    onChange={(e) => setApplicantPlate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 uppercase focus:outline-none transition-colors"
                    placeholder="E.g., MH-02-EA-8841"
                  />
                </div>

                {/* Aadhaar Book Card Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    Aadhaar Identity Number (12 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={applicantAadhaar}
                    onChange={(e) => setApplicantAadhaar(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 focus:outline-none transition-colors"
                    placeholder="Enter 12-digit Aadhaar Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driving License Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    Driving License (DL) Number
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantDL}
                    onChange={(e) => setApplicantDL(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 focus:outline-none transition-colors"
                    placeholder="E.g., DL-1420110058814"
                  />
                </div>

                {/* Vehicle Registration Certificate (RC) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1">
                    Vehicle RC Number
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantRC}
                    onChange={(e) => setApplicantRC(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-750 focus:outline-none transition-colors font-mono"
                    placeholder="E.g., RC-MH02-990142"
                  />
                </div>

                {/* Optional Referral Code (Refer & Earn system) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase pl-1 block mb-1 flex items-center justify-between">
                    <span>Referred By Code</span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono font-medium lowercase">optional</span>
                  </label>
                  <input
                    type="text"
                    value={applicantReferredByCode}
                    onChange={(e) => setApplicantReferredByCode(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl p-3 text-xs font-semibold text-slate-750 focus:outline-none transition-colors font-mono"
                    placeholder="E.g., SWIFT-RAMESH99"
                  />
                </div>
              </div>

              {/* Document File uploading widgets */}
              <div className="space-y-3 bg-slate-55 p-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block pl-1">
                    Upload Digital KYCs & Documents
                  </h4>
                  <button
                    type="button"
                    onClick={handleQuickDemoAutoFill}
                    className="text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-600 font-extrabold px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-orange-100 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />
                    Quick Auto-Fill Demo Papers
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Aadhaar Card */}
                  <div 
                    type="button"
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      aadhaarFile 
                        ? "border-emerald-300 bg-emerald-50/20" 
                        : "border-slate-200 hover:border-orange-400 bg-slate-100/30 hover:bg-slate-100/50"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDocUpload('aadhaar', e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('aadhaar-file-input')?.click()}
                  >
                    <input 
                      id="aadhaar-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocUpload('aadhaar', e.target.files[0]);
                        }
                      }}
                    />
                    {aadhaarFile ? (
                      <div className="space-y-2 text-left">
                        {aadhaarFile === "PRESET_AADHAAR" ? (
                          <div className="h-20 bg-slate-100 border border-slate-200 rounded-lg flex flex-col justify-center items-center text-[10px] text-slate-500 relative overflow-hidden font-sans">
                            {/* Premium Simulated Aadhaar Graphic */}
                            <div className="absolute top-0 inset-x-0 bg-blue-600 h-1.5" />
                            <p className="font-extrabold text-[7px] text-slate-400 uppercase tracking-widest mt-1">GOVERNMENT OF INDIA</p>
                            <div className="flex items-center gap-2 mt-1 pl-2 pr-1 w-full">
                              <div className="w-6 h-7 bg-slate-300 border border-slate-200 rounded flex items-center justify-center font-bold text-slate-500 text-[8px] shrink-0">PHOTO</div>
                              <div className="text-left leading-none space-y-0.5 truncate">
                                <p className="font-extrabold text-[9px] text-slate-705 truncate">{applicantName || "Demo Partner"}</p>
                                <p className="text-[6.5px] text-slate-400">DOB: 12/04/1994 | Male</p>
                                <p className="font-mono text-[8px] font-black tracking-wider text-slate-600 mt-0.5">{applicantAadhaar.replace(/(\d{4})/g, "$1 ") || "XXXX XXXX XXXX"}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 bg-slate-150 border border-slate-250 rounded-lg relative overflow-hidden flex items-center justify-center">
                            <img src={aadhaarFile} alt="Aadhaar Card" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1 text-[10px] px-1">
                          <span className="text-slate-600 truncate font-semibold block max-w-[100px]">{aadhaarFileName}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAadhaarFile(null);
                              setAadhaarFileName("");
                            }}
                            className="text-rose-500 hover:text-rose-700 font-extrabold text-xs px-1 cursor-pointer"
                            title="Remove File"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="font-bold text-[11px] text-slate-700">Aadhaar Card Front</p>
                        <p className="text-[9px] text-slate-450 leading-tight">Drag & drop or Click to capture scan</p>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Driving License */}
                  <div 
                    type="button"
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      dlFile 
                        ? "border-emerald-300 bg-emerald-50/20" 
                        : "border-slate-200 hover:border-orange-400 bg-slate-100/30 hover:bg-slate-100/50"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDocUpload('dl', e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('dl-file-input')?.click()}
                  >
                    <input 
                      id="dl-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocUpload('dl', e.target.files[0]);
                        }
                      }}
                    />
                    {dlFile ? (
                      <div className="space-y-2 text-left">
                        {dlFile === "PRESET_DL" ? (
                          <div className="h-20 bg-emerald-50/50 border border-emerald-100 rounded-lg flex flex-col justify-center items-center text-[10px] text-slate-500 relative overflow-hidden font-sans">
                            <div className="absolute top-0 inset-x-0 bg-emerald-600 h-1.5" />
                            <p className="font-extrabold text-[7px] text-emerald-800 uppercase tracking-wider mt-1">UNION OF INDIA LICENSE</p>
                            <div className="flex items-center gap-2 mt-1 pl-2 pr-1 w-full">
                              <div className="w-6 h-7 bg-amber-100 border border-amber-200 rounded flex items-center justify-center font-bold text-slate-400 text-[8px] shrink-0">DL</div>
                              <div className="text-left leading-none space-y-0.5 truncate font-semibold">
                                <p className="font-extrabold text-[9px] text-slate-700 truncate">{applicantName || "Demo Partner"}</p>
                                <p className="text-[6.5px] text-slate-400">Class: LMV / MCWG</p>
                                <p className="font-mono text-[8px] font-black tracking-wider text-teal-850 mt-0.5">{applicantDL || "MH12-2015024"}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 bg-slate-150 border border-slate-250 rounded-lg relative overflow-hidden flex items-center justify-center">
                            <img src={dlFile} alt="Driving License" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1 text-[10px] px-1">
                          <span className="text-slate-600 truncate font-semibold block max-w-[100px]">{dlFileName}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDlFile(null);
                              setDlFileName("");
                            }}
                            className="text-rose-500 hover:text-rose-700 font-extrabold text-xs px-1 cursor-pointer"
                            title="Remove File"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="font-bold text-[11px] text-slate-700">Driving License (DL)</p>
                        <p className="text-[9px] text-slate-450 leading-tight">Drag & drop or Click to capture scan</p>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Registration Certificate */}
                  <div 
                    type="button"
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      rcFile 
                        ? "border-emerald-300 bg-emerald-50/20" 
                        : "border-slate-200 hover:border-orange-400 bg-slate-100/30 hover:bg-slate-100/50"
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDocUpload('rc', e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById('rc-file-input')?.click()}
                  >
                    <input 
                      id="rc-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDocUpload('rc', e.target.files[0]);
                        }
                      }}
                    />
                    {rcFile ? (
                      <div className="space-y-2 text-left">
                        {rcFile === "PRESET_RC" ? (
                          <div className="h-20 bg-indigo-50/50 border border-indigo-100 rounded-lg flex flex-col justify-center items-center text-[10px] text-slate-500 relative overflow-hidden font-sans">
                            <div className="absolute top-0 inset-x-0 bg-indigo-600 h-1.5" />
                            <p className="font-extrabold text-[7px] text-indigo-800 uppercase tracking-widest mt-1">RC BOOK FORM 23</p>
                            <div className="flex items-center gap-2 mt-1 pl-2 pr-1 w-full">
                              <div className="w-6 h-7 bg-indigo-100 border border-indigo-200 rounded flex items-center justify-center font-bold text-indigo-400 text-[8px] shrink-0">RC</div>
                              <div className="text-left leading-none space-y-0.5 truncate font-semibold">
                                <p className="text-[6.5px] text-slate-500">Owner: <span className="font-bold text-slate-750">{applicantName || "Demo Partner"}</span></p>
                                <p className="text-[6.5px] text-slate-450">PLATE: {applicantPlate || "MH-12-EA-xxxx"}</p>
                                <p className="font-mono text-[8px] font-black tracking-wider text-indigo-750 mt-0.5">{applicantRC || "MH23-RC-ID"}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 bg-slate-150 border border-slate-250 rounded-lg relative overflow-hidden flex items-center justify-center">
                            <img src={rcFile} alt="Registration Certificate" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1 text-[10px] px-1">
                          <span className="text-slate-600 truncate font-semibold block max-w-[100px]">{rcFileName}</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRcFile(null);
                              setRcFileName("");
                            }}
                            className="text-rose-500 hover:text-rose-700 font-extrabold text-xs px-1 cursor-pointer"
                            title="Remove File"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="font-bold text-[11px] text-slate-700">Vehicle RC Booklet</p>
                        <p className="text-[9px] text-slate-450 leading-tight">Drag & drop or Click to capture scan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload checklist guide */}
              <div className="bg-orange-50/60 p-4 border border-orange-100 rounded-2xl text-xs space-y-2 text-slate-700">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  Fleet Document Integrity Terms
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center gap-1 font-medium text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" /> Aadhaar Validated
                  </div>
                  <div className="flex items-center gap-1 font-medium text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" /> Driving License (LVM)
                  </div>
                  <div className="flex items-center gap-1 font-medium text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" /> RC Book matching
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition active:scale-[0.98] cursor-pointer duration-150 flex items-center justify-center gap-2"
                >
                  Proceed to Pay Joining Fee & Submit
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-2 border-emerald-300">
                <CheckCircle className="w-8 h-8 fill-emerald-100" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-800">Application Lodged Successfully!</h4>
                <p className="text-xs text-slate-500">
                  We have received your document dossier along with the ₹100 registration fee.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-100 rounded-xl text-left text-xs space-y-2 max-w-sm mx-auto font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-slate-700">{applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RC Number:</span>
                  <span className="font-bold text-slate-705">{applicantRC.toUpperCase()}</span>
                </div>
                {assignedReferralCode && (
                  <div className="bg-orange-50 text-orange-950 p-2.5 rounded-lg border border-orange-100 mt-2">
                    <p className="text-[9px] text-orange-650 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Gift className="w-3.5 h-3.5 animate-bounce text-orange-500" />
                      Your Auto-Assigned Code:
                    </p>
                    <p className="font-black text-sm tracking-widest text-orange-600 font-mono text-center">{assignedReferralCode}</p>
                    <p className="text-[8px] text-slate-400 text-center leading-tight mt-1 font-sans">Share this identifier for unlimited future earnings!</p>
                  </div>
                )}
                {applicantReferredByCode && (
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 leading-none">
                    <span className="text-slate-400">Referred By:</span>
                    <span className="font-bold text-slate-600 font-mono">{applicantReferredByCode.trim().toUpperCase()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-slate-100 pt-1.5 leading-none">
                  <span className="text-slate-400">Joining Fees:</span>
                  <span className="text-emerald-600">₹100 (PAID)</span>
                </div>
                <div className="flex justify-between text-[11px] border-t border-slate-100 pt-1.5 font-bold">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-orange-600 uppercase">Pending Admin Verification</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-[10px] text-slate-400 italic">
                  Tip: Log into the **"Admin Verification"** tab at the top using PIN `admin123` to instantly review, verify, and approve this application credentials!
                </p>
                <button
                  onClick={resetApplicantForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          )}

          {/* Secure gateway checkout payment slider panel overlay */}
          {showCheckout && !paymentSuccess && (
            <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-5 animate-scaleIn">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">Secure Payment Terminal</h4>
                      <p className="text-[10px] text-slate-500">Verified SwiftPort Gateway</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs p-1 font-bold bg-slate-50 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

                <div className="bg-slate-55 mb-2 bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-xs text-slate-700 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">FEES TYPE</span>
                    <span className="font-bold text-slate-800">One-time Joining spam barrier fee</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">TOTAL CHARGE</span>
                    <span className="font-black text-emerald-600 text-sm">₹100.00</span>
                  </div>
                </div>

                {/* Payment method selector tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('card')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${selectedPayMethod === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('upi')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${selectedPayMethod === 'upi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>UPI ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('qr_code')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${selectedPayMethod === 'qr_code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-500" />
                    <span>Scan QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('bank_transfer')}
                    className={`py-2 px-1 rounded-xl text-[10px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${selectedPayMethod === 'bank_transfer' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Transfer</span>
                  </button>
                </div>

                {/* Sub-form fields according to pay method */}
                <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                  {/* Method 1: CREDIT/DEBIT CARDS */}
                  {selectedPayMethod === 'card' && (
                    <div className="space-y-3 text-xs animate-fadeIn">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">Cardholder Name</label>
                        <input
                          type="text"
                          required={selectedPayMethod === 'card'}
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-orange-500"
                          placeholder="E.g., Siddhant Pitale"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">Card Number</label>
                        <input
                          type="text"
                          required={selectedPayMethod === 'card'}
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-orange-500"
                          placeholder="4111 2222 3333 4444"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">Expiry Date</label>
                          <input
                            type="text"
                            required={selectedPayMethod === 'card'}
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">Security CVV</label>
                          <input
                            type="password"
                            required={selectedPayMethod === 'card'}
                            maxLength={3}
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Method 2: UPI INTEGRATION */}
                  {selectedPayMethod === 'upi' && (
                    <div className="space-y-3.5 text-xs animate-fadeIn">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">Virtual Payment Address (UPI ID)</label>
                        <div className="relative">
                          <input
                            type="text"
                            required={selectedPayMethod === 'upi'}
                            value={paymentUpiId}
                            onChange={(e) => setPaymentUpiId(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 pl-8 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-emerald-500"
                            placeholder="e.g., siddhant@okhdfcbank"
                          />
                          <div className="absolute left-3 top-3 text-[11px] text-emerald-600 font-extrabold font-mono">@</div>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 pl-1 leading-normal">Popular handles: @okhdfcbank, @paytm, @ybl, @sbi, @icici</p>
                      </div>
                      
                      <div className="bg-emerald-50/55 border border-emerald-100 rounded-xl p-3 flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10.5px] text-emerald-800 leading-normal">
                          A checkout request of <strong>₹100</strong> will be triggered instantly to your mobile app client.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Method 3: QR CODE SCANNERS */}
                  {selectedPayMethod === 'qr_code' && (
                    <div className="space-y-4 text-xs animate-fadeIn text-center">
                      <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col items-center shadow-inner">
                        {/* Dynamic Styled BHIM QR Code SVG */}
                        <div className="w-32 h-32 bg-white p-2 border border-slate-150 rounded-xl flex items-center justify-center relative group">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                            {/* Mock QR matrix outlines */}
                            <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                            <rect x="5" y="5" width="20" height="20" fill="white" />
                            <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                            <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                            <rect x="75" y="5" width="20" height="20" fill="white" />
                            <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                            <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                            <rect x="5" y="75" width="20" height="20" fill="white" />
                            <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                            {/* Random QR noise dots */}
                            <rect x="35" y="5" width="10" height="10" fill="currentColor" />
                            <rect x="40" y="20" width="5" height="10" fill="currentColor" />
                            <rect x="55" y="10" width="12" height="6" fill="currentColor" />
                            <rect x="45" y="35" width="8" height="8" fill="currentColor" />
                            <rect x="15" y="45" width="15" height="5" fill="currentColor" />
                            <rect x="80" y="40" width="10" height="15" fill="currentColor" />
                            <rect x="75" y="60" width="15" height="8" fill="currentColor" />
                            <rect x="50" y="50" width="20" height="20" fill="currentColor" />
                            <rect x="35" y="75" width="10" height="15" fill="currentColor" />
                            <rect x="55" y="80" width="15" height="10" fill="currentColor" />
                            
                            <rect x="45" y="0" width="4" height="4" fill="currentColor" />
                            <rect x="90" y="90" width="10" height="10" fill="currentColor" />
                            <rect x="95" y="95" width="5" height="5" fill="white" />
                          </svg>
                        </div>
                        <p className="font-extrabold text-[11px] text-slate-800 mt-2">SwiftPort UPI BHIM Merchant QR</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Collect Fee: ₹100.00</p>
                      </div>

                      <div className="bg-blue-50/55 border border-blue-105 border-blue-100 rounded-xl p-3 text-left flex gap-1.5">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800 leading-normal">
                          Scan the merchants QR code above from GPay/PhonePe to capture payment, then click the confirmation submit below.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Method 4: BANK TRANSFER WIRE */}
                  {selectedPayMethod === 'bank_transfer' && (
                    <div className="space-y-3 text-xs animate-fadeIn">
                      <div className="bg-white border border-slate-150 p-3 rounded-xl space-y-2 relative shadow-inner">
                        <span className="absolute top-2.5 right-2.5 bg-indigo-50 border border-indigo-100 text-[9px] px-2 py-0.5 rounded font-black text-indigo-700 uppercase">
                          IMPS/NEFT ONLY
                        </span>
                        <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Nodal Collection Bank</h5>
                        
                        <div className="space-y-1 text-[10.5px] font-mono">
                          <div className="flex justify-between border-b border-slate-100 pb-1">
                            <span className="text-slate-400">BENEFICIARY:</span>
                            <span className="font-bold text-slate-800">SWIFTPORT LOGISTICS CORE</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-1 items-center">
                            <span className="text-slate-400">A/C NUMBER:</span>
                            <span className="font-black text-slate-800 flex items-center gap-1 leading-none">
                              1004240984920
                              <button 
                                type="button" 
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText("1004240984920");
                                    alert("Account Number 1004240984920 copied!");
                                  } catch (e) {
                                    // ignore 
                                  }
                                }}
                                className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded cursor-pointer leading-none"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-1 items-center">
                            <span className="text-slate-400">BANK IFSC:</span>
                            <span className="font-black text-indigo-700 flex items-center gap-1 leading-none">
                              ICIC0000042
                              <button 
                                type="button" 
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText("ICIC0000042");
                                    alert("Bank IFSC ICIC0000042 copied!");
                                  } catch (e) {
                                    // ignore
                                  }
                                }}
                                className="p-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded cursor-pointer"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          </div>
                          <div className="flex justify-between pb-0.5">
                            <span className="text-slate-400">BANK NAME:</span>
                            <span className="font-bold text-slate-800">ICICI BANK LTD, MUMBAI</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 pl-0.5">
                          Remittance Reference / Transaction UTR ID
                        </label>
                        <input
                          type="text"
                          required={selectedPayMethod === 'bank_transfer'}
                          value={paymentBankRef}
                          onChange={(e) => setPaymentBankRef(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-820 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                          placeholder="E.g., UTR-194018442"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-xs text-slate-500 space-y-3">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="leading-snug text-[10px]">
                      Your ₹100 payment is secure. Payment proceeds directly within simulated Sandbox. No actual bank transfers are executed.
                    </p>
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    disabled={paymentLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg shadow-emerald-100 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Authorizing Transaction...
                      </>
                    ) : (
                      <>
                        Pay Joining Fees ₹100 & Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: ADMIN VERIFICATION PANEL */}
      {consoleTab === "admin" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-505 text-indigo-600" />
                🔒 Fleet Onboarding Admin Desk
              </h3>
              <p className="text-xs text-slate-500 mt-1 pl-0.5">
                Developer portal for reviewing new joinees KYC papers & licensing documents before giving active status.
              </p>
            </div>

            {isAdminLoggedIn && (
              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Admin Log Out
              </button>
            )}
          </div>

          {!isAdminLoggedIn ? (
            <form onSubmit={handleAdminAuth} className="max-w-md mx-auto space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-center space-y-1">
                <Lock className="w-10 h-10 text-indigo-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Secret PIN Authentication</h4>
                <p className="text-[11px] text-slate-400">
                  Please enter the Admin Authorization security key to unlock document controls.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">
                  Security Code PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs font-bold text-center pl-10 placeholder:text-slate-350 focus:outline-none"
                    placeholder="Enter security code"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {adminError && (
                  <p className="text-[10px] text-rose-500 font-bold pl-1 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {adminError}
                  </p>
                )}
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-[10.5px] text-indigo-700 leading-snug">
                🔑 **Security Hint**: Use code <span className="font-extrabold text-indigo-900 bg-white px-2 py-0.5 rounded shadow-sm border border-indigo-150">admin123</span> to bypass credentials assessment in local simulator mode.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Unlock Admin Controls
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-700">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                <span>
                  Authorized Status: **Admin Mode unlocked successfully.** You are viewing actual live applicant document registries.
                </span>
              </div>

              {/* Sleek Sub-Tab Navigators for Admin view */}
              <div className="flex border-b border-slate-200 mt-5 mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => setAdminSubTab("performance")}
                  className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    adminSubTab === "performance"
                      ? "border-b-2 border-indigo-600 text-indigo-700 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-indigo-500 hover:scale-110 transition" />
                  Riders Performance & Incentives Setup
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubTab("kyc")}
                  className={`px-5 py-3 text-xs font-black tracking-tight border-b-2 cursor-pointer transition-all flex items-center gap-2 relative ${
                    adminSubTab === "kyc"
                      ? "border-b-2 border-indigo-600 text-indigo-700 font-extrabold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-550 text-slate-500 hover:scale-110 transition" />
                  KYC Onboarding Applications Queue
                  {joinees.filter(j => j.documentStatus === "pending").length > 0 && (
                    <span className="absolute top-1.5 right-0.5 bg-rose-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">
                      {joinees.filter(j => j.documentStatus === "pending").length}
                    </span>
                  )}
                </button>
              </div>

              {adminSubTab === "kyc" ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Active Onboarding Applications Queue ({joinees.filter(j => j.documentStatus === "pending").length} Pending)
                  </h4>

                {joinees.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 space-y-1">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No partner applications registered yet</p>
                    <p className="text-[11px] text-slate-350">Applicants will appear here once they complete the "Join as a Partner" form and pay ₹100.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinees.map((app, idx) => (
                      <div 
                        key={`${app.id}_${idx}`} 
                        className={`border rounded-2xl p-5 ${
                          app.documentStatus === "pending" 
                            ? "bg-amber-50/20 border-amber-200 shadow-sm" 
                            : app.documentStatus === "verified"
                              ? "bg-emerald-50/20 border-emerald-200"
                              : "bg-rose-50/10 border-rose-200"
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-sm text-slate-800">{app.name}</h5>
                              <span className="text-[9px] bg-slate-150 bg-slate-100 border border-slate-205 text-slate-650 px-2 py-0.5 rounded font-bold uppercase">
                                APP ID: {app.id.slice(5, 11).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Submitted at {app.submittedAt}</p>
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              app.documentStatus === "pending" 
                                ? "bg-amber-100 text-amber-700 font-black border border-amber-250 animate-pulse" 
                                : app.documentStatus === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-105 bg-rose-100 text-rose-800"
                            }`}>
                              Status: {app.documentStatus}
                            </span>
                          </div>
                        </div>

                        {/* KYC Credentials assessment matrix */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Vehicle Particulars</span>
                            <p className="font-bold text-slate-805 text-slate-800 mt-0.5" style={{ minHeight: "18px" }}>
                              {app.vehicleId === "2wheeler" ? "2-Wheeler (Moped)" : app.vehicleId === "3wheeler" ? "3-Wheeler (Auto)" : app.vehicleId === "8ftace" ? "Tata Ace 8ft" : "Bolero Pickup"}
                            </p>
                            <span className="text-[10px] font-mono font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {app.vehicleNumber}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Aadhaar Identity</span>
                            <p className="font-bold text-slate-800 mt-0.5 font-mono" style={{ minHeight: "18px" }}>{app.aadhaarNum.replace(/(\d{4})/g, "$1 ")}</p>
                            {app.aadhaarFile ? (
                              <button
                                type="button"
                                onClick={() => setPreviewingDoc({
                                  label: "Aadhaar Identity Card",
                                  url: app.aadhaarFile || "",
                                  applicantName: app.name,
                                  documentNum: app.aadhaarNum
                                })}
                                className="text-[10px] text-orange-600 hover:text-orange-700 font-extrabold flex items-center gap-1 mt-1 hover:underline cursor-pointer bg-orange-50 px-1.5 py-0.5 rounded leading-none"
                              >
                                <Eye className="w-3 h-3 text-orange-500 hover:scale-110 transition" />
                                Review Photo KYC
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-semibold block mt-1">✓ Verified No Card</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Driving License</span>
                            <p className="font-bold text-slate-800 mt-0.5 font-mono block truncate" style={{ minHeight: "18px" }}>{app.dlNum.toUpperCase()}</p>
                            {app.dlFile ? (
                              <button
                                type="button"
                                onClick={() => setPreviewingDoc({
                                  label: "Driving License (DL)",
                                  url: app.dlFile || "",
                                  applicantName: app.name,
                                  documentNum: app.dlNum
                                })}
                                className="text-[10px] text-orange-600 hover:text-orange-700 font-extrabold flex items-center gap-1 mt-1 hover:underline cursor-pointer bg-orange-50 px-1.5 py-0.5 rounded leading-none"
                              >
                                <Eye className="w-3 h-3 text-orange-500 hover:scale-110 transition" />
                                Review DL Scan
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-semibold block mt-1">✓ Verified No Card</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Vehicle Permit (RC)</span>
                            <p className="font-bold text-slate-800 mt-0.5 font-mono block truncate" style={{ minHeight: "18px" }}>{app.rcNum.toUpperCase()}</p>
                            {app.rcFile ? (
                              <button
                                type="button"
                                onClick={() => setPreviewingDoc({
                                  label: "Registration Certificate (RC)",
                                  url: app.rcFile || "",
                                  applicantName: app.name,
                                  documentNum: app.rcNum
                                })}
                                className="text-[10px] text-orange-600 hover:text-orange-700 font-extrabold flex items-center gap-1 mt-1 hover:underline cursor-pointer bg-orange-50 px-1.5 py-0.5 rounded leading-none"
                              >
                                <Eye className="w-3 h-3 text-orange-500 hover:scale-110 transition" />
                                Review RC Papers
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-semibold block mt-1">✓ Verified No Card</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">onboarding fee payment</span>
                            <p className="font-black text-emerald-600 mt-0.5" style={{ minHeight: "18px" }}>₹100 PAID</p>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-1.5 py-0.5 rounded mt-1 inline-block uppercase max-w-full truncate" title={app.paymentReference || "Verified Transaction Token"}>
                              {app.paymentMethod ? `${app.paymentMethod.replace('_', ' ')}` : "VISA Card"}
                            </span>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5 max-w-[130px] font-mono leading-none">{app.paymentReference || "VISA *** 4444"}</p>
                          </div>
                        </div>

                        {/* Referral Tracking Details for Admin */}
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs flex flex-wrap gap-4 justify-between items-center mt-3">
                          <div>
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-0.5">Assigned Referral Code</span>
                            <span className="font-mono font-black text-orange-600 bg-white border border-orange-100 px-2 py-0.5 rounded text-[11px]">{app.referralCode || "NONE"}</span>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider block mb-0.5">Referred By Code Partner</span>
                            {app.referredByCode ? (() => {
                              const referrer = driversList.find(d => d.referralCode === app.referredByCode);
                              return (
                                <div className="flex items-center gap-1.5 text-[11px] text-orange-800">
                                  <Gift className="w-3.5 h-3.5 text-orange-500 animate-pulse shrink-0" />
                                  <span>
                                    <strong className="font-mono bg-orange-50 text-orange-700 border border-orange-100 px-1.5 py-0.5 rounded">{app.referredByCode}</strong> 
                                    {referrer ? (
                                      <span className="font-bold text-slate-700 ml-1">({referrer.name}) - <span className="text-emerald-600">₹250 reward pending approval</span></span>
                                    ) : (
                                      <span className="text-slate-400 ml-1 italic">(Unmatched system code)</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })() : (
                              <span className="text-slate-400 italic text-[11px] block">Organic Applicant / No Referrer Code</span>
                            )}
                          </div>
                        </div>

                        {/* Actions for pending applicants */}
                        {app.documentStatus === "pending" && (
                          <div className="flex gap-2 border-t border-slate-100 pt-3.5 mt-2 justify-end">
                            <button
                              onClick={() => handleAdminVerify(app.id, "rejected")}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-650 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-150"
                            >
                              Deny Onboarding
                            </button>
                            <button
                              onClick={() => handleAdminVerify(app.id, "verified")}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wide transition shadow cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Verify & Convert to Active Partner
                            </button>
                          </div>
                        )}

                        {app.documentStatus === "verified" && (
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2 text-[11px] text-emerald-700 flex items-center gap-1.5 font-sans justify-between mt-1">
                            <p className="flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                              Driver has been successfully onboarded and integrated into direct dispatch channels.
                            </p>
                            <span className="text-[10px] font-mono text-emerald-650 bg-white font-bold border border-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                              ACTIVE PARTNER
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              ) : (
                renderPerformanceTabContent()
              )}

              {/* Secure Floating Visual KYC Document Viewer dialog overlay desk */}
              {previewingDoc && (
                <div className="fixed inset-0 bg-slate-950/70 z-55 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                  <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">{previewingDoc.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Belongs to: {previewingDoc.applicantName}</p>
                      </div>
                      <button 
                        onClick={() => setPreviewingDoc(null)}
                        className="text-slate-500 hover:text-slate-800 text-[11px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition"
                      >
                        ✕ Close Review
                      </button>
                    </div>

                    <div className="bg-slate-100/50 p-2 text-center rounded-2xl flex items-center justify-center min-h-[140px] max-h-[220px] overflow-auto border border-slate-150">
                      {previewingDoc.url === "PRESET_AADHAAR" ? (
                        <div className="w-full bg-white border border-slate-300 rounded-2xl p-4 shadow-sm relative overflow-hidden font-sans space-y-3.5">
                          <div className="absolute top-0 inset-x-0 bg-blue-600 h-2" />
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <p className="font-black text-[9px] text-blue-900 tracking-wider leading-none">GOVERNMENT OF INDIA</p>
                              <p className="text-[7.5px] text-slate-400 leading-tight">UNIQUE IDENTIFICATION AUTHORITY OF INDIA</p>
                            </div>
                            <span className="text-[7.5px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded leading-none shrink-0 uppercase">Verified KYC</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-16 h-20 bg-slate-150 border border-slate-200 rounded-lg flex flex-col items-center justify-center font-bold text-slate-400 text-[8px] shrink-0 leading-none">
                              <User className="w-6 h-6 text-slate-300" />
                              <span>PHOTO CAPTURE</span>
                            </div>
                            <div className="text-left leading-normal space-y-1">
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">NAME</span>
                                <p className="font-extrabold text-[12px] text-slate-800 leading-snug">{previewingDoc.applicantName}</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">DOB / GENDER</span>
                                <p className="text-[10px] text-slate-650 font-bold leading-tight">12/04/1994 | MALE</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">AADHAAR CARD ID</span>
                                <p className="font-mono text-xs font-black tracking-widest text-slate-800 leading-tight">
                                  {previewingDoc.documentNum.replace(/(\d{4})/g, "$1 ")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[7px] text-slate-400 text-center border-t border-slate-100 pt-2 font-mono">मेरा आधार, मेरी पहचान (Govt of India Secure OCR Verified)</p>
                        </div>
                      ) : previewingDoc.url === "PRESET_DL" ? (
                        <div className="w-full bg-white border border-slate-300 rounded-2xl p-4 shadow-sm relative overflow-hidden font-sans space-y-3.5">
                          <div className="absolute top-0 inset-x-0 bg-emerald-600 h-2" />
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <p className="font-black text-[9px] text-emerald-800 tracking-wider leading-none">INDIAN UNION DRIVING LICENSE</p>
                              <p className="text-[7.5px] text-slate-400 leading-tight">MINISTRY OF ROAD TRANSPORT & HIGHWAYS</p>
                            </div>
                            <span className="text-[7.5px] font-black text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.2 rounded leading-none shrink-0">DL VALID</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-16 h-20 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center justify-center font-bold text-amber-500 text-[8px] shrink-0 leading-none">
                              <GraduationCap className="w-6 h-6 text-amber-300" />
                              <span>DL CARD</span>
                            </div>
                            <div className="text-left leading-normal space-y-1">
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">OPERATOR NAME</span>
                                <p className="font-extrabold text-[12px] text-slate-800 leading-tight">{previewingDoc.applicantName}</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">VEHICLE CL</span>
                                <p className="text-[10px] text-slate-650 font-bold leading-tight">MCWG - LMV - CARGO SHIFTER</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">LICENSE IND REF</span>
                                <p className="font-mono text-xs font-black tracking-wider text-teal-900 leading-none">
                                  {previewingDoc.documentNum.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[7px] text-slate-400 text-center border-t border-slate-100 pt-2 font-mono">Valid throughout Union of India Transport channels</p>
                        </div>
                      ) : previewingDoc.url === "PRESET_RC" ? (
                        <div className="w-full bg-white border border-slate-300 rounded-2xl p-4 shadow-sm relative overflow-hidden font-sans space-y-3.5">
                          <div className="absolute top-0 inset-x-0 bg-indigo-600 h-2" />
                          <div className="flex justify-between items-start">
                            <div className="text-left">
                              <p className="font-black text-[9px] text-indigo-900 tracking-wider leading-none">REGISTRATION CERTIFICATE (FORM 23)</p>
                              <p className="text-[7.5px] text-slate-400 leading-tight">STATE VEHICLE REGISTRY OFFICE</p>
                            </div>
                            <span className="text-[7.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded leading-none shrink-0">RC MATCH</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-16 h-20 bg-indigo-50 border border-indigo-150 rounded-lg flex flex-col items-center justify-center font-bold text-indigo-400 text-[8px] shrink-0 leading-none">
                              <FileText className="w-6 h-6 text-indigo-300" />
                              <span>RC REGISTRY</span>
                            </div>
                            <div className="text-left leading-normal space-y-1">
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">REGISTERED OWNER</span>
                                <p className="font-extrabold text-[12px] text-slate-800 leading-tight">{previewingDoc.applicantName}</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">PERMIT STATUS</span>
                                <p className="text-[10px] text-slate-650 font-bold leading-tight">LIGHT MOTOR VEHICLE / COMMERCIAL</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-400 uppercase font-bold block leading-none">REGISTRATION UID</span>
                                <p className="font-mono text-xs font-black tracking-widest text-indigo-850 leading-tight">
                                  {previewingDoc.documentNum.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-[7px] text-slate-400 text-center border-t border-slate-100 pt-2 font-mono">Fitness & pollution norms verified & active</p>
                        </div>
                      ) : (
                        <div className="p-1 max-w-full">
                          <img src={previewingDoc.url} alt="KYC Scan attachment" className="max-h-[200px] max-w-full object-contain rounded-xl shadow-md border border-slate-200" />
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl text-[9px] text-slate-500 leading-normal flex gap-1.5 pt-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p>OCR parsing complete. This document corresponds with Ministry parameters. Verified within secure sandbox database.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DRIVER WITHDRAWAL REQUESTS QUEUE */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div className="flex justify-between items-center pr-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    💸 Driver Wallet Withdrawal & Payout Requests ({withdrawalRequests.filter(w => w.status === 'pending').length} Pending)
                  </h4>
                  <span className="text-[10px] text-indigo-500 font-mono font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    Admin Payout Registry
                  </span>
                </div>

                {withdrawalRequests.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 space-y-1">
                    <IndianRupee className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No payout requests submitted</p>
                    <p className="text-[11px] text-slate-300">Drivers will appear here once they request payouts from their available wallet balance.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests.map((req, idx) => (
                      <div 
                        key={`${req.id}_${idx}`} 
                        className={`border rounded-2xl p-5 ${
                          req.status === "pending" 
                            ? "bg-amber-50/20 border-amber-200 shadow-sm" 
                            : req.status === "approved"
                              ? "bg-emerald-50/20 border-emerald-200"
                              : "bg-rose-50/10 border-rose-200"
                        }`}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                <IndianRupee className="w-4 h-4 text-emerald-655 text-emerald-600 font-black shrink-0" />
                                {req.driverName} requested ₹{req.amount}
                              </h5>
                              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                REQ ID: {req.id.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Requested on {req.createdAt}</p>
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              req.status === "pending" 
                                ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse" 
                                : req.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-250"
                                  : "bg-rose-100 text-rose-800 border border-rose-250"
                            }`}>
                              Status: {req.status}
                            </span>
                          </div>
                        </div>

                        {/* Payment Credentials layout block */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black block">Destination Method</span>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {req.paymentType === 'upi' ? '⚡ Instant UPI ID' : '🏦 Bank Account Transfer'}
                            </p>
                          </div>

                          {req.paymentType === 'upi' ? (
                            <div className="sm:col-span-2">
                              <span className="text-[9px] text-slate-400 uppercase font-black block font-mono">UPI Address String</span>
                              <p className="font-extrabold text-slate-800 mt-0.5 font-mono select-all bg-slate-50 border border-slate-100 rounded-lg py-1 px-2.5 inline-block text-[11px]">
                                {req.upiId}
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-black block">Account & Bank</span>
                                <p className="font-bold text-slate-800 mt-0.5">{req.bankName}</p>
                                <p className="text-[10px] text-slate-500 font-mono select-all font-semibold bg-slate-50 px-1 py-0.5 rounded border border-slate-100 inline-block">
                                  {req.accountNumber}
                                </p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-black block">Bank IFSC Code</span>
                                <p className="font-extrabold text-slate-800 mt-0.5 font-mono select-all uppercase tracking-wide bg-slate-50 px-1 py-0.5 rounded border border-slate-100 inline-block text-[11px]">
                                  {req.ifscCode}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions for pending payouts */}
                        {req.status === "pending" && (
                          <div className="flex gap-2 border-t border-slate-100 pt-3.5 mt-2 justify-end">
                            <button
                              onClick={() => onAdminActionWithdrawal(req.id, "rejected")}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-550 hover:text-white text-rose-705 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-200"
                            >
                              Reject & Refund Wallet
                            </button>
                            <button
                              onClick={() => onAdminActionWithdrawal(req.id, "approved")}
                              className="px-4 py-1.5 bg-emerald-650 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wide transition shadow cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve & Release Funds (Simulated)
                            </button>
                          </div>
                        )}

                        {req.status === "approved" && (
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2 text-[11px] text-emerald-700 flex items-center gap-1.5 justify-between">
                            <p className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              Payout dispatched successfully. Transferred to UPI/Bank gateway ledger.
                            </p>
                            <span className="text-[9px] font-mono text-emerald-600 bg-white font-black border border-emerald-150 px-1.5 py-0.5 rounded shrink-0">
                              SETTLED {req.processedAt}
                            </span>
                          </div>
                        )}

                        {req.status === "rejected" && (
                          <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-[11px] text-rose-700 flex items-center gap-1.5 justify-between">
                            <p className="flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              Payout request rejected. Requested funds have been auto-refunded back to partner wallet.
                            </p>
                            <span className="text-[9px] font-mono text-rose-600 bg-white font-black border border-rose-150 px-1.5 py-0.5 rounded shrink-0">
                              REJECTED {req.processedAt}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* VIEW 4: DETAILED PAYOUTS & WITHDRAWALS LEDGER */}
      {consoleTab === "payouts" && (() => {
        // Filter based on rider login role mode
        const rawList = currentRoleMode === 'rider' && activeDriver
          ? withdrawalRequests.filter(req => req.driverId === activeDriver.id)
          : withdrawalRequests;

        // Compute summary metrics dynamically
        const totalApprovedSum = rawList
          .filter(w => w.status === 'approved')
          .reduce((sum, w) => sum + w.amount, 0);

        const totalPendingSum = rawList
          .filter(w => w.status === 'pending')
          .reduce((sum, w) => sum + w.amount, 0);

        const totalCount = rawList.length;

        // Perform dynamic filtering of the ledger dataset
        const filteredRequests = rawList.filter(req => {
          // Status filter integration
          if (payoutFilterStatus !== 'all' && req.status !== payoutFilterStatus) {
            return false;
          }
          // Driver selection filter (admin mode only)
          if (currentRoleMode !== 'rider' && payoutFilterDriver !== 'all' && req.driverId !== payoutFilterDriver) {
            return false;
          }
          // Multi-column query string evaluation
          if (payoutSearchQuery.trim()) {
            const q = payoutSearchQuery.toLowerCase();
            const nameMatch = req.driverName.toLowerCase().includes(q);
            const upiMatch = req.upiId ? req.upiId.toLowerCase().includes(q) : false;
            const bankMatch = req.bankName ? req.bankName.toLowerCase().includes(q) : false;
            const accMatch = req.accountNumber ? req.accountNumber.includes(q) : false;
            const idMatch = req.id.toLowerCase().includes(q);
            if (!nameMatch && !upiMatch && !bankMatch && !accMatch && !idMatch) {
              return false;
            }
          }
          return true;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6 animate-fadeIn">
            {/* Header branding */}
            <div className="border-b border-slate-200 pb-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-600 shrink-0" />
                  💸 Partner Payout History & Wallet Settlement ledger
                </h3>
                <p className="text-xs text-slate-500 mt-1 pl-0.5">
                  Complete real-time accounting record for platform commissions, online prepaid settlements, and bank-released withdrawal payouts.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wide">
                  Internal Ledger Synced
                </span>
              </div>
            </div>

            {/* Premium Metrics Indicators cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-150 shadow-sm">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Total Settled (Approved)</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-emerald-600 flex items-center">
                    <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                    {totalApprovedSum}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">INR</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Released directly to drivers' bank accounts or instant UPI string addresses.
                </p>
              </div>

              <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-150 shadow-sm">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Escrow Pending Processing</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-orange-500 flex items-center">
                    <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                    {totalPendingSum}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">INR</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Awaiting review by fleet operator desks in **Admin Verification** tab.
                </p>
              </div>

              <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-150 shadow-sm">
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Total Request Records</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-indigo-600 flex items-center">
                    {totalCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">Payout Logs</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Aggregated lifetime withdrawal records processed across courier partners.
                </p>
              </div>
            </div>

            {/* Filter and selector query row */}
            <div className={`bg-slate-50 p-4.5 rounded-2xl border border-slate-150 grid grid-cols-1 ${currentRoleMode === 'rider' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3.5 items-end text-xs text-slate-705`}>
              {/* Filter by target driver selector */}
              {currentRoleMode !== 'rider' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5 tracking-wide">
                    Filter by Courier partner
                  </label>
                  <select
                    value={payoutFilterDriver}
                    onChange={(e) => setPayoutFilterDriver(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
                  >
                    <option value="all">👥 All Registered Drivers</option>
                    {driversList.map((driver, idx) => (
                      <option key={`${driver.id}_${idx}`} value={driver.id}>
                        👤 {driver.name} ({driver.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter by request status slider */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5 tracking-wide">
                  Filter by Payout Status
                </label>
                <select
                  value={payoutFilterStatus}
                  onChange={(e) => setPayoutFilterStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
                >
                  <option value="all">📋 All Status Logs</option>
                  <option value="pending">⏳ Pending Approvals</option>
                  <option value="approved">✅ Approved & Settled</option>
                  <option value="rejected">❌ Rejected / Refunded</option>
                </select>
              </div>

              {/* Clear and filter query bar input */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5 tracking-wide">
                  Search driver name, UPI or Account
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payoutSearchQuery}
                    onChange={(e) => setPayoutSearchQuery(e.target.value)}
                    placeholder="Search query string..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 pr-8"
                  />
                  {payoutSearchQuery && (
                    <button
                      onClick={() => setPayoutSearchQuery("")}
                      className="absolute right-2.5 top-2.5 py-1 px-1 bg-slate-100 hover:bg-slate-200 rounded-full font-bold text-[10px] text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed list log table */}
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-slate-150/60 rounded-3xl space-y-3.5">
                <HelpCircle className="w-10 h-10 text-slate-350 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">No matching payout records found</p>
                  <p className="text-[11px] text-slate-400">
                    Try clearing search inputs or adjust filters to view archived records.
                  </p>
                </div>
                {(payoutFilterDriver !== "all" || payoutFilterStatus !== "all" || payoutSearchQuery) && (
                  <button
                    onClick={() => {
                      setPayoutFilterDriver("all");
                      setPayoutFilterStatus("all");
                      setPayoutSearchQuery("");
                    }}
                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reset Filter Query
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-150 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-150">
                    <tr>
                      <th className="py-3 px-4">Courier Partner</th>
                      <th className="py-3 px-4">Request Date & ID</th>
                      <th className="py-3 px-4">Payout Destination String</th>
                      <th className="py-3 px-4">Final Settlement Amount</th>
                      <th className="py-3 px-4">Status & Action Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRequests.map((req, idx) => (
                      <tr 
                        key={`${req.id}_${idx}`} 
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        {/* Courier Partner Info */}
                        <td className="py-4.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-orange-400 border border-slate-800 shadow-sm shrink-0">
                              {req.driverName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800">{req.driverName}</p>
                              <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wide">
                                Partner ID: {req.driverId.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Request Date & ID */}
                        <td className="py-4.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-700">{req.createdAt}</p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            ID: {req.id.toUpperCase()}
                          </p>
                        </td>

                        {/* Payout Destination route info */}
                        <td className="py-4.5 px-4 font-mono">
                          {req.paymentType === 'upi' ? (
                            <div>
                              <span className="text-[8px] uppercase font-black text-rose-500 bg-rose-50 px-1 py-0.5 rounded leading-none">
                                UPI Link
                              </span>
                              <p className="text-[11px] font-bold text-slate-800 mt-1 select-all">{req.upiId}</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[8px] uppercase font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded leading-none">
                                Bank Settled
                              </span>
                              <p className="text-[11px] font-bold text-slate-800 mt-1">{req.bankName}</p>
                              <p className="text-[9px] text-slate-450 text-slate-500 font-semibold select-all">
                                Acc: {req.accountNumber} • IFSC {req.ifscCode}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Final settlement amount */}
                        <td className="py-4.5 px-4">
                          <span className="text-sm font-black text-emerald-600 flex items-center gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                            {req.amount}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 leading-none">Net Outflow</span>
                        </td>

                        {/* Status Badge & Settled Timeline */}
                        <td className="py-4.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] rounded-full font-black uppercase tracking-wider ${
                              req.status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : req.status === 'rejected' 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            }`}>
                              {req.status === 'approved' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                              ) : req.status === 'rejected' ? (
                                <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                              )}
                              {req.status}
                            </span>

                            {req.processedAt ? (
                              <p className="text-[9.5px] text-slate-400 leading-tight">
                                Settle Date: <span className="text-slate-500 font-mono font-bold">{req.processedAt}</span>
                              </p>
                            ) : (
                              <p className="text-[9.5px] text-slate-400 italic font-medium leading-tight">
                                Pending Release
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* VIEW 5: EARNINGS TAB (Screenshot 2 style layout) */}
      {consoleTab === "earnings" && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl animate-fadeIn text-slate-800 font-sans">
          {/* Header Mobile Header Bar mockup style */}
          <div className="bg-slate-900 p-4 shrink-0 flex items-center gap-4 text-white">
            <button 
              onClick={() => setConsoleTab("active")}
              className="p-1.5 hover:bg-slate-800 rounded-full transition cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </button>
            <h3 className="font-extrabold text-sm tracking-wide">Earnings</h3>
          </div>

          <div className="p-5 space-y-6">
            {activeDriver && (() => {
              const activeDriverDeliveredOrders = pendingOrders.filter(
                o => o.status === 'delivered' && o.driver?.id === activeDriver.id
              );
              const liveSessionTripsCount = activeDriverDeliveredOrders.length;
              const liveSessionEarningsSum = activeDriverDeliveredOrders.reduce(
                (sum, o) => sum + Math.round(o.totalPrice * 0.8),
                0
              );

              const displayedEarningsThisWeek = (2849.04 + liveSessionEarningsSum).toFixed(2);
              const displayedTripsThisWeek = 28 + liveSessionTripsCount;
              const displayedEarningsToday = (570.55 + liveSessionEarningsSum).toFixed(2);
              const displayedTripsToday = 7 + liveSessionTripsCount;

              const historicalTrips = [
                { id: "h1", time: "02:44 PM", amount: 76.94, desc: "Bandra West to Juhu", isLive: false, paymentMethod: "online" },
                { id: "h2", time: "02:12 PM", amount: 83.35, desc: "Andheri East to Powai", isLive: false, paymentMethod: "cash_pickup" },
                { id: "h3", time: "01:30 PM", amount: 78.77, desc: "Prabhadevi to Worli", isLive: false, paymentMethod: "online" },
                { id: "h4", time: "01:02 PM", amount: 106.22, desc: "Colaba to Lower Parel", isLive: false, paymentMethod: "online" },
                { id: "h5", time: "12:38 PM", amount: 93.43, desc: "Mulund West to Thane", isLive: false, paymentMethod: "cash_pickup" },
                { id: "h6", time: "11:20 AM", amount: 65.91, desc: "Sion to Dadar Market", isLive: false, paymentMethod: "online" },
                { id: "h7", time: "10:05 AM", amount: 75.93, desc: "Bhandup to Kanjurmarg", isLive: false, paymentMethod: "online" }
              ];

              const liveTripsFormatted = activeDriverDeliveredOrders.map((o) => {
                const earningAmount = Math.round(o.totalPrice * 0.8);
                let timeStr = "Now";
                if (o.createdAt) {
                  const parts = o.createdAt.split(', ');
                  if (parts[1]) timeStr = parts[1];
                  else timeStr = o.createdAt;
                }
                return {
                  id: o.id.slice(10, 16).toUpperCase() || o.id.toUpperCase(),
                  time: timeStr,
                  amount: earningAmount,
                  desc: `${o.pickup.name} to ${o.dropoff.name}`,
                  isLive: true,
                  paymentMethod: o.paymentMethod || 'cash_pickup'
                };
              });

              const mergedTrips = [...liveTripsFormatted, ...historicalTrips];

              return (
                <div className="space-y-6">
                  {/* Top Cards Slider Container */}
                  <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4.5">
                    <span className="text-[10px] text-sky-600 block uppercase font-black tracking-wider mb-1">
                      This Week (Mon 25 - Sun 31)
                    </span>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-6 h-6 stroke-[3]" />
                        {displayedEarningsThisWeek}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">INR Earned</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5 border-t border-slate-200 pt-3 mt-1 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Estimated online hours</span>
                        <p className="font-extrabold text-slate-800 mt-0.5">20h 10m</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Trips Completed</span>
                        <p className="font-extrabold text-slate-800 mt-0.5">{displayedTripsThisWeek} Trips</p>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Calendar week-slider matching Screenshot 2 */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-black mb-3">
                      Daily Calendar Planner
                    </span>
                    <div className="grid grid-cols-7 gap-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                      {[
                        { day: "Mon", date: "25" },
                        { day: "Tue", date: "26" },
                        { day: "Wed", date: "27" },
                        { day: "Thu", date: "28" },
                        { day: "Fri", date: "29" },
                        { day: "Sat", date: "30", active: true },
                        { day: "Sun", date: "31" }
                      ].map((d) => (
                        <div 
                          key={d.date} 
                          className={`p-2.5 rounded-xl text-center select-none ${
                            d.active 
                              ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/20' 
                              : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
                          }`}
                        >
                          <span className="text-[9px] block uppercase font-bold tracking-tight opacity-80">{d.day}</span>
                          <span className="text-xs font-black block mt-0.5">{d.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Today's Summary card section */}
                  <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4.5">
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide border-b border-slate-200/80 pb-2 mb-3 flex justify-between items-center">
                      <span>Today's Summary (Sat 30)</span>
                      <span className="text-[9.5px] bg-blue-50 text-blue-600 border border-blue-150 px-2 py-0.5 rounded-full font-bold">Saturday Live</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Earnings</span>
                        <p className="font-black text-emerald-600 text-sm mt-0.5 flex items-center justify-center">
                          <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                          {displayedEarningsToday}
                        </p>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Time Spent</span>
                        <p className="font-extrabold text-slate-800 text-sm mt-0.5">4h 13m</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Trips</span>
                        <p className="font-extrabold text-slate-800 text-sm mt-0.5">{displayedTripsToday} Trips</p>
                      </div>
                    </div>
                  </div>

                  {/* Individual trips log list matching Screenshot 2 amounts */}
                  <div className="space-y-3">
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest pl-0.5">
                      Trip Statements list
                    </h4>
                    <div className="divide-y divide-slate-150 bg-slate-50 rounded-2xl border border-slate-250 overflow-hidden text-xs">
                      {mergedTrips.map((item, idx) => {
                        const isCashType = item.paymentMethod !== 'online';
                        return (
                          <div key={item.id + '_' + idx} className={`flex justify-between items-center p-3.5 hover:bg-slate-100/50 transition border-l-4 ${item.isLive ? 'bg-orange-50/15 border-l-orange-500' : 'border-l-transparent'}`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-800">
                                  {item.isLive ? `Live Trip #LP_${item.id}` : `Trip Delivery #${item.id}`}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">({item.time})</span>
                                {item.isLive && (
                                  <span className="text-[8px] bg-orange-100 text-orange-850 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-[10.5px] text-slate-500 font-medium">{item.desc}</p>
                              {item.isLive && (
                                <p className="text-[9px] text-slate-450 italic text-slate-400 font-medium">
                                  {isCashType 
                                    ? "💵 Received in hand (20% platform commission debited from wallet balance)"
                                    : "💳 Electronic checkout (80% share deposited directly to partner wallet balance)"
                                  }
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-extrabold text-emerald-600 text-xs font-mono">+ ₹{parseFloat(item.amount as any).toFixed(2)}</p>
                              <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded uppercase font-black ${
                                isCashType 
                                  ? "bg-amber-100 text-amber-800 border border-amber-250" 
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}>
                                {isCashType ? "Cash collected" : "Prepaid online"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* VIEW 6: DRIVER PROFILE TAB (Screenshot 1 style layout) */}
      {consoleTab === "profile" && activeDriver && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl animate-fadeIn text-slate-800 font-sans">
          
          {/* Header Mobile Header Bar blue mockup style */}
          <div className="bg-blue-600 p-4.5 shrink-0 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-4 text-white">
              <button 
                onClick={() => setConsoleTab("active")}
                className="p-1 hover:bg-blue-700 rounded-full transition cursor-pointer border-none bg-transparent"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h3 className="font-extrabold text-sm tracking-wide">Profile</h3>
            </div>
            
            {/* Log Out mock action button */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  alert("Simulated Logout complete. Reselect active driver in the top select dropdown header of active board.");
                }
              }}
              className="text-[11px] font-bold bg-blue-700 hover:bg-blue-800 text-blue-100 px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 border-none"
            >
              <LogOut className="w-3 h-3" />
              Log Out
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Header profile details group card */}
            <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center font-black text-slate-100 text-lg shadow">
                  {activeDriver.name.charAt(0)}
                </div>
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-black text-sm text-slate-900">{activeDriver.name}</h4>
                  <span className="bg-slate-200 text-slate-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                    ★ {activeDriver.rating || "4.9"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Scooter • {activeDriver.vehicleNumber || "MH-46-CW-6716"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                  Partner ID: {activeDriver.id.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Profile properties form or list box details */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden text-xs">
              <div className="p-4 flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Home Address</span>
                  {isEditingProfileOther ? (
                    <input
                      type="text"
                      defaultValue={activeDriver.address || ""}
                      onChange={(e) => {
                        setEditedAddress(e.target.value);
                      }}
                      id="profile-address-input"
                      placeholder="Enter home address details..."
                      className="mt-1 bg-slate-50 border border-slate-250 p-2 font-bold rounded-xl text-slate-800 w-full min-w-[200px]"
                    />
                  ) : (
                    <p className="font-extrabold text-slate-800">{activeDriver.address || "--"}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (isEditingProfileOther) {
                      updateActiveDriver({ 
                        address: editedAddress || activeDriver.address || "--",
                        mobile: editedMobile || activeDriver.mobile || "7039487596"
                      });
                      setIsEditingProfileOther(false);
                    } else {
                      setEditedAddress(activeDriver.address || "");
                      setEditedMobile(activeDriver.mobile || "7039487596");
                      setIsEditingProfileOther(true);
                    }
                  }}
                  className="text-blue-600 font-extrabold hover:underline"
                >
                  {isEditingProfileOther ? "Save" : "Change"}
                </button>
              </div>

              <div className="p-4 flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Mobile number</span>
                  {isEditingProfileOther ? (
                    <input
                      type="text"
                      defaultValue={activeDriver.mobile || "7039487596"}
                      onChange={(e) => {
                        setEditedMobile(e.target.value);
                      }}
                      id="profile-mobile-input"
                      placeholder="Enter mobile number"
                      className="mt-1 bg-slate-50 border border-slate-250 p-2 font-bold rounded-xl text-slate-800 w-full"
                    />
                  ) : (
                    <p className="font-extrabold text-slate-800">{activeDriver.mobile || "7039487596"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bank details card form exactly replica of Screenshot 1 bank container */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">Bank details</span>
                <button
                  onClick={() => {
                    if (isEditingBankDetails) {
                      updateActiveDriver({
                        accountNumber: editedBankAcc || activeDriver.accountNumber || "009818210002618",
                        ifscCode: editedBankIFSC || activeDriver.ifscCode || "bkid0000098",
                        bankName: editedBankName || activeDriver.bankName || "Bank of India"
                      });
                      setIsEditingBankDetails(false);
                    } else {
                      setEditedBankAcc(activeDriver.accountNumber || "009818210002618");
                      setEditedBankIFSC(activeDriver.ifscCode || "bkid0000098");
                      setEditedBankName(activeDriver.bankName || "Bank of India");
                      setIsEditingBankDetails(true);
                    }
                  }}
                  className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isEditingBankDetails ? "Save Details" : "Change"}
                </button>
              </div>

              {isEditingBankDetails ? (
                <div className="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-slate-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editedBankName}
                      onChange={(e) => setEditedBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-extrabold text-xs"
                      placeholder="Bank of India"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-slate-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editedBankAcc}
                      onChange={(e) => setEditedBankAcc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-extrabold text-xs"
                      placeholder="009818210002618"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-slate-400 block mb-1">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={editedBankIFSC}
                      onChange={(e) => setEditedBankIFSC(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-black text-xs uppercase"
                      placeholder="bkid0000098"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] rounded-full font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-150">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      ✓ ACTIVE
                    </span>
                    <span className="text-[10px] font-bold text-slate-800">{activeDriver.bankName || "Bank of India"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold leading-none mb-1">Account number</span>
                      <p className="font-extrabold text-slate-800">{activeDriver.accountNumber || "009818210002618"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold leading-none mb-1">IFSC code</span>
                      <p className="font-extrabold text-slate-800 uppercase select-all font-mono">{activeDriver.ifscCode || "bkid0000098"}</p>
                    </div>
                  </div>

                  {/* Info notice banner exactly like Screenshot 1 */}
                  <div className="bg-[#eff6ff] border border-blue-100 rounded-xl px-2.5 py-1.5 text-[10.5px] text-blue-700 leading-snug flex items-start gap-2 pt-2 pb-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">All your earnings are sent here</p>
                      <p className="text-[9.5px] text-blue-500 mt-0.5">Withdrawal payouts and escrow balances settle automatically to this verified bank account.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Extra options row */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden text-xs">
              
              {/* My Vehicles list option */}
              <div className="p-4 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">My Registered Vehicles</span>
                  <p className="font-extrabold text-slate-800">{activeDriver.vehicleDetails || "1 Scooter (Active)"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Languages option */}
              <div className="p-4 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Preferred app language</span>
                  <p className="font-extrabold text-slate-800">{activeDriver.preferredLanguage || "English"}</p>
                </div>
                <button
                  onClick={() => {
                    const newLang = activeDriver.preferredLanguage === "English" ? "Marathi" : "English";
                    updateActiveDriver({ preferredLanguage: newLang });
                  }}
                  className="text-blue-600 font-bold hover:underline border-none bg-transparent"
                >
                  Change
                </button>
              </div>

              {/* Change training language option */}
              <div className="p-4 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Change Training Language</span>
                  <p className="font-extrabold text-slate-800">{activeDriver.trainingLanguage || "हिन्दी"}</p>
                </div>
                <button
                  onClick={() => {
                    const newTrain = activeDriver.trainingLanguage === "हिन्दी" ? "मराठी" : "हिन्दी";
                    updateActiveDriver({ trainingLanguage: newTrain });
                  }}
                  className="text-blue-600 font-bold hover:underline border-none bg-transparent"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Courier Partner Badges */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-xs">
              <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-black">
                Verification & Referral Program
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="bg-white border border-slate-150 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
                  <GraduationCap className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold leading-none mb-1">Status</span>
                    <span className="font-extrabold text-slate-800">Training Complete</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-150 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
                  <Gift className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold leading-none mb-1">Referral Code</span>
                    <strong className="text-orange-550 text-orange-600 font-mono text-xs">{activeDriver ? (activeDriver.referralCode || "SWIFTPORT500") : "SWIFTPORT500"}</strong>
                  </div>
                </div>
                <div className="bg-white border border-slate-150 p-3 rounded-xl flex items-center gap-2.5 shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold leading-none mb-1">Security</span>
                    <span className="font-extrabold text-slate-800">Privacy Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-aligned App version metadata */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-400 font-mono">App Version 5.151.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Driver Operations Advisory Guidelines */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 flex gap-3 text-xs leading-relaxed shadow-lg">
        <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-slate-100">Driver Simulator Instructions</p>
          <p className="text-slate-300 font-sans leading-relaxed">
            Switch tabs above to simulate joining as a brand new delivery driver. Enter license details, process the safe **₹100 simulated checkout**, then authenticate into the verification desk using code `admin123` to review and approve KYC papers. Watch your driver automatically added to the maps and lists!
          </p>
        </div>
      </div>
    </div>
  );
}
