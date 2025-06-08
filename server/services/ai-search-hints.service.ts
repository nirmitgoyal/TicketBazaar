// Search hints service - provides search suggestions without external dependencies

export interface SearchHint {
  suggestion: string;
  category: string;
  confidence: number;
  reasoning: string;
}

export interface SearchContext {
  userQuery: string;
  userLocation?: string;
  previousSearches?: string[];
  userPreferences?: {
    categories?: string[];
    priceRange?: [number, number];
    datePreference?: string;
  };
  currentEvents?: {
    title: string;
    category: string;
    venue: string;
    city: string;
  }[];
}

export class SearchHintsService {
  async generateSearchHints(context: SearchContext): Promise<SearchHint[]> {
    // Use rule-based search hints instead of external AI services
    return this.getFallbackHints(context);
  }



  private getFallbackHints(context: SearchContext): SearchHint[] {
    const { userQuery, userLocation } = context;
    const fallbackHints: SearchHint[] = [];

    // Location-based fallbacks
    if (userLocation) {
      fallbackHints.push({
        suggestion: `concerts in ${userLocation}`,
        category: "Concert",
        confidence: 0.7,
        reasoning: "Popular local concert search",
      });
    }

    // Query-based fallbacks
    if (userQuery.toLowerCase().includes("cricket")) {
      fallbackHints.push({
        suggestion: "IPL matches",
        category: "Sports",
        confidence: 0.8,
        reasoning: "Popular cricket event in India",
      });
    }

    if (
      userQuery.toLowerCase().includes("music") ||
      userQuery.toLowerCase().includes("concert")
    ) {
      fallbackHints.push({
        suggestion: "Bollywood concerts",
        category: "Concert",
        confidence: 0.8,
        reasoning: "Popular music genre in India",
      });
    }

    // General popular searches
    fallbackHints.push(
      {
        suggestion: "comedy shows",
        category: "Comedy",
        confidence: 0.6,
        reasoning: "Popular entertainment category",
      },
      {
        suggestion: "music festivals",
        category: "Festival",
        confidence: 0.6,
        reasoning: "Growing popularity of music festivals",
      },
    );

    return fallbackHints.slice(0, 4);
  }

  async generateSmartSuggestions(
    userInput: string,
    availableEvents: any[],
  ): Promise<string[]> {
    // Use rule-based suggestions instead of external AI services
    return this.getBasicSuggestions(userInput, availableEvents);
  }

  private getBasicSuggestions(
    userInput: string,
    availableEvents: any[],
  ): string[] {
    const input = userInput.toLowerCase();
    const suggestions: string[] = [];

    // Match against available events
    availableEvents.forEach((event) => {
      if (event.title.toLowerCase().includes(input)) {
        suggestions.push(event.title);
      }
    });

    // Add generic suggestions based on input
    if (input.includes("concert") || input.includes("music")) {
      suggestions.push(
        "live concerts",
        "music festivals",
        "bollywood concerts",
      );
    }

    if (input.includes("cricket") || input.includes("sport")) {
      suggestions.push("cricket matches", "IPL tickets", "sports events");
    }

    if (input.includes("comedy")) {
      suggestions.push("stand up comedy", "comedy shows", "comedy nights");
    }

    return suggestions.slice(0, 5);
  }
}

export const searchHintsService = new SearchHintsService();
