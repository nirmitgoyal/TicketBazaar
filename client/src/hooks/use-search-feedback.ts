import { useState } from "react";

export interface SearchFeedback {
  message: string;
  suggestions: string[];
  type: 'info' | 'warning' | 'suggestion';
  showPopularTickets?: boolean;
}

export interface SearchFeedbackContext {
  queryType: 'empty' | 'normal' | 'special_chars' | 'xss_like' | 'sql_like' | 'too_long' | 'no_results';
  originalQuery?: string;
  sanitizedQuery?: string;
  userLocation?: string;
  resultCount?: number;
}

export function useSearchFeedback() {
  const [feedback, setFeedback] = useState<SearchFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const getFeedback = async (context: SearchFeedbackContext) => {
    setIsLoadingFeedback(true);
    try {
      const response = await fetch("/api/search/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });

      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback);
      } else {
        console.warn("Failed to get search feedback:", data.message);
        setFeedback(null);
      }
    } catch (error) {
      console.error("Error getting search feedback:", error);
      setFeedback(null);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const getPopularSuggestions = async () => {
    try {
      const response = await fetch("/api/search/popular-suggestions");
      const data = await response.json();

      if (data.success) {
        return data.suggestions || [];
      }
      return [];
    } catch (error) {
      console.error("Error getting popular suggestions:", error);
      return [];
    }
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  // Helper function to detect query types on client side
  const analyzeQuery = (query: string): SearchFeedbackContext => {
    if (!query || query.trim().length === 0) {
      return { queryType: 'empty' };
    }

    // Check for XSS-like patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /vbscript:/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(query)) {
        return { 
          queryType: 'xss_like',
          originalQuery: query,
          sanitizedQuery: query.replace(/[<>\"';&\\]/g, '').trim()
        };
      }
    }

    // Check for SQL-like patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /--/,
      /\/\*/
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(query)) {
        return { 
          queryType: 'sql_like',
          originalQuery: query,
          sanitizedQuery: query.replace(/[<>\"';&\\]/g, '').trim()
        };
      }
    }

    // Check for excessive special characters
    const specialCharCount = (query.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > 3 && specialCharCount / query.length > 0.3) {
      return { 
        queryType: 'special_chars',
        originalQuery: query,
        sanitizedQuery: query.replace(/[<>\"';&\\]/g, '').trim()
      };
    }

    return { 
      queryType: 'normal',
      originalQuery: query,
      sanitizedQuery: query.trim()
    };
  };

  return {
    feedback,
    isLoadingFeedback,
    getFeedback,
    getPopularSuggestions,
    clearFeedback,
    analyzeQuery,
  };
}