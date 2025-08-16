// Enhanced search feedback service for user guidance

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

export class SearchFeedbackService {
  private popularSuggestions = [
    "IPL matches",
    "Bollywood concerts", 
    "Comedy shows Mumbai",
    "Music festivals",
    "Cricket World Cup",
    "Stand up comedy Delhi",
    "Rock concerts Bangalore",
    "Theater shows",
    "Football matches",
    "Classical music concerts"
  ];

  private searchTips = [
    "Try searching for event names",
    "Search by artist or performer name", 
    "Look for events in your city",
    "Browse by category like 'concerts' or 'sports'",
    "Use simple keywords without special characters"
  ];

  getFeedback(context: SearchFeedbackContext): SearchFeedback {
    switch (context.queryType) {
      case 'empty':
        return {
          message: "Discover amazing events happening near you",
          suggestions: this.popularSuggestions.slice(0, 5),
          type: 'suggestion',
          showPopularTickets: true
        };

      case 'special_chars':
        return {
          message: "Special characters aren't needed for search. Try simple keywords!",
          suggestions: this.searchTips.slice(0, 4),
          type: 'info'
        };

      case 'xss_like':
        return {
          message: "Let's keep it simple! Search with event names, artists, or cities.",
          suggestions: [
            "concert tickets",
            "sports events", 
            "theater shows",
            "comedy nights"
          ],
          type: 'warning'
        };

      case 'sql_like':
        return {
          message: "Please search using simple keywords like event names or cities.",
          suggestions: [
            "bollywood concert",
            "cricket match",
            "stand up comedy",
            "music festival"
          ],
          type: 'warning'
        };

      case 'no_results':
        return this.getNoResultsFeedback(context);

      case 'normal':
      default:
        return {
          message: "Search suggestion",
          suggestions: this.getContextualSuggestions(context),
          type: 'suggestion'
        };
    }
  }

  private getNoResultsFeedback(context: SearchFeedbackContext): SearchFeedback {
    const query = context.sanitizedQuery || context.originalQuery || '';
    
    // Generate contextual suggestions based on the search query
    const suggestions = this.generateSmartSuggestions(query, context.userLocation);
    
    return {
      message: `No tickets found for "${query}". Here are some suggestions:`,
      suggestions,
      type: 'info',
      showPopularTickets: suggestions.length < 3
    };
  }

  private generateSmartSuggestions(query: string, userLocation?: string): string[] {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];
    
    // Music-related suggestions
    if (lowerQuery.includes('music') || lowerQuery.includes('concert') || lowerQuery.includes('song')) {
      suggestions.push('bollywood concerts', 'live music events', 'music festivals');
    }
    
    // Sports-related suggestions  
    if (lowerQuery.includes('sport') || lowerQuery.includes('match') || lowerQuery.includes('game')) {
      suggestions.push('cricket matches', 'football games', 'sports events');
    }
    
    // Comedy-related suggestions
    if (lowerQuery.includes('comedy') || lowerQuery.includes('funny') || lowerQuery.includes('laugh')) {
      suggestions.push('stand up comedy', 'comedy shows', 'comedy nights');
    }
    
    // Location-specific suggestions
    if (userLocation) {
      suggestions.push(`events in ${userLocation}`, `concerts in ${userLocation}`);
    }
    
    // City-specific suggestions
    const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad'];
    for (const city of cities) {
      if (lowerQuery.includes(city)) {
        suggestions.push(`concerts in ${city}`, `events in ${city}`);
        break;
      }
    }
    
    // If no contextual suggestions, use popular ones
    if (suggestions.length === 0) {
      suggestions.push(...this.popularSuggestions.slice(0, 3));
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private getContextualSuggestions(context: SearchFeedbackContext): string[] {
    const query = context.sanitizedQuery || '';
    return this.generateSmartSuggestions(query, context.userLocation);
  }

  // Helper method to get popular searches for empty state
  getPopularSuggestions(): string[] {
    return this.popularSuggestions.slice(0, 8);
  }

  // Helper method to check if query needs user guidance
  needsGuidance(queryType: string): boolean {
    return ['empty', 'special_chars', 'xss_like', 'sql_like', 'no_results'].includes(queryType);
  }
}

export const searchFeedbackService = new SearchFeedbackService();