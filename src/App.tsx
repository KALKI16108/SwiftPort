import React, { useState, useEffect } from "react";
import { LocationPoint, Vehicle, DeliveryOrder, Driver, ChatMessage, JoineeApplication, WithdrawalRequest, SupportTicket, SupportMessage } from "./types";
import { LOCATIONS, VEHICLES, DRIVERS, calculateDistance } from "./data/mockData";
import MapVisualization from "./components/MapVisualization";
import VehicleSelector from "./components/VehicleSelector";
import BookingForm from "./components/BookingForm";
import DriverChat from "./components/DriverChat";
import DriverConsole from "./components/DriverConsole";
import IncomingAlertOverlay from "./components/IncomingAlertOverlay";
import PaymentMethodsModal from "./components/PaymentMethodsModal";
import CustomerSupportWidget from "./components/CustomerSupportWidget";
import SupportAgentPanel from "./components/SupportAgentPanel";
import RateDriverModal from "./components/RateDriverModal";
import SwiftPortLogo from "./components/SwiftPortLogo";
import { CustomerLoginForm } from "./components/CustomerLoginForm";
import CustomerHomeTab from "./components/CustomerHomeTab";
import CustomerOrdersTab from "./components/CustomerOrdersTab";
import CustomerPaymentsTab from "./components/CustomerPaymentsTab";
import CustomerProfileTab from "./components/CustomerProfileTab";
import { DriverOnboardingForm } from "./components/DriverOnboardingForm";
import { APIProvider } from "@vis.gl/react-google-maps";
import { 
  Bike, Truck, Bus, Grid, Compass, Navigation, MapPin, 
  History, UserCheck, ShieldCheck, CreditCard, Sparkles, AlertCircle, Info, Clock, CheckCircle, Headphones,
  Heart, Building, Gift, User, Wallet, ArrowRight, Receipt, FileText, LogOut, Share2, PlusCircle, Plus, Check, Trash2, Menu, X, ChevronRight
} from "lucide-react";

// Prepopulate history with realistic completed trips to make the system rich from launch
const PAST_ORDERS_PRESET: DeliveryOrder[] = [
  {
    id: "ord_past_01",
    pickup: LOCATIONS[3], // Dadar
    dropoff: LOCATIONS[0], // Bandra
    vehicle: VEHICLES[0], // 2wheeler
    cargoDescription: "Urgent signed legal paper files and a hardbacked laptop casing",
    cargoCategory: "Documents",
    weightEstimate: 2,
    labourType: "none",
    basePrice: 40,
    distancePrice: 48, // 6km * 8
    labourPrice: 0,
    totalPrice: 88,
    status: "delivered",
    distanceKm: 6,
    chats: [
      { id: "c1", sender: "system", text: "Dispatch created", timestamp: "10:15 AM" },
      { id: "c2", sender: "driver", text: "Documents acquired. Riding on expressway", timestamp: "10:20 AM" },
      { id: "c3", sender: "driver", text: "Reached building lobby", timestamp: "10:35 AM" },
      { id: "c4", sender: "system", text: "Delivered to reception", timestamp: "10:41 AM" }
    ],
    createdAt: "May 29, 2026",
    driver: DRIVERS[0]
  },
  {
    id: "ord_past_02",
    pickup: LOCATIONS[1], // Andheri
    dropoff: LOCATIONS[2], // Powai
    vehicle: VEHICLES[2], // 8ft Tata Ace
    cargoDescription: "Double-sized wooden cupboard and glass study computer desk",
    cargoCategory: "Furniture/Appliances",
    weightEstimate: 140,
    labourType: "driver",
    basePrice: 300,
    distancePrice: 154, // 7km * 22
    labourPrice: 250,
    totalPrice: 704,
    status: "delivered",
    distanceKm: 7,
    chats: [
      { id: "c1", sender: "system", text: "Dispatch created", timestamp: "02:10 PM" },
      { id: "user", sender: "user", text: "Cupboard is extremely heavy, please bring support ropes", timestamp: "02:11 PM" },
      { id: "c3", sender: "driver", text: "Ropes and cardboard edges secured, don't worry", timestamp: "02:13 PM" },
      { id: "c4", sender: "driver", text: "Loaded! Starting GPS navigator", timestamp: "02:30 PM" },
      { id: "c5", sender: "system", text: "Cargo delivered beautifully with zero scratches", timestamp: "02:55 PM" }
    ],
    createdAt: "May 28, 2026",
    driver: DRIVERS[2]
  }
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  const [activeTab, setActiveTab] = useState<"book" | "orders" | "payments" | "profile" | "refer">("book");
  const [bypassKeyCheck, setBypassKeyCheck] = useState(true);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);

  // Consolidated Role-based account environment switcher
  const [currentRole, setCurrentRole] = useState<'customer' | 'driver' | 'support' | 'admin' | null>(() => {
    return (localStorage.getItem("ais_porter_clone_current_role") as any) || null;
  });

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem("ais_porter_clone_current_role", currentRole);
    } else {
      localStorage.removeItem("ais_porter_clone_current_role");
    }
  }, [currentRole]);

  // Track if a partner is logged in to their rider account
  const [isRiderLoggedIn, setIsRiderLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("ais_porter_clone_rider_logged_in") === "true";
  });

  const [riderAuthTab, setRiderAuthTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_rider_logged_in", String(isRiderLoggedIn));
  }, [isRiderLoggedIn]);

  // Customer credentials and local session management (Solves Direct Login requirement)
  const [customerSession, setCustomerSession] = useState<{
    name: string;
    email: string;
    phone: string;
    walletBalance: number;
    couponApplied?: string;
  } | null>(() => {
    const stored = localStorage.getItem("ais_porter_clone_customer_session");
    return stored ? JSON.parse(stored) : null;
  });

  // Custom Confirmation Dialog for Order cancellation
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<any | null>(null);

  // Sync session state changes to local storage
  useEffect(() => {
    if (customerSession) {
      localStorage.setItem("ais_porter_clone_customer_session", JSON.stringify(customerSession));
    } else {
      localStorage.removeItem("ais_porter_clone_customer_session");
    }
  }, [customerSession]);

  // Dynamic system state for registered drivers list
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const stored = localStorage.getItem("ais_porter_clone_drivers");
    const raw = stored ? JSON.parse(stored) : DRIVERS;
    return raw.map((d: any) => ({
      ...d,
      walletBalance: typeof d.walletBalance === 'number' ? d.walletBalance : 1500,
      walletTransactions: d.walletTransactions || [],
      incentiveClaimedToday: !!d.incentiveClaimedToday
    }));
  });

  // Real-time Partner Incentives Setup
  const [activeIncentive, setActiveIncentive] = useState(() => {
    const stored = localStorage.getItem("ais_porter_clone_active_incentive");
    return stored ? JSON.parse(stored) : {
      targetTrips: 5,
      rewardAmount: 350,
      description: "Rush Hour special: Complete 5 transit consignments today to trigger a pocket-heavy bonus!",
      isActive: true
    };
  });

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_active_incentive", JSON.stringify(activeIncentive));
  }, [activeIncentive]);

  // Dynamic system state for Withdrawal Requests
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const stored = localStorage.getItem("ais_porter_clone_withdrawal_requests");
    return stored ? JSON.parse(stored) : [
      {
        id: "wtd_01",
        driverId: "drv_01",
        driverName: "Ramesh Shinde",
        amount: 500,
        paymentType: "upi",
        upiId: "ramesh.shinde@okaxis",
        status: "approved",
        createdAt: new Date(Date.now() - 48*60*60*1000).toLocaleString(),
        processedAt: new Date(Date.now() - 47*60*60*1000).toLocaleString()
      },
      {
        id: "wtd_02",
        driverId: "drv_02",
        driverName: "Anil Kamble",
        amount: 800,
        paymentType: "bank",
        accountNumber: "9180902011244",
        ifscCode: "HDFC0000214",
        bankName: "HDFC Bank",
        status: "pending",
        createdAt: new Date(Date.now() - 6*60*60*1000).toLocaleString()
      }
    ];
  });

  // Share active simulated driver ID across the system
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    const stored = localStorage.getItem("ais_porter_clone_active_driver_id");
    return stored || (drivers[0]?.id || "drv_01");
  });

  // Track skipped order IDs for each driver to prevent double-buzzing skipped alerts
  const [skippedOrderIds, setSkippedOrderIds] = useState<{ [driverId: string]: string[] }>(() => {
    const stored = localStorage.getItem("ais_porter_clone_skipped_orders");
    return stored ? JSON.parse(stored) : {};
  });

  // Dynamic system state for onboarding partner joinees
  const [joinees, setJoinees] = useState<JoineeApplication[]>(() => {
    const stored = localStorage.getItem("ais_porter_clone_joinees");
    return stored ? JSON.parse(stored) : [];
  });

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const stored = localStorage.getItem("ais_porter_clone_support_tickets");
    if (stored) return JSON.parse(stored);
    
    // Default preset tickets
    return [
      {
        id: "tkt_sample_1",
        customerName: "Siddhant Pitale",
        customerEmail: "siddhantpitale125@gmail.com",
        subject: "Pricing Inquiry",
        status: "resolved",
        messages: [
          {
            id: "m1",
            sender: "customer",
            senderName: "Siddhant Pitale",
            text: "Hello, I wanted to understand how loading labor charges are computed?",
            timestamp: "11:05 AM"
          },
          {
            id: "m2",
            sender: "bot",
            senderName: "AI Support Assist",
            text: "Hello! Welcome to SwiftPort Support. SwiftPort calculates fixed extra labor costs based on helper selections. Driver-only loading service adds a baseline of ₹250. Selecting robust Driver + Helper loading adds an all-inclusive ₹750 charge to safeguard your fragile cargos on transit. Let me know if you need to connect with live human support!",
            timestamp: "11:06 AM"
          },
          {
            id: "m3",
            sender: "system",
            senderName: "System",
            text: "This support ticket session has been marked as Resolved & closed by HelpDesk.",
            timestamp: "11:10 AM"
          }
        ],
        createdAt: "May 30, 2026",
        updatedAt: "May 30, 2026"
      },
      {
        id: "tkt_sample_2",
        customerName: "Siddhant Pitale",
        customerEmail: "siddhantpitale125@gmail.com",
        subject: "Driver Partner Delay",
        status: "assigned_to_agent",
        messages: [
          {
            id: "m4",
            sender: "customer",
            senderName: "Siddhant Pitale",
            text: "My driver is stuck at the Dadar traffic block and has not advanced in 15 minutes. Can you check his location on the map?",
            timestamp: "12:15 PM"
          },
          {
            id: "m5",
            sender: "system",
            senderName: "System",
            text: "Transferring to live operator desk queue... Place in queue: #1. A live assistant will connect shortly.",
            timestamp: "12:16 PM"
          }
        ],
        createdAt: "May 30, 2026",
        updatedAt: "May 30, 2026"
      }
    ];
  });

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  
  // Shared Logistics States
  const [pickup, setPickup] = useState<LocationPoint>(LOCATIONS[0]); // Bandra
  const [dropoff, setDropoff] = useState<LocationPoint>(LOCATIONS[1]); // Andheri
  const [cargoDescription, setCargoDescription] = useState("Boxed commercial stocks and household goods");
  const [cargoCategory, setCargoCategory] = useState("General Goods");
  const [cargoWeight, setCargoWeight] = useState(50);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("2wheeler");
  const [labourType, setLabourType] = useState<'none' | 'driver' | 'driver-helper'>("none");
  const [isSearching, setIsSearching] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>("");
  const [bookerPaymentMethod, setBookerPaymentMethod] = useState<'cash_pickup' | 'cash_drop' | 'online'>('cash_pickup');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Orders Directory
  const [orders, setOrders] = useState<DeliveryOrder[]>(() => {
    // Attempt local storage recall
    const stored = localStorage.getItem("ais_porter_clone_orders");
    return stored ? JSON.parse(stored) : PAST_ORDERS_PRESET;
  });

  // GST details tracker state
  const [gstinDetails, setGstinDetails] = useState<{ gstin: string; businessName: string }>(() => {
    const stored = localStorage.getItem("ais_swiftport_gstin");
    return stored ? JSON.parse(stored) : { gstin: "", businessName: "" };
  });

  // Saved Addresses list state
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; name: string; address: string }>>(() => {
    const stored = localStorage.getItem("ais_swiftport_saved_addresses");
    if (stored) return JSON.parse(stored);
    return [
      { id: "adr_1", name: "Bandra Warehouse Depot", address: "Plot 12, G-Block, Bandra Kurla Complex, Mumbai 400051" },
      { id: "adr_2", name: "Andheri Retail Outlet", address: "32 New Link Road, Opp. Citi Mall, Andheri West, Mumbai 400053" },
      { id: "adr_3", name: "Wadala Logistics Hub", address: "Seashells Enclave, Anik Wadala Link Rd, Wadala East, Mumbai 400037" }
    ];
  });

  // Wallet transaction ledger logger state
  const [walletTransactions, setWalletTransactions] = useState<Array<{ id: string; amount: number; desc: string; timestamp: string; isCredit: boolean }>>(() => {
    const stored = localStorage.getItem("ais_swiftport_wallet_txs");
    if (stored) return JSON.parse(stored);
    return [
      { id: "tx_1", amount: 150, desc: "Welcome Account Setup Bonus", timestamp: "31/05/2026, 11:32 AM", isCredit: true },
      { id: "tx_2", amount: 200, desc: "Promo Code SWIFTPARTNER Applied", timestamp: "31/05/2026, 11:45 AM", isCredit: true }
    ];
  });

  // Synchronizers of custom fields to localStorage
  useEffect(() => {
    localStorage.setItem("ais_swiftport_gstin", JSON.stringify(gstinDetails));
  }, [gstinDetails]);

  useEffect(() => {
    localStorage.setItem("ais_swiftport_saved_addresses", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem("ais_swiftport_wallet_txs", JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // Multi-Trip State Management
  const [selectedActiveOrderId, setSelectedActiveOrderId] = useState<string | null>(null);
  const [forceShowBookingForm, setForceShowBookingForm] = useState(false);

  // Active Rating target order
  const [ratingOrder, setRatingOrder] = useState<DeliveryOrder | null>(null);

  // Top-up Sandbox Credit tracker state
  const [topupValue, setTopupValue] = useState<number>(500);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Track prompted or finished rating order IDs
  const [promptedRatings, setPromptedRatings] = useState<string[]>(() => {
    const stored = localStorage.getItem("ais_porter_clone_prompted_ratings");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_prompted_ratings", JSON.stringify(promptedRatings));
  }, [promptedRatings]);

  // Auto-prompt feedback modal when shipment transitions to 'delivered'
  useEffect(() => {
    const unratedDeliveredOrder = orders.find(
      o => o.status === 'delivered' && o.driver && !promptedRatings.includes(o.id) && !o.id.startsWith('ord_past_')
    );
    if (unratedDeliveredOrder) {
      setRatingOrder(unratedDeliveredOrder);
    }
  }, [orders, promptedRatings]);

  // Sync state properties automatically to local storage database
  useEffect(() => {
    localStorage.setItem("ais_porter_clone_active_driver_id", selectedDriverId);
  }, [selectedDriverId]);

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_skipped_orders", JSON.stringify(skippedOrderIds));
  }, [skippedOrderIds]);

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_withdrawal_requests", JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  // Calculate coordinates distance automatically
  const distanceKm = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

  // Sync to database local storage on modify
  useEffect(() => {
    localStorage.setItem("ais_porter_clone_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("ais_porter_clone_joinees", JSON.stringify(joinees));
  }, [joinees]);

  // Sync support tickets state
  useEffect(() => {
    localStorage.setItem("ais_porter_clone_support_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Support Ticket Helper Handler Functions
  const handleRaiseTicket = (subject: string, messageText: string, bookingId?: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userEmailStr = customerSession?.email || "customer@example.com";
    const userDisplayStr = customerSession?.name || "Premium Client";
    
    const initialCustomerMsg: SupportMessage = {
      id: `m_cust_${Date.now()}`,
      sender: "customer",
      senderName: userDisplayStr,
      text: messageText,
      timestamp: timestampStr
    };

    const welcomeMsg: SupportMessage = {
      id: `m_bot_init_${Date.now()}`,
      sender: "bot",
      senderName: "AI Support Assist",
      text: `Hello, ${userDisplayStr}! I have successfully logged your ticket for "${subject}". Our smart chatbot is reviewing your details to settle your query immediately...`,
      timestamp: timestampStr
    };

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      customerName: userDisplayStr,
      customerEmail: userEmailStr,
      subject,
      status: "chatbot",
      messages: [initialCustomerMsg, welcomeMsg],
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      bookingId
    };

    setTickets(prev => [newTicket, ...prev]);
    setActiveTicketId(newTicket.id);
  };

  const handleSendTicketMessage = (
    ticketId: string, 
    text: string, 
    sender: 'customer' | 'bot' | 'agent' | 'system',
    senderName?: string
  ) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const calculatedSenderName = 
          sender === 'customer' ? t.customerName :
          sender === 'bot' ? "AI Support Assist" :
          sender === 'system' ? "System" :
          (senderName || "Agent Help-Desk");

        const newMsg: SupportMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          sender,
          senderName: calculatedSenderName,
          text,
          timestamp: timestampStr
        };

        return {
          ...t,
          messages: [...t.messages, newMsg],
          updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return t;
    }));
  };

  const handleEscalateTicketToAgent = (ticketId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const escalateMsg: SupportMessage = {
          id: `msg_sys_${Date.now()}`,
          sender: "system",
          senderName: "System",
          text: "Transferring to live operator desk queue... Place in queue: #1. A live assistant will connect shortly.",
          timestamp: timestampStr
        };

        return {
          ...t,
          status: "assigned_to_agent",
          messages: [...t.messages, escalateMsg],
          updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return t;
    }));
  };

  const handleAssignAgentToTicket = (ticketId: string, agentNameStr: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const welcomeMsg: SupportMessage = {
          id: `msg_sys_assigned_${Date.now()}`,
          sender: "system",
          senderName: "System",
          text: `Support agent "${agentNameStr}" has connected to this chat log. Feel free to address your queries directly.`,
          timestamp: timestampStr
        };

        return {
          ...t,
          assignedAgentName: agentNameStr,
          messages: [...t.messages, welcomeMsg],
          updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return t;
    }));
  };

  const handleResolveSupportTicket = (ticketId: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const closeMsg: SupportMessage = {
          id: `msg_sys_resolved_${Date.now()}`,
          sender: "system",
          senderName: "System",
          text: "This support ticket session has been marked as Resolved & closed by HelpDesk.",
          timestamp: timestampStr
        };

        return {
          ...t,
          status: "resolved",
          messages: [...t.messages, closeMsg],
          updatedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return t;
    }));
  };

  // Multi-Trip Filter: Ongoing active orders
  const activeOrders = orders.filter(
    o => o.status !== "delivered" && o.status !== "cancelled"
  );

  // Identify active order if any is currently in development checklist
  const currentActiveOrder = (() => {
    // If there is any searching order, force select it so they can see assignment
    const searching = activeOrders.find(o => o.status === "searching");
    if (searching) return searching;
    
    if (selectedActiveOrderId) {
      const match = activeOrders.find(o => o.id === selectedActiveOrderId);
      if (match) return match;
    }
    return activeOrders[0] || null;
  })();

  // Derived state for toggling the booking panels view vs trip tracker
  const isShowingBookingForm = !currentActiveOrder || (forceShowBookingForm && !activeOrders.some(o => o.status === 'searching') && activeOrders.length < 5);

  // Auto-search driver timer simulation (For customers who are sitting back and relaxing)
  useEffect(() => {
    let timerId: any;
    if (currentActiveOrder?.status === "searching") {
      // Check if the current driver is suspended or skipped the order
      const activeDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
      const isSuspended = activeDriver?.suspendedUntil
        ? new Date(activeDriver.suspendedUntil).getTime() > Date.now()
        : false;
      const hasSkipped = (skippedOrderIds[selectedDriverId] || []).includes(currentActiveOrder.id);

      // If active driver is suspended or skipped, match a different driver immediately (quick match in 3s)
      // Otherwise, give the active driver 13 seconds (10s countdown + 3s buffer) to accept manually.
      const delayMs = (isSuspended || hasSkipped) ? 3000 : 13000;

      timerId = setTimeout(async () => {
        // Exclude driver if they are suspended or skipped this order
        const activeDriversList = drivers.length > 0 ? drivers : DRIVERS;
        const availableDrivers = activeDriversList.filter(d => {
          const isDrvSuspended = d.suspendedUntil 
            ? new Date(d.suspendedUntil).getTime() > Date.now() 
            : false;
          const isDrvSkipped = (skippedOrderIds[d.id] || []).includes(currentActiveOrder.id);
          return !isDrvSuspended && !isDrvSkipped;
        });

        // Sort available drivers by proximity to order pickup and match the closest available rider first
        const sortedAvailable = [...availableDrivers].map(d => {
          const dist = calculateDistance(d.currentLat, d.currentLng, currentActiveOrder.pickup.lat, currentActiveOrder.pickup.lng);
          return { driver: d, distance: dist };
        }).sort((a, b) => a.distance - b.distance);

        const matchedDriver = sortedAvailable.length > 0
          ? sortedAvailable[0].driver
          : (activeDriversList.length > 0 ? activeDriversList[0] : DRIVERS[0]);

        // Let's call the AI instructions proxy server-side route to generate driver briefs!
        let instructions = "Drive carefully. Verify package count before departing from source.";
        try {
          const aiRes = await fetch("/api/ai/delivery-instructions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cargoDescription,
              pickupName: pickup.name,
              dropoffName: dropoff.name
            })
          });
          const aiData = await aiRes.json();
          if (aiData.instructions) {
            instructions = aiData.instructions;
          }
        } catch (e) {
          console.error("AI driver briefing grab failed:", e);
        }

        setAiBriefing(instructions);

        // Transition dispatch state only if the order is STILL in searching mode (hasn't been accepted manually)
        setOrders(prev => prev.map(o => {
          if (o.id === currentActiveOrder.id && o.status === "searching") {
            return {
              ...o,
              status: "assigned",
              driver: matchedDriver,
              chats: [
                ...o.chats,
                { id: `sys_m_${Date.now()}`, sender: "system", text: `Driver Partner Match Found: ${matchedDriver.name}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { id: `ai_m_${Date.now()}`, sender: "ai", text: `🤖 AI Dispatch Briefing: "${instructions}"`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { id: `drv_m_${Date.now()}`, sender: "driver", text: "Hello! I have accepted your SwiftPort booking. Heading to your pickup point right now.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
              ]
            };
          }
          return o;
        }));
      }, delayMs);
    }
    return () => clearTimeout(timerId);
  }, [currentActiveOrder?.status, currentActiveOrder?.id, selectedDriverId, skippedOrderIds, drivers]);

  // Handle direct custom configurations applying from the Gemini AI Assistant
  const handleApplyAISuggestions = (vehicleId: string, weight: number, crewSuggest: 'none' | 'driver' | 'driver-helper', category: string) => {
    setSelectedVehicleId(vehicleId);
    setCargoWeight(weight);
    setLabourType(crewSuggest);
    setCargoCategory(category);
  };

  const getCalculatedPrice = () => {
    const vehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];
    const basePrice = vehicle.baseFare;
    const distancePrice = Math.round(distanceKm * vehicle.ratePerKm);
    
    let labourPrice = 0;
    if (labourType === "driver") labourPrice = 250;
    if (labourType === "driver-helper") labourPrice = 750;

    const baseSum = basePrice + distancePrice + labourPrice;
    
    // Apply ₹200 referral discount if they signed up using a driver code
    if (customerSession?.couponApplied && baseSum > 200) {
      return baseSum - 200;
    }
    return baseSum;
  };

  // Trigger New Core Customer Booking
  const handleCreateBooking = () => {
    const totalPrice = getCalculatedPrice();

    if (bookerPaymentMethod === 'online') {
      if (!customerSession) {
        alert("Please register or log in first to complete a booking.");
        return;
      }
      if (customerSession.walletBalance < totalPrice) {
        alert(`Insufficient Wallet Balance! This shipment costs ₹${totalPrice}, but your current wallet balance is ₹${customerSession.walletBalance}.\n\nPlease head to the 'Payments' tab in your footer menu to top up your credits, or switch your payment method to Cash to dispatch immediately.`);
        return;
      }

      // Deduct wallet balance
      const newBalance = customerSession.walletBalance - totalPrice;
      setCustomerSession(prev => prev ? { ...prev, walletBalance: newBalance } : null);

      // Log wallet transaction entry
      setWalletTransactions(prev => [
        {
          id: `tx_${Date.now()}`,
          amount: totalPrice,
          desc: `Paid for cargo delivery (Booking #${Date.now().toString().slice(-4)})`,
          timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
          isCredit: false
        },
        ...prev
      ]);
    }

    setIsSearching(true);

    const vehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];
    const basePrice = vehicle.baseFare;
    const distancePrice = Math.round(distanceKm * vehicle.ratePerKm);
    
    let labourPrice = 0;
    if (labourType === "driver") labourPrice = 250;
    if (labourType === "driver-helper") labourPrice = 750;

    const newOrder: DeliveryOrder = {
      id: `ord_${Date.now()}`,
      pickup,
      dropoff,
      vehicle,
      cargoDescription: cargoDescription || "Assorted general logistics box packages",
      cargoCategory: cargoCategory || "General Goods",
      weightEstimate: cargoWeight,
      labourType,
      basePrice,
      distancePrice,
      labourPrice,
      totalPrice,
      status: "searching",
      distanceKm,
      paymentMethod: bookerPaymentMethod,
      paymentStatus: bookerPaymentMethod === 'online' ? 'paid' : 'pending',
      chats: [
        { id: `sys_${Date.now()}`, sender: "system", text: `Order created. Payment via: ${bookerPaymentMethod === 'online' ? 'Online Pre-paid (Verified)' : bookerPaymentMethod === 'cash_drop' ? 'Cash at Drop-off' : 'Cash at Pickup'}. Looking for closest partner network...`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ],
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setOrders(prev => [newOrder, ...prev]);
    setIsSearching(false);
    setForceShowBookingForm(false);
    setSelectedActiveOrderId(newOrder.id);
    setActiveTab("orders"); // Auto redirect to orders tab for active tracking!
  };

  // Driver Console Event: Accept Ride
  const handleDriverAcceptRide = (orderId: string, customDriver?: Driver) => {
    // Find active driver profile in state
    const matchedDriver = customDriver || drivers.find(d => d.id === selectedDriverId) || drivers[0];
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "assigned",
          driver: matchedDriver,
          chats: [
            ...o.chats,
            { id: `sys_${Date.now()}`, sender: "system", text: `Driver Partner ${matchedDriver.name} accepted booking live`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            { id: `drv_msg_${Date.now()}`, sender: "driver", text: "Confirmed! Reaching your pickup site immediately.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return o;
    }));
  };

  // Driver declines/misses a ringing dispatch request
  const handleDriverDeclineAlert = (orderId: string, driverId: string) => {
    setSkippedOrderIds(prev => {
      const currentSkips = prev[driverId] || [];
      if (!currentSkips.includes(orderId)) {
        return {
          ...prev,
          [driverId]: [...currentSkips, orderId]
        };
      }
      return prev;
    });
  };

  // Driver Cancels/Forfeits an accepted match (counts towards suspensions threshold)
  const handleDriverCancelOrder = (orderId: string, driverId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "cancelled",
          chats: [
            ...o.chats,
            { id: `sys_c_${Date.now()}`, sender: "system", text: `Active dispatch matched contract CANCELLED by Driver Partner. Relisting shipment...`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return o;
    }));

    // Increment driver's cancellation counter & deduct penalty
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const currentCount = (d.cancellationsToday || 0) + 1;
        let suspendedUntil = d.suspendedUntil;
        if (currentCount >= 3) {
          // Suspend driver for exactly 1 hour from now
          suspendedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        }
        const penaltyTx = {
          id: `tx_cancel_${Date.now()}`,
          amount: -150,
          desc: `Cancellation Penalty: Forfeited accepted dispatch #${orderId}`,
          timestamp: new Date().toLocaleString(),
          type: 'penalty_forfeit' as const
        };
        return {
          ...d,
          walletBalance: (d.walletBalance || 0) - 150,
          walletTransactions: [...(d.walletTransactions || []), penaltyTx],
          cancellationsToday: currentCount,
          suspendedUntil
        };
      }
      return d;
    }));
  };

  // Instantly restore driver stands (Bypass/Clear Penalty)
  const handleLiftDriverSuspension = (driverId: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return {
          ...d,
          cancellationsToday: 0,
          suspendedUntil: undefined
        };
      }
      return d;
    }));
  };

  // Submit a brand new cash payout request for a partner driver
  const handleDriverRequestWithdrawal = (requestData: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: WithdrawalRequest = {
      ...requestData,
      id: `wtd_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };

    // Deduct withdrawal amount immediately from driver list state
    setDrivers(prev => prev.map(d => {
      if (d.id === requestData.driverId) {
        const balanceAfter = Math.max(0, (d.walletBalance || 0) - requestData.amount);
        const wtdTx = {
          id: `tx_w_req_${Date.now()}`,
          amount: -requestData.amount,
          desc: `Withdrawal payout request (${requestData.paymentType.toUpperCase()} transfer)`,
          timestamp: new Date().toLocaleString(),
          type: 'withdrawal' as const
        };
        return {
          ...d,
          walletBalance: balanceAfter,
          walletTransactions: [...(d.walletTransactions || []), wtdTx]
        };
      }
      return d;
    }));

    setWithdrawalRequests(prev => [newRequest, ...prev]);
  };

  // Process approval/rejection actions by fleet managers
  const handleAdminActionWithdrawal = (requestId: string, action: 'approved' | 'rejected') => {
    setWithdrawalRequests(prev => prev.map(r => {
      if (r.id === requestId && r.status === 'pending') {
        if (action === 'rejected') {
          // Refund target cash back into driver wallet
          setDrivers(prevDrivers => prevDrivers.map(d => {
            if (d.id === r.driverId) {
              const refundTx = {
                id: `tx_refund_${Date.now()}`,
                amount: r.amount,
                desc: `Refund for rejected payout request #${requestId}`,
                timestamp: new Date().toLocaleString(),
                type: 'withdrawal_refund' as const
              };
              return {
                ...d,
                walletBalance: (d.walletBalance || 0) + r.amount,
                walletTransactions: [...(d.walletTransactions || []), refundTx]
              };
            }
            return d;
          }));
        } else if (action === 'approved') {
          // Add approval completion ledger log
          setDrivers(prevDrivers => prevDrivers.map(d => {
            if (d.id === r.driverId) {
              const settleTx = {
                id: `tx_settle_${Date.now()}`,
                amount: -r.amount,
                desc: `Payout settled & transferred: Request #${requestId}`,
                timestamp: new Date().toLocaleString(),
                type: 'payout_settlement' as const
              };
              return {
                ...d,
                walletTransactions: [...(d.walletTransactions || []), settleTx]
              };
            }
            return d;
          }));
        }
        return {
          ...r,
          status: action,
          processedAt: new Date().toLocaleString()
        };
      }
      return r;
    }));
  };

  // Driver Console Event: Progress status change updates
  const handleDriverUpdateStatus = (orderId: string, status: DeliveryOrder['status']) => {
    // Intercept delivery and do payment accounting
    const targetOrder = orders.find(o => o.id === orderId);
    if (status === 'delivered' && targetOrder && targetOrder.status !== 'delivered') {
      const orderDriver = targetOrder.driver;
      if (orderDriver) {
        const orderPrice = targetOrder.totalPrice;
        const method = targetOrder.paymentMethod || 'cash_pickup';
        
        let adjustment = 0;
        if (method === 'online') {
          adjustment = Math.round(orderPrice * 0.80);
        } else {
          adjustment = -Math.round(orderPrice * 0.20);
        }

        // Apply wallet adjustment to driver list state and check incentive!
        const sessionCount = orders.filter(o => o.status === 'delivered' && o.driver?.id === orderDriver.id).length + 1;
        
        setDrivers(prevDrivers => prevDrivers.map(d => {
          if (d.id === orderDriver.id) {
            let txsToAdd: any[] = [];
            const grossFare = orderPrice;
            const commissionAmount = Math.round(orderPrice * 0.20);
            const netOnlineAdjustment = grossFare - commissionAmount;

            if (method === 'online') {
              // Online payment gets full fare credit & immediate commission deduction
              txsToAdd.push({
                id: `tx_trip_gross_${Date.now()}_a`,
                amount: grossFare,
                desc: `Prepaid Gross Fare (100%) for Delivery #${orderId}`,
                timestamp: new Date().toLocaleString(),
                type: 'trip_online' as const
              });
              txsToAdd.push({
                id: `tx_trip_comm_${Date.now()}_b`,
                amount: -commissionAmount,
                desc: `Platform Commission (20% deducted) for Delivery #${orderId}`,
                timestamp: new Date().toLocaleString(),
                type: 'trip_commission' as const
              });
            } else {
              // Cash payment: full fare collected in-hand, with 20% platform commission debited from wallet
              txsToAdd.push({
                id: `tx_trip_comm_${Date.now()}`,
                amount: -commissionAmount,
                desc: `Platform Commission (20% deducted) for Cash Delivery #${orderId}`,
                timestamp: new Date().toLocaleString(),
                type: 'trip_commission' as const
              });
            }
            
            const adjustmentToBalance = method === 'online' ? netOnlineAdjustment : -commissionAmount;
            let updatedTxs = [...(d.walletTransactions || []), ...txsToAdd];
            let currentBalance = (d.walletBalance || 0) + adjustmentToBalance;
            let claimed = d.incentiveClaimedToday || false;

            if (activeIncentive.isActive && !claimed && sessionCount >= activeIncentive.targetTrips) {
              claimed = true;
              currentBalance += activeIncentive.rewardAmount;
              updatedTxs.push({
                id: `tx_inc_${Date.now()}`,
                amount: activeIncentive.rewardAmount,
                desc: `🏆 Bonus Achieved: ${activeIncentive.description}`,
                timestamp: new Date().toLocaleString(),
                type: 'incentive_credit' as const
              });
            }

            return {
              ...d,
              walletBalance: currentBalance,
              walletTransactions: updatedTxs,
              incentiveClaimedToday: claimed
            };
          }
          return d;
        }));
      }
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        let systemNote = "";
        let driverSay = "";
        
        switch (status) {
          case 'loaded':
            systemNote = "Cargo verified and successfully loaded on flatbed";
            driverSay = "All packages are securely placed. Shifting routes starting now!";
            break;
          case 'in_transit':
            systemNote = "In transit: Courier coordinates moving on live path trackers";
            driverSay = "Highway coordinates tracking loaded. Estimating quick arrival.";
            break;
          case 'delivered':
            systemNote = "Delivery complete! Shipment handoff confirmed.";
            driverSay = "Arrived and unloaded packages with customer. Trip closed!";
            break;
        }

        const updatedChats = [...o.chats];
        if (systemNote) {
          updatedChats.push({ id: `chat_n_${Date.now()}`, sender: "system", text: systemNote, timestamp: "Now" });
        }
        if (driverSay) {
          updatedChats.push({ id: `chat_s_${Date.now()}`, sender: "driver", text: driverSay, timestamp: "Now" });
        }

        if (status === 'delivered') {
          const method = o.paymentMethod || 'cash_pickup';
          const orderPrice = o.totalPrice;
          let adjustment = 0;
          let billMsg = "";
          if (method === 'online') {
            adjustment = Math.round(orderPrice * 0.80);
            billMsg = `💳 Prepaid Online: ₹${orderPrice}. Partner wallet gets +₹${adjustment} (80% share).`;
          } else {
            adjustment = -Math.round(orderPrice * 0.20);
            billMsg = `💵 Cash Collected: ₹${orderPrice} (collected at ${method === 'cash_pickup' ? 'pickup' : 'drop-off'}). Platform 20% commission -₹${Math.abs(adjustment)} deducted from driver wallet.`;
          }
          updatedChats.push({
            id: `chat_p_${Date.now()}`,
            sender: "system",
            text: `🧾 Settle Statement: ${billMsg}`,
            timestamp: "Now"
          });
        }

        return {
          ...o,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : o.paymentStatus,
          chats: updatedChats
        };
      }
      return o;
    }));
  };

  // Customer appends a chat message
  const handleAddChatMessage = (newMsg: ChatMessage) => {
    setOrders(prev => prev.map(o => {
      if (currentActiveOrder && o.id === currentActiveOrder.id) {
        return {
          ...o,
          chats: [...o.chats, newMsg]
        };
      }
      return o;
    }));
  };

  // Direct cancellation of active order
  const handleCancelActiveOrder = () => {
    if (!currentActiveOrder) return;
    setOrders(prev => prev.map(o => {
      if (o.id === currentActiveOrder.id) {
        return {
          ...o,
          status: "cancelled",
          chats: [...o.chats, { id: `sys_${Date.now()}`, sender: "system", text: "Courier request explicitly cancelled.", timestamp: "Now" }]
        };
      }
      return o;
    }));
    setIsSearching(false);
    setCancelConfirmOrder(null);
  };

  const handleSubmitRating = (orderId: string, driverId: string, stars: number, comment: string, tags: string[]) => {
    setDrivers(prevDrivers => prevDrivers.map(d => {
      if (d.id === driverId) {
        const currentCount = d.tripsCount || 0;
        const currentRating = d.rating || 5.0;
        const newRating = parseFloat(((currentRating * currentCount + stars) / (currentCount + 1)).toFixed(2));
        return {
          ...d,
          rating: newRating,
          tripsCount: currentCount + 1
        };
      }
      return d;
    }));

    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === orderId) {
        const ratingMsg = `⭐ Rated: ${stars}/5 Stars. ${tags.length > 0 ? `Tags: [${tags.join(', ')}]. ` : ''}${comment ? `Notes: "${comment}"` : ''}`;
        return {
          ...o,
          driverRating: stars,
          chats: [
            ...o.chats,
            { id: `sys_rate_${Date.now()}`, sender: "system", text: ratingMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return o;
    }));

    setPromptedRatings(prev => [...prev, orderId]);
    setRatingOrder(null);
  };

  const handleSkipRating = (orderId: string) => {
    setPromptedRatings(prev => [...prev, orderId]);
    setRatingOrder(null);
  };

  if (!hasValidKey && !bypassKeyCheck) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-6 text-slate-800">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-2xl max-w-lg w-full text-center space-y-6 animate-fadeIn">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">
              Google Maps API Key Required
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Unlock live Google Map renders, actual routing polylines, and real-time geographic Place search lookups.
            </p>
          </div>

          <div className="text-left bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 text-xs">
            <p className="font-extrabold text-slate-700 uppercase tracking-widest text-[10px]">
              Setup Process Checklist:
            </p>
            <div className="space-y-3.5 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-5 h-5 shrink-0 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                <div>
                  <a 
                    href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 font-extrabold hover:underline"
                  >
                    Acquire Google Maps API Key ↗
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Generate a platform credential in the Google Cloud Console.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 shrink-0 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                <div>
                  <span className="font-extrabold text-slate-800 font-mono">Add key as a secret securely</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click <strong>Settings</strong> (⚙️ gear icon, top-right panel corner) → <strong>Secrets</strong> → type <code className="bg-slate-200/60 px-1 py-0.5 rounded text-rose-600 font-mono text-[10.5px]">GOOGLE_MAPS_PLATFORM_KEY</code> → paste value → press <strong>Enter</strong>.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="border-t border-slate-200/60 pt-3 text-[10px] text-slate-400 italic">
              * Note: The server rebuilds automatically - no manual browser reload is required.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setBypassKeyCheck(true)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              Continue to Simulated Mumbai Grid
            </button>
            <p className="text-[10px] text-slate-400">
              Run without live map search with built-in mock locations
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden antialiased select-none text-slate-100">
        {/* Ambient background glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl w-full space-y-8 relative z-10 my-10 animate-scaleIn">
          {/* Logo and Brand */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl">
              <SwiftPortLogo theme="dark" />
              <span className="text-orange-500 font-extrabold text-[10px] tracking-widest uppercase">Simulation Portal Gate</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white font-sans max-w-xl mx-auto leading-none pt-2">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-tr from-orange-500 to-amber-400">SwiftPort</span> Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Experience high-fidelity, simulated parcel routing and driver kinematics segmented by dedicated team roles.
            </p>
          </div>

          {/* Role Gateway Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Customer Portal */}
            <div className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 text-orange-400">
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-white text-md tracking-tight group-hover:text-orange-400 transition-colors">Client Portal</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Book couriers across Mumbai, manage instant payments, apply referrals, and track live transit telemetry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('customer');
                  setActiveTab('book');
                }}
                className="w-full mt-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black tracking-wider transition shadow-md shadow-orange-950/45 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                Enter Workspace
              </button>
            </div>

            {/* Card 2: Courier Rider Portal */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-white text-md tracking-tight group-hover:text-emerald-400 transition-colors">Partner Rider</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Accept shipping contracts, coordinate physical delivery dispatches, track daily statements, and request cashouts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('driver');
                  setActiveTab('driver-console');
                }}
                className="w-full mt-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black tracking-wider transition shadow-md shadow-emerald-950/45 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                Enter Workspace
              </button>
            </div>

            {/* Card 3: Support Helpdesk */}
            <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-white text-md tracking-tight group-hover:text-blue-400 transition-colors">Support Desk</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Resolve incoming user complaints, chat with live client sessions, assign tickets, and resolve escalations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('support');
                  setActiveTab('support-desk');
                }}
                className="w-full mt-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider transition shadow-md shadow-blue-950/45 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                Enter Workspace
              </button>
            </div>

            {/* Card 4: System Fleet Administrator */}
            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-white text-md tracking-tight group-hover:text-indigo-400 transition-colors">Fleet Admin</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Verify onboarding courier riders, approve bank KYC, audit payouts registry, and monitor system-wide dispatches.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setActiveTab('driver-console');
                }}
                className="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black tracking-wider transition shadow-md shadow-indigo-950/45 cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                Enter Workspace
              </button>
            </div>
          </div>

          {/* Footer details */}
          <div className="text-center pt-4">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono font-bold">SwiftPort Simulator Environment</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SwiftPortLogo />
            {currentRole === 'customer' && (
              <button
                onClick={() => setBypassKeyCheck(p => !p)}
                className={`hidden md:flex px-2.5 py-1 rounded-full text-[10px] font-bold transition items-center gap-1.5 shadow-sm border cursor-pointer ${
                  bypassKeyCheck 
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
                title={bypassKeyCheck ? "Click to configure real Google Maps Credentials" : "Click to use Simulated Mumbai Grid"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${bypassKeyCheck ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
                <span>{bypassKeyCheck ? "Simulated Grid" : "Google Maps Live"}</span>
              </button>
            )}
          </div>

          {/* Quick tab controllers for Customer Role */}
          {currentRole === 'customer' && customerSession && (
            <button
              type="button"
              onClick={() => setIsCustomerDrawerOpen(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-orange-500 rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5 shrink-0 border border-slate-200 group focus:outline-none"
              title="Open Menu"
            >
              <Menu className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
            </button>
          )}

          {/* Workspace titles to guide team members */}
          {currentRole === 'driver' && !isRiderLoggedIn && (
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide border border-emerald-200 flex items-center gap-1.5 text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Courier Partner Console
              </span>
            </div>
          )}
          {currentRole === 'support' && (
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-800 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide border border-blue-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Support Queue HelpDesk
              </span>
            </div>
          )}
          {/* User Session status OR Switch Role actions */}
          {currentRole === 'customer' && customerSession ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 pl-3.5 pr-2.5 py-1 rounded-xl shadow-sm">
              <div className="text-right hidden md:block">
                <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider leading-none">Sim Customer</span>
                <span className="font-extrabold text-slate-800 text-xs tracking-tight line-clamp-1 leading-normal">{customerSession.name}</span>
                {customerSession.couponApplied && (
                  <span className="text-[8px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.2 rounded mt-0.5 inline-block font-mono">CODE: {customerSession.couponApplied}</span>
                )}
              </div>
              
              <div className="w-8.5 h-8.5 bg-gradient-to-tr from-orange-100 to-amber-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-200 relative">
                <span className="font-black text-xs">{customerSession.name.charAt(0).toUpperCase()}</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setCustomerSession(null);
                  setCurrentRole(null);
                }}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                title="Sign Out / Switch Operator Account"
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : currentRole && currentRole !== 'customer' && !(currentRole === 'driver' && isRiderLoggedIn) ? (
            <button
              onClick={() => {
                if (currentRole === 'driver') {
                  setIsRiderLoggedIn(false);
                }
                setCurrentRole(null);
              }}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl text-xs font-black tracking-wide cursor-pointer transition border-none flex items-center gap-1.5 shadow"
              title="Return to the Gateway Mode Lobby"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Back to Lobby</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SWIFTPORT 4-TAB MODULAR SYSTEM */}
        {currentRole === "customer" && activeTab === "book" && (
          <CustomerHomeTab
            pickup={pickup}
            setPickup={setPickup}
            dropoff={dropoff}
            setDropoff={setDropoff}
            cargoDescription={cargoDescription}
            setCargoDescription={setCargoDescription}
            cargoWeight={cargoWeight}
            setCargoWeight={setCargoWeight}
            selectedVehicleId={selectedVehicleId}
            setSelectedVehicleId={setSelectedVehicleId}
            handleApplyAISuggestions={handleApplyAISuggestions}
            handleCreateBooking={handleCreateBooking}
            getCalculatedPrice={getCalculatedPrice}
            bookerPaymentMethod={bookerPaymentMethod}
            setBookerPaymentMethod={setBookerPaymentMethod}
            labourType={labourType}
            setLabourType={setLabourType}
            aiBriefing={aiBriefing}
            customerSession={customerSession}
            distanceKm={distanceKm}
            drivers={drivers}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
          />
        )}

        {currentRole === "customer" && activeTab === "orders" && (
          <CustomerOrdersTab
            orders={orders}
            activeOrders={activeOrders}
            currentActiveOrder={currentActiveOrder}
            setSelectedActiveOrderId={setSelectedActiveOrderId}
            setCancelConfirmOrder={setCancelConfirmOrder}
            handleAddChatMessage={handleAddChatMessage}
            drivers={drivers}
            gstinDetails={gstinDetails}
            setActiveTab={setActiveTab}
          />
        )}

        {currentRole === "customer" && activeTab === "payments" && (
          <CustomerPaymentsTab
            customerSession={customerSession}
            topupValue={topupValue}
            setTopupValue={setTopupValue}
            setIsTopupModalOpen={setIsTopupModalOpen}
            walletTransactions={walletTransactions}
          />
        )}

        {currentRole === "customer" && activeTab === "profile" && (
          <CustomerProfileTab
            customerSession={customerSession}
            setCustomerSession={setCustomerSession}
            setCurrentRole={setCurrentRole}
            setActiveTab={setActiveTab}
            gstinDetails={gstinDetails}
            setGstinDetails={setGstinDetails}
            savedAddresses={savedAddresses}
            setSavedAddresses={setSavedAddresses}
            setPickup={setPickup}
          />
        )}

        {currentRole === "customer" && activeTab === "refer" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-black text-slate-800">Refer & Earn</h2>
            <div className="bg-gradient-to-br from-[#0c3e9e] to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-900 text-left">
              <div className="space-y-3 text-center md:text-left flex-1">
                <span className="text-[11px] font-black uppercase text-orange-300 tracking-widest block bg-orange-300/10 w-fit md:mx-0 mx-auto px-2 py-1 rounded-full border border-orange-300/20">refer and earn credits</span>
                <h3 className="text-2xl font-black text-white leading-tight">Save ₹200 on logistics dispatches</h3>
                <p className="text-xs md:text-sm text-indigo-200 max-w-sm mt-0.5 leading-relaxed">Invite your carrier networks or company clients to simulate moves. They get a ₹200 starting discount, and you get ₹200 added to your credits!</p>
              </div>

              <div className="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto">
                <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest text-center w-full">Your Invite Code</p>
                <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 font-mono text-lg font-black text-amber-400 text-center w-full shadow-inner">
                  SWIFT-SIDDHANT99
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("SWIFT-SIDDHANT99");
                    alert("Referral code copied successfully! Share it during client signups to win credits.");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-3 font-black text-xs transition w-full flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  SHARE CODE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORMER CORE RENDERING DISABLED */}
        {false && (
          <div className="space-y-6">
            {/* MULTI-TRIP CONTROL HARNESS */}
            {activeOrders.length > 0 && (
              <div id="multi-trip-dashboard" className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                    <span className="font-mono text-[10px] font-bold text-orange-400 uppercase tracking-widest">Multi-Trip Dashboard</span>
                  </div>
                  <h3 className="text-sm font-black text-white">Manage & Track Your Shipments</h3>
                  <p className="text-[10px] text-slate-400">
                    You can book and track up to 5 parallel orders. Select a trip tab to view its live status or chat with its driver.
                  </p>
                </div>

                {/* TRIP TABS AND NEW BOOKING BUTTON */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {activeOrders.map((order, idx) => {
                    const isSelected = !isShowingBookingForm && currentActiveOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => {
                          setForceShowBookingForm(false);
                          setSelectedActiveOrderId(order.id);
                        }}
                        className={`px-3.5 py-2 rounded-[14px] text-xs font-bold transition flex items-center gap-2 border-2 cursor-pointer ${
                          isSelected 
                            ? "bg-orange-500 border-orange-600 text-white shadow-md scale-102" 
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          order.status === 'searching' ? 'bg-yellow-400 animate-pulse' :
                          order.status === 'assigned' ? 'bg-indigo-400' :
                          'bg-emerald-400 animate-pulse'
                        }`} />
                        <span className="font-mono">Trip #{activeOrders.length - idx}</span>
                        <span className="text-[9px] opacity-90 uppercase tracking-wider font-extrabold px-1 py-0 rounded bg-black/40 text-slate-200">
                          {order.status === 'searching' ? 'Matching' :
                           order.status === 'assigned' ? 'Accepted' :
                           order.status === 'loaded' ? 'Loaded' :
                           order.status === 'in_transit' ? 'In Transit' :
                           order.status}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={activeOrders.length >= 5 || activeOrders.some(o => o.status === 'searching')}
                    onClick={() => {
                      setForceShowBookingForm(true);
                    }}
                    className={`px-4 py-2 rounded-[14px] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition border-2 cursor-pointer ${
                      isShowingBookingForm
                        ? "bg-[#0c3e9e] text-white border-blue-400 shadow-md shadow-[#0c3e9e]/30"
                        : (activeOrders.length >= 5 || activeOrders.some(o => o.status === 'searching'))
                          ? "bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed border-none opacity-40"
                          : "bg-orange-500 hover:bg-orange-400 text-white border-orange-600"
                    }`}
                  >
                    <span>+ Book New Shipment</span>
                    <span className="text-[9.5px] bg-black/30 px-1.5 py-0.2 rounded font-mono font-black">
                      {activeOrders.length}/5
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Validation alerts for trip limits */}
            {activeOrders.length > 0 && (
              <div className="space-y-2 animate-fadeIn">
                {activeOrders.length >= 5 && isShowingBookingForm && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11.5px] font-bold p-3.5 rounded-2xl flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500 shrink-0" />
                    <p>
                      🔒 Maximum capacity filled (5/5 concurrent active orders). Cancel or complete an existing delivery to book more.
                    </p>
                  </div>
                )}
                {activeOrders.some(o => o.status === 'searching') && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px] font-bold p-3.5 rounded-2xl flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" />
                    <p>
                      ⏳ Booking is limited to "one after another" when accepted. Please wait for Driver Matching to complete on your current trip before requesting another.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Hand interactive inputs controller */}
              <div className="lg:col-span-7 space-y-6">

                {/* Visual fleet categories - SwiftPort Signature Style (reproduces layout from user's screenshot #5) */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-xl animate-fadeIn">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 font-mono">Quick Fleet Select</span>
                    <h3 className="text-sm font-black text-white mt-1">What are you delivering today?</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId("3wheeler");
                        setCargoCategory("Commercial Loads");
                      }}
                      className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
                        selectedVehicleId === "3wheeler" || selectedVehicleId === "8ftace" || selectedVehicleId === "pickup"
                          ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                      }`}
                    >
                      <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
                        <Truck className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[12px] text-white">Trucks</p>
                        <p className="text-[9px] text-slate-400 mt-1">Heavy Loads & tempos</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId("2wheeler");
                        setCargoCategory("Documents & Parcels");
                      }}
                      className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
                        selectedVehicleId === "2wheeler"
                          ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                      }`}
                    >
                      <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[12px] text-white">2 Wheeler</p>
                        <p className="text-[9px] text-slate-400 mt-1">Parcels & courier</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId("8ftace");
                        setLabourType("driver-helper");
                        setCargoCategory("Shifting / Furniture");
                      }}
                      className={`p-4 rounded-2xl text-left border-3 transition-all flex flex-col justify-between h-32 cursor-pointer ${
                        selectedVehicleId === "8ftace" && labourType === "driver-helper"
                          ? "bg-white/10 border-orange-500 shadow-md shadow-orange-500/20"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-750"
                      }`}
                    >
                      <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl text-white shadow w-fit">
                        <Grid className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[12px] text-white">Packers</p>
                        <p className="text-[9px] text-slate-400 mt-1">Full shift & helper</p>
                      </div>
                    </button>
                  </div>

                  {/* Promotion Banner */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex items-start gap-3">
                    <div className="text-orange-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-200">Introducing SwiftPort Enterprise</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Upgrade or expand! Parallel booking slots (up to 5 active trips) with instant GST-ready corporate tax invoices and ledger management.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isShowingBookingForm ? (
                // BOOKING CONFIGURATION PANELS
                <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl animate-fadeIn">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                       Configure Shipment Courier
                    </h2>
                    <p className="text-xs text-slate-500">Specify pickup destinations and select commercial utility load trucks.</p>
                  </div>

                  <BookingForm 
                    pickup={pickup}
                    onSelectPickup={setPickup}
                    dropoff={dropoff}
                    onSelectDropoff={setDropoff}
                    cargoDescription={cargoDescription}
                    onChangeCargoDescription={setCargoDescription}
                    cargoWeight={cargoWeight}
                    onChangeCargoWeight={setCargoWeight}
                    selectedVehicleId={selectedVehicleId}
                    onApplyAISuggestions={handleApplyAISuggestions}
                    onSubmitBooking={() => {
                      if (bookerPaymentMethod === 'online') {
                        setIsPaymentModalOpen(true);
                      } else {
                        handleCreateBooking();
                      }
                    }}
                    isSearching={isSearching}
                    distanceKm={distanceKm}
                    paymentMethod={bookerPaymentMethod}
                    onChangePaymentMethod={setBookerPaymentMethod}
                  />

                  {/* Manual selector cards block */}
                  <VehicleSelector 
                    selectedVehicleId={selectedVehicleId}
                    onSelectVehicle={setSelectedVehicleId}
                    cargoWeight={cargoWeight}
                    labourType={labourType}
                    onSelectLabour={setLabourType}
                    distanceKm={distanceKm}
                  />
                </div>
              ) : (
                // ACTIVE SHIPMENT TRANSIT & CHAT VIEW
                <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl animate-fadeIn">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold font-mono tracking-widest bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded animate-pulse">
                          TRACKING ID: {currentActiveOrder.id.slice(4, 12).toUpperCase()}
                        </span>
                        <span className="text-[10px] ml-1.5 text-slate-500 font-medium">
                          Dispatched {currentActiveOrder.createdAt}
                        </span>
                      </div>
                      <h2 className="text-md font-bold text-slate-800 mt-2 font-sans flex items-center gap-1.5">
                        {currentActiveOrder.status === 'searching' ? "Broadcasting dispatch signal..." : "Your Shipment is Active"}
                      </h2>
                    </div>

                     <button
                       onClick={() => setCancelConfirmOrder(currentActiveOrder)}
                      className="text-xs bg-rose-50 hover:bg-rose-500 hover:text-white transition px-3 py-1.5 text-rose-650 border border-rose-200 rounded-lg cursor-pointer font-bold duration-150 active:scale-95"
                    >
                      Cancel Order
                    </button>
                  </div>

                  {/* Operational status milestones tracker bar */}
                  <div className="grid grid-cols-4 gap-2 relative z-10 select-none">
                    <div className="absolute top-3.5 left-10 right-10 h-0.5 bg-slate-200 -z-10"></div>
                    
                    {/* Step: Searching */}
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                        currentActiveOrder.status === 'searching' 
                          ? "bg-orange-500 text-white animate-pulse font-extrabold" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        1
                      </div>
                      <span className="text-[10px] block font-semibold text-slate-500 mt-1">Pending</span>
                    </div>

                    {/* Step: Assigned */}
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                        currentActiveOrder.status === 'assigned' 
                          ? "bg-orange-500 text-white font-extrabold shadow-md shadow-orange-200" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        2
                      </div>
                      <span className="text-[10px] block font-semibold text-slate-500 mt-1">Matched</span>
                    </div>

                    {/* Step: Shifting */}
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                        currentActiveOrder.status === 'in_transit' || currentActiveOrder.status === 'loaded' 
                          ? "bg-orange-500 text-white font-extrabold shadow-md shadow-orange-200" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        3
                      </div>
                      <span className="text-[10px] block font-semibold text-slate-500 mt-1">Shifting</span>
                    </div>

                    {/* Step: Delivered */}
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                        currentActiveOrder.status === 'delivered' 
                          ? "bg-emerald-650 text-white font-extrabold shadow-md shadow-emerald-200" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        4
                      </div>
                      <span className="text-[10px] block font-semibold text-slate-500 mt-1">Arrived</span>
                    </div>
                  </div>

                  {/* Active delivery description report */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-700 flex-wrap gap-2">
                      <p className="font-bold">
                        Selected Fleet Courier: <span className="font-extrabold text-orange-600">{currentActiveOrder.vehicle.name}</span>
                      </p>
                      <div className="text-right">
                        <p className="font-mono text-orange-600 font-bold block">
                          ₹{currentActiveOrder.totalPrice} gross fare
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Rider payout: <span className="font-bold text-emerald-600">₹{Math.round(currentActiveOrder.totalPrice * 0.8)}</span> | 
                          Profit: <span className="font-bold text-indigo-600">₹{Math.round(currentActiveOrder.totalPrice * 0.2)}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed font-sans">
                      Cargo payload: <span className="text-slate-800 font-medium italic">"{currentActiveOrder.cargoDescription}"</span>, Estimated weight load: <span className="font-bold text-slate-900">{currentActiveOrder.weightEstimate} kg</span>.
                    </p>

                    {/* Simulation Guide notification */}
                    <div className="bg-orange-50 px-3 py-2 rounded-xl text-[11px] text-orange-700 flex items-center gap-1.5 border border-orange-100">
                      <Info className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>
                        Simulate driver actions! Try switching to the **"Courier Desk"** tab above to accept jobs and trigger status milestones.
                      </span>
                    </div>
                  </div>

                  {/* Live Chat with driver partner */}
                  <DriverChat 
                    activeOrder={currentActiveOrder}
                    onAddChatMessage={handleAddChatMessage}
                  />
                </div>
              )}
            </div>

            {/* Right Hand GPS grid mapping & price summary layout */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Maps widget card */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-550 uppercase tracking-widest pl-1 block">Live Route Blueprint</label>
                <MapVisualization activeOrder={currentActiveOrder} driversList={drivers} />
              </div>

              {/* Dynamic Billing Panel estimation receipt */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4 text-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Freight Receipt Breakdown
                </h3>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Freight Fee</span>
                    <span className="font-mono text-slate-900 font-semibold">₹{(VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0]).baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance charge ({distanceKm} km)</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      ₹{Math.round(distanceKm * ((VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0]).ratePerKm))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labormen help charges</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {labourType === "none" ? "₹0 (Self-load)" : labourType === "driver" ? "₹250" : "₹750"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-3">
                    <span>CGST + SGST (Platform levy)</span>
                    <span className="font-mono text-slate-900 font-semibold">₹0 (Promo Fallback)</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-slate-800 pt-1">
                    <span className="uppercase text-slate-600 font-bold">Estimated Total</span>
                    <span className="font-mono text-orange-600 text-lg font-black">
                      ₹{Math.round(
                        (VEHICLES.find(v => v.id === selectedVehicleId)?.baseFare || 250) + 
                        (distanceKm * (VEHICLES.find(v => v.id === selectedVehicleId)?.ratePerKm || 12)) +
                        (labourType === "none" ? 0 : labourType === "driver" ? 250 : 750)
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-[10.5px] text-slate-500 space-y-1 mt-2">
                    <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-1">Corporate Revenue Breakdown</p>
                    <div className="flex justify-between">
                      <span>Rider Payout Share (80% net payout):</span>
                      <span className="font-mono font-bold text-slate-700">
                        ₹{Math.round(
                          ((VEHICLES.find(v => v.id === selectedVehicleId)?.baseFare || 250) + 
                          (distanceKm * (VEHICLES.find(v => v.id === selectedVehicleId)?.ratePerKm || 12)) +
                          (labourType === "none" ? 0 : labourType === "driver" ? 250 : 750)) * 0.8
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>App Commission (20% direct profit):</span>
                      <span className="font-mono font-black text-indigo-650 text-indigo-600">
                        +₹{Math.round(
                          ((VEHICLES.find(v => v.id === selectedVehicleId)?.baseFare || 250) + 
                          (distanceKm * (VEHICLES.find(v => v.id === selectedVehicleId)?.ratePerKm || 12)) +
                          (labourType === "none" ? 0 : labourType === "driver" ? 250 : 750)) * 0.2
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-2xl text-[10px] text-emerald-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No premium cancellation penalties exist under current simulated trials.</span>
                </div>
              </div>

            </div>
          </div>
          </div>
        )}

        {/* VIEW TAB 2: HISTORY DIRECTORY - DISABLED */}
        {false && currentRole === "customer" && activeTab === "history" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-lg">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2 mb-2 italic">
                Order Activity <span className="text-orange-500">Ledger</span>
              </h2>
              <p className="text-xs text-slate-500">Review historic statements, dynamic transit breakdowns, and digital receipts.</p>
            </div>

            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div 
                  key={`historic-${order.id}-${idx}`}
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-orange-300 transition shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-semibold">
                          ID: {order.id.slice(4, 12).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {order.createdAt}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-2 font-sans">
                        Transport: <span className="text-orange-600 font-bold">{order.cargoCategory}</span> via {order.vehicle.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-150" 
                          : order.status === 'cancelled'
                            ? "bg-rose-50 text-rose-600 border border-rose-150"
                            : "bg-orange-50 text-orange-600 border border-orange-150"
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-md font-black text-slate-800 mt-1.5 font-mono">₹{order.totalPrice}</p>
                      {order.status === 'delivered' && (
                        <div className="text-[10px] text-slate-500 font-medium space-y-0.5 mt-1">
                          <p>Driver payout: <span className="font-bold text-emerald-600">₹{Math.round(order.totalPrice * 0.8)}</span></p>
                          <p>App Profit: <span className="font-black text-indigo-600">₹{Math.round(order.totalPrice * 0.2)}</span></p>
                          {order.driverRating && (
                            <div className="flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-slate-100">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider font-mono mr-1">Your Rating:</span>
                              <span className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg 
                                    key={i} 
                                    className={`w-3 h-3 ${i < (order.driverRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none mb-1">Pickup</span>
                      <span className="font-semibold text-slate-800">{order.pickup.name}</span>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{order.pickup.address}</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold leading-none mb-1">Destination</span>
                      <span className="font-semibold text-orange-600">{order.dropoff.name}</span>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{order.dropoff.address}</p>
                    </div>
                  </div>

                  {/* Shipment specs description */}
                  <div className="flex justify-between items-center text-xs text-slate-600 leading-relaxed">
                    <span>Cargo detail: <span className="italic text-slate-705">"{order.cargoDescription}"</span></span>
                    <span className="shrink-0 font-mono text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {order.distanceKm} km trip
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COURIER RIDER WORKSPACE */}
        {currentRole === "driver" && (
          <div className="max-w-4xl mx-auto">
            {!isRiderLoggedIn ? (
              /* COURIER RIDER LOGIN/SIGNUP/ONBOARD ENTRY LOCKSCREEN GATE */
              <div className="max-w-md w-full mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 animate-scaleIn relative overflow-hidden text-slate-850">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center space-y-2 relative z-10">
                  <div className="flex justify-center mb-1">
                    <span className="bg-slate-900 border border-slate-800 text-white rounded-2xl px-4 py-2 text-xs font-black tracking-widest flex items-center gap-1.5 shadow-md uppercase">
                      🚲 Courier Partner Portal
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                    Verify Partner Ride Identity
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                    Acknowledge your registered profile to retrieve the live Mumbai transit jobs board and request instant wallet payouts.
                  </p>
                </div>

                {/* Authentication Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl relative z-10">
                  <button
                    type="button"
                    onClick={() => setRiderAuthTab('login')}
                    className={`py-2 text-xs font-black rounded-xl transition border-none cursor-pointer ${
                      riderAuthTab === 'login' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    Partner Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiderAuthTab('signup')}
                    className={`py-2 text-xs font-black rounded-xl transition border-none cursor-pointer ${
                      riderAuthTab === 'signup' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    Onboard / Sign Up
                  </button>
                </div>

                {riderAuthTab === 'login' ? (
                  <div className="space-y-4 pt-2 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 pl-1 block">
                        Choose Active Partner Account
                      </label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 font-extrabold border border-slate-200 text-xs px-3.5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/25 cursor-pointer"
                      >
                        {drivers.map((d, idx) => (
                          <option key={`${d.id}-${idx}`} value={d.id}>
                            {d.name} ({d.vehicleNumber}) - Rating: ★{d.rating || "4.9"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 pl-1 block">
                        Security Passkey PIN
                      </label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value="123456"
                        disabled
                        className="w-full bg-slate-100 text-slate-400 font-bold border border-slate-200 text-xs px-3.5 py-2.5 rounded-2xl cursor-not-allowed"
                      />
                      <p className="text-[9px] text-slate-400 pl-1">Passkey authentication is simulated for trial bypass.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsRiderLoggedIn(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black tracking-wider transition shadow-lg shadow-emerald-100 cursor-pointer border-none flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Sign In & Launch Jobs Panel
                    </button>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <DriverOnboardingForm 
                      drivers={drivers}
                      onAddJoinee={(newJoinee) => {
                        setJoinees(prev => [newJoinee, ...prev]);
                      }}
                      onInstantVerifyAndActivate={(newDriver) => {
                        setDrivers(prev => [newDriver, ...prev]);
                        setSelectedDriverId(newDriver.id);
                        setIsRiderLoggedIn(true);
                      }}
                      onCancel={() => setRiderAuthTab('login')}
                    />
                  </div>
                )}

                <div className="pt-2 relative z-10">
                  <button
                    onClick={() => setCurrentRole(null)}
                    className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition bg-transparent hover:bg-slate-50 rounded-xl cursor-pointer border-none"
                  >
                    ← Back to Portal Lobby
                  </button>
                </div>
              </div>
            ) : (
              <DriverConsole 
                pendingOrders={orders.filter(o => o.status !== "draft" && o.status !== "cancelled")}
                onAcceptOrder={handleDriverAcceptRide}
                onUpdateStatus={handleDriverUpdateStatus}
                driversList={drivers}
                setDriversList={setDrivers}
                joinees={joinees}
                setJoinees={setJoinees}
                selectedDriverId={selectedDriverId}
                setSelectedDriverId={setSelectedDriverId}
                onCancelOrder={handleDriverCancelOrder}
                onLiftSuspension={handleLiftDriverSuspension}
                withdrawalRequests={withdrawalRequests}
                onAddWithdrawalRequest={handleDriverRequestWithdrawal}
                onAdminActionWithdrawal={handleAdminActionWithdrawal}
                activeIncentive={activeIncentive}
                onChangeIncentive={setActiveIncentive}
                currentRoleMode="rider"
                isRiderLoggedIn={isRiderLoggedIn}
                setIsRiderLoggedIn={setIsRiderLoggedIn}
                onLogout={() => {
                  setIsRiderLoggedIn(false);
                }}
              />
            )}
          </div>
        )}

        {/* SUPPORT QUEUE DESK */}
        {currentRole === "support" && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <SupportAgentPanel
              tickets={tickets}
              onSendMessage={handleSendTicketMessage}
              onAssignTicket={handleAssignAgentToTicket}
              onResolveTicket={handleResolveSupportTicket}
              onLogout={() => {
                setCurrentRole(null);
              }}
            />
          </div>
        )}

         {/* FLEET ADMIN CONTROL DESK */}
        {currentRole === "admin" && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <DriverConsole 
              pendingOrders={orders.filter(o => o.status !== "draft" && o.status !== "cancelled")}
              onAcceptOrder={handleDriverAcceptRide}
              onUpdateStatus={handleDriverUpdateStatus}
              driversList={drivers}
              setDriversList={setDrivers}
              joinees={joinees}
              setJoinees={setJoinees}
              selectedDriverId={selectedDriverId}
              setSelectedDriverId={setSelectedDriverId}
              onCancelOrder={handleDriverCancelOrder}
              onLiftSuspension={handleLiftDriverSuspension}
              withdrawalRequests={withdrawalRequests}
              onAddWithdrawalRequest={handleDriverRequestWithdrawal}
              onAdminActionWithdrawal={handleAdminActionWithdrawal}
              activeIncentive={activeIncentive}
              onChangeIncentive={setActiveIncentive}
              currentRoleMode="admin"
              onLogout={() => {
                setCurrentRole(null);
              }}
            />
          </div>
        )}

      </main>

      {/* Brand Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-slate-500 text-[11px] font-sans">
          <p>© 2026 SwiftPort Logistics Platform - Premium On-Demand Intra-City Courier Simulator.</p>
          <p>Utilizing server-side Gemini 3.5-flash for cargo analytics and Liquid LFM-2.5-1.2B-Instruct via OpenRouter for virtual support assistance.</p>
        </div>
      </footer>

      {/* Real-time Order Ping Alerts Floating Overlay with Web Audio Ringtone Sim */}
      {currentRole === "driver" && (
        <IncomingAlertOverlay
          activeDriver={drivers.find(d => d.id === selectedDriverId) || drivers[0]}
          searchingOrders={orders}
          onAccept={handleDriverAcceptRide}
          onDecline={(orderId) => handleDriverDeclineAlert(orderId, selectedDriverId)}
          allSkippedOrderIds={skippedOrderIds}
          isSuspended={
            (drivers.find(d => d.id === selectedDriverId) || drivers[0])?.suspendedUntil
              ? new Date((drivers.find(d => d.id === selectedDriverId) || drivers[0])!.suspendedUntil!).getTime() > Date.now()
              : false
          }
          drivers={drivers}
        />
      )}

      {/* Interactive payment methods modal for customer checkout */}
      <PaymentMethodsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={() => {
          setIsPaymentModalOpen(false);
          handleCreateBooking();
          setActiveTab("orders"); // Move to orders immediately on book dispatch success!
        }}
        amount={getCalculatedPrice()}
      />

      {/* Interactive payment methods modal for wallet credit deposits */}
      <PaymentMethodsModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        onPaymentSuccess={() => {
          setIsTopupModalOpen(false);
          if (customerSession) {
            const addedAmt = topupValue;
            setCustomerSession(prev => prev ? { ...prev, walletBalance: prev.walletBalance + addedAmt } : null);
            setWalletTransactions(prev => [
              {
                id: `tx_${Date.now()}`,
                amount: addedAmt,
                desc: `Loaded credit wallet balance via direct UPI gateway`,
                timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
                isCredit: true
              },
              ...prev
            ]);
            setTimeout(() => {
              alert(`🎉 Success! ₹${addedAmt} loaded successfully into your SwiftPort virtual wallet.\n\nYour new available balance is ₹${customerSession.walletBalance + addedAmt}.`);
            }, 100);
          }
        }}
        amount={topupValue}
      />

      {/* Rate Your Driver modal is triggered automatically on shipment delivered status */}
      {ratingOrder && (
        <RateDriverModal
          order={ratingOrder}
          onClose={() => handleSkipRating(ratingOrder.id)}
          onSubmit={(stars, comment, tags) => handleSubmitRating(ratingOrder.id, ratingOrder.driver?.id || "", stars, comment, tags)}
        />
      )}

      {/* Floating support widget available throughout user journey */}
      <CustomerSupportWidget
        tickets={tickets}
        activeTicketId={activeTicketId}
        setActiveTicketId={setActiveTicketId}
        onRaiseTicket={handleRaiseTicket}
        onSendMessage={handleSendTicketMessage}
        onEscalateToAgent={handleEscalateTicketToAgent}
        activeOrder={currentActiveOrder}
      />

      {/* Custom Order Cancellation Confirmation Dialog (Replaces unsafe native confirm boxes) */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-800 tracking-tight text-sm">Cancel Booking Request?</h4>
              <p className="text-xs text-slate-500 leading-normal max-w-[280px] mx-auto">
                Are you sure you want to cancel courier consignment <strong className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">{cancelConfirmOrder.id.slice(4,12).toUpperCase()}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCancelConfirmOrder(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border-none"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleCancelActiveOrder}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-wide transition shadow shadow-rose-100 cursor-pointer border-none"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Customer Sign-In Welcome Gate (Solves Direct Login requirement) */}
      {/* Sliding Navigation Drawer from Left for Customer */}
      {isCustomerDrawerOpen && (
        <>
          <div 
            onClick={() => setIsCustomerDrawerOpen(false)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] cursor-pointer"
          />
          <div className="fixed top-0 left-0 w-[290px] h-full bg-white shadow-2xl z-[140] flex flex-col p-6 overflow-y-auto animate-slideInLeft text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-500 text-sm tracking-widest uppercase">SWIFTPORT</span>
              </div>
              <button 
                onClick={() => setIsCustomerDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition text-slate-500 hover:text-slate-900 border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile overview inside drawer */}
            {customerSession && (
              <button
                type="button"
                onClick={() => { setActiveTab("profile"); setIsCustomerDrawerOpen(false); }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left hover:bg-slate-100 transition"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-orange-400 border border-slate-800 shadow-sm relative">
                  {customerSession.name.charAt(0).toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{customerSession.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{customerSession.phone}</p>
                </div>
              </button>
            )}

            {/* Drawer Items */}
            <div className="space-y-2.5 flex-1">
              <button
                onClick={() => { setActiveTab("book"); setIsCustomerDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${activeTab === "book" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Home</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveTab("orders"); setIsCustomerDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${activeTab === "orders" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Grid className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Orders</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveTab("payments"); setIsCustomerDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${activeTab === "payments" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Payments</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveTab("profile"); setIsCustomerDrawerOpen(false); }}
                className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition ${activeTab === "profile" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-600"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Account</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            
            <div className="border-t border-slate-100 pt-5 mt-4 space-y-2">
              <button
                onClick={() => { setActiveTab("refer"); setIsCustomerDrawerOpen(false); }}
                className={`w-full py-2 px-3 rounded-xl flex items-center justify-between text-left transition ${activeTab === "refer" ? "bg-indigo-50 font-bold text-indigo-700" : "hover:bg-indigo-50/50 text-indigo-600"}`}
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Refer & Earn</span>
                </div>
                <ChevronRight className="w-3 h-3 text-indigo-400" />
              </button>
              <div className="text-[10px] text-slate-400 px-3 pt-2 pb-1">
                <p>App Version: 4.8.2-client</p>
              </div>
            </div>
          </div>
        </>
      )}

      {currentRole === "customer" && !customerSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6 animate-scaleIn relative overflow-hidden">
            {/* Ambient visual background glow elements inside card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-200/50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <span className="bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl px-4 py-2 text-xs font-black tracking-widest flex items-center gap-1.5 shadow-md shadow-orange-100 uppercase">
                  <Compass className="w-5 h-5 animate-spin-slow" /> SwiftPort Services
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-850 tracking-tight font-sans">
                Authenticate Customer Portal
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Set up your customer profile to book couriers, review live transit trackers, and manage support desk tickets under your own handle.
              </p>
            </div>

            {/* Simulated signup input variables form */}
            <CustomerLoginForm 
              onAuthenticate={(name, email, phone, appliedCoupon) => {
                // If they entered a referral code, let's verify if a driver owns it!
                let verifiedBonus = 0;
                let couponName = "";
                if (appliedCoupon) {
                  const matchedDriver = drivers.find(d => d.referralCode && d.referralCode.toUpperCase() === appliedCoupon.trim().toUpperCase());
                  if (matchedDriver) {
                    verifiedBonus = 200; // Provide ₹200 free credits
                    couponName = matchedDriver.referralCode.toUpperCase();
                  }
                }

                setCustomerSession({
                  name: name.trim() || "Anonymous Operator",
                  email: email.trim() || "customer@example.com",
                  phone: phone.trim() || "99307 44723",
                  walletBalance: 150 + verifiedBonus, // Initial balance + bonus
                  couponApplied: couponName || undefined
                });
              }}
              drivers={drivers}
            />
          </div>
        </div>
      )}
    </div>
    </APIProvider>
  );
}
