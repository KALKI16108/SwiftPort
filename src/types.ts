export interface LocationPoint {
  id: string;
  name: string;
  address: string;
  lat: number; // For canvas/SVG plotting
  lng: number; // For canvas/SVG plotting
}

export interface Vehicle {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  capacity: string;
  baseFare: number;
  ratePerKm: number;
  maxWeight: number; // in kg
  dims: string;
  description: string;
}

export interface DeliveryOrder {
  id: string;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  vehicle: Vehicle;
  cargoDescription: string;
  cargoCategory: string;
  weightEstimate: number;
  labourType: 'none' | 'driver' | 'driver-helper';
  basePrice: number;
  distancePrice: number;
  labourPrice: number;
  totalPrice: number;
  status: 'draft' | 'searching' | 'assigned' | 'loaded' | 'in_transit' | 'delivered' | 'cancelled';
  driver?: Driver;
  createdAt: string;
  chats: ChatMessage[];
  distanceKm: number;
  paymentMethod?: 'cash_pickup' | 'cash_drop' | 'online';
  paymentStatus?: 'pending' | 'paid';
  driverRating?: number;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  tripsCount: number;
  vehicleNumber: string;
  currentLat: number;
  currentLng: number;
  cancellationsToday?: number;
  denialsCount?: number;
  missedOrders?: number;
  suspendedUntil?: string;
  walletBalance?: number; // Represent driver wallet balance
  address?: string;
  mobile?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  vehicleDetails?: string;
  preferredLanguage?: string;
  trainingLanguage?: string;
  referralCode?: string;
  referredByCode?: string;
  incentiveClaimedToday?: boolean;
  isOffline?: boolean;
  walletTransactions?: Array<{
    id: string;
    amount: number; // positive for credit, negative for debit
    desc: string;
    timestamp: string;
    type: 'trip_online' | 'trip_commission' | 'withdrawal' | 'withdrawal_refund' | 'penalty_forfeit' | 'referral_credit' | 'payout_settlement' | 'incentive_credit';
  }>;
}

export interface WithdrawalRequest {
  id: string;
  driverId: string;
  driverName: string;
  amount: number;
  paymentType: 'upi' | 'bank';
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'driver' | 'system' | 'ai';
  text: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  category: string;
  weightEstimate: number;
  suggestedVehicleId: string;
  helperRecommendation: string;
  loadingTip: string;
  summary: string;
  success: boolean;
}

export interface JoineeApplication {
  id: string;
  name: string;
  vehicleNumber: string;
  vehicleId: string;
  aadhaarNum: string;
  dlNum: string;
  rcNum: string;
  joiningFeePaid: boolean;
  documentStatus: "pending" | "verified" | "rejected";
  submittedAt: string;
  aadhaarFile?: string; // image representation or filename
  dlFile?: string;      // image representation or filename
  rcFile?: string;      // image representation or filename
  paymentMethod?: 'card' | 'upi' | 'qr_code' | 'bank_transfer';
  paymentReference?: string;
  referralCode?: string;
  referredByCode?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'bot' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'chatbot' | 'assigned_to_agent' | 'resolved';
  messages: SupportMessage[];
  assignedAgentName?: string;
  createdAt: string;
  updatedAt: string;
  bookingId?: string;
}

