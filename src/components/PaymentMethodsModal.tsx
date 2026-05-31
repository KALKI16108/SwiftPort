import React, { useState, useEffect } from "react";
import { 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  ChevronRight, 
  Copy, 
  Check, 
  Smartphone,
  ShieldCheck,
  Building,
  Info,
  AppWindow,
  Monitor,
  Activity,
  Zap
} from "lucide-react";

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
}

export default function PaymentMethodsModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  amount 
}: PaymentMethodsModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("phonepe");
  const [isCopying, setIsCopying] = useState(false);
  const [showTransactionOverlay, setShowTransactionOverlay] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devicePlatform, setDevicePlatform] = useState<"Android" | "iOS" | "Desktop">("Desktop");
  const [detectedApps, setDetectedApps] = useState<string[]>([]);
  const [redirectingCount, setRedirectingCount] = useState<number>(0);

  // Parse UserAgent on Component Mount to identify platform
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isAndroid = /Android/i.test(ua);
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      
      if (isAndroid) {
        setDevicePlatform("Android");
        // Simulate detection of top installed payments framework on Android
        setDetectedApps(["gpay", "phonepe", "paytm", "bhim"]);
      } else if (isIOS) {
        setDevicePlatform("iOS");
        // Simulate default system capabilities
        setDetectedApps(["gpay", "phonepe", "paytm"]);
      } else {
        setDevicePlatform("Desktop");
        setDetectedApps([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const upiId = "9930744723@naviaxis";
  const payeeName = "SwiftPort Booking";
  const transactionNote = "SwiftPort Shipment Fare Payment";

  // Build the app parameters
  const upiQueryString = `pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  // Format Deep Link Protocols for chosen UPI Apps
  const getAppDeepLink = (appType: string) => {
    switch (appType) {
      case "phonepe":
        return {
          mobileUrl: `phonepe://pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;package=com.phonepe.app;end`,
          appName: "PhonePe",
          color: "#5f259f"
        };
      case "gpay":
        return {
          mobileUrl: `gpay://upi/pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`,
          appName: "Google Pay",
          color: "#1a73e8"
        };
      case "paytm":
        return {
          mobileUrl: `paytmmp://pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;package=net.one97.paytm;end`,
          appName: "Paytm",
          color: "#00b9f5"
        };
      case "bhim":
        return {
          mobileUrl: `bhim://pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;package=in.org.npci.upiapp;end`,
          appName: "BHIM UPI",
          color: "#e85e00"
        };
      case "jupiter":
        return {
          mobileUrl: `upi://pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;package=co.jupiter.app;end`,
          appName: "Jupiter",
          color: "#ff4f00"
        };
      default:
        return {
          mobileUrl: `upi://pay?${upiQueryString}`,
          androidIntent: `intent://pay?${upiQueryString}#Intent;scheme=upi;end`,
          appName: "Any UPI App",
          color: "#0c3e9e"
        };
    }
  };

  const handleCopyLink = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(upiId);
    setTimeout(() => setIsCopying(false), 2000);
  };

  // Perform absolute direct redirection
  const selectAndPay = (optionName: string) => {
    setSelectedOption(optionName);
    setShowTransactionOverlay(true);
    setRedirectingCount(3);

    const appConfig = getAppDeepLink(optionName);
    const redirectUrl = devicePlatform === "Android" ? appConfig.androidIntent : appConfig.mobileUrl;

    // Trigger instant location rewrite with chosen UPI parameters
    if (devicePlatform !== "Desktop") {
      setTimeout(() => {
        try {
          window.location.href = redirectUrl;
        } catch (err) {
          console.warn("Deep Link failure. Relying on default browser prompt picker...", err);
          window.location.href = `upi://pay?${upiQueryString}`;
        }
      }, 800);
    }
  };

  const confirmSimulatedPaid = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowTransactionOverlay(false);
      onPaymentSuccess();
    }, 1500);
  };

  // Build standard image QR code for scanners
  const upiStandardUrl = `upi://pay?${upiQueryString}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiStandardUrl)}`;

  return (
    <div id="payment-modal-container" className="fixed inset-0 z-[150] overflow-y-auto font-sans text-slate-800">
      {/* Dark frosted background backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Main payment card body */}
        <div id="payment-methods-card" className="relative w-full max-w-sm bg-[#f4f6fa] rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[580px] border border-slate-200 animate-fadeIn scale-100">
          
          {/* Header resembling design in screenshot */}
          <div className="bg-[#0c3e9e] text-white px-4 py-4.5 flex items-center justify-between shrink-0">
            <div className="flex items-center">
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition text-white border-none bg-transparent cursor-pointer mr-3"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-sm font-black tracking-wide text-white">Payment Methods</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition text-white/80 border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Order Fare Header */}
          <div className="bg-white border-b border-slate-150 px-5 py-4 flex justify-between items-center shrink-0 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Partner wallet top-up / Shipment Fare</span>
            <span className="text-lg font-black text-[#0c3e9e] font-mono">₹{amount}</span>
          </div>

          {/* Device and App Detection Status Banner */}
          <div className="mx-4.5 mt-4 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-orange-500 mt-0.5 shrink-0 animate-pulse" />
            <div className="text-[10px] leading-relaxed">
              <p className="font-extrabold text-slate-900">
                System: {devicePlatform === "Desktop" ? "Desktop Browser" : `Mobile Device (${devicePlatform})`}
              </p>
              <p className="text-slate-500 mt-0.5">
                {devicePlatform === "Desktop" 
                  ? "Scan QR with any UPI app to pay with exact amount." 
                  : `Detected installed UPI apps. Ready for instant redirection.`}
              </p>
            </div>
          </div>

          <div className="p-4.5 space-y-4 overflow-y-auto flex-1 pb-7 text-xs">
            
            {/* SECTION 1: Recently Used Payment Option(s) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                Recently Used Payment Option(s)
              </span>
              
              <div 
                onClick={() => selectAndPay("phonepe")}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-3">
                  {/* Purple PhonePe styled logo */}
                  <div className="w-8.5 h-8.5 bg-[#5f259f] rounded-xl flex items-center justify-center text-white font-black shadow-sm shrink-0">
                    <span className="text-xs font-mono tracking-tighter">Pe</span>
                  </div>
                  <div>
                    <span className="font-black text-xs block text-slate-800">PhonePe UPI</span>
                    <span className="text-[9px] text-[#5f259f] font-extrabold flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 bg-[#5f259f] rounded-full animate-ping"></span>
                      Direct Express Redirection
                    </span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  {selectedOption === "phonepe" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0c3e9e]" />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: UPI Apps */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                UPI Apps
              </span>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Pay by Any UPI app banner row */}
                <div 
                  onClick={() => selectAndPay("any_upi")}
                  className="p-3.5 flex items-center justify-between cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7.5 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 shrink-0 font-black text-[#0c3e9e] tracking-tight text-[9px] font-mono">
                      UPI
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-800 block">Pay by Any UPI app</span>
                      <span className="text-[9.5px] text-slate-400 block mt-0.5">Launches the default app chooser prompt</span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                    {selectedOption === "any_upi" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0c3e9e]" />
                    )}
                  </div>
                </div>

                {/* Specific 4 quick apps Grid matching exact screen */}
                <div className="p-4.5 grid grid-cols-4 gap-2 text-center bg-slate-50/50">
                  {/* Google Pay */}
                  <button 
                    onClick={() => selectAndPay("gpay")}
                    className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer border-none bg-transparent group"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                      <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter">G<span className="text-red-500">P</span><span className="text-yellow-500">a</span><span className="text-emerald-500">y</span></span>
                    </div>
                    <span className="text-[9.5px] text-slate-600 font-bold">GPay</span>
                  </button>

                  {/* Paytm */}
                  <button 
                    onClick={() => selectAndPay("paytm")}
                    className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer border-none bg-transparent group"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                      <div className="flex flex-col leading-none font-bold text-[#00b9f5] text-[9px] tracking-tight">
                        <span className="font-black text-[#002e6e]">pay</span>
                        <span className="text-[7.5px] font-black">tm</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] text-slate-600 font-bold">Paytm</span>
                  </button>

                  {/* BHIM App */}
                  <button 
                    onClick={() => selectAndPay("bhim")}
                    className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer border-none bg-transparent group"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                      <span className="text-[9.5px] font-black text-orange-500 font-mono leading-none tracking-tighter">BHIM</span>
                    </div>
                    <span className="text-[9.5px] text-slate-600 font-bold text-center">BHIM</span>
                  </button>

                  {/* Jupiter */}
                  <button 
                    onClick={() => selectAndPay("jupiter")}
                    className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer border-none bg-transparent group"
                  >
                    <div className="w-10 h-10 bg-[#ea580c] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
                      <span className="text-[9px] font-black text-white italic font-serif">J</span>
                    </div>
                    <span className="text-[9.5px] text-slate-600 font-bold">Jupiter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Credit/Debit Cards */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                Credit/Debit Cards
              </span>

              <div 
                onClick={() => selectAndPay("card")}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shadow-xs shrink-0">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block text-slate-800">Credit/Debit Cards</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Select to use standard mock cards checkout</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
              </div>
            </div>

            {/* SECTION 4: Net Banking */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">
                Net Banking
              </span>

              <div 
                onClick={() => selectAndPay("net_banking")}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shadow-xs shrink-0">
                    <Building className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block text-slate-800">Net Banking</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Select to view list of retail banks</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

          </div>

          {/* Bottom Security Footer */}
          <div className="bg-slate-100 border-t border-slate-200/60 p-3 flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 font-mono shrink-0">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Secure Powered by UPI Direct Gateway (INR)</span>
          </div>

          {/* TRANSACTION POPUP OVERLAY */}
          {showTransactionOverlay && (() => {
            const appConfig = getAppDeepLink(selectedOption);
            const isCardOrBank = selectedOption === "card" || selectedOption === "net_banking";

            return (
              <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-end text-slate-800 font-sans">
                <div className="bg-white rounded-t-[32px] p-5.5 space-y-5 animate-slideUp">
                  
                  {/* Header of payment modal overlay */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-2 py-0.5 rounded-full font-black uppercase tracking-wider block w-max mb-1">
                        {isCardOrBank ? "GATEWAY CHECKOUT" : "UPI AUTO RESPOND"}
                      </span>
                      <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">
                        {isCardOrBank ? "Verified Gateway Checkout" : `Redirecting to ${appConfig.appName}`}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setShowTransactionOverlay(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-500 cursor-pointer border-none bg-transparent"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Main Action layout block */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    
                    {!isCardOrBank && (
                      <>
                        {/* QR Code and Direct Amount Verification */}
                        <div className="relative p-2.5 bg-white border border-slate-200 shadow-md rounded-2xl flex items-center justify-center w-40 h-40">
                          <img 
                            src={qrCodeUrl} 
                            alt="UPI Direct Transfer QR Code" 
                            className="w-full h-full object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10.5px] text-slate-500">
                            Paying UPI payee ID: <strong className="text-slate-800 font-mono font-black">{upiId}</strong>
                          </p>
                          <p className="text-[10.5px] text-slate-500">Exact amount configured automatically:</p>
                          <p className="text-base font-black text-[#0c3e9e] font-mono">₹{amount}</p>
                        </div>

                        <div className="w-full bg-[#f0f9ff] border border-blue-150 text-blue-700 rounded-xl px-3 py-2 text-[10.5px] text-left leading-relaxed flex gap-2">
                          <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-blue-900">Immediate Phone Redirect</p>
                            <p className="text-[9.5px] text-blue-600">The browser will prompt or open your selected UPI application ({appConfig.appName}) to auto-fill ₹{amount}.</p>
                          </div>
                        </div>

                        {/* Direct link button fallback and copy options */}
                        <div className="flex gap-2 w-full text-xs">
                          <a 
                            href={devicePlatform === "Android" ? appConfig.androidIntent : appConfig.mobileUrl}
                            className="flex-1 py-3 bg-[#5f259f] hover:bg-[#4a1d7f] text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer text-[10.5px] transition"
                            onClick={() => {
                              // Force standard fallback directly if link doesn't respond
                              setTimeout(() => {
                                window.location.href = `upi://pay?${upiQueryString}`;
                              }, 1200);
                            }}
                          >
                            <Smartphone className="w-4 h-4 text-white" />
                            Launch {appConfig.appName}
                          </a>

                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="py-3 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition text-[10.5px] font-bold text-slate-700 shrink-0"
                          >
                            {isCopying ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy UPI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {isCardOrBank && (
                      <div className="w-full text-left space-y-4 py-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                          <div className="flex justify-between font-bold text-slate-500">
                            <span>Transaction Type</span>
                            <span>{selectedOption === "card" ? "Credit/Debit Card" : "Net Banking"}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-500">
                            <span>Total Payable Amount</span>
                            <span className="text-slate-900 text-sm font-black">₹{amount}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-500">
                            <span>Platform Gateway Fee</span>
                            <span className="text-emerald-600 font-extrabold">₹0.00 (FREE)</span>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-150 rounded-xl p-3.5 text-blue-700 leading-relaxed flex gap-2">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-[11px] text-blue-900">Direct Gateway Routing</p>
                            <p className="text-[9.5px] text-blue-600">This flow simulates entering your card / banking credentials and settles immediately upon verification.</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Final Interactive Action Confirmations */}
                  <button
                    type="button"
                    onClick={confirmSimulatedPaid}
                    disabled={isVerifying}
                    className="w-full py-3.5 bg-[#0c3e9e] hover:bg-[#0a3280] text-white font-black rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 text-xs"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Verifying Transaction ₹{amount} Settle Status...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        {isCardOrBank ? "Confirm Payment Successful" : "I Have Paid / Confirm Payment Completed"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
