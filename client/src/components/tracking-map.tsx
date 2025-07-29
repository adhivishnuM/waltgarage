import { useEffect, useRef } from "react";
import { ServiceTracking } from "@shared/schema";

declare global {
  interface Window {
    L: any;
  }
}

interface TrackingMapProps {
  tracking: ServiceTracking;
  className?: string;
}

export function TrackingMap({ tracking, className }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([19.0760, 72.8777], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
    }

    // Update marker position
    if (tracking.currentLocation && typeof tracking.currentLocation === 'object') {
      const location = tracking.currentLocation as { lat: number; lng: number };
      
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
      } else {
        markerRef.current = window.L.marker([location.lat, location.lng])
          .addTo(mapInstance.current)
          .bindPopup(`Technician Location<br>Status: ${tracking.status}`);
      }
      
      mapInstance.current.setView([location.lat, location.lng], 15);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [tracking]);

  return (
    <div 
      ref={mapRef} 
      className={className || "h-64 w-full bg-surface rounded-xl"}
    />
  );
}
