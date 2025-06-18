/**
 * Event Discovery Service using Perplexity AI
 * Discovers trending events, concerts, and shows for marketplace expansion
 */

interface EventDiscoveryRequest {
  location: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  radius?: number; // km
}

interface DiscoveredEvent {
  title: string;
  description: string;
  venue: string;
  venueAddress: string;
  date: Date;
  category: string;
  ticketPlatforms: string[];
  estimatedDemand: 'low' | 'medium' | 'high';
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  sourceUrls: string[];
  trending: boolean;
  ageRestriction?: string;
}

export class EventDiscoveryService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
  }

  async discoverEvents(request: EventDiscoveryRequest): Promise<DiscoveredEvent[]> {
    try {
      const prompt = this.buildEventDiscoveryPrompt(request);
      const response = await this.callPerplexityAPI(prompt);
      return this.parseDiscoveredEvents(response);
    } catch (error) {
      console.error('Error discovering events:', error);
      return [];
    }
  }

  private buildEventDiscoveryPrompt(request: EventDiscoveryRequest): string {
    const { location, category, dateRange, radius } = request;
    const startDate = dateRange?.start || new Date();
    const endDate = dateRange?.end || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return `Find upcoming trending events and shows in ${location} for a ticket marketplace platform:

SEARCH CRITERIA:
- Location: ${location} ${radius ? `(within ${radius}km)` : ''}
- Category: ${category || 'All categories (concerts, sports, theater, comedy, festivals)'}
- Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}

RESEARCH TASKS:
1. Find popular upcoming concerts, shows, sports events, theater performances, festivals
2. Include both major venue events and smaller local shows that might sell out
3. Look for events that typically have high resale demand
4. Check official venues, ticketing platforms, and event announcement sources
5. Focus on events where tickets are likely to be resold

FOR EACH EVENT, PROVIDE:
- Event title and description
- Venue name and full address
- Exact date and time
- Event category (concert, sports, theater, comedy, festival, etc.)
- Official ticket platforms (Ticketmaster, StubHub, venue websites)
- Estimated demand level (high for popular artists/teams, medium for regional acts, low for niche events)
- Typical price range in local currency
- Any age restrictions
- Whether it's currently trending or selling fast

FORMAT YOUR RESPONSE AS:
Event 1:
Title: [Event Name]
Description: [Brief description]
Venue: [Venue Name]
Address: [Full venue address]
Date: [YYYY-MM-DD HH:MM]
Category: [Category]
Platforms: [Ticket selling platforms]
Demand: [high/medium/low]
Price Range: [Min-Max Currency]
Trending: [Yes/No]
Age: [Age restriction if any]
Sources: [URLs where you found this information]

Event 2:
[Continue format...]

Focus on events that are likely to generate resale activity. Include a mix of high-demand mainstream events and potentially undervalued local shows.`;
  }

  private async callPerplexityAPI(prompt: string): Promise<string> {
    const requestBody = {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event discovery analyst specializing in finding trending entertainment events that typically have active resale markets. Provide accurate, up-to-date information about real upcoming events.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'week',
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseDiscoveredEvents(aiResponse: string): DiscoveredEvent[] {
    const events: DiscoveredEvent[] = [];
    const eventBlocks = aiResponse.split(/Event \d+:/i).filter(block => block.trim().length > 0);

    for (const block of eventBlocks) {
      try {
        const event = this.parseEventBlock(block);
        if (event) {
          events.push(event);
        }
      } catch (error) {
        console.warn('Failed to parse event block:', error);
        continue;
      }
    }

    return events;
  }

  private parseEventBlock(block: string): DiscoveredEvent | null {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const event: Partial<DiscoveredEvent> = {
      ticketPlatforms: [],
      sourceUrls: [],
      trending: false
    };

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (!value) continue;

      switch (key.toLowerCase().trim()) {
        case 'title':
          event.title = value;
          break;
        case 'description':
          event.description = value;
          break;
        case 'venue':
          event.venue = value;
          break;
        case 'address':
          event.venueAddress = value;
          break;
        case 'date':
          event.date = new Date(value);
          break;
        case 'category':
          event.category = value.toLowerCase();
          break;
        case 'platforms':
          event.ticketPlatforms = value.split(',').map(p => p.trim());
          break;
        case 'demand':
          event.estimatedDemand = value.toLowerCase() as 'low' | 'medium' | 'high';
          break;
        case 'price range':
          event.priceRange = this.parsePriceRange(value);
          break;
        case 'trending':
          event.trending = value.toLowerCase().includes('yes');
          break;
        case 'age':
          event.ageRestriction = value;
          break;
        case 'sources':
          event.sourceUrls = value.split(',').map(url => url.trim());
          break;
      }
    }

    // Validate required fields
    if (!event.title || !event.venue || !event.date || !event.category) {
      return null;
    }

    return event as DiscoveredEvent;
  }

  private parsePriceRange(priceString: string): { min: number; max: number; currency: string } {
    // Parse patterns like "$50-200 USD", "₹1000-5000 INR", "€30-100"
    const match = priceString.match(/([₹$€£¥])(\d+)-(\d+)\s*([A-Z]{3})?/i);
    
    if (match) {
      const [, symbol, min, max, currency] = match;
      return {
        min: parseInt(min),
        max: parseInt(max),
        currency: currency || this.getCurrencyFromSymbol(symbol)
      };
    }

    // Fallback for different formats
    const numbers = priceString.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]),
        max: parseInt(numbers[1]),
        currency: 'USD'
      };
    }

    return { min: 0, max: 0, currency: 'USD' };
  }

  private getCurrencyFromSymbol(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR'
    };
    return symbolMap[symbol] || 'USD';
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    try {
      const prompt = `Suggest 5 major cities or metropolitan areas that match "${query}" for event discovery. Focus on places with active entertainment venues and event scenes. Return only city names, one per line.`;
      
      const response = await this.callPerplexityAPI(prompt);
      return response.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting location suggestions:', error);
      return [];
    }
  }
}