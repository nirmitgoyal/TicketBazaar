import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from "@react-google-maps/api";
import { Ticket } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, MapPin, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventListFallback from "./event-list-fallback";
import SimpleMap from "./simple-map";
import { 
  GOOGLE_MAPS_LIBRARIES, 
  GOOGLE_MAPS_OPTIONS, 
  MAP_CONTAINER_STYLE, 
  DEFAULT_CENTER 
} from "@/lib/google-maps-config";

// Set up props interface
interface EventMapProps {
  events: Ticket[];
  onViewportChange?: (bounds: google.maps.LatLngBounds | null) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, onViewportChange }) => {
  const [selectedEvent, setSelectedEvent] = useState<Ticket | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(
    null,
  );
  const [eventMarkers, setEventMarkers] = useState<Ticket[]>([]);

  // Track events with valid coordinates for analytics
  useEffect(() => {
    const eventsWithCoords = events.filter((e) => e.latitude && e.longitude).length;
    if (eventsWithCoords !== events.length) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Map: ${events.length - eventsWithCoords} events missing location data`);
      }
    }
  }, [events]);

  // Load the Google Maps JavaScript API
  // Use environment variable for API key security
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Enhanced error logging for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Maps API Key configured:', !!GOOGLE_MAPS_API_KEY);
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'demo') {
        console.warn('Google Maps API key is missing or set to demo mode');
      }
    }
  }, [GOOGLE_MAPS_API_KEY]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    // Remove mapIds to fix the Advanced Markers warning
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // When the map bounds change, call the onViewportChange callback
  const onBoundsChanged = useCallback(() => {
    if (map && onViewportChange) {
      const bounds = map.getBounds();
      if (bounds) {
        onViewportChange(bounds);
      } else {
        onViewportChange(null);
      }
    }
  }, [map, onViewportChange]);

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isLoaded || !window.google) return;

          const userPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
          );
          setUserLocation(userPos);

          // Center map on user's location
          if (map) {
            map.setCenter(userPos);
            map.setZoom(11);

            // Trigger bounds change to update the events list
            const bounds = map.getBounds();
            if (bounds && onViewportChange) {
              onViewportChange(bounds);
            }
          }
        },
        (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error getting user location:", error);
          }
        },
      );
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  }, [map, onViewportChange, isLoaded]);

  // Track if we've already set initial bounds
  const [initialBoundsSet, setInitialBoundsSet] = useState(false);

  // Set event markers for rendering
  useEffect(() => {
    if (!map || !isLoaded) return;
    
    const validEvents = events.filter((event) => event.latitude && event.longitude);
    setEventMarkers(validEvents);
  }, [map, events, isLoaded]);

  // Fit map to all markers only on initial load
  useEffect(() => {
    if (
      map &&
      events.length > 0 &&
      isLoaded &&
      window.google &&
      !initialBoundsSet
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Map is loaded and ready to display events");
      }

      // Always fit to all markers in India for "All cities" view
      const bounds = new google.maps.LatLngBounds();
      let hasValidCoordinates = false;

      events.forEach((event) => {
        if (event.latitude && event.longitude) {
          bounds.extend({ lat: event.latitude, lng: event.longitude });
          hasValidCoordinates = true;
        }
      });

      if (hasValidCoordinates) {
        map.fitBounds(bounds);

        // Add padding to the bounds to show a better view of India
        const extendPoint = (bounds: google.maps.LatLngBounds) => {
          const newSW = new google.maps.LatLng(
            bounds.getSouthWest().lat() - 0.5,
            bounds.getSouthWest().lng() - 0.5,
          );
          const newNE = new google.maps.LatLng(
            bounds.getNorthEast().lat() + 0.5,
            bounds.getNorthEast().lng() + 0.5,
          );
          const newBounds = new google.maps.LatLngBounds();
          newBounds.extend(newSW);
          newBounds.extend(newNE);
          return newBounds;
        };

        map.fitBounds(extendPoint(bounds));

        // Limit max zoom level for country-level view
        const listener = google.maps.event.addListenerOnce(map, "idle", () => {
          const currentZoom = map?.getZoom();
          if (currentZoom && currentZoom > 6) {
            map.setZoom(6);
          }
        });

        setInitialBoundsSet(true);
      } else {
        // If no valid coordinates at all, center on India
        map.setCenter(DEFAULT_CENTER); // Center of India
        map.setZoom(5); // Zoom level to see most of India
        setInitialBoundsSet(true);
      }
    }
  }, [map, events, isLoaded, initialBoundsSet]);

  // Show loading state or error
  if (loadError) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Google Maps error:", loadError);
      console.error("Error details:", {
        message: loadError.message,
        stack: loadError.stack,
        apiKey: GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'
      });
    }

    // Display events in a grid layout as fallback
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Map Temporarily Unavailable</h3>
          <p className="text-sm text-yellow-700 mb-3">
            The map feature requires a valid Google Maps API key to display venue locations. 
            Showing events in list format instead.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-yellow-600">
              <summary className="cursor-pointer">Technical Details</summary>
              <pre className="mt-2 bg-yellow-100 p-2 rounded text-xs overflow-auto">
                {loadError.message}
              </pre>
            </details>
          )}
        </div>
        <SimpleMap
          events={events}
          onViewportChange={onViewportChange}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative h-[600px]">
      {/* Location Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          size="sm"
          variant="secondary"
          className="flex items-center gap-1.5 bg-white shadow-md hover:bg-gray-100"
          onClick={getUserLocation}
        >
          <MapPin className="h-4 w-4" />
          <span>Find events near me</span>
        </Button>
      </div>

      {/* Custom Zoom Controls */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="bg-white shadow-md hover:bg-gray-100 h-8 w-8"
          onClick={() => map?.setZoom((map?.getZoom() || 11) + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="bg-white shadow-md hover:bg-gray-100 h-8 w-8"
          onClick={() => map?.setZoom((map?.getZoom() || 11) - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onBoundsChanged={onBoundsChanged}
        options={GOOGLE_MAPS_OPTIONS}
      >
        {/* Event Markers */}
        {eventMarkers.map((event) => (
          <Marker
            key={event.id}
            position={{
              lat: event.latitude!,
              lng: event.longitude!,
            }}
            title={event.eventTitle}
            onClick={() => setSelectedEvent(event)}
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE || google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#1976D2',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            }}
          />
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Location"
            icon={{
              path: window.google?.maps?.SymbolPath?.CIRCLE || google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            }}
          />
        )}

        {selectedEvent && selectedEvent.latitude && selectedEvent.longitude && (
          <InfoWindow
            position={{
              lat: selectedEvent.latitude,
              lng: selectedEvent.longitude,
            }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <div className="bg-white p-3 max-w-xs">
              {selectedEvent.eventImageUrl && (
                <div className="mb-2 rounded overflow-hidden">
                  <img
                    src={selectedEvent.eventImageUrl}
                    alt={selectedEvent.eventTitle}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg text-primary">
                {selectedEvent.eventTitle}
              </h3>
              <p className="text-sm text-gray-700">{selectedEvent.venue}</p>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(selectedEvent.eventDate).toLocaleDateString()}
              </p>
              <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 inline-block mb-2">
                {selectedEvent.category}
              </div>
              {selectedEvent.eventDescription && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {selectedEvent.eventDescription}
                </p>
              )}
              <Link
                href={`/events/${selectedEvent.id}`}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default EventMap;
