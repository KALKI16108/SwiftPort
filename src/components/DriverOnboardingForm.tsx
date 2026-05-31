import React, { useState } from "react";
import { 
  User, ShieldCheck, Check, ArrowRight, CheckCircle, 
  CreditCard, Gift, Phone, Eye, UploadCloud, Info, AlertCircle, FileText, Sparkles 
} from "lucide-react";
import { Driver, JoineeApplication } from "../types";

interface DriverOnboardingFormProps {
  onAddJoinee: (joinee: JoineeApplication) => void;
  onInstantVerifyAndActivate: (newDriver: Driver) => void;
  onCancel: () => void;
  drivers: Driver[];
}

export function DriverOnboardingForm({ onAddJoinee, onInstantVerifyAndActivate, onCancel, drivers }: DriverOnboardingFormProps) {
  // Mode configuration
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form Fields
  const [applicantName, setApplicantName] = useState("");
  const [applicantVehicleId, setApplicantVehicleId] = useState("2wheeler");
  const [applicantPlate, setApplicantPlate] = useState("");
  const [applicantAadhaar, setApplicantAadhaar] = useState("");
  const [applicantDL, setApplicantDL] = useState("");
  const [applicantRC, setApplicantRC] = useState("");
  const [applicantReferredByCode, setApplicantReferredByCode] = useState("");
  
  // Simulated Docs
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState("");
  const [dlFile, setDlFile] = useState<string | null>(null);
  const [dlFileName, setDlFileName] = useState("");
  const [rcFile, setRcFile] = useState<string | null>(null);
  const [rcFileName, setRcFileName] = useState("");

  // Payment Selection
  const [selectedPayMethod, setSelectedPayMethod] = useState<'card' | 'upi' | 'qr_code' | 'bank_transfer'>('card');
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [paymentUpiId, setPaymentUpiId] = useState("");
  const [paymentBankRef, setPaymentBankRef] = useState("");
  
  // Custom interactive helper
  const [autoApprove, setAutoApprove] = useState(true);
  const [assignedCode, setAssignedCode] = useState("");

  const handleDocUpload = (docType: 'aadhaar' | 'dl' | 'rc', fileName: string) => {
    if (docType === 'aadhaar') {
      setAadhaarFile("PRESET_AADHAAR");
      setAadhaarFileName(fileName || "simulated_aadhaar_card.png");
    } else if (docType === 'dl') {
      setDlFile("PRESET_DL");
      setDlFileName(fileName || "simulated_driving_license.png");
    } else {
      setRcFile("PRESET_RC");
      setRcFileName(fileName || "simulated_rc_booklet.png");
    }
  };

  const handleQuickDemoAutoFill = () => {
    const demoNames = ["Aravind Sharma", "Priya Patel", "Vikram Malhotra", "Sunita Rao", "Sameer Deshmukh"];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    setApplicantName(randomName);
    setApplicantPlate(`MH-12-${['KW','EA','DF','ZX'][Math.floor(Math.random() * 4)]}-${8000 + Math.floor(Math.random() * 1999)}`);
    setApplicantAadhaar(Math.floor(100000000000 + Math.random() * 900000000000).toString());
    setApplicantDL(`DL-MH12-${Math.floor(1000000 + Math.random() * 8999999)}`);
    setApplicantRC(`RC-MH12-ID-${Math.floor(100000 + Math.random() * 899999)}`);
    
    handleDocUpload('aadhaar', "demo_aadhaar_card_scan.jpg");
    handleDocUpload('dl', "demo_driving_license_front.jpg");
    handleDocUpload('rc', "demo_rc_smartcard_permit.jpg");
  };

  const triggerOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPlate.trim() || !applicantAadhaar.trim() || !applicantDL.trim() || !applicantRC.trim()) {
      alert("Please complete all document details first.");
      return;
    }

    if (!aadhaarFile || !dlFile || !rcFile) {
      if (!aadhaarFile) handleDocUpload('aadhaar', "simulated_aadhaar_card.png");
      if (!dlFile) handleDocUpload('dl', "simulated_driving_license.png");
      if (!rcFile) handleDocUpload('rc', "simulated_rc_booklet.png");
    }
    
    setShowCheckout(true);
  };

  const handleProcessPayment = () => {
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
      
      const genCode = `SWIFT-${applicantName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PART'}${Math.floor(100 + Math.random() * 899)}`;
      setAssignedCode(genCode);

      const newJoinee: JoineeApplication = {
        id: `join_${Date.now()}`,
        name: applicantName,
        vehicleNumber: applicantPlate.toUpperCase(),
        vehicleId: applicantVehicleId,
        aadhaarNum: applicantAadhaar,
        dlNum: applicantDL,
        rcNum: applicantRC,
        joiningFeePaid: true,
        documentStatus: autoApprove ? "verified" : "pending",
        submittedAt: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        aadhaarFile: aadhaarFile || undefined,
        dlFile: dlFile || undefined,
        rcFile: rcFile || undefined,
        paymentMethod: selectedPayMethod,
        paymentReference: referenceString,
        referralCode: genCode,
        referredByCode: applicantReferredByCode.trim().toUpperCase() || undefined
      };

      if (autoApprove) {
        // Automatically create a fully active Driver account instantly
        const nextDriverId = `SWIFT_MUM_${800 + Math.floor(Math.random() * 199)}`;
        const newDriver: Driver = {
          id: nextDriverId,
          name: applicantName,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          rating: 5.0,
          tripsCount: 0,
          vehicleNumber: applicantPlate.toUpperCase(),
          currentLat: 19.076 + (Math.random() - 0.5) * 0.05,
          currentLng: 72.877 + (Math.random() - 0.5) * 0.05,
          walletBalance: 200, // Instant startup loyalty reward
          mobile: "99307 44723",
          preferredLanguage: "Hindi & English",
          referralCode: genCode,
          referredByCode: applicantReferredByCode.trim().toUpperCase() || undefined,
          walletTransactions: [
            { id: `tx_init_${Date.now()}`, amount: 200, desc: "Onboarding Partner Loyalty Bonus", timestamp: new Date().toLocaleTimeString(), type: "incentive_credit" }
          ]
        };
        onInstantVerifyAndActivate(newDriver);
      } else {
        onAddJoinee(newJoinee);
        setFormSubmitted(true);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4 text-slate-800 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900">Partner Rider Registration</h4>
          <p className="text-[10px] text-slate-500">Apply to join the professional SwiftPort carrier network</p>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoAutoFill}
          className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-[10px] font-black rounded-lg transition"
        >
          ⚡ Demo Autofill
        </button>
      </div>

      {!showCheckout ? (
        <form onSubmit={triggerOpenCheckout} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="E.g., Priya Patel"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-semibold px-3 py-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">Vehicle Type</label>
              <select
                value={applicantVehicleId}
                onChange={(e) => setApplicantVehicleId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
              >
                <option value="2wheeler">2-Wheeler (Scooter/Bike)</option>
                <option value="3wheeler">3-Wheeler (Cargo Auto)</option>
                <option value="8ftace">8ft Tata Ace (Mini Truck)</option>
                <option value="pickup">Bolero Pickup (Heavy)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">Plate Number</label>
              <input
                type="text"
                required
                value={applicantPlate}
                onChange={(e) => setApplicantPlate(e.target.value)}
                placeholder="MH-12-KW-8542"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-semibold px-3 py-2.5 rounded-xl uppercase"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">Aadhaar Number (12-Digit)</label>
              <input
                type="text"
                required
                maxLength={12}
                value={applicantAadhaar}
                onChange={(e) => setApplicantAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="4253 1092 8540"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-semibold px-3 py-2.5 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">D.L. Number</label>
              <input
                type="text"
                required
                value={applicantDL}
                onChange={(e) => setApplicantDL(e.target.value)}
                placeholder="DL-MH12-2023000"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-semibold px-3 py-2.5 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1">RC Book Number</label>
              <input
                type="text"
                required
                value={applicantRC}
                onChange={(e) => setApplicantRC(e.target.value)}
                placeholder="RC-MH12-REG-949"
                className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-semibold px-3 py-2.5 rounded-xl uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase font-black text-slate-400 pl-1 block mb-1 flex items-center justify-between">
              <span>Referral Invited By (Optional)</span>
              <span className="text-[8px] text-orange-500 font-bold uppercase">Earn credits</span>
            </label>
            <input
              type="text"
              value={applicantReferredByCode}
              onChange={(e) => setApplicantReferredByCode(e.target.value)}
              placeholder="E.g., SWIFT-RAMESH99"
              className="w-full bg-slate-50 border border-slate-200 focus:outline-orange-500 text-xs font-medium px-3 py-2.5 rounded-xl uppercase"
            />
          </div>

          {/* Document Upload Simulation */}
          <div className="py-2 px-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Upload Scanning Credentials (Verified Sandbox OCR)
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div 
                className={`p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
                  aadhaarFile ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => handleDocUpload('aadhaar', "scanned_aadhaar_card.jpg")}
              >
                <UploadCloud className={`w-4 h-4 ${aadhaarFile ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[8px] font-extrabold mt-1 truncate max-w-full">
                  {aadhaarFile ? "Aadhaar Ok" : "Aadhaar Card"}
                </span>
              </div>

              <div 
                className={`p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
                  dlFile ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => handleDocUpload('dl', "scanned_driving_license.jpg")}
              >
                <UploadCloud className={`w-4 h-4 ${dlFile ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[8px] font-extrabold mt-1 truncate max-w-full">
                  {dlFile ? "License Ok" : "License DL"}
                </span>
              </div>

              <div 
                className={`p-2 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
                  rcFile ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => handleDocUpload('rc', "scanned_rc_booklet.jpg")}
              >
                <UploadCloud className={`w-4 h-4 ${rcFile ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-[8px] font-extrabold mt-1 truncate max-w-full">
                  {rcFile ? "RC Book Ok" : "RC Booklet"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive sandbox auto-approve toggle */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <p className="text-[10px] font-black text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 animate-pulse" />
                ⚡ Sandbox Instant Auto-Approval
              </p>
              <p className="text-[8.5px] text-slate-500 leading-normal">
                Bypass manual KYC operator queue. Automatically register, activate, and login straight away for trial booking runs!
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition border-none text-center block"
            >
              Proceed to ₹100 Onboarding Fee
            </button>
          </div>
        </form>
      ) : (
        /* Checkout fee payment screen */
        <div>
          {!paymentSuccess ? (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 bg-white text-orange-600 rounded-xl shadow-sm font-black text-center text-xs">
                  ₹100
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Onboarding Entry Fee (One-time)</p>
                  <p className="text-[9px] text-slate-500">Safeguards operator verify registry logistics in Mumbai region.</p>
                </div>
              </div>

              {/* Payment Methods tabs inside form */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                {(['card', 'upi', 'qr_code', 'bank_transfer'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedPayMethod(method)}
                    className={`py-1.5 text-[8.5px] font-bold rounded-lg uppercase tracking-tight transition border-none cursor-pointer ${
                      selectedPayMethod === method ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Payment content */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[140px] flex flex-col justify-center">
                {selectedPayMethod === 'card' && (
                  <div className="space-y-2 text-left">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-slate-400">Cardholder Legal Name</label>
                      <input
                        type="text"
                        placeholder="E.g., Priya Patel"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-slate-400">16-Digit Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4253 1094 8504 9021"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, "$1 "))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedPayMethod === 'upi' && (
                  <div className="space-y-2 text-left">
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-slate-400">Virtual Payment UPI Address</label>
                      <input
                        type="text"
                        placeholder="E.g., priyapatel@okhdfcbank"
                        value={paymentUpiId}
                        onChange={(e) => setPaymentUpiId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedPayMethod === 'qr_code' && (
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 bg-white border border-slate-200 p-1 rounded-xl mx-auto flex items-center justify-center">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=swiftport@icici%26pn=SwiftPort%2520Logistics%26am=100%26cu=INR" 
                        alt="Onboarding QR Pay" 
                        className="w-22 h-22 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[8px] text-slate-400">Scan this sandbox QR code via GPay, PhonePe or Paytm to settle the fee instantly.</p>
                  </div>
                )}

                {selectedPayMethod === 'bank_transfer' && (
                  <div className="space-y-2 text-left">
                    <div className="p-2 bg-slate-100 rounded-xl space-y-1 text-[8.5px] border border-slate-150 text-slate-600 font-mono">
                      <p>Bank: **ICICI Bank India**</p>
                      <p>A/C: **1004240984920** (SwiftPort Corp)</p>
                      <p>IFSC: **ICIC0000042**</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-slate-400">IMPS Reference Receipt ID</label>
                      <input
                        type="text"
                        placeholder="E.g., IMPS-9024820"
                        value={paymentBankRef}
                        onChange={(e) => setPaymentBankRef(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-750 text-xs font-bold rounded-xl transition cursor-pointer border-none"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={paymentLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition border-none flex items-center justify-center gap-1.5"
                >
                  {paymentLoading ? (
                    <span className="loader w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Pay & Connect
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Onboarding verification success (if manual check) */
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border-2 border-emerald-300 mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-500 leading-normal mx-auto max-w-sm">
                  We have welcomed your document dossier & joining fee. Your referral identifier code is <strong className="font-mono text-orange-600 text-xs">{assignedCode}</strong>.
                </p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-[10px] text-orange-950 font-medium max-w-sm mx-auto leading-normal">
                📌 <strong>Sandbox Notice:</strong> Your credentials are currently queued in the Administrative Verification list under the **"pending"** state. To review and activate this account, sign in as any other driver first, select the admin tab at the top and enter PIN <strong>admin123</strong> to approve!
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border-none"
              >
                Sign In With Existing Partners
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
