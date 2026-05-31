import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  MessageCircle, 
  CornerDownRight, 
  BadgeHelp,
  AlertCircle,
  Clock,
  Sparkles,
  Headphones,
  CheckCircle,
  HelpCircle,
  Check
} from "lucide-react";
import { SupportTicket, SupportMessage, DeliveryOrder } from "../types";

interface CustomerSupportWidgetProps {
  tickets: SupportTicket[];
  activeTicketId: string | null;
  setActiveTicketId: (id: string | null) => void;
  onRaiseTicket: (subject: string, messageText: string, bookingId?: string) => void;
  onSendMessage: (ticketId: string, text: string, sender: 'customer' | 'bot' | 'agent' | 'system') => void;
  onEscalateToAgent: (ticketId: string) => void;
  activeOrder: DeliveryOrder | null;
}

export default function CustomerSupportWidget({
  tickets,
  activeTicketId,
  setActiveTicketId,
  onRaiseTicket,
  onSendMessage,
  onEscalateToAgent,
  activeOrder
}: CustomerSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("Booking Enquiry");
  const [initialMessageText, setInitialMessageText] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [linkToActiveBooking, setLinkToActiveBooking] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  // Auto scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages, isBotThinking, isOpen]);

  // Handle raising a new ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialMessageText.trim()) return;

    const bookingId = (linkToActiveBooking && activeOrder) ? activeOrder.id : undefined;
    onRaiseTicket(subject, initialMessageText, bookingId);
    setInitialMessageText("");
  };

  // Handle user sending an inline chat reply
  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeTicketId) return;

    const userText = messageInput.trim();
    setMessageInput("");

    // Append customer message
    onSendMessage(activeTicketId, userText, 'customer');

    // If status is chatbot, trigger the OpenRouter/Mock API call
    if (activeTicket?.status === 'chatbot') {
      setIsBotThinking(true);
      
      try {
        // Collect messages formatted for current ticket
        const chatHistoryForApi = [
          ...(activeTicket?.messages || []).map(m => ({
            sender: m.sender,
            text: m.text
          })),
          { sender: 'customer' as const, text: userText }
        ];

        const response = await fetch("/api/support/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatHistoryForApi })
        });

        if (!response.ok) {
          throw new Error("Proxy response failed");
        }

        const data = await response.json();
        
        // Let simulation wait slightly for realism
        setTimeout(() => {
          onSendMessage(activeTicketId, data.text || "I apologize, I missed that. Please say it again.", 'bot');
          setIsBotThinking(false);
        }, 600);

      } catch (err) {
        console.error("Support API query failure. Settle to generic response.", err);
        setTimeout(() => {
          onSendMessage(
            activeTicketId, 
            "My automated connection is a bit slow. Please continue to write your questions, or select 'Request Support Agent' above for immediate physical assistance.", 
            'bot'
          );
          setIsBotThinking(false);
        }, 800);
      }
    }
  };

  const handleEscalateClick = () => {
    if (activeTicketId) {
      onEscalateToAgent(activeTicketId);
    }
  };

  return (
    <div id="customer-support-widget-wrapper" className="fixed bottom-6 right-6 z-[140] font-sans">
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0c3e9e] hover:bg-[#0a3280] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer border-none"
        title="Raise Support Ticket / AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white transform scale-x-[-1]" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-[8px] font-black items-center justify-center text-white">?</span>
            </span>
          </div>
        )}
      </button>

      {/* Support Chat Box */}
      {isOpen && (
        <div id="support-chat-container" className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[550px] bg-[#f4f6fa] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-slideUp">
          
          {/* Header */}
          <div className="bg-[#0c3e9e] text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-xl">
                <BadHelp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide text-white">Live Support Portal</h3>
                <p className="text-[10px] text-blue-200 font-medium">Auto AI Bot & Human Officer Desk</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:bg-white/10 rounded-full transition cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            
            {/* If no ticket is active, show Ticket Raise Panel */}
            {!activeTicket ? (
              <div className="space-y-4 flex-1 flex flex-col justify-center animate-fadeIn py-2">
                <div className="text-center space-y-2 mb-2">
                  <div className="w-12 h-12 bg-blue-50 text-[#0c3e9e] rounded-2.5xl flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#0c3e9e] text-xs uppercase tracking-wide">Raise a Support Ticket</h4>
                  <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Our instant AI agent resolves 85% of enquiries immediately. Escalate to real operators anytime.
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-sm">
                  
                  {/* Subject select */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-wide text-slate-400 pl-1 block">Specify Issue Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-[#0c3e9e]"
                    >
                      <option value="Booking Issues">Booking Placement Errors</option>
                      <option value="Pricing Inquiry">Fare / Charge Dispute</option>
                      <option value="Driver Partner Delay">Driver Not Arrived / Delay</option>
                      <option value="Payment Settlements">Online Payment Settle Error</option>
                      <option value="Other Logistics Inquiry">General Feedback or Help</option>
                    </select>
                  </div>

                  {/* Booking Link Checkbox if order exists */}
                  {activeOrder && (
                    <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-2 rounded-xl">
                      <input
                        type="checkbox"
                        id="link-booking"
                        checked={linkToActiveBooking}
                        onChange={(e) => setLinkToActiveBooking(e.target.checked)}
                        className="rounded accent-blue-600 focus:ring-0"
                      />
                      <label htmlFor="link-booking" className="text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                        Link ticket to Active Shipment ID: <span className="font-mono text-[#0c3e9e]">{activeOrder.id.slice(4,10)}</span>
                      </label>
                    </div>
                  )}

                  {/* Initial Enquiry Message */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-wide text-slate-400 pl-1 block">Describe Your Problem</label>
                    <textarea
                      required
                      value={initialMessageText}
                      onChange={(e) => setInitialMessageText(e.target.value)}
                      placeholder="e.g., My payment debited but booking status says pending..."
                      rows={3}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-[#0c3e9e] resized-none"
                    />
                  </div>

                  {/* Raise Ticket Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0c3e9e] hover:bg-[#0a3280] text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border-none shadow"
                  >
                    Launch Ticket & Start Chat
                  </button>
                </form>

                {/* Show list of previous resolved/active tickets for quick review */}
                {tickets.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-black tracking-wide text-slate-400 block pl-1">
                      Existing Support Tickets ({tickets.length})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {tickets.map((ticket, idx) => (
                        <div
                          key={`${ticket.id}_${idx}`}
                          onClick={() => setActiveTicketId(ticket.id)}
                          className="bg-white border border-slate-200 hover:border-[#0c3e9e] p-2.5 rounded-xl cursor-pointer flex justify-between items-center transition"
                        >
                          <div className="text-left">
                            <p className="font-extrabold text-[10.5px] text-slate-800 tracking-tight leading-none">
                              {ticket.subject}
                            </p>
                            <p className="font-mono text-[9px] text-slate-400 mt-1">
                              ID: {ticket.id.slice(4,11).toUpperCase()} | {ticket.createdAt}
                            </p>
                          </div>
                          
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase ${
                            ticket.status === 'chatbot' ? "bg-blue-50 text-blue-600 border border-blue-200" :
                            ticket.status === 'assigned_to_agent' ? "bg-orange-50 text-orange-600 border border-orange-200" :
                            "bg-emerald-550 text-white"
                          }`}>
                            {ticket.status === 'chatbot' ? "AI Auto" :
                             ticket.status === 'assigned_to_agent' ? "Agent Queue" :
                             "Resolved"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              
              /* Conversation Window active */
              <div className="flex-1 flex flex-col h-full animate-fadeIn">
                
                {/* Meta ticket header bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 mb-3 flex items-center justify-between shadow-xs">
                  <div className="text-left text-[10px]">
                    <span className="text-slate-400 block uppercase font-mono leading-none font-bold">
                      Ticket ID: {activeTicket.id.slice(4,12).toUpperCase()}
                    </span>
                    <span className="text-slate-800 font-extrabold block mt-0.5">
                      {activeTicket.subject}
                    </span>
                  </div>

                  <button 
                    onClick={() => setActiveTicketId(null)}
                    className="text-[9px] text-[#0c3e9e] font-extrabold hover:underline border-none bg-transparent cursor-pointer"
                  >
                    View All Tickets
                  </button>
                </div>

                {/* ESCALATION OPTION BAR */}
                {activeTicket.status === 'chatbot' && (
                  <div className="bg-[#fef3c7] border border-amber-200 rounded-xl p-2.5 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[10px] text-amber-800 font-bold leading-tight">
                        Need live human assistant?
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleEscalateClick}
                      className="text-[9.5px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-1.2 rounded-lg font-black transition cursor-pointer border-none shadow-xs uppercase tracking-wide flex items-center gap-1"
                    >
                      <Headphones className="w-3 h-3 text-white" />
                      Request Support Agent
                    </button>
                  </div>
                )}

                {activeTicket.status === 'assigned_to_agent' && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-2.5 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                    <span className="text-[10px] text-orange-950 font-bold leading-none">
                      {activeTicket.assignedAgentName 
                        ? `Connected with ${activeTicket.assignedAgentName}` 
                        : "Escalated: Waiting for help-desk officer to accept..."}
                    </span>
                  </div>
                )}

                {activeTicket.status === 'resolved' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-[10px] text-emerald-600 font-black leading-none">
                      This ticket is settled & closed.
                    </span>
                  </div>
                )}

                {/* Messages feed */}
                <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-3 overflow-y-auto space-y-3.5 max-h-[290px] min-h-[240px]">
                  
                  {activeTicket.messages.map((msg, idx) => {
                    const isMe = msg.sender === 'customer';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={`${msg.id}_${idx}`} className="text-center text-[9px] font-mono text-slate-400 capitalize px-2">
                          💡 {msg.text} ({msg.timestamp})
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={`${msg.id}_${idx}`} 
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        {/* Sender handle */}
                        <span className="text-[8px] font-bold text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                          {msg.sender === 'bot' && <Sparkles className="w-2.5 h-2.5 text-blue-500" />}
                          {msg.senderName}
                        </span>

                        {/* Msg bubble */}
                        <div className={`p-2.5 rounded-2xl max-w-[85%] text-[10.5px] leading-relaxed shadow-xs ${
                          isMe 
                            ? "bg-[#0c3e9e] text-white rounded-tr-none" 
                            : msg.sender === 'bot' 
                              ? "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50" 
                              : "bg-orange-50 text-orange-900 rounded-tl-none border border-orange-100"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[7.5px] text-slate-350 mt-0.5 px-1 font-mono">{msg.timestamp}</span>
                      </div>
                    );
                  })}

                  {/* AI Bot thinking indicator */}
                  {isBotThinking && (
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] font-bold text-[#0c3e9e] mb-0.5 px-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#0c3e9e] animate-pulse" />
                        AI Automated Support Chatbot
                      </span>
                      <div className="p-2.5 rounded-2xl rounded-tl-none bg-slate-50 text-slate-500 flex items-center gap-1.5 text-[10.5px] border border-slate-200/50">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                        <span>Processing with Model...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Support Response input footer */}
                {activeTicket.status !== 'resolved' ? (
                  <form onSubmit={handleSendChatReply} className="mt-2.5 flex gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={activeTicket.status === 'chatbot' ? "Send chat to bot..." : "Talk to live partner..."}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-[#0c3e9e]"
                    />
                    <button
                      type="submit"
                      className="bg-[#0c3e9e] hover:bg-[#0a3280] text-white p-2 rounded-xl flex items-center justify-center transition border-none cursor-pointer shadow-sc"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </form>
                ) : (
                  <div className="mt-2 text-center text-[10px] bg-slate-100 p-2 rounded-xl text-slate-500 font-semibold uppercase">
                    🔒 Chat sessions have been locked
                  </div>
                )}
                
              </div>
            )}

          </div>

          {/* Secure watermark */}
          <div className="bg-slate-100 p-2 text-center text-[8.5px] font-mono text-slate-400 border-t border-slate-200/50 shrink-0">
             HelpDesk v2.1 • Transports Escalation Protocol Settle Status
          </div>

        </div>
      )}
    </div>
  );
}

// Custom simple helper identifier for BadHelp icon
function BadHelp({ className }: { className?: string }) {
  return (
    <HelpCircle className={className} />
  );
}
