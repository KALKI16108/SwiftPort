import React, { useState } from "react";
import { X, Star, Check, Award, Smile, ShieldAlert } from "lucide-react";
import { DeliveryOrder } from "../types";

interface RateDriverModalProps {
  order: DeliveryOrder;
  onClose: () => void;
  onSubmit: (stars: number, comment: string, tags: string[]) => void;
}

export default function RateDriverModal({ order, onClose, onSubmit }: RateDriverModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driver = order.driver;
  if (!driver) return null;

  const PRESET_TAGS = [
    "Polite & Professional",
    "On-Time Arrival",
    "Safe Driving",
    "Careful Handling",
    "Great Communication",
    "Assisted with Loading"
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent!";
      default: return "Select Star Rating";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    // Simulate real-time database update progress
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(rating, comment, selectedTags);
    }, 1200);
  };

  return (
    <div id="rate-driver-modal-overlay" className="fixed inset-0 z-[200] overflow-y-auto font-sans text-slate-800">
      {/* Dark frosted background backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Main rating card body */}
        <div id="rate-driver-card" className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-fadeIn scale-100 p-6 md:p-8 space-y-6">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              Shipment Delivered!
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Rate Your Delivery Driver</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Help us maintain high professional standards by submitting your honest experience checklist.
            </p>
          </div>

          {/* Driver profile teaser */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
            <img 
              src={driver.avatar} 
              alt={driver.name} 
              className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <p className="text-xs font-mono text-slate-450 uppercase font-semibold tracking-wider">Your Courier Partner</p>
              <h3 className="text-sm font-black text-slate-800">{driver.name}</h3>
              <p className="text-[11px] font-mono text-orange-600 font-bold">{driver.vehicleNumber}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Stars Block */}
            <div className="space-y-2 text-center">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition group cursor-pointer border-none bg-transparent"
                    >
                      <Star 
                        className={`w-9 h-9 transition-all duration-150 transform active:scale-95 ${
                          isActive 
                            ? "fill-amber-400 text-amber-400 scale-105 filter drop-shadow-md" 
                            : "text-slate-200 hover:text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-black text-amber-500 transition-all font-mono uppercase tracking-wider">
                {getRatingLabel(hoverRating || rating)}
              </p>
            </div>

            {/* Quick tags selector */}
            {rating > 0 && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                  What went exceptional? (Multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanatory Comment Box */}
            <div className="space-y-1.5">
              <label htmlFor="feedback-comment" className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                Additional Comments
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                placeholder="Share specific compliments or recommendations..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3.5 bg-slate-50/50 border border-slate-205 rounded-xl border-slate-200 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Block */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-2xl font-bold transition border-none cursor-pointer"
              >
                Skip Rating
              </button>

              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="flex-1.5 py-3 text-xs bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Submitting feedback...
                  </>
                ) : (
                  <>
                    <span>Submit Rating</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Secure disclaimer */}
          <div className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Smile className="w-3.5 h-3.5 text-slate-400" />
            <span>Ratings boost partner tier achievements & extra performance bonuses.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
