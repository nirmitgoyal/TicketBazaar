// Centralized Google Maps configuration to prevent LoadScript reloading issues
// Keep libraries as a static constant to avoid performance warnings

export const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

export const GOOGLE_MAPS_OPTIONS = {
  mapId: "8e0a97af9386fef", // Required for Advanced Markers
  fullscreenControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: true,
  scrollwheel: true,
  gestureHandling: "greedy" as const,
  disableDefaultUI: false,
  clickableIcons: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "600px",
};

export const DEFAULT_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};