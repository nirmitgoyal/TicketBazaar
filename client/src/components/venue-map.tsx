import { useState, useCallback } from "react";
import { GoogleMap, InfoWindow, Marker, useLoadScript } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import { GOOGLE_MAPS_OPTIONS, DEFAULT_CENTER, GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";

interface VenueMapProps {
  venues: Array<{
    id: number;
    eventTitle: string;
    venue: string;
    venueAddress?: string;
    latitude?: number;
    longitude?: number;
    category: string;
  }>;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

export function VenueMap({ venues, className = "" }: VenueMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Filter venues that have coordinates
  const venuesWithCoordinates = venues.filter(
    (venue) => venue.latitude && venue.longitude
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // If we have venues, fit the map to show all markers
    if (venuesWithCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      venuesWithCoordinates.forEach((venue) => {
        if (venue.latitude && venue.longitude) {
          bounds.extend({ lat: venue.latitude, lng: venue.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [venuesWithCoordinates]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle loading error
  if (loadError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Map Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Unable to load venue locations. The map service is temporarily unavailable.
            </p>
            <p className="text-sm text-red-600">
              Error: {loadError.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle loading state
  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (venuesWithCoordinates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No venue locations available for mapping
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Venue Locations ({venuesWithCoordinates.length} venues)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={DEFAULT_CENTER}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={GOOGLE_MAPS_OPTIONS}
          data-testid="google-map"
        >
          {/* Venue Markers */}
          {venuesWithCoordinates.map((venue) => (
            <Marker
              key={venue.id}
              position={{
                lat: venue.latitude!,
                lng: venue.longitude!,
              }}
              title={venue.eventTitle}
              onClick={() => setSelectedVenue(venue.id)}
              icon={{
                path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#dc2626',
                strokeWeight: 2,
                rotation: 45,
              }}
            />
          ))}

          {selectedVenue && (
            <InfoWindow
              position={{
                lat: venuesWithCoordinates.find(v => v.id === selectedVenue)!.latitude!,
                lng: venuesWithCoordinates.find(v => v.id === selectedVenue)!.longitude!,
              }}
              onCloseClick={() => setSelectedVenue(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-sm mb-1">
                  {venuesWithCoordinates.find(v => v.id === selectedVenue)!.eventTitle}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {venuesWithCoordinates.find(v => v.id === selectedVenue)!.venue}
                </p>
                {venuesWithCoordinates.find(v => v.id === selectedVenue)!.venueAddress && (
                  <p className="text-xs text-gray-500 mb-2">
                    {venuesWithCoordinates.find(v => v.id === selectedVenue)!.venueAddress}
                  </p>
                )}
                <div className="flex justify-start items-center">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {venuesWithCoordinates.find(v => v.id === selectedVenue)!.category}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
}