import { storage } from "../server/storage";

/**
 * Seed mixed ticket data with both current and past events to test cleanup functionality
 */
async function seedMixedTickets() {
  try {
    console.log("Adding mixed ticket data with past and future events...");

    // Get existing user IDs
    const userIds = [6, 18, 1]; // Use existing user IDs

    // Past events (these should be cleaned up)
    const pastTickets = [
      {
        sellerId: userIds[0],
        title: "AR Rahman Live Concert 2024 - SOLD OUT",
        eventTitle: "AR Rahman Live Concert 2024",
        eventDescription: "The maestro AR Rahman performed his greatest hits including Jai Ho, Taal Se Taal, and Dil Se.",
        venue: "Siri Fort Auditorium",
        venueAddress: "Siri Fort Auditorium, August Kranti Marg, New Delhi 110049",
        eventDate: new Date("2024-12-15T19:30:00Z"),
        category: "concert",
        eventImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        trending: false,
        sellingFast: false,
        latitude: 28.5562,
        longitude: 77.2192,
        city: "delhi",
        section: "Premium",
        row: "Row 10",
        seat: "Seat 15-16",
        price: 5500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Event already happened. Tickets were not used.",
        showContactInfo: true
      },
      {
        sellerId: userIds[1],
        title: "IPL 2024 Playoffs - CSK vs MI",
        eventTitle: "IPL 2024 Playoffs - CSK vs MI",
        eventDescription: "Epic playoff match between Chennai Super Kings and Mumbai Indians at the iconic MA Chidambaram Stadium.",
        venue: "MA Chidambaram Stadium",
        venueAddress: "MA Chidambaram Stadium, Chepauk, Chennai, Tamil Nadu 600005",
        eventDate: new Date("2024-05-20T19:30:00Z"),
        category: "sports",
        eventImageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
        trending: false,
        sellingFast: false,
        latitude: 13.0627,
        longitude: 80.2792,
        city: "chennai",
        section: "Upper Tier",
        row: "Block H",
        seat: "Row 25, Seat 8-10",
        price: 3200,
        quantity: 3,
        status: "available",
        isTransferrable: true,
        transferMethod: "in-person",
        additionalInfo: "Past event tickets - selling for collection purposes.",
        showContactInfo: true
      },
      {
        sellerId: userIds[2],
        title: "Kapil Sharma Comedy Show - Bangalore",
        eventTitle: "Kapil Sharma Live Comedy Show",
        eventDescription: "The king of comedy Kapil Sharma performed live with his hilarious stand-up routine.",
        venue: "Palace Grounds",
        venueAddress: "Palace Grounds, Sadashiva Nagar, Bangalore, Karnataka 560080",
        eventDate: new Date("2024-03-10T20:00:00Z"),
        category: "comedy",
        eventImageUrl: "https://images.unsplash.com/photo-1585699975055-600f8061b5be?w=800",
        trending: false,
        sellingFast: false,
        latitude: 13.0143,
        longitude: 77.5980,
        city: "bangalore",
        section: "Gold",
        row: "Row 5",
        seat: "Seat 20-21",
        price: 2500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Missed the show due to emergency. Past event tickets.",
        showContactInfo: true
      }
    ];

    // Future events (these should remain)
    const futureTickets = [
      {
        sellerId: userIds[0],
        title: "Shreya Ghoshal Live Tour 2025",
        eventTitle: "Shreya Ghoshal Live in Concert",
        eventDescription: "The nightingale of Bollywood Shreya Ghoshal performs her melodious hits live.",
        venue: "Thyagaraj Sports Complex",
        venueAddress: "Thyagaraj Sports Complex, INA, New Delhi 110023",
        eventDate: new Date("2025-09-15T19:30:00Z"),
        category: "concert",
        eventImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        trending: true,
        sellingFast: true,
        latitude: 28.5678,
        longitude: 77.2412,
        city: "delhi",
        section: "Platinum",
        row: "Row 3",
        seat: "Seat 12-13",
        price: 7500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premium front row seats with VIP parking included.",
        showContactInfo: true
      },
      {
        sellerId: userIds[1],
        title: "T20 World Cup 2025 - India vs Pakistan",
        eventTitle: "T20 World Cup 2025 - India vs Pakistan",
        eventDescription: "The most anticipated cricket match - India vs Pakistan in T20 World Cup 2025.",
        venue: "Eden Gardens",
        venueAddress: "Eden Gardens, Maidan, Kolkata, West Bengal 700021",
        eventDate: new Date("2025-10-12T14:30:00Z"),
        category: "sports",
        eventImageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        trending: true,
        sellingFast: true,
        latitude: 22.5645,
        longitude: 88.3433,
        city: "kolkata",
        section: "Corporate Box",
        row: "Box 15",
        seat: "Seats 1-4",
        price: 15000,
        quantity: 4,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premium corporate box with catering and AC. Historic India-Pakistan clash.",
        showContactInfo: true
      }
    ];

    // Insert past tickets
    console.log("\nAdding past events (these should be cleaned up):");
    let pastCount = 0;
    for (const ticketData of pastTickets) {
      try {
        await storage.createTicket(ticketData);
        pastCount++;
        console.log(`Added past event: ${ticketData.eventTitle} (${ticketData.eventDate.toDateString()})`);
      } catch (error) {
        console.log(`Skipped duplicate: ${ticketData.eventTitle}`);
      }
    }

    // Insert future tickets
    console.log("\nAdding future events (these should remain):");
    let futureCount = 0;
    for (const ticketData of futureTickets) {
      try {
        await storage.createTicket(ticketData);
        futureCount++;
        console.log(`Added future event: ${ticketData.eventTitle} (${ticketData.eventDate.toDateString()})`);
      } catch (error) {
        console.log(`Skipped duplicate: ${ticketData.eventTitle}`);
      }
    }

    console.log(`\nSummary:`);
    console.log(`Past events added: ${pastCount}`);
    console.log(`Future events added: ${futureCount}`);
    console.log(`Total new tickets: ${pastCount + futureCount}`);

    // Show current database state
    const allTickets = await storage.getAllEvents();
    console.log(`\nCurrent database state: ${allTickets.length} total tickets`);
    
    console.log("\nAll tickets with dates:");
    allTickets.forEach(ticket => {
      const eventDate = new Date(ticket.eventDate);
      const isExpired = eventDate < new Date();
      console.log(`- ${ticket.eventTitle}: ${eventDate.toDateString()} ${isExpired ? '(EXPIRED)' : '(ACTIVE)'}`);
    });

  } catch (error) {
    console.error("Error seeding mixed tickets:", error);
  } finally {
    process.exit(0);
  }
}

seedMixedTickets();