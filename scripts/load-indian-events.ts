/**
 * Load 10 additional Indian events into the database
 * Focuses on diverse Indian entertainment, sports, and cultural events
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tickets } from "../shared/schema";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

interface IndianTicketData {
  sellerId: number;
  title: string;
  eventTitle: string;
  eventDescription: string;
  venue: string;
  venueAddress: string;
  eventDate: Date;
  category: string;
  latitude: number;
  longitude: number;
  city: string;
  section: string;
  row?: string;
  seat?: string;
  price: number;
  quantity: number;
  transferMethod: string;
  additionalInfo?: string;
  trending: boolean;
  sellingFast: boolean;
  eventImageUrl?: string;
  isTransferrable: boolean;
  showContactInfo: boolean;
  status: string;
}

const indianEvents: IndianTicketData[] = [
  {
    sellerId: 1,
    title: "Shreya Ghoshal Live Concert - Premium Seats",
    eventTitle: "Shreya Ghoshal Live in Concert",
    eventDescription: "The nightingale of Bollywood performs her greatest hits live with full orchestra accompaniment",
    venue: "Jawaharlal Nehru Stadium",
    venueAddress: "Lodhi Road, New Delhi, Delhi 110003",
    eventDate: new Date("2024-12-28T19:30:00"),
    category: "concerts",
    latitude: 28.5706,
    longitude: 77.2176,
    city: "New Delhi",
    section: "VIP",
    row: "A",
    seat: "15-16",
    price: 4500,
    quantity: 2,
    transferMethod: "Digital transfer via BookMyShow",
    additionalInfo: "Meet and greet passes included",
    trending: true,
    sellingFast: true,
    eventImageUrl: "https://example.com/shreya-concert.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 2,
    title: "India vs Australia Test Match Day 2",
    eventTitle: "India vs Australia 2nd Test Match",
    eventDescription: "Border-Gavaskar Trophy Test series at the iconic Eden Gardens",
    venue: "Eden Gardens",
    venueAddress: "Eden Gardens Rd, Maidan, Kolkata, West Bengal 700021",
    eventDate: new Date("2025-01-15T09:30:00"),
    category: "sports",
    latitude: 22.5645,
    longitude: 88.3433,
    city: "Kolkata",
    section: "Club House",
    row: "Upper",
    seat: "Block J, Row 5, Seat 12",
    price: 3200,
    quantity: 1,
    transferMethod: "Hard copy pickup or courier",
    additionalInfo: "Day 2 tickets, includes lunch voucher",
    trending: true,
    sellingFast: false,
    eventImageUrl: "https://example.com/ind-aus-test.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 3,
    title: "Zakir Khan Comedy Show - Front Row",
    eventTitle: "Zakir Khan: Tathastu Tour",
    eventDescription: "India's most beloved comedian brings his signature storytelling style to Mumbai",
    venue: "NSCI Dome",
    venueAddress: "NSCI, Dr Annie Besant Rd, Worli, Mumbai, Maharashtra 400018",
    eventDate: new Date("2025-01-10T20:00:00"),
    category: "comedy",
    latitude: 19.0144,
    longitude: 72.8124,
    city: "Mumbai",
    section: "VIP",
    row: "A",
    seat: "5-6",
    price: 2800,
    quantity: 2,
    transferMethod: "E-ticket via email",
    additionalInfo: "Front row seats, complimentary snacks included",
    trending: true,
    sellingFast: true,
    eventImageUrl: "https://example.com/zakir-khan.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 4,
    title: "Sunburn Goa 2024 - 3 Day Pass",
    eventTitle: "Sunburn Goa Music Festival",
    eventDescription: "Asia's largest music festival featuring international and Indian EDM artists",
    venue: "Vagator Beach",
    venueAddress: "Vagator Beach, Bardez, Goa 403509",
    eventDate: new Date("2024-12-29T16:00:00"),
    category: "festivals",
    latitude: 15.6050,
    longitude: 73.7396,
    city: "Goa",
    section: "General",
    row: "Standing",
    price: 8500,
    quantity: 1,
    transferMethod: "Mobile app transfer",
    additionalInfo: "3-day festival pass, camping option available",
    trending: true,
    sellingFast: true,
    eventImageUrl: "https://example.com/sunburn-goa.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 5,
    title: "Chennai Super Kings vs Mumbai Indians",
    eventTitle: "IPL 2025: CSK vs MI",
    eventDescription: "The most anticipated rivalry in IPL returns to Chepauk Stadium",
    venue: "M. A. Chidambaram Stadium",
    venueAddress: "Chepauk, Chennai, Tamil Nadu 600005",
    eventDate: new Date("2025-04-12T19:30:00"),
    category: "sports",
    latitude: 13.0675,
    longitude: 80.2798,
    city: "Chennai",
    section: "Pavilion",
    row: "Lower Tier",
    seat: "Block L, Row 8, Seat 45",
    price: 4200,
    quantity: 1,
    transferMethod: "IPL official app transfer",
    additionalInfo: "Premium seating with food court access",
    trending: true,
    sellingFast: true,
    eventImageUrl: "https://example.com/csk-mi.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 6,
    title: "Ustad Rahat Fateh Ali Khan Qawwali Night",
    eventTitle: "Rahat Fateh Ali Khan Live",
    eventDescription: "The legendary Qawwali maestro performs classical and contemporary Sufi music",
    venue: "Siri Fort Auditorium",
    venueAddress: "Siri Fort Rd, Siri Fort, New Delhi, Delhi 110049",
    eventDate: new Date("2025-02-14T19:00:00"),
    category: "concerts",
    latitude: 28.5493,
    longitude: 77.2213,
    city: "New Delhi",
    section: "Orchestra",
    row: "C",
    seat: "12-13",
    price: 3500,
    quantity: 2,
    transferMethod: "BookMyShow digital transfer",
    additionalInfo: "Valentine's Day special Qawwali night",
    trending: false,
    sellingFast: false,
    eventImageUrl: "https://example.com/rahat-qawwali.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 7,
    title: "Kailash Kher Kailasa Band Concert",
    eventTitle: "Kailash Kher & Kailasa Live",
    eventDescription: "Spiritual rock fusion concert featuring Kailash Kher's soulful voice and Kailasa band",
    venue: "Palace Grounds",
    venueAddress: "Jayamahal Rd, Cantonment, Bengaluru, Karnataka 560001",
    eventDate: new Date("2025-01-26T18:30:00"),
    category: "concerts",
    latitude: 12.9916,
    longitude: 77.5920,
    city: "Bengaluru",
    section: "Silver",
    row: "B",
    seat: "25-26",
    price: 2200,
    quantity: 2,
    transferMethod: "Paytm Insider app",
    additionalInfo: "Republic Day special concert",
    trending: false,
    sellingFast: false,
    eventImageUrl: "https://example.com/kailash-kher.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 8,
    title: "Pushpak Vimana Movie Premiere",
    eventTitle: "Pushpak Vimana Special Screening",
    eventDescription: "Classic Kamal Haasan silent comedy film special 35mm print screening with live orchestra",
    venue: "PVR Phoenix Marketcity",
    venueAddress: "Phoenix Marketcity, Whitefield Rd, Bengaluru, Karnataka 560066",
    eventDate: new Date("2025-01-05T19:00:00"),
    category: "movies",
    latitude: 12.9698,
    longitude: 77.7499,
    city: "Bengaluru",
    section: "Premium",
    row: "F",
    seat: "8-9",
    price: 850,
    quantity: 2,
    transferMethod: "PVR app ticket transfer",
    additionalInfo: "Special screening with director's commentary",
    trending: false,
    sellingFast: false,
    eventImageUrl: "https://example.com/pushpak-vimana.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  },
  {
    sellerId: 9,
    title: "Jaipur Literature Festival Main Stage",
    eventTitle: "Jaipur Literature Festival 2025",
    eventDescription: "The world's largest free literary festival featuring authors, poets, and thinkers",
    venue: "Diggi Palace",
    venueAddress: "Shivaji Nagar, Diggi Palace, Jaipur, Rajasthan 302004",
    eventDate: new Date("2025-01-25T10:00:00"),
    category: "festivals",
    latitude: 26.9124,
    longitude: 75.7873,
    city: "Jaipur",
    section: "Main Stage",
    row: "Reserved",
    seat: "Row 3, Seat 15",
    price: 0,
    quantity: 1,
    transferMethod: "Festival app registration",
    additionalInfo: "Free entry, advance registration required for main stage",
    trending: true,
    sellingFast: false,
    eventImageUrl: "https://example.com/jlf-2025.jpg",
    isTransferrable: true,
    showContactInfo: false,
    status: "available"
  },
  {
    sellerId: 10,
    title: "Arijit Singh Acoustic Tour",
    eventTitle: "Arijit Singh: Unplugged Tour",
    eventDescription: "Bollywood's most loved playback singer performs acoustic versions of his hit songs",
    venue: "Netaji Indoor Stadium",
    venueAddress: "1, Strand Rd, Esplanade, Kolkata, West Bengal 700001",
    eventDate: new Date("2025-02-08T19:00:00"),
    category: "concerts",
    latitude: 22.5726,
    longitude: 88.3639,
    city: "Kolkata",
    section: "Gold",
    row: "D",
    seat: "18-20",
    price: 5200,
    quantity: 3,
    transferMethod: "BookMyShow transfer",
    additionalInfo: "Acoustic unplugged concert, limited seating",
    trending: true,
    sellingFast: true,
    eventImageUrl: "https://example.com/arijit-acoustic.jpg",
    isTransferrable: true,
    showContactInfo: true,
    status: "available"
  }
];

async function loadIndianEvents() {
  try {
    console.log("🎭 Loading 10 additional Indian events...");
    
    for (const eventData of indianEvents) {
      await db.insert(tickets).values({
        sellerId: eventData.sellerId,
        title: eventData.title,
        eventTitle: eventData.eventTitle,
        eventDescription: eventData.eventDescription,
        venue: eventData.venue,
        venueAddress: eventData.venueAddress,
        eventDate: eventData.eventDate,
        category: eventData.category,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        city: eventData.city,
        section: eventData.section,
        row: eventData.row,
        seat: eventData.seat,
        price: eventData.price,
        quantity: eventData.quantity,
        transferMethod: eventData.transferMethod,
        additionalInfo: eventData.additionalInfo,
        trending: eventData.trending,
        sellingFast: eventData.sellingFast,
        eventImageUrl: eventData.eventImageUrl,
        isTransferrable: eventData.isTransferrable,
        showContactInfo: eventData.showContactInfo,
        status: eventData.status
      });
      
      console.log(`✅ Added: ${eventData.eventTitle} in ${eventData.city}`);
    }
    
    console.log("🎉 Successfully loaded 10 Indian events!");
    console.log("\nAdded events:");
    indianEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.eventTitle} - ${event.city} (${event.category})`);
    });
    
  } catch (error) {
    console.error("❌ Error loading Indian events:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loadIndianEvents().catch(console.error);
}

export { loadIndianEvents };