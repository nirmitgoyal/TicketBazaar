import { useState, useCallback, useRef } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
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
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Filter venues that have coordinates
  const venuesWithCoordinates = venues.filter(
    (venue) => venue.latitude && venue.longitude
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];

    // Create advanced markers for each venue
    venuesWithCoordinates.forEach((venue) => {
      if (venue.latitude && venue.longitude) {
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div style="
            background: #ef4444;
            border: 2px solid #dc2626;
            border-radius: 50% 50% 50% 0;
            width: 24px;
            height: 24px;
            position: relative;
            transform: rotate(-45deg);
            cursor: pointer;
          ">
            <div style="
              background: white;
              border-radius: 50%;
              width: 8px;
              height: 8px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: venue.latitude, lng: venue.longitude },
          content: markerElement,
          title: venue.eventTitle,
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedVenue(venue.id);
        });

        markersRef.current.push(marker);
      }
    });
    
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
          data-testid="google-map"
        >
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