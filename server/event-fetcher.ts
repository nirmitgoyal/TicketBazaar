import OpenAI from "openai";
import { db } from "./db";
import { tickets } from "@shared/schema";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EventData {
  title: string;
  description: string;
  venue: string;
  date: string;
  category: string;
  imageUrl?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  trending?: boolean;
  sellingFast?: boolean;
}

/**
 * Fetch events from various Indian event platforms
 */
export async function fetchEventsFromInternet(): Promise<EventData[]> {
  const eventSources = [
    "https://insider.in/",
    "https://www.bookmyshow.com/explore/home/mumbai",
    "https://www.zomato.com/events",
  ];

  const allEvents: EventData[] = [];

  for (const source of eventSources) {
    try {
      console.log(`Fetching events from: ${source}`);
      const response = await fetch(source, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.log(`Failed to fetch from ${source}: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract text content for OpenAI processing
      const textContent = $("body").text().slice(0, 8000); // Limit to prevent token overflow

      // Use OpenAI to extract event information
      const events = await extractEventsWithOpenAI(textContent, source);
      allEvents.push(...events);

      // Add delay to be respectful to servers
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
    }
  }

  return allEvents;
}

/**
 * Use OpenAI to extract structured event data from webpage content
 */
async function extractEventsWithOpenAI(
  content: string,
  source: string,
): Promise<EventData[]> {
  try {
    const prompt = `
Extract event information from the following webpage content. Focus on upcoming events in India.
Return a JSON array of events with this structure:
{
  "title": "Event name",
  "description": "Brief description (max 200 chars)",
  "venue": "Venue name and location", 
  "date": "ISO date string (YYYY-MM-DDTHH:MM:SS.000Z)",
  "category": "Concert|Sports|Theatre|Comedy|Festival|Conference",
  "city": "City name (Mumbai, Delhi, Bangalore, etc.)",
  "trending": boolean,
  "sellingFast": boolean
}

Extract only real, upcoming events. Ignore past events. Limit to 5-8 events per source.
Make dates realistic (within next 6 months). Use Indian cities.

Website content:
${content}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting structured event data from web content. Return only valid JSON arrays with complete event objects.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (result.events && Array.isArray(result.events)) {
      return result.events.map((event: any) => ({
        ...event,
        imageUrl: getDefaultImageForCategory(event.category),
        latitude: getCityCoordinates(event.city).lat,
        longitude: getCityCoordinates(event.city).lng,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error extracting events with OpenAI:", error);
    return [];
  }
}

/**
 * Get default image URLs for different event categories
 */
function getDefaultImageForCategory(category: string): string {
  const images = {
    Concert:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    Sports: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    Theatre:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
    Comedy:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    Festival:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    Conference:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
  };

  return images[category as keyof typeof images] || images.Concert;
}

/**
 * Get coordinates for major Indian cities
 */
function getCityCoordinates(city: string): { lat: number; lng: number } {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    Mumbai: { lat: 19.076, lng: 72.8777 },
    Delhi: { lat: 28.6139, lng: 77.209 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Hyderabad: { lat: 17.385, lng: 78.4867 },
    Chennai: { lat: 13.0827, lng: 80.2707 },
    Kolkata: { lat: 22.5726, lng: 88.3639 },
    Pune: { lat: 18.5204, lng: 73.8567 },
    Ahmedabad: { lat: 23.0225, lng: 72.5714 },
    Jaipur: { lat: 26.9124, lng: 75.7873 },
    Surat: { lat: 21.1702, lng: 72.8311 },
    Lucknow: { lat: 26.8467, lng: 80.9462 },
    Kanpur: { lat: 26.4499, lng: 80.3319 },
    Nagpur: { lat: 21.1458, lng: 79.0882 },
    Indore: { lat: 22.7196, lng: 75.8577 },
    Thane: { lat: 19.2183, lng: 72.9781 },
    Bhopal: { lat: 23.2599, lng: 77.4126 },
    Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
    Pimpri: { lat: 18.6298, lng: 73.8131 },
    Patna: { lat: 25.5941, lng: 85.1376 },
    Vadodara: { lat: 22.3072, lng: 73.1812 },
    Ghaziabad: { lat: 28.6692, lng: 77.4538 },
    Ludhiana: { lat: 30.901, lng: 75.8573 },
    Agra: { lat: 27.1767, lng: 78.0081 },
    Madurai: { lat: 9.9252, lng: 78.1198 },
    Nashik: { lat: 19.9975, lng: 73.7898 },
    Faridabad: { lat: 28.4089, lng: 77.3178 },
    Meerut: { lat: 28.9845, lng: 77.7064 },
    Rajkot: { lat: 22.3039, lng: 70.8022 },
    Kalyan: { lat: 19.2437, lng: 73.1355 },
    Vasai: { lat: 19.4911, lng: 72.8054 },
    Varanasi: { lat: 25.3176, lng: 82.9739 },
    Srinagar: { lat: 34.0837, lng: 74.7973 },
    Dhanbad: { lat: 23.7957, lng: 86.4304 },
    Jodhpur: { lat: 26.2389, lng: 73.0243 },
    Amritsar: { lat: 31.634, lng: 74.8723 },
    Raipur: { lat: 21.2514, lng: 81.6296 },
    Allahabad: { lat: 25.4358, lng: 81.8463 },
    Gwalior: { lat: 26.2183, lng: 78.1828 },
    Jabalpur: { lat: 23.1815, lng: 79.9864 },
  };

  // Normalize city name and find match
  const normalizedCity = city.toLowerCase().trim();
  for (const [cityName, coords] of Object.entries(coordinates)) {
    if (
      cityName.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(cityName.toLowerCase())
    ) {
      return coords;
    }
  }

  // Default to Mumbai if city not found
  return coordinates["Mumbai"];
}

/**
 * Save events to database as sample tickets
 */
export async function saveEventsToDatabase(
  eventsData: EventData[],
): Promise<void> {
  try {
    // Create sample tickets for each event to populate the marketplace
    for (const eventData of eventsData) {
      // Create 2-3 sample tickets per event with different sections and prices
      const sampleTickets = [
        {
          sellerId: 1, // Default system user
          title: `${eventData.title} - Premium Section`,
          eventTitle: eventData.title,
          eventDescription: eventData.description,
          venue: eventData.venue,
          eventDate: new Date(eventData.date),
          category: eventData.category,
          eventImageUrl: eventData.imageUrl,
          trending: eventData.trending || false,
          sellingFast: eventData.sellingFast || false,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          city: eventData.city,
          section: "Premium",
          row: "A",
          seat: "15-16",
          price: Math.floor(Math.random() * 2000) + 1000, // ₹1000-3000
          quantity: 2,
          status: "available",
          isTransferrable: true,
          transferMethod: "electronic",
          additionalInfo: "Excellent seats with great view",
          showContactInfo: true,
        },
        {
          sellerId: 1,
          title: `${eventData.title} - General Admission`,
          eventTitle: eventData.title,
          eventDescription: eventData.description,
          venue: eventData.venue,
          eventDate: new Date(eventData.date),
          category: eventData.category,
          eventImageUrl: eventData.imageUrl,
          trending: eventData.trending || false,
          sellingFast: eventData.sellingFast || false,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          city: eventData.city,
          section: "General",
          row: "C",
          seat: "25",
          price: Math.floor(Math.random() * 1000) + 500, // ₹500-1500
          quantity: 1,
          status: "available",
          isTransferrable: true,
          transferMethod: "in-person",
          additionalInfo: "Good value tickets",
          showContactInfo: true,
        },
      ];

      for (const ticket of sampleTickets) {
        await db.insert(tickets).values(ticket);
      }
    }

    console.log(`Successfully saved ${eventsData.length} events as sample tickets to database`);
  } catch (error) {
    console.error("Error saving events to database:", error);
    throw error;
  }
}
