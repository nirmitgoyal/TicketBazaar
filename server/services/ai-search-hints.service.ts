import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export class AISearchHintsService {
  async generateSearchHints(context: SearchContext): Promise<SearchHint[]> {
    try {
      const prompt = this.buildPrompt(context);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert search assistant for a ticket marketplace in India. Generate helpful, contextual search suggestions that will help users find relevant events. Focus on popular events, artists, sports teams, and venues in India.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = JSON.parse(
        response.choices[0].message.content || '{"hints": []}',
      );
      return result.hints || [];
    } catch (error) {
      console.error("Error generating search hints:", error);
      return this.getFallbackHints(context);
    }
  }

  private buildPrompt(context: SearchContext): string {
    const {
      userQuery,
      userLocation,
      previousSearches,
      userPreferences,
      currentEvents,
    } = context;

    let prompt = `Generate 3-5 contextual search hints for a user searching for event tickets in India.

User's current search: "${userQuery}"`;

    if (userLocation) {
      prompt += `\nUser's location: ${userLocation}`;
    }

    if (previousSearches?.length) {
      prompt += `\nUser's previous searches: ${previousSearches.join(", ")}`;
    }

    if (userPreferences) {
      if (userPreferences.categories?.length) {
        prompt += `\nUser prefers these categories: ${userPreferences.categories.join(", ")}`;
      }
      if (userPreferences.priceRange) {
        prompt += `\nUser's price range: ₹${userPreferences.priceRange[0]} - ₹${userPreferences.priceRange[1]}`;
      }
    }

    if (currentEvents?.length) {
      prompt += `\nCurrently available events: ${currentEvents.map((e) => `${e.title} (${e.category}) in ${e.city}`).join(", ")}`;
    }

    prompt += `

Please generate search hints that:
1. Are relevant to Indian events, artists, and venues
2. Consider the user's context and preferences
3. Include popular searches for concerts, sports, comedy shows, festivals
4. Suggest specific artist names, team names, or event types popular in India
5. Include location-specific suggestions if relevant

Return response in JSON format:
{
  "hints": [
    {
      "suggestion": "search suggestion text",
      "category": "Concert/Sports/Comedy/Festival/Theater",
      "confidence": 0.8,
      "reasoning": "why this suggestion is relevant"
    }
  ]
}`;

    return prompt;
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
    try {
      const prompt = `Based on the user input "${userInput}" and available events, suggest 3-5 smart search completions.

Available events: ${availableEvents.map((e) => e.title).join(", ")}

Generate suggestions that are:
1. Relevant to the user's partial input
2. Match or are similar to available events
3. Include popular search patterns for ticket marketplaces
4. Are specific and actionable

Return only the suggestions as a JSON array of strings.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a search autocomplete assistant for an Indian ticket marketplace. Generate relevant search suggestions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 300,
      });

      const result = JSON.parse(
        response.choices[0].message.content || '{"suggestions": []}',
      );
      return result.suggestions || [];
    } catch (error) {
      console.error("Error generating smart suggestions:", error);
      return this.getBasicSuggestions(userInput, availableEvents);
    }
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

export const aiSearchHintsService = new AISearchHintsService();
