import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export interface SearchHint {
  suggestion: string;
  category: string;
  confidence: number;
  reasoning: string;
}

export interface SearchContext {
  query: string;
  location?: string;
  previousSearches?: string[];
  preferences?: {
    categories?: string[];
    priceRange?: [number, number];
    datePreference?: string;
  };
}

export function useSearchHints() {
  const [hints, setHints] = useState<SearchHint[]>([]);
  const [isLoadingHints, setIsLoadingHints] = useState(false);

  const generateHints = async (context: SearchContext) => {
    if (!context.query.trim() || context.query.length < 2) {
      setHints([]);
      return;
    }

    setIsLoadingHints(true);
    try {
      const response = await fetch("/api/search/hints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });

      const data = await response.json();

      if (data.success) {
        setHints(data.hints || []);
      } else {
        console.warn("Failed to generate hints:", data.message);
        setHints([]);
      }
    } catch (error) {
      console.error("Error generating search hints:", error);
      setHints([]);
    } finally {
      setIsLoadingHints(false);
    }
  };

  const clearHints = () => {
    setHints([]);
  };

  return {
    hints,
    isLoadingHints,
    generateHints,
    clearHints,
  };
}
