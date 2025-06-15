import { useState } from "react";

export interface SearchSuggestion {
  suggestion: string;
  category: string;
  popularity: number;
}

export interface SearchContext {
  query: string;
  location?: string;
  preferences?: {
    categories?: string[];
    priceRange?: [number, number];
    datePreference?: string;
  };
}

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const getSuggestions = async (context: SearchContext) => {
    if (!context.query.trim() || context.query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/search/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: context.query,
          userLocation: context.location,
          userPreferences: context.preferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        console.warn("Failed to get suggestions:", data.message);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const getPopularSearches = async () => {
    try {
      const response = await fetch("/api/search/popular");
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.popularSearches || []);
      }
    } catch (error) {
      console.error("Error getting popular searches:", error);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    suggestions,
    isLoadingSuggestions,
    getSuggestions,
    getPopularSearches,
    clearSuggestions,
  };
}
