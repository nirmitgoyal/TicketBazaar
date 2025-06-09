import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";
import { ReactNode, createContext, useContext, cloneElement, isValidElement } from "react";
import { MapFallback } from "./MapFallback";

interface GoogleMapsContextType {
  isLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false });

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
  children: ReactNode;
  venues?: Array<{
    id: number;
    eventTitle: string;
    venue: string;
    venueAddress?: string;
    category: string;
  }>;
  className?: string;
}

export function GoogleMapsProvider({ children, venues = [], className }: GoogleMapsProviderProps) {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey || googleMapsApiKey === "demo") {
    return <MapFallback venues={venues} className={className} />;
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Maps...</span>
        </div>
      }
    >
      <GoogleMapsContext.Provider value={{ isLoaded: true }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}