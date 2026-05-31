import React, { useEffect, useState, useRef } from "react";
import { LocationPoint, DeliveryOrder, Driver } from "../types";
import { LOCATIONS, DRIVERS } from "../data/mockData";
import { MapPin, Navigation, Compass, ShieldAlert, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface RouteRendererProps {
  pickup: LocationPoint;
  dropoff: LocationPoint;
  isActiveTransit: boolean;
  progress: number;
  status: string;
}

function RouteRenderer({ pickup, dropoff, isActiveTransit, progress, status }: RouteRendererProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const [routePolyline, setRoutePolyline] = useState<google.maps.Polyline | null>(null);
  const vehicleMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!routesLib || !map || !pickup || !dropoff) return;

    if (routePolyline) {
      routePolyline.setMap(null);
    }

    routesLib.Route.computeRoutes({
      origin: { lat: pickup.lat, lng: pickup.lng },
      destination: { lat: dropoff.lat, lng: dropoff.lng },
      travelMode: 'DRIVING',
      fields: ['path', 'viewport']
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const polyLinesList = routes[0].createPolylines();
        if (polyLinesList?.[0]) {
          polyLinesList.forEach(p => {
            p.setOptions({
              strokeColor: status === 'delivered' ? '#10b981' : '#f97316',
              strokeOpacity: 0.85,
              strokeWeight: 4
            });
            p.setMap(map);
          });
          setRoutePolyline(polyLinesList[0]);
        }
        
        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport);
        }
      }
    }).catch(err => {
      console.warn("Directions request rejected or unavailable:", err);
    });

    return () => {
      if (routePolyline) {
        routePolyline.setMap(null);
      }
    };
  }, [routesLib, map, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  // Animate Google Map polyline color dynamically from Orange to Emerald upon completion
  useEffect(() => {
    if (!routePolyline) return;
    if (status === 'delivered') {
      let currentStep = 0;
      const totalSteps = 40;
      const interval = setInterval(() => {
        currentStep++;
        const ratio = currentStep / totalSteps;
        // Interpolate between #f97316 rgb(249, 115, 22) and #10b981 rgb(16, 185, 129)
        const r = Math.round(249 + (16 - 249) * ratio);
        const g = Math.round(115 + (185 - 115) * ratio);
        const b = Math.round(22 + (129 - 22) * ratio);
        const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        routePolyline.setOptions({ strokeColor: colorHex });
        if (currentStep >= totalSteps) {
          clearInterval(interval);
        }
      }, 35);
      return () => clearInterval(interval);
    } else {
      routePolyline.setOptions({ strokeColor: '#f97316' });
    }
  }, [status, routePolyline]);

  useEffect(() => {
    if (!map || !routePolyline || !isActiveTransit) {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.map = null;
        vehicleMarkerRef.current = null;
      }
      return;
    }

    const pathPoints = routePolyline.getPath()?.getArray();
    if (!pathPoints || pathPoints.length === 0) return;

    const index = Math.min(
      pathPoints.length - 1,
      Math.floor(progress * (pathPoints.length - 1))
    );
    const point = pathPoints[Math.max(0, index)];

    if (!vehicleMarkerRef.current) {
      const container = document.createElement("div");
      container.className = "bg-slate-900 border-2 border-orange-500 p-2 rounded-full shadow-2xl flex items-center justify-center text-[18px]";
      container.style.width = "40px";
      container.style.height = "40px";
      container.innerHTML = "🚚";
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: point,
        content: container,
        title: "Active Delivery Partner"
      });
      vehicleMarkerRef.current = marker;
    } else {
      vehicleMarkerRef.current.position = point;
    }

    return () => {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.map = null;
        vehicleMarkerRef.current = null;
      }
    };
  }, [map, routePolyline, isActiveTransit, progress]);

  return null;
}

interface MapVisualizationProps {
  activeOrder?: DeliveryOrder | null;
  driversList?: Driver[];
}

export default function MapVisualization({ activeOrder, driversList = DRIVERS }: MapVisualizationProps) {
  const [progress, setProgress] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants mapping lat/lng bounding box to SVG coordinate grid (0-400 size)
  // Mumbai bounding box
  const LAT_MIN = 18.90;
  const LAT_MAX = 19.25;
  const LNG_MIN = 72.80;
  const LNG_MAX = 73.00;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
    const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100; // Invert Y for cartesian
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Pulse radar animations when looking for drivers
  useEffect(() => {
    let intervalId: any;
    if (activeOrder?.status === "searching") {
      intervalId = setInterval(() => {
        setRadarAngle((p) => (p + 8) % 360);
      }, 30);
    }
    return () => clearInterval(intervalId);
  }, [activeOrder?.status]);

  // Handle active routing transit bar animation state changes
  useEffect(() => {
    let intervalId: any;
    if (activeOrder?.status === "in_transit") {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(intervalId);
            return 1;
          }
          return prev + 0.02; // Take ~50 cycles to cross
        });
      }, 250);
    } else if (activeOrder?.status === "delivered") {
      setProgress(1);
    } else if (activeOrder?.status === "loaded") {
      setProgress(0.2);
    } else if (activeOrder?.status === "assigned") {
      setProgress(0.05);
    } else {
      setProgress(0);
    }
    return () => clearInterval(intervalId);
  }, [activeOrder?.status, activeOrder?.id]);

  const pickupCoords = activeOrder ? projectCoords(activeOrder.pickup.lat, activeOrder.pickup.lng) : null;
  const dropCoords = activeOrder ? projectCoords(activeOrder.dropoff.lat, activeOrder.dropoff.lng) : null;

  // Active delivery position interpolator
  const getDeliveryVehicleCoords = () => {
    if (!pickupCoords || !dropCoords) return null;
    const x = pickupCoords.x + (dropCoords.x - pickupCoords.x) * progress;
    const y = pickupCoords.y + (dropCoords.y - pickupCoords.y) * progress;
    return { x, y };
  };

  const deliveryVehiclePos = getDeliveryVehicleCoords();

  return (
    <div id="map-visualization" ref={containerRef} className="relative w-full h-[360px] md:h-[450px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between">
      {/* Dynamic Map Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex lg:flex-row flex-col gap-2 justify-between items-start pointer-events-none md:items-center">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Mumbai Active Delivery Grid</span>
        </div>
        
        {activeOrder && (
          <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs flex items-center gap-3 shadow-2xl">
            <span className="text-slate-400">Status:</span>
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
              {activeOrder.status.replace("_", " ")}
            </span>
            {activeOrder.status === 'in_transit' && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                {Math.round(progress * 100)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Canvas Map Background or Dynamic Google Map */}
      <div className="w-full h-full relative cursor-crosshair">
        {(() => {
          const isGoogleLoaded = typeof window !== "undefined" && !!(window as any).google;
          if (isGoogleLoaded) {
            return (
              <Map
                defaultCenter={{ lat: activeOrder ? activeOrder.pickup.lat : 19.0760, lng: activeOrder ? activeOrder.pickup.lng : 72.8777 }}
                defaultZoom={11}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                gestureHandling="greedy"
                disableDefaultUI={true}
              >
                {activeOrder && (
                  <>
                    <AdvancedMarker position={{ lat: activeOrder.pickup.lat, lng: activeOrder.pickup.lng }}>
                      <Pin background="#4f46e5" glyphColor="#fff" borderColor="#4f46e5">
                        <span className="text-[10px] font-black font-sans text-white">P</span>
                      </Pin>
                    </AdvancedMarker>
                    <AdvancedMarker position={{ lat: activeOrder.dropoff.lat, lng: activeOrder.dropoff.lng }}>
                      <Pin background="#e11d48" glyphColor="#fff" borderColor="#e11d48">
                        <span className="text-[10px] font-black font-sans text-white">D</span>
                      </Pin>
                    </AdvancedMarker>
                    <RouteRenderer 
                      pickup={activeOrder.pickup} 
                      dropoff={activeOrder.dropoff}
                      isActiveTransit={activeOrder.status === 'in_transit' || activeOrder.status === 'loaded' || activeOrder.status === 'assigned'}
                      progress={progress}
                      status={activeOrder.status}
                    />
                  </>
                )}
                
                {/* Standard presets markers */}
                {!activeOrder && LOCATIONS.map((loc) => (
                  <AdvancedMarker key={`gmarker-${loc.id}`} position={{ lat: loc.lat, lng: loc.lng }}>
                    <div className="px-2 py-1 bg-white border border-slate-200 rounded-md font-bold text-[9px] shadow text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                      {loc.name}
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            );
          }

          return (
            <>
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Subtle Grid Lines */}
                <defs>
                  <pattern id="mapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />

                {/* Road/Route schematic networking mesh */}
                <g stroke="rgba(30, 41, 59, 0.7)" strokeWidth="0.5" strokeDasharray="1,2" fill="none">
                  {LOCATIONS.map((loc, idx) => {
                    const fromProj = projectCoords(loc.lat, loc.lng);
                    const nextLoc = LOCATIONS[(idx + 1) % LOCATIONS.length];
                    const nextProj = projectCoords(nextLoc.lat, nextLoc.lng);
                    return (
                      <line 
                        key={`road-${loc.id}-${nextLoc.id}`} 
                        x1={`${fromProj.x}%`} 
                        y1={`${fromProj.y}%`} 
                        x2={`${nextProj.x}%`} 
                        y2={`${nextProj.y}%`} 
                      />
                    );
                  })}
                </g>

                {/* Draw connecting route path if order is active */}
                {pickupCoords && dropCoords && (
                  <>
                    {/* Route line underlayer shadow */}
                    <line 
                      x1={`${pickupCoords.x}%`} 
                      y1={`${pickupCoords.y}%`} 
                      x2={`${dropCoords.x}%`} 
                      y2={`${dropCoords.y}%`} 
                      stroke="rgba(99, 102, 241, 0.15)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Animated active path line */}
                    <motion.line 
                      x1={`${pickupCoords.x}%`} 
                      y1={`${pickupCoords.y}%`} 
                      x2={`${dropCoords.x}%`} 
                      y2={`${dropCoords.y}%`} 
                      animate={{ stroke: activeOrder.status === 'delivered' ? '#10b981' : '#6366f1' }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      strokeWidth="1.2"
                      strokeDasharray="4,3"
                      className={activeOrder.status === 'in_transit' ? 'animate-[dash_20s_linear_infinite]' : ''}
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Render static locations as nodes */}
                {LOCATIONS.map((loc) => {
                  const proj = projectCoords(loc.lat, loc.lng);
                  const isPickup = activeOrder?.pickup.id === loc.id;
                  const isDropoff = activeOrder?.dropoff.id === loc.id;
                  
                  return (
                    <g key={`node-${loc.id}`}>
                      <circle 
                        cx={`${proj.x}%`} 
                        cy={`${proj.y}%`} 
                        r={isPickup || isDropoff ? "2" : "1"} 
                        fill={isPickup ? "#6366f1" : isDropoff ? "#f43f5e" : "#475569"}
                        className={isPickup || isDropoff ? "animate-pulse" : ""}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Live CSS Interactive Markers */}
              <AnimatePresence>
                {/* Nearby Drivers representing delivery cluster */}
                {activeOrder?.status !== 'in_transit' && activeOrder?.status !== 'delivered' && driversList.map((driver, idx) => {
                  const proj = projectCoords(driver.currentLat, driver.currentLng);
                  return (
                    <motion.div
                      key={`drv-pin-${driver.id}-${idx}`}
                      id={`drv-pin-${driver.id}`}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-5 hidden md:block"
                      style={{ left: `${proj.x}%`, top: `${proj.y}%` }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.6, scale: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ opacity: 1, scale: 1.2 }}
                    >
                      <div className="bg-slate-900 border border-amber-500/70 p-1 rounded-full text-[10px] text-amber-400 shadow-md flex items-center justify-center p-1 font-mono">
                        <Navigation className="w-3.5 h-3.5 rotate-45" />
                      </div>
                    </motion.div>
                  );
                })}

                {/* Search Radar Scan overlay */}
                {activeOrder?.status === "searching" && pickupCoords && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${pickupCoords.x}%`, top: `${pickupCoords.y}%` }}
                  >
                    <div className="w-48 h-48 rounded-full border border-indigo-500/30 bg-indigo-500/5 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center">
                        <Compass 
                          className="w-12 h-12 text-indigo-400"
                          style={{ transform: `rotate(${radarAngle}deg)` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Pin */}
                {pickupCoords && (
                  <motion.div 
                    id="pickup-pin"
                    className="absolute transform -translate-x-1/2 -translate-y-full z-20"
                    style={{ left: `${pickupCoords.x}%`, top: `${pickupCoords.y}%` }}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="bg-indigo-600 outline-none text-white px-2 py-1 rounded text-[10px] font-bold shadow-lg flex items-center gap-1 border border-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        P
                      </div>
                      <MapPin className="w-5 h-5 text-indigo-500 -mt-1.5 fill-indigo-900" />
                    </div>
                  </motion.div>
                )}

                {/* Destination Pin */}
                {dropCoords && (
                  <motion.div 
                    id="dropoff-pin"
                    className="absolute transform -translate-x-1/2 -translate-y-full z-20"
                    style={{ left: `${dropCoords.x}%`, top: `${dropCoords.y}%` }}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-lg border border-red-400">
                        D
                      </div>
                      <MapPin className="w-5 h-5 text-red-500 -mt-1.5 fill-red-950" />
                    </div>
                  </motion.div>
                )}

                {/* Live Delivery Vehicle Pin (Moving) */}
                {activeOrder && deliveryVehiclePos && (activeOrder.status === 'in_transit' || activeOrder.status === 'loaded' || activeOrder.status === 'assigned') && (
                  <motion.div 
                    id="delivery-vehicle-pin"
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
                    style={{ left: `${deliveryVehiclePos.x}%`, top: `${deliveryVehiclePos.y}%` }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="bg-slate-900 border-2 border-indigo-400 p-2 rounded-full shadow-2xl relative">
                      <Navigation className="w-5 h-5 text-indigo-400 rotate-90" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center border border-slate-900 text-[8px] text-white font-extrabold animate-bounce">
                        ⚡
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 mt-1">
                      {activeOrder.vehicle.name.split(" ")[0]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </div>

      {/* Map Footer Informational Overlay */}
      <div className="bg-slate-900/90 border-t border-slate-800 p-3.5 flex flex-wrap gap-4 items-center justify-between text-xs z-10 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Drivers active: {driversList.length}</span>
        </div>
        {activeOrder ? (
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <span>{activeOrder.pickup.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeOrder.dropoff.name}</span>
            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] ml-1">
              {activeOrder.distanceKm} km
            </span>
          </div>
        ) : (
          <div className="text-slate-500 italic">Select routes to configure on-demand logistics metrics</div>
        )}
      </div>
    </div>
  );
}
