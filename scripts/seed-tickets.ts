
import { db } from "../server/db";
import { tickets, users } from "../shared/schema";
import { eq } from "drizzle-orm";

interface TicketData {
  sellerId: number;
  title: string;
  eventTitle: string;
  eventDescription: string;
  venue: string;
  venueAddress: string;
  eventDate: Date;
  category: string;
  eventImageUrl: string;
  trending: boolean;
  sellingFast: boolean;
  latitude: number;
  longitude: number;
  city: string;
  section: string;
  row?: string;
  seat?: string;
  price: number;
  quantity: number;
  status: string;
  isTransferrable: boolean;
  transferMethod: string;
  additionalInfo: string;
  showContactInfo: boolean;
}

async function getAllUsers() {
  return await db.select().from(users);
}

async function getOrCreateTicket(ticketData: TicketData) {
  try {
    // Check if ticket exists by title and seller
    const existingTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.title, ticketData.title))
      .limit(1);

    if (existingTickets.length > 0) {
      console.log(`Ticket "${ticketData.title}" already exists, skipping creation`);
      return existingTickets[0];
    }

    // Create ticket
    const newTickets = await db
      .insert(tickets)
      .values(ticketData)
      .returning();

    console.log(`Created ticket: ${ticketData.title} by seller ID ${ticketData.sellerId}`);
    return newTickets[0];
  } catch (error) {
    console.error(`Error creating ticket ${ticketData.title}:`, error);
    throw error;
  }
}

async function seedTickets() {
  try {
    console.log("Seeding tickets...");

    // Get all available users to use as sellers
    const availableUsers = await getAllUsers();
    
    if (availableUsers.length < 3) {
      throw new Error("Need at least 3 users in the database to create tickets with multiple sellers");
    }

    // Create ticket data with multiple sellers
    const ticketData: TicketData[] = [
      {
        sellerId: availableUsers[0].id,
        title: "IPL Final 2024 - Premium Seats",
        eventTitle: "IPL Final 2024",
        eventDescription: "The Indian Premier League Final match between top teams",
        venue: "Narendra Modi Stadium",
        venueAddress: "Sardar Vallabhbhai Patel Sports Complex, Ahmedabad",
        eventDate: new Date("2024-06-15T19:30:00+05:30"),
        category: "sports",
        eventImageUrl: "https://picsum.photos/seed/ipl2024/800/600",
        trending: true,
        sellingFast: true,
        latitude: 23.091848,
        longitude: 72.596487,
        city: "Ahmedabad",
        section: "Premium",
        row: "A",
        seat: "15-16",
        price: 8500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Two adjacent premium seats with excellent view",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[1].id,
        title: "Coldplay Concert - VIP Standing",
        eventTitle: "Coldplay Music of the Spheres World Tour",
        eventDescription: "Coldplay's world tour featuring their latest album and classic hits",
        venue: "DY Patil Stadium",
        venueAddress: "DY Patil Sports City, Navi Mumbai",
        eventDate: new Date("2024-07-20T19:30:00+05:30"),
        category: "events",
        eventImageUrl: "https://picsum.photos/seed/coldplay2024/800/600",
        trending: true,
        sellingFast: true,
        latitude: 19.045904,
        longitude: 73.02848,
        city: "Mumbai",
        section: "VIP Standing",
        row: null,
        seat: null,
        price: 12000,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "VIP standing area with bar access and exclusive merchandise",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[2].id,
        title: "Sunburn Festival - 3-Day Pass",
        eventTitle: "Sunburn Festival 2024",
        eventDescription: "Asia's biggest EDM festival featuring top international DJs",
        venue: "Candolim Beach",
        venueAddress: "Candolim Beach, North Goa",
        eventDate: new Date("2024-12-29T14:00:00+05:30"),
        category: "events",
        eventImageUrl: "https://picsum.photos/seed/sunburn2024/800/600",
        trending: true,
        sellingFast: false,
        latitude: 15.513814,
        longitude: 73.764956,
        city: "Goa",
        section: "General",
        row: null,
        seat: null,
        price: 6500,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "3-day festival pass with camping access included",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[0].id,
        title: "India vs Australia Test - Day 1",
        eventTitle: "India vs Australia Test Match",
        eventDescription: "Border-Gavaskar Trophy 2024: 2nd Test Match",
        venue: "M. Chinnaswamy Stadium",
        venueAddress: "Queens Road, Bangalore",
        eventDate: new Date("2024-08-10T09:30:00+05:30"),
        category: "sports",
        eventImageUrl: "https://picsum.photos/seed/indaus2024/800/600",
        trending: false,
        sellingFast: true,
        latitude: 12.978731,
        longitude: 77.599416,
        city: "Bangalore",
        section: "Upper Tier",
        row: "M",
        seat: "45",
        price: 2500,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "in-person",
        additionalInfo: "Great view of the pitch, can meet near stadium",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[1].id,
        title: "Arijit Singh Live - Golden Circle",
        eventTitle: "Arijit Singh Live in Concert",
        eventDescription: "Arijit Singh performing live with a full orchestra",
        venue: "Jawaharlal Nehru Stadium",
        venueAddress: "Pragati Vihar, New Delhi",
        eventDate: new Date("2024-09-05T19:00:00+05:30"),
        category: "events",
        eventImageUrl: "https://picsum.photos/seed/arijit2024/800/600",
        trending: true,
        sellingFast: true,
        latitude: 28.613895,
        longitude: 77.237839,
        city: "Delhi",
        section: "Golden Circle",
        row: "C",
        seat: "22-23",
        price: 7500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Two seats in the golden circle, very close to stage",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[2].id,
        title: "Chennai Express Bus Ticket",
        eventTitle: "Chennai to Bangalore Express",
        eventDescription: "Luxury bus journey from Chennai to Bangalore",
        venue: "CMBT Bus Terminal",
        venueAddress: "Chennai Mofussil Bus Terminus, Koyambedu",
        eventDate: new Date("2024-07-25T22:00:00+05:30"),
        category: "buses",
        eventImageUrl: "https://picsum.photos/seed/chennaibus/800/600",
        trending: false,
        sellingFast: false,
        latitude: 13.067439,
        longitude: 80.237617,
        city: "Chennai",
        section: "AC Sleeper",
        row: null,
        seat: "15U",
        price: 1200,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Upper berth in AC sleeper coach, comfortable overnight journey",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[3] ? availableUsers[3].id : availableUsers[0].id,
        title: "Pushpa 2 - IMAX Premier",
        eventTitle: "Pushpa 2: The Rule",
        eventDescription: "The much-awaited sequel starring Allu Arjun",
        venue: "PVR IMAX Forum Mall",
        venueAddress: "Forum Mall, Hosur Road, Bangalore",
        eventDate: new Date("2024-08-15T21:00:00+05:30"),
        category: "movies",
        eventImageUrl: "https://picsum.photos/seed/pushpa2/800/600",
        trending: true,
        sellingFast: false,
        latitude: 12.935025,
        longitude: 77.647743,
        city: "Bangalore",
        section: "IMAX",
        row: "F",
        seat: "12-13",
        price: 850,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premier show tickets, perfect center seats in IMAX",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[1].id,
        title: "Royal Challengers vs Mumbai Indians",
        eventTitle: "RCB vs MI - IPL 2024",
        eventDescription: "High-voltage IPL match between RCB and Mumbai Indians",
        venue: "M. Chinnaswamy Stadium",
        venueAddress: "Queens Road, Bangalore",
        eventDate: new Date("2024-05-20T15:30:00+05:30"),
        category: "sports",
        eventImageUrl: "https://picsum.photos/seed/rcbmi/800/600",
        trending: true,
        sellingFast: true,
        latitude: 12.978731,
        longitude: 77.599416,
        city: "Bangalore",
        section: "Corporate Box",
        row: "Box 12",
        seat: "1-4",
        price: 15000,
        quantity: 4,
        status: "available",
        isTransferrable: true,
        transferMethod: "in-person",
        additionalInfo: "Corporate box with catering, perfect for groups",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[0].id,
        title: "Diljit Dosanjh Concert - Pit Access",
        eventTitle: "Diljit Dosanjh Live Tour",
        eventDescription: "Punjabi superstar Diljit Dosanjh live in concert",
        venue: "Indira Gandhi Stadium",
        venueAddress: "IP Extension, New Delhi",
        eventDate: new Date("2024-10-12T19:00:00+05:30"),
        category: "events",
        eventImageUrl: "https://picsum.photos/seed/diljit/800/600",
        trending: true,
        sellingFast: true,
        latitude: 28.650496,
        longitude: 77.239170,
        city: "Delhi",
        section: "Pit",
        row: null,
        seat: null,
        price: 9500,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Pit access - closest to the stage, standing area",
        showContactInfo: true,
      },
      {
        sellerId: availableUsers[2].id,
        title: "Mumbai to Goa Luxury Bus",
        eventTitle: "Mumbai to Goa Express",
        eventDescription: "Luxury Volvo bus with reclining seats and entertainment",
        venue: "Mumbai Central Bus Station",
        venueAddress: "Mumbai Central Railway Station Complex",
        eventDate: new Date("2024-08-30T23:30:00+05:30"),
        category: "buses",
        eventImageUrl: "https://picsum.photos/seed/mumbaigoa/800/600",
        trending: false,
        sellingFast: false,
        latitude: 18.969449,
        longitude: 72.820457,
        city: "Mumbai",
        section: "AC Seater",
        row: null,
        seat: "12A",
        price: 1800,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Window seat in luxury Volvo with wifi and charging points",
        showContactInfo: true,
      }
    ];

    // Create all tickets
    const createdTickets = [];
    for (const ticket of ticketData) {
      const createdTicket = await getOrCreateTicket(ticket);
      createdTickets.push(createdTicket);
    }

    console.log(`Successfully seeded ${createdTickets.length} tickets`);
    console.log("Ticket summary:");
    createdTickets.forEach((ticket) => {
      console.log(`- ${ticket.title} (₹${ticket.price}) - ${ticket.city} - Seller ID: ${ticket.sellerId}`);
    });

    // Show seller distribution
    const sellerCounts = createdTickets.reduce((acc, ticket) => {
      acc[ticket.sellerId] = (acc[ticket.sellerId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log("\nSeller distribution:");
    Object.entries(sellerCounts).forEach(([sellerId, count]) => {
      const seller = availableUsers.find(u => u.id === parseInt(sellerId));
      console.log(`- ${seller?.fullName} (ID: ${sellerId}): ${count} tickets`);
    });

  } catch (error) {
    console.error("Error seeding tickets:", error);
    throw error;
  }
}

seedTickets();
