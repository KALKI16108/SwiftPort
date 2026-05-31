import React, { useState } from "react";
import { 
  Building, 
  User, 
  Lock, 
  LogIn, 
  LogOut, 
  MessageSquare, 
  CheckCircle, 
  UserCheck, 
  Terminal, 
  HelpCircle, 
  Clock, 
  Inbox, 
  Activity, 
  Send, 
  AlertCircle,
  PackageCheck,
  Check
} from "lucide-react";
import { SupportTicket, SupportMessage } from "../types";

interface SupportAgentPanelProps {
  tickets: SupportTicket[];
  onSendMessage: (ticketId: string, text: string, sender: 'customer' | 'bot' | 'agent' | 'system', senderName?: string) => void;
  onAssignTicket: (ticketId: string, agentName: string) => void;
  onResolveTicket: (ticketId: string) => void;
  onLogout?: () => void;
}

export default function SupportAgentPanel({
  tickets,
  onSendMessage,
  onAssignTicket,
  onResolveTicket,
  onLogout
}: SupportAgentPanelProps) {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("admin@swiftport.com");
  const [password, setPassword] = useState("swiftport123");
  const [agentName, setAgentName] = useState("Agent Rohan");
  const [loginError, setLoginError] = useState("");

  // Active terminal selection state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [agentMessage, setAgentMessage] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'assigned' | 'resolved'>('all'); // Set to default 'all' for clean initial view

  // Support Capacity Limits state
  const [maxCapacity, setMaxCapacity] = useState<number>(3); // Capacity limit from 2 to 4
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError("Please enter your agent credentials.");
      return;
    }
    if (password !== "swiftport123") {
      setLoginError("Invalid credentials. Try 'swiftport123' for simulator access.");
      return;
    }
    
    setLoginError("");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Filtered tickets count
  const totalTicketsCount = tickets.length;
  const pendingTicketsCount = tickets.filter(t => t.status === 'assigned_to_agent' && !t.assignedAgentName).length;
  const assignedTicketsCount = tickets.filter(t => t.status === 'assigned_to_agent' && t.assignedAgentName === agentName).length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'resolved').length;

  const filteredTickets = tickets.filter(t => {
    if (filterType === 'pending') return t.status === 'assigned_to_agent' && !t.assignedAgentName;
    if (filterType === 'assigned') return t.status === 'assigned_to_agent' && t.assignedAgentName === agentName;
    if (filterType === 'resolved') return t.status === 'resolved';
    return true; // model 'all'
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Agent claims/accepts the tickets
  const handleAcceptTicket = (ticketId: string) => {
    if (assignedTicketsCount >= maxCapacity) {
      setCapacityWarning(`Desk is currently at maximum capacity limit of ${maxCapacity} tickets! Please resolve one of your active chats first.`);
      setTimeout(() => setCapacityWarning(null), 5000);
      return;
    }
    setCapacityWarning(null);
    onAssignTicket(ticketId, agentName);
  };

  // Agent replies to customer support tickets
  const handleSendAgentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentMessage.trim() || !selectedTicketId) return;

    onSendMessage(selectedTicketId, agentMessage.trim(), 'agent', agentName);
    setAgentMessage("");
  };

  return (
    <div id="support-agent-terminal" className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl min-h-[580px] flex flex-col font-sans text-slate-800">
      
      {/* Banner Header */}
      <div className="bg-[#0c3e9e] text-white px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest text-white uppercase font-mono">Agent Support Terminal</h2>
            <p className="text-[10px] text-blue-200 font-medium">Internal HelpDesk Control Console</p>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-3">
            {/* Seat Capacity Config */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 text-xs text-white">
              <span className="text-[10px] font-black text-blue-200 uppercase tracking-wider font-mono">Desk Capacity:</span>
              <select
                value={maxCapacity}
                onChange={(e) => {
                  setMaxCapacity(parseInt(e.target.value));
                  setCapacityWarning(null);
                }}
                className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer text-xs border-none select-none outline-none mr-1"
                style={{ colorScheme: 'dark' }}
              >
                <option value={2} className="text-slate-800 bg-white">2 tickets</option>
                <option value={3} className="text-slate-800 bg-white">3 tickets</option>
                <option value={4} className="text-slate-800 bg-white">4 tickets</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black">{agentName} (Rider Support)</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Terminal Frame */}
      {!isLoggedIn ? (
        
        /* 1. AGENT LOGIN VIEW */
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2.5xl p-6.5 shadow-lg space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-[#0c3e9e] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase text-[#0c3e9e] tracking-wide">HelpDesk Credentials</h3>
              <p className="text-[11px] text-slate-500">Sign in to claim escalated customer support sessions.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {loginError && (
                <div className="bg-rose-50 border border-rose-150 text-rose-700 p-2.5 rounded-xl text-[10.5px] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email credentials */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Agent Login Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-[#0c3e9e]"
                    placeholder="e.g., admin@swiftport.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Secret Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-[#0c3e9e]"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-[9px] text-[#0c3e9e] font-semibold pl-1">
                  💡 Sandbox Password rule: <strong className="font-black font-mono">swiftport123</strong>
                </p>
              </div>

              {/* Selected Agent Name Profile */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-black text-slate-400 block pl-1">Select Active Agent Handle</label>
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-[#0c3e9e] font-bold"
                >
                  <option value="Agent Rohan">Agent Rohan (Logistics Head)</option>
                  <option value="Agent Priya">Agent Priya (Operations Direct)</option>
                  <option value="Agent Sneha">Agent Sneha (Instant Refund Supervisor)</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0c3e9e] hover:bg-[#0a3280] text-white font-black uppercase tracking-wider rounded-xl transition cursor-pointer border-none shadow text-[10.5px]"
              >
                Sign In to Settle Queue
              </button>
            </form>
          </div>
        </div>
      ) : (
        
        /* 2. LIVE SUPPORT DESK CONTROL FRAME */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left panel: tickets lists */}
          <div className="md:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50">
            
            {/* Counts overview banners */}
            <div className="p-3 grid grid-cols-4 gap-1.5 text-center bg-white border-b border-slate-100 shrink-0">
              <div className="p-1 bg-slate-100 rounded-lg">
                <span className="font-black text-slate-700 text-xs block">{totalTicketsCount}</span>
                <span className="text-[8px] uppercase font-extrabold text-slate-400">Total</span>
              </div>
              <div className={`p-1 rounded-lg ${pendingTicketsCount > 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-500"}`}>
                <span className="font-black text-xs block animate-pulse">{pendingTicketsCount}</span>
                <span className="text-[8px] uppercase font-extrabold text-slate-400">Pending</span>
              </div>
              <div className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                <span className="font-black text-xs block">{assignedTicketsCount}</span>
                <span className="text-[8px] uppercase font-extrabold text-slate-400">My Queue</span>
              </div>
              <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                <span className="font-black text-xs block">{resolvedTicketsCount}</span>
                <span className="text-[8px] uppercase font-extrabold text-slate-400">Closed</span>
              </div>
            </div>

            {capacityWarning && (
              <div className="mx-3 my-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold p-3 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                <span>{capacityWarning}</span>
              </div>
            )}

            {/* Selector Filters Tabs */}
            <div className="px-3 py-2 bg-slate-100/60 border-b border-slate-200 shrink-0 flex gap-1">
              <button
                onClick={() => setFilterType('pending')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[9.5px] font-extrabold transition uppercase tracking-wider border-none cursor-pointer ${
                  filterType === 'pending' ? "bg-[#0c3e9e] text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"
                }`}
              >
                Waiting ({pendingTicketsCount})
              </button>
              <button
                onClick={() => setFilterType('assigned')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[9.5px] font-extrabold transition uppercase tracking-wider border-none cursor-pointer ${
                  filterType === 'assigned' ? "bg-[#0c3e9e] text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"
                }`}
              >
                My Active ({assignedTicketsCount})
              </button>
              <button
                onClick={() => setFilterType('resolved')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[9.5px] font-extrabold transition uppercase tracking-wider border-none cursor-pointer ${
                  filterType === 'resolved' ? "bg-[#0c3e9e] text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"
                }`}
              >
                Closed ({resolvedTicketsCount})
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`py-1 px-2 rounded-lg text-[9.5px] font-extrabold transition uppercase tracking-wider border-none cursor-pointer ${
                  filterType === 'all' ? "bg-[#0c3e9e] text-white" : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800"
                }`}
              >
                All
              </button>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[460px]">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Inbox className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-[11px] font-medium">No tickets match this filter.</p>
                </div>
              ) : (
                filteredTickets.map((ticket, idx) => {
                  const isAssignedToMe = ticket.assignedAgentName === agentName;
                  const isPending = ticket.status === 'assigned_to_agent' && !ticket.assignedAgentName;

                  return (
                    <div
                      key={`${ticket.id}_${idx}`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-3 rounded-2xl cursor-pointer text-left transition relative border ${
                        selectedTicketId === ticket.id 
                          ? "bg-white border-[#0c3e9e] shadow-md ring-2 ring-[#0c3e9e]/10" 
                          : "bg-white border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-1.5 flex-wrap gap-1">
                        <span className="font-black text-xs text-slate-900 leading-tight">
                          {ticket.subject}
                        </span>
                        
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          ticket.status === 'resolved' ? "bg-emerald-50 text-emerald-600 border border-emerald-250" :
                          isAssignedToMe ? "bg-blue-50 text-blue-600 border border-blue-200" :
                          isPending ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" :
                          "bg-slate-50 text-slate-500"
                        }`}>
                          {ticket.status === 'resolved' ? "Closed" :
                           isAssignedToMe ? "My Chat" :
                           isPending ? "Waiting Agent" :
                           "Claimed"}
                        </span>
                      </div>

                      {/* Snippet message body */}
                      {ticket.messages.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate mb-2 mt-0.5 font-medium">
                          Customer: "{ticket.messages[ticket.messages.length - 1].text}"
                        </p>
                      )}

                      {/* Footer Info */}
                      <div className="flex justify-between items-center text-[8.5px] text-slate-450 font-mono">
                        <span>ID: {ticket.id.slice(4,10).toUpperCase()} • {ticket.customerName}</span>
                        <span>{ticket.createdAt}</span>
                      </div>

                      {/* Linked booking label */}
                      {ticket.bookingId && (
                        <span className="absolute -top-1.5 -right-1 flex items-center gap-1 bg-[#0c3e9e] text-white font-extrabold text-[7.5px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-white">
                          <PackageCheck className="w-2 h-2 text-white" />
                          Shipment Linked
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right main panel: chat interactions detail */}
          <div className="md:col-span-7 flex flex-col bg-white">
            {!selectedTicket ? (
              
              /* Default Welcome Splash Screen */
              <div className="flex-1 flex flex-col justify-center items-center text-slate-450 p-6 text-center space-y-3.5">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 border border-slate-150 rounded-2.5xl flex items-center justify-center shadow-xs">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wide">Select a Ticket Entry</h4>
                  <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed mt-1">
                    Select any waiting customer ticket in the left tray to connect as active support, check linked cargo history, and chat.
                  </p>
                </div>
              </div>
            ) : (
              
              /* Conversation Desk active */
              <div className="flex-1 flex flex-col h-full overflow-hidden p-4">
                
                {/* Selected Ticket Head Detail info bar */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 shrink-0 flex justify-between items-center flex-wrap gap-3">
                  <div className="text-left bg-transparent">
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase">
                      Ticket ID: {selectedTicket.id.slice(4, 15).toUpperCase()}
                    </span>
                    <h3 className="font-black text-xs text-slate-900 mt-1.5 leading-none">{selectedTicket.subject}</h3>
                    
                    <div className="flex items-center gap-2 mt-1 px-0.5">
                      <span className="text-[10px] text-slate-550">
                        Customer: <strong className="text-slate-800">{selectedTicket.customerName}</strong>
                      </span>
                      {selectedTicket.bookingId && (
                        <span className="text-[10px] text-slate-450 font-mono">
                          • Booking ID: {selectedTicket.bookingId.slice(4, 12).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational actions: Assign/Claim or Resolve */}
                  <div className="flex gap-2">
                    {/* Accept button claims waiting ticket */}
                    {selectedTicket.status === 'assigned_to_agent' && !selectedTicket.assignedAgentName && (
                      <button
                        type="button"
                        onClick={() => handleAcceptTicket(selectedTicket.id)}
                        className="py-1.8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black transition cursor-pointer border-none shadow-sm uppercase tracking-wide flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-white animate-pulse" />
                        Accept & Start Chat
                      </button>
                    )}

                    {/* Mark Resolved claims ticket */}
                    {selectedTicket.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => onResolveTicket(selectedTicket.id)}
                        className="py-1.8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition cursor-pointer border-none shadow-sm uppercase tracking-wide flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Linked shipment advisory info bar if applicable */}
                {selectedTicket.bookingId && (
                  <div className="mx-0.5 mt-2.5 bg-[#f0f9ff] border border-blue-150 rounded-xl px-3 py-2 text-[10px] leading-relaxed text-blue-700 flex items-start gap-2.5">
                    <PackageCheck className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-blue-900">Live Linked Shipment Metadata</p>
                      <p className="text-[9px] text-[#002e6e] mt-0.5">
                        This customer filed this inquiry representing an ongoing logistics trip. You can verify their live coordinates on the live tracking panel if requested.
                      </p>
                    </div>
                  </div>
                )}

                {/* Conversation Chat list */}
                <div className="flex-1 my-3 bg-slate-50 border border-slate-200/50 rounded-2xl p-4.5 overflow-y-auto space-y-3.5 max-h-[300px]">
                  {selectedTicket.messages.map((msg, idx) => {
                    const isUserSelf = msg.sender === 'agent' && msg.senderName === agentName;
                    const isSystem = msg.sender === 'system';
                    const isCustomer = msg.sender === 'customer';

                    if (isSystem) {
                      return (
                        <div key={`${msg.id}_${idx}`} className="text-center text-[9px] font-mono text-slate-400 capitalize bg-slate-100/60 p-1 rounded">
                          📌 {msg.text} • {msg.timestamp}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${msg.id}_${idx}`}
                        className={`flex flex-col ${isUserSelf ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[8.5px] font-bold text-slate-400 mb-0.5 px-0.5">
                          {msg.senderName} ({msg.sender.toUpperCase()})
                        </span>

                        <div className={`p-2.5 rounded-2xl max-w-[85%] text-[10.5px] leading-relaxed shadow-xs ${
                          isUserSelf 
                            ? "bg-[#0c3e9e] text-white rounded-tr-none" 
                            : isCustomer
                              ? "bg-stone-200 text-stone-900 rounded-tl-none border border-stone-250/55" 
                              : "bg-blue-100 text-blue-950 rounded-tl-none border border-blue-200"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[7.5px] text-slate-350 font-mono mt-0.5 px-0.5">{msg.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Send Footer replies inputs */}
                {selectedTicket.status !== 'resolved' ? (
                  <form onSubmit={handleSendAgentMessage} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      required
                      disabled={selectedTicket.status === 'assigned_to_agent' && !selectedTicket.assignedAgentName}
                      value={agentMessage}
                      onChange={(e) => setAgentMessage(e.target.value)}
                      placeholder={
                        selectedTicket.status === 'assigned_to_agent' && !selectedTicket.assignedAgentName
                          ? "Claim this ticket above to start chatting with the customer..."
                          : "Type your dispatcher message here..."
                      }
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.8 text-xs focus:outline-[#0c3e9e] disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={selectedTicket.status === 'assigned_to_agent' && !selectedTicket.assignedAgentName}
                      className="bg-[#0c3e9e] hover:bg-[#0a3280] text-white px-4.5 rounded-xl flex items-center justify-center font-bold text-xs transition border-none cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-150 p-2 text-center text-[10px] font-bold rounded-xl uppercase shrink-0">
                    🔒 This support conversation query has been resolved & closed.
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
