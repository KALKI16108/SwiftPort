import React, { useState } from "react";
import { User, Mail, Phone, Gift, ArrowRight, Check, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Driver } from "../types";

interface CustomerLoginFormProps {
  onAuthenticate: (name: string, email: string, phone: string, appliedCoupon?: string) => void;
  drivers: Driver[];
}

export function CustomerLoginForm({ onAuthenticate, drivers }: CustomerLoginFormProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  
  // OTP flow stages: 'input' | 'otp'
  const [stage, setStage] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Coupon check tracking state
  const [promoMessage, setPromoMessage] = useState("");
  const [isValidPromo, setIsValidPromo] = useState(false);

  // Manual Sign In email/phone input state
  const [signInEmail, setSignInEmail] = useState("");

  const MOCK_PROFILES = [
    { name: "Siddhant Pitale", email: "siddhant@example.com", phone: "99307 44723", rank: "Premium Client", balance: "₹2,500" },
    { name: "Rhea Sen", email: "rhea@example.com", phone: "98112 34567", rank: "Enterprise Shipper", balance: "₹750" },
    { name: "Aditya Sharma", email: "aditya@gmail.com", phone: "91672 88390", rank: "Standard Member", balance: "₹1,200" }
  ];

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    const target = coupon.trim().toUpperCase();
    const match = drivers.find(d => d.referralCode && d.referralCode.toUpperCase() === target);
    if (match) {
      setIsValidPromo(true);
      setPromoMessage(`🎉 Referral Verified! Sponsored by ${match.name}. You get ₹200 credit!`);
    } else {
      setIsValidPromo(false);
      setPromoMessage("❌ Promo code not found in drivers database. organic rates apply.");
    }
  };

  const triggerRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStage('otp');
    }, 1200);
  };

  const verifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234" && otp !== "123456" && otp.length < 4) {
      setOtpError("Incorrect code. Sandbox OTP is 1234!");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthenticate(name, email, phone, isValidPromo ? coupon : undefined);
    }, 1500);
  };

  const handleQuickProfileSignIn = (profile: typeof MOCK_PROFILES[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Directly log them in without OTP in sandbox
      onAuthenticate(profile.name, profile.email, profile.phone);
    }, 800);
  };

  const handleManualSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const namePart = signInEmail.split('@')[0];
      const normalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      onAuthenticate(normalizedName, signInEmail.trim(), "99307 44723");
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Visual Navigation Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveTab('signin');
            setStage('input');
          }}
          className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer ${
            activeTab === 'signin' ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800 bg-transparent"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('signup');
            setStage('input');
          }}
          className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer ${
            activeTab === 'signup' ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-800 bg-transparent"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Sign Up / Register
        </button>
      </div>

      {activeTab === 'signin' ? (
        <div className="space-y-4 text-left">
          {/* Quick-select Simulated Customer accounts */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">
              Select Sandbox Profile
            </label>
            <div className="grid grid-cols-1 gap-2">
              {MOCK_PROFILES.map((profile, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickProfileSignIn(profile)}
                  disabled={isLoading}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                      <span>{profile.name}</span>
                      <span className="text-[8px] px-1.5 py-0.2 bg-orange-100 text-orange-700 font-bold rounded-md font-sans">
                        {profile.rank}
                      </span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{profile.email}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-emerald-600">{profile.balance}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <span className="relative bg-white px-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">or enter manually</span>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSignInSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">
                Enter Email or Phone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 text-xs font-bold text-slate-850"
                  placeholder="e.g., siddhant@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !signInEmail.trim()}
              className="w-full py-3 bg-slate-950 hover:bg-slate-850 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
            >
              {isLoading ? (
                <span className="loader w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Direct Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Sign Up Form flow with OTP validation */
        <div>
          {stage === 'input' ? (
            <form onSubmit={triggerRequestOTP} className="space-y-4 text-left">
              {/* Legal Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 text-xs font-bold text-slate-850"
                    placeholder="E.g., Siddhant Pitale"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 font-sans block pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 text-xs font-bold text-slate-850"
                    placeholder="e.g., siddhant@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 text-xs font-bold text-slate-850"
                    placeholder="E.g., 99307 44723"
                  />
                </div>
              </div>

              {/* Optional Driver Referral code */}
              <div className="space-y-1 block">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1 flex items-center justify-between col-span-2">
                  <span>Referral Code (Optional)</span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono font-medium lowercase">sandbox bonus</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value);
                        setPromoMessage("");
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 text-xs font-semibold text-slate-755 font-mono"
                      placeholder="E.g., SWIFT-RAMESH99"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4.5 bg-slate-900 border-none select-none hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-[10px] font-semibold pl-1 leading-relaxed mt-1 ${isValidPromo ? "text-emerald-600 animate-pulse" : "text-rose-500"}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer mt-2 border-none"
              >
                {isLoading ? (
                  <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm & Send Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Enter Verification PIN</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                  className="w-full tracking-[1.5em] text-center bg-slate-50 border-2 border-slate-200 focus:border-orange-500 text-lg font-black text-slate-800 rounded-xl p-3 focus:outline-none transition-all"
                  placeholder="1234"
                />
                <p className="text-[10px] text-indigo-750 font-semibold pl-1 leading-normal italic text-center">
                  🛡️ Simulation Otp Hint: enter Standard PIN <strong className="font-bold">1234</strong> to enter the sandbox!
                </p>
                {otpError && (
                  <p className="text-[10px] text-rose-500 font-extrabold text-center mt-1">
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition active:scale-95 duration-100 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isLoading ? (
                  <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Verify OTP & Launch App
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStage('input')}
                className="text-center w-full text-xs text-slate-400 hover:text-slate-600 block transition font-bold border-none bg-transparent cursor-pointer"
              >
                Edit Profile Credentials
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
