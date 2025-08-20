import { useState, useCallback } from "react";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";
import { Input } from "@/components/ui/input";
import { MapPin, X } from "lucide-react";

export default function GoogleMapsTest() {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [venueInputValue, setVenueInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleVenueSearch = useCallback((query: string) => {
    setVenueInputValue(query);
    addDebugInfo(`Search query: "${query}"`);

    // Clear previous selection when user starts typing again
    if (selectedPlace && query !== selectedPlace.name) {
      setSelectedPlace(null);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      addDebugInfo("Query too short, clearing results");
      return;
    }

    // Check if Google Maps is loaded
    if (!window.google) {
      addDebugInfo("ERROR: window.google is not available");
      return;
    }

    if (!window.google.maps) {
      addDebugInfo("ERROR: window.google.maps is not available");
      return;
    }

    if (!window.google.maps.places) {
      addDebugInfo("ERROR: window.google.maps.places is not available");
      return;
    }

    addDebugInfo("Google Maps API loaded successfully");

    // Use Google Places API to search for venues
    try {
      // Try the new Place class first
      if (window.google.maps.places.Place) {
        addDebugInfo("Trying new Places API (Place.searchByText)");
        const { Place } = window.google.maps.places;
        const request = {
          textQuery: query + " venue",
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'types'],
          maxResultCount: 5,
        };

        Place.searchByText(request).then((response) => {
          addDebugInfo(`New API response: ${response.places?.length || 0} places found`);
          if (response.places && response.places.length > 0) {
            // Convert new Place format to old PlaceResult format for compatibility
            const convertedResults = response.places.map(place => ({
              place_id: place.id,
              name: place.displayName,
              formatted_address: place.formattedAddress,
              geometry: {
                location: place.location ? {
                  lat: () => place.location!.lat(),
                  lng: () => place.location!.lng(),
                  equals: () => false,
                  toJSON: () => ({ lat: place.location!.lat(), lng: place.location!.lng() }),
                  toUrlValue: () => `${place.location!.lat()},${place.location!.lng()}`
                } : undefined
              },
              types: place.types || []
            })) as google.maps.places.PlaceResult[];
            setSearchResults(convertedResults);
            setShowResults(true);
            addDebugInfo("Successfully set search results from new API");
          } else {
            setSearchResults([]);
            setShowResults(false);
            addDebugInfo("No results from new API");
          }
        }).catch((error) => {
          addDebugInfo(`New API error: ${error.message || error}`);
          // Fallback to deprecated API
          tryDeprecatedAPI(query);
        });
      } else {
        addDebugInfo("New Places API not available, using deprecated API");
        tryDeprecatedAPI(query);
      }
    } catch (error: any) {
      addDebugInfo(`Exception in new API: ${error.message || error}`);
      tryDeprecatedAPI(query);
    }

    function tryDeprecatedAPI(query: string) {
      addDebugInfo("Trying deprecated PlacesService API");
      try {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const fallbackRequest = {
          query: query + " venue",
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
        };

        service.textSearch(fallbackRequest, (results, status) => {
          addDebugInfo(`Deprecated API status: ${status}`);
          addDebugInfo(`Deprecated API results: ${results?.length || 0}`);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setSearchResults(results.slice(0, 5));
            setShowResults(true);
            addDebugInfo("Successfully set results from deprecated API");
          } else {
            setSearchResults([]);
            setShowResults(false);
            addDebugInfo(`Deprecated API failed with status: ${status}`);
          }
        });
      } catch (error: any) {
        addDebugInfo(`Deprecated API exception: ${error.message || error}`);
      }
    }
  }, [selectedPlace]);

  const handleSelectVenue = useCallback((place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    const venue = place.name || "";
    setVenueInputValue(venue);
    setShowResults(false);
    setSearchResults([]);
    addDebugInfo(`Selected venue: ${venue}`);
  }, []);

  const handleClearVenue = useCallback(() => {
    setSelectedPlace(null);
    setVenueInputValue("");
    setSearchResults([]);
    setShowResults(false);
    addDebugInfo("Venue cleared");
  }, []);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo";

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<div>Loading Maps...</div>}
      onLoad={() => addDebugInfo("Google Maps LoadScript loaded")}
      onError={(error) => addDebugInfo(`LoadScript error: ${error}`)}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Google Maps Places API Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google Maps API Key:</label>
              <p className="text-sm text-gray-600">{googleMapsApiKey === "demo" ? "Using demo key" : "Valid key detected"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue Search:
              </label>
              <div className="relative">
                <Input
                  placeholder="Search for venue (e.g., Phoenix Marketcity, Mumbai)"
                  value={venueInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setVenueInputValue(value);
                    handleVenueSearch(value);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  onBlur={(e) => {
                    // Delay hiding results to allow clicks on dropdown items
                    setTimeout(() => {
                      setShowResults(false);
                    }, 200);
                  }}
                />

                {/* Clear button */}
                {(venueInputValue || selectedPlace) && (
                  <button
                    type="button"
                    onClick={handleClearVenue}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear venue selection"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((place, index) => (
                      <button
                        key={place.place_id || index}
                        type="button"
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleSelectVenue(place)}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">
                              {place.name}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {place.formatted_address}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPlace && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="font-medium text-green-800">{selectedPlace.name}</p>
                    <p className="text-green-600">{selectedPlace.formatted_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Debug Information:</h3>
            <div className="bg-gray-100 p-4 rounded text-xs max-h-96 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p>No debug info yet. Try searching for a venue.</p>
              ) : (
                debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">
                    {info}
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setDebugInfo([])}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Clear Debug
            </button>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}