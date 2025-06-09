import { useState, useCallback, useRef } from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { GOOGLE_MAPS_OPTIONS, DEFAULT_CENTER } from "@/lib/google-maps-config";

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
        >
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
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 24),
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