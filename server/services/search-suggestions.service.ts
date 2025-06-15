// Simple search suggestions service without external dependencies

export interface SearchSuggestion {
  suggestion: string;
  category: string;
  popularity: number;
}

export interface SearchContext {
  userQuery: string;
  userLocation?: string;
  userPreferences?: {
    categories?: string[];
    priceRange?: [number, number];
    datePreference?: string;
  };
}

export class SearchSuggestionsService {
  private popularSearches = [
    { suggestion: "IPL matches", category: "Sports", popularity: 95 },
    { suggestion: "Bollywood concerts", category: "Concert", popularity: 90 },
    { suggestion: "Comedy shows Mumbai", category: "Comedy", popularity: 85 },
    { suggestion: "Music festivals", category: "Festival", popularity: 80 },
    { suggestion: "Cricket World Cup", category: "Sports", popularity: 85 },
    { suggestion: "Stand up comedy Delhi", category: "Comedy", popularity: 75 },
    { suggestion: "Rock concerts Bangalore", category: "Concert", popularity: 70 },
    { suggestion: "Theater shows", category: "Theater", popularity: 65 },
    { suggestion: "Football matches", category: "Sports", popularity: 60 },
    { suggestion: "Classical music concerts", category: "Concert", popularity: 55 },
  ];

  getSearchSuggestions(context: SearchContext): SearchSuggestion[] {
    const { userQuery, userLocation } = context;
    const query = userQuery.toLowerCase().trim();
    
    if (query.length < 2) {
      return this.popularSearches.slice(0, 5);
    }

    // Filter suggestions based on query
    const matchingSuggestions = this.popularSearches.filter(item =>
      item.suggestion.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );

    // Add location-specific suggestions if location is provided
    if (userLocation && matchingSuggestions.length < 5) {
      const locationSuggestions = [
        { suggestion: `concerts in ${userLocation}`, category: "Concert", popularity: 70 },
        { suggestion: `sports events ${userLocation}`, category: "Sports", popularity: 65 },
        { suggestion: `comedy shows ${userLocation}`, category: "Comedy", popularity: 60 },
      ];
      
      matchingSuggestions.push(...locationSuggestions);
    }

    // Sort by popularity and return top suggestions
    return matchingSuggestions
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);
  }

  getPopularSearches(): SearchSuggestion[] {
    return this.popularSearches.slice(0, 8);
  }
}

export const searchSuggestionsService = new SearchSuggestionsService();