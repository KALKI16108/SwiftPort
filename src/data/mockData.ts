import { LocationPoint, Vehicle, Driver } from "../types";

export const LOCATIONS: LocationPoint[] = [
  { id: "bandra", name: "Bandra West", address: "Hill Road, Near Bandra Station, Mumbai 400050", lat: 19.0544, lng: 72.8402 },
  { id: "andheri", name: "Andheri East", address: "Saki Naka, Near Metro Station, Mumbai 400072", lat: 19.1158, lng: 72.8761 },
  { id: "powai", name: "Powai Valley", address: "Hiranandani Gardens, Near Powai Lake, Mumbai 400076", lat: 19.1176, lng: 72.9060 },
  { id: "dadar", name: "Dadar Central", address: "Dadar TT Circle, Near Station, Mumbai 400014", lat: 19.0178, lng: 72.8478 },
  { id: "juhu", name: "Juhu Beach", address: "Juhu Tara Road, Near JW Marriott, Mumbai 400049", lat: 19.1012, lng: 72.8258 },
  { id: "colaba", name: "Colaba Causeway", address: "Gateway of India Plaza, Mumbai 400001", lat: 18.9220, lng: 72.8347 },
  { id: "thane", name: "Thane West", address: "Ghodbunder Road, Near Teen Hath Naka, Thane 400601", lat: 19.2183, lng: 72.9781 },
  { id: "chembur", name: "Chembur Colony", address: "Sion Panvel Highway, Chembur, Mumbai 400071", lat: 19.0622, lng: 72.8974 }
];

export const VEHICLES: Vehicle[] = [
  {
    id: "2wheeler",
    name: "2-Wheeler (Scooter)",
    icon: "Bike",
    capacity: "Up to 20 kg",
    baseFare: 40,
    ratePerKm: 8,
    maxWeight: 20,
    dims: "40 x 40 x 40 cm",
    description: "Best for envelopes, documents, clothes, boxes, laptops, food crates and swift couriers."
  },
  {
    id: "3wheeler",
    name: "3-Wheeler (Ape Auto)",
    icon: "Truck",
    capacity: "Up to 500 kg",
    baseFare: 180,
    ratePerKm: 18,
    maxWeight: 500,
    dims: "5.5 x 4.2 x 4.2 ft",
    description: "Perfect for single bed, small fridge, multiple packing boxes, luggage shifting or commercial stocks."
  },
  {
    id: "8ftace",
    name: "8ft Tata Ace (Tempo)",
    icon: "Bus",
    capacity: "Up to 800 kg",
    baseFare: 300,
    ratePerKm: 22,
    maxWeight: 800,
    dims: "7.2 x 4.8 x 4.8 ft",
    description: "Highly versatile for major apartment moves, sofas, king-size beds, multi-appliance payloads, and heavy crates."
  },
  {
    id: "pickup",
    name: "Bolero Pickup (1.5T)",
    icon: "Grid",
    capacity: "Up to 1500 kg",
    baseFare: 550,
    ratePerKm: 28,
    maxWeight: 1500,
    dims: "9 x 5 ft open-bed",
    description: "Heavy commercial capacity tailored for steel rods, construction cement, industrial reels, raw materials, or huge volumes."
  }
];

export const DRIVERS: Driver[] = [
  {
    id: "drv_01",
    name: "Ramesh Shinde",
    avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=120&auto=format&fit=crop",
    rating: 4.8,
    tripsCount: 1450,
    vehicleNumber: "MH-02-EA-8841",
    currentLat: 19.0500,
    currentLng: 72.8350,
    referralCode: "SWIFT-RAMESH99"
  },
  {
    id: "drv_02",
    name: "Anil Kamble",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
    rating: 4.9,
    tripsCount: 2201,
    vehicleNumber: "MH-03-BZ-3419",
    currentLat: 19.1000,
    currentLng: 72.8800,
    referralCode: "SWIFT-ANIL88"
  },
  {
    id: "drv_03",
    name: "Vikram Jadhav",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
    rating: 4.7,
    tripsCount: 940,
    vehicleNumber: "MH-02-QT-5103",
    currentLat: 19.1200,
    currentLng: 72.9100,
    referralCode: "SWIFT-VIKRAM77"
  },
  {
    id: "drv_04",
    name: "Gurbaksh Singh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=120&auto=format&fit=crop",
    rating: 4.95,
    tripsCount: 4120,
    vehicleNumber: "MH-04-YK-9911",
    currentLat: 19.0200,
    currentLng: 72.8500,
    referralCode: "SWIFT-GURBAKSH66"
  }
];

// Helper to estimate absolute Haversine distance in Km between locations
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return parseFloat(d.toFixed(1)); // round to 1 decimal place
}
