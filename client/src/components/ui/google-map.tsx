import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { Event } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, MapPin, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventListFallback from "./event-list-fallback";

// Container style for the map
const containerStyle = {
  width: "100%",
  height: "600px",
};

// Center on central India for a better overall view
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

// Define libraries for Google Maps as a static array to prevent reloading issues
const mapLibraries: ("places" | "geometry" | "marker")[] = ["places", "geometry", "marker"];

// Set up props interface
interface EventMapProps {
  events: Event[];
  onViewportChange?: (bounds: google.maps.LatLngBounds | null) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, onViewportChange }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(
    null,
  );
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  // Track events with valid coordinates for analytics
  useEffect(() => {
    const eventsWithCoords = events.filter((e) => e.latitude && e.longitude).length;
    if (eventsWithCoords !== events.length) {
      console.warn(`Map: ${events.length - eventsWithCoords} events missing location data`);
    }
  }, [events]);

  // Load the Google Maps JavaScript API
  // Use environment variable for API key security
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
    mapIds: ["ticket-bazaar-map"], // Add a map ID for Advanced Markers
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
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
          console.error("Error getting user location:", error);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [map, onViewportChange, isLoaded]);

  // Track if we've already set initial bounds
  const [initialBoundsSet, setInitialBoundsSet] = useState(false);

  // Add markers to map using DOM manipulation to avoid deprecated warnings
  useEffect(() => {
    if (!map || !isLoaded || !window.google) return;

    // Clear existing markers
    markers.forEach((marker) => {
      if (marker.map) {
        marker.map = null;
      }
    });
    setMarkers([]);

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    // Add event markers
    events
      .filter((event) => event.latitude && event.longitude)
      .forEach((event) => {
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
        <div style="
          width: 24px; 
          height: 24px; 
          background: #1976D2; 
          border: 2px solid white; 
          border-radius: 50%; 
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: event.latitude!, lng: event.longitude! },
          map: map,
          content: markerElement,
          title: event.title,
        });

        markerElement.addEventListener("click", () => {
          setSelectedEvent(event);
        });

        newMarkers.push(marker);
      });

    // Add user location marker if available
    if (userLocation) {
      const userMarkerElement = document.createElement("div");
      userMarkerElement.innerHTML = `
        <div style="
          width: 16px; 
          height: 16px; 
          background: #4285F4; 
          border: 2px solid white; 
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: userLocation,
        map: map,
        content: userMarkerElement,
        title: "Your Location",
      });

      newMarkers.push(userMarker);
    }

    setMarkers(newMarkers);

    // Cleanup function
    return () => {
      newMarkers.forEach((marker) => {
        if (marker.map) {
          marker.map = null;
        }
      });
    };
  }, [map, events, userLocation, isLoaded]);

  // Fit map to all markers only on initial load
  useEffect(() => {
    if (
      map &&
      events.length > 0 &&
      isLoaded &&
      window.google &&
      !initialBoundsSet
    ) {
      console.log("Map is loaded and ready to display events");

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
        map.setCenter({ lat: 20.5937, lng: 78.9629 }); // Center of India
        map.setZoom(5); // Zoom level to see most of India
        setInitialBoundsSet(true);
      }
    }
  }, [map, events, isLoaded, initialBoundsSet]);

  // Show loading state or error
  if (loadError) {
    console.error("Google Maps error:", loadError);

    // Display events in a grid layout as fallback
    return (
      <EventListFallback
        events={events}
        title="Events Map View"
        description="Map view is temporarily unavailable. Displaying events in list view."
      />
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
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onBoundsChanged={onBoundsChanged}
        options={{
          mapId: "ticket-bazaar-map", // Add map ID for Advanced Markers
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: "greedy",
          disableDefaultUI: false,
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {/* Markers are now handled with useEffect to avoid deprecated warnings */}

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
