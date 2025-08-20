import { useState, useEffect, useCallback } from 'react';

interface UseGoogleMapsOptions {
  apiKey: string;
  libraries?: ("places" | "geometry")[];
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
  isValidApiKey: boolean;
}

export function useGoogleMaps({ apiKey, libraries = ["places"] }: UseGoogleMapsOptions): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Check if API key is valid (not demo/empty and reasonable length)
  const isValidApiKey = apiKey && apiKey !== "demo" && apiKey.length > 10;

  useEffect(() => {
    // Don't attempt to load if API key is invalid
    if (!isValidApiKey) {
      setLoadError(new Error("Invalid or missing Google Maps API key"));
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const handleLoad = () => {
        setIsLoaded(true);
        setLoadError(null);
      };
      
      const handleError = () => {
        setLoadError(new Error("Failed to load Google Maps API"));
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    // Create and load the script
    const script = document.createElement('script');
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly${librariesParam}`;
    script.async = true;
    script.defer = true;

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadError(null);
    };

    const handleError = () => {
      setLoadError(new Error("Failed to load Google Maps API. Please check your API key and internet connection."));
      setIsLoaded(false);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.head.appendChild(script);

    return () => {
      // Cleanup event listeners
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [apiKey, isValidApiKey, libraries]);

  return {
    isLoaded,
    loadError,
    isValidApiKey
  };
}

export interface PlaceSearchResult {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
  types?: string[];
}

interface UsePlacesSearchOptions {
  isLoaded: boolean;
  enabled?: boolean;
}

interface UsePlacesSearchReturn {
  searchPlaces: (query: string) => Promise<PlaceSearchResult[]>;
  isSearching: boolean;
  searchError: string | null;
}

export function usePlacesSearch({ isLoaded, enabled = true }: UsePlacesSearchOptions): UsePlacesSearchReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (query: string): Promise<PlaceSearchResult[]> => {
    if (!enabled || !isLoaded || !window.google?.maps?.places) {
      console.warn("Places API not available for search");
      return [];
    }

    if (!query || query.length < 2) {
      return [];
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Try new Places API first
      if (window.google.maps.places.Place && typeof window.google.maps.places.Place.searchByText === 'function') {
        const { Place } = window.google.maps.places;
        const request = {
          textQuery: query + " venue",
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'types'],
          maxResultCount: 5,
        };

        const response = await Place.searchByText(request);
        
        if (response.places && response.places.length > 0) {
          const results = response.places.map(place => ({
            place_id: place.id,
            name: place.displayName,
            formatted_address: place.formattedAddress,
            geometry: {
              location: place.location ? {
                lat: () => place.location!.lat(),
                lng: () => place.location!.lng(),
              } : undefined
            },
            types: place.types || []
          }));
          
          return results;
        }
      }

      // Fallback to deprecated TextSearch API
      return new Promise((resolve) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
          query: query + " venue",
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
        };

        service.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results.slice(0, 5));
          } else {
            console.warn("Places search failed with status:", status);
            resolve([]);
          }
        });
      });

    } catch (error: any) {
      console.error("Places search error:", error);
      setSearchError("Failed to search for venues. Please try again.");
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [isLoaded, enabled]);

  return {
    searchPlaces,
    isSearching,
    searchError
  };
}