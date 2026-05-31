import React, { useState, useEffect, useRef } from "react";
import { DeliveryOrder, ChatMessage } from "../types";
import { Send, User, Check, ShieldAlert, CheckCheck, Clock } from "lucide-react";

interface DriverChatProps {
  activeOrder: DeliveryOrder;
  onAddChatMessage: (chat: ChatMessage) => void;
}

export default function DriverChat({ activeOrder, onAddChatMessage }: DriverChatProps) {
  const [inputText, setInputText] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeOrder.chats]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // User message
    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}_u`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddChatMessage(userMsg);
    setInputText("");

    // Simulate standard driver replies depending on status
    setTimeout(() => {
      let driverResponseText = "Yes, received! Confirmed.";
      
      const lowerInput = inputText.toLowerCase();
      if (lowerInput.includes("where") || lowerInput.includes("reach") || lowerInput.includes("time") || lowerInput.includes("stay")) {
        if (activeOrder.status === "assigned") {
          driverResponseText = "Coming to pickup! Estimating 4-5 minutes to reach you.";
        } else if (activeOrder.status === "in_transit") {
          driverResponseText = "GPS says 12 more minutes through Link road. Traffic is dense but moving.";
        } else if (activeOrder.status === "loaded") {
          driverResponseText = "Just starting the engine. Driving carefully!";
        }
      } else if (lowerInput.includes("fragile") || lowerInput.includes("care") || lowerInput.includes("soft") || lowerInput.includes("glass")) {
        driverResponseText = "Understood. I have bound it with safety cords and bubble wraps on the bed.";
      } else if (lowerInput.includes("phone") || lowerInput.includes("call") || lowerInput.includes("number")) {
        driverResponseText = `Sure, you can double check with my company plate: ${activeOrder.driver?.vehicleNumber || "MH-02"}`;
      } else {
        // Status specific general text
        switch (activeOrder.status) {
          case "assigned":
            driverResponseText = "Entering your neighborhood now. Please keep the cargo ready for loading.";
            break;
          case "loaded":
            driverResponseText = "Everything is strapped. Starting GPS routing right now.";
            break;
          case "in_transit":
            driverResponseText = "In transit. Highway clear, cruising slowly with safety.";
            break;
          case "delivered":
            driverResponseText = "Package left with receiver, thank you for choosing our delivery system!";
            break;
          default:
            driverResponseText = "Got you, sir. I am on it.";
        }
      }

      const driverMsg: ChatMessage = {
        id: `chat_${Date.now()}_d`,
        sender: "driver",
        text: driverResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      onAddChatMessage(driverMsg);
    }, 1200);
  };

  const driver = activeOrder.driver;

  if (!driver) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 text-slate-500 shadow-sm animate-fadeIn">
        <Clock className="w-8 h-8 text-orange-500 mx-auto animate-pulse" />
        <p className="text-sm font-bold text-slate-700">Waiting for dispatch allocation...</p>
        <p className="text-xs text-slate-400">Secure drivers to initiate messaging channel.</p>
      </div>
    );
  }

  return (
    <div id="driver-chat" className="bg-white border-2 border-slate-200/85 rounded-3xl flex flex-col h-[400px] overflow-hidden shadow-lg animate-fadeIn text-slate-800">
      {/* Driver Contact Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={driver.avatar}
            alt={driver.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              {driver.name}
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                ⭐ {driver.rating}
              </span>
            </h4>
            <p className="text-[10px] text-orange-600 font-mono tracking-wider font-bold">
              {driver.vehicleNumber}
            </p>
          </div>
        </div>

        {/* Action tags */}
        <div className="text-right">
          <span className="text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {activeOrder.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Messages logs stream scrolling */}
      <div 
        ref={chatScrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40"
        style={{ scrollBehavior: "smooth" }}
      >
        {activeOrder.chats.length === 0 ? (
          <div className="text-center py-10 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold">Connection encrypted securely.</p>
            <p>Tell Ramesh instructions or verify entry gates here.</p>
          </div>
        ) : (
          activeOrder.chats.map((c, idx) => {
            const isMe = c.sender === "user";
            const isSystem = c.sender === "system";
            const isAi = c.sender === "ai";

            if (isSystem) {
              return (
                <div key={`${c.id}_${idx}`} className="text-center py-1">
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-mono border border-slate-200 px-2 py-0.5 rounded-lg inline-block">
                    {c.text}
                  </span>
                </div>
              );
            }

            if (isAi) {
              return (
                <div key={`${c.id}_${idx}`} className="bg-orange-50 border border-orange-100 p-3.5 rounded-2xl max-w-[85%] text-xs text-orange-850 space-y-1 my-2 shadow-sm font-sans">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-orange-600 font-extrabold font-mono">
                    🤖 Dispatcher briefing
                  </div>
                  <p className="text-slate-700 font-medium">{c.text}</p>
                </div>
              );
            }

            return (
              <div 
                key={`${c.id}_${idx}`} 
                className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isMe 
                    ? "bg-orange-500 text-white rounded-br-none shadow-md shadow-orange-100" 
                    : "bg-white border border-slate-205 text-slate-800 rounded-bl-none shadow-sm"
                }`}>
                  <p>{c.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-mono">
                  <span>{c.timestamp}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inputs box bar */}
      <form onSubmit={handleSendMessage} className="bg-slate-55 bg-slate-50 border-t border-slate-200 p-2.5 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask driver to hurry, give road instructions"
          className="flex-1 bg-white border-2 border-slate-150 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center shadow-md shadow-orange-100 hover:shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
