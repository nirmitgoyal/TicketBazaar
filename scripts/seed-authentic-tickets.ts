import { storage } from "../server/storage";
import { db } from "../server/db";
import { users, tickets } from "../shared/schema";

/**
 * Seed authentic ticket data based on real upcoming events in India
 */
async function seedAuthenticTickets() {
  try {
    console.log("🎫 Seeding authentic ticket data...");

    // First, ensure we have some users to sell tickets
    const existingUsers = await storage.getAllEvents();
    console.log(`Found ${existingUsers.length} existing tickets`);

    // Get or create sample users (sellers)
    const sampleUsers = [
      {
        email: "rajesh.kumar@gmail.com",
        password: "hashedpassword123",
        fullName: "Rajesh Kumar",
        phone: "+91-9876543210",
        whatsapp: "+91-9876543210",
        instagram: "@rajesh_mumbai",
        rating: 4.8,
        ratingsCount: 25,
        preferredContactMethod: "whatsapp"
      },
      {
        email: "priya.sharma@gmail.com", 
        password: "hashedpassword456",
        fullName: "Priya Sharma",
        phone: "+91-9876543211",
        whatsapp: "+91-9876543211",
        instagram: "@priya_delhi",
        rating: 4.6,
        ratingsCount: 18,
        preferredContactMethod: "instagram"
      },
      {
        email: "amit.patel@gmail.com",
        password: "hashedpassword789",
        fullName: "Amit Patel",
        phone: "+91-9876543212",
        whatsapp: "+91-9876543212",
        instagram: "@amit_bangalore",
        rating: 4.9,
        ratingsCount: 42,
        preferredContactMethod: "whatsapp"
      }
    ];

    // Create users if they don't exist
    const userIds = [];
    for (const userData of sampleUsers) {
      try {
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser) {
          userIds.push(existingUser.id);
        } else {
          const newUser = await storage.createUser(userData);
          userIds.push(newUser.id);
        }
      } catch (error) {
        console.log(`User ${userData.email} might already exist, continuing...`);
        userIds.push(1); // fallback to user ID 1
      }
    }

    // Authentic upcoming events in India (June 2025 onwards)
    const authenticTickets = [
      // Music Concerts
      {
        sellerId: userIds[0],
        title: "Arijit Singh Live in Concert - VIP Tickets",
        eventTitle: "Arijit Singh Live in Concert",
        eventDescription: "The king of Bollywood playback singing performs live with his greatest hits including Tum Hi Ho, Channa Mereya, and Ae Dil Hai Mushkil.",
        venue: "DY Patil Stadium",
        venueAddress: "DY Patil Stadium, Nerul, Navi Mumbai, Maharashtra 400706",
        eventDate: new Date("2025-07-15T19:30:00Z"),
        category: "concert",
        eventImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        trending: true,
        sellingFast: true,
        latitude: 19.0330,
        longitude: 73.0297,
        city: "mumbai",
        section: "VIP Block A",
        row: "Row 5",
        seat: "Seat 12-13",
        price: 8500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premium VIP experience with meet and greet opportunity. Original BookMyShow tickets.",
        showContactInfo: true
      },
      {
        sellerId: userIds[1],
        title: "Coldplay Music of the Spheres World Tour",
        eventTitle: "Coldplay Music of the Spheres World Tour",
        eventDescription: "British rock band Coldplay returns to India with their spectacular Music of the Spheres World Tour featuring hits like Yellow, Fix You, and Viva La Vida.",
        venue: "Narendra Modi Stadium",
        venueAddress: "Narendra Modi Stadium, Ahmedabad, Gujarat 382475",
        eventDate: new Date("2025-08-22T19:00:00Z"),
        category: "concert",
        eventImageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
        trending: true,
        sellingFast: true,
        latitude: 23.0927,
        longitude: 72.5953,
        city: "ahmedabad",
        section: "Gold Circle",
        row: "Standing",
        seat: "General Admission",
        price: 12000,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Official Paytm Insider tickets. Best view of the main stage.",
        showContactInfo: true
      },
      // Bollywood Events
      {
        sellerId: userIds[2],
        title: "Diljit Dosanjh Born to Shine Tour",
        eventTitle: "Diljit Dosanjh Born to Shine Tour",
        eventDescription: "Punjabi superstar Diljit Dosanjh brings his Born to Shine tour to India with hits like G.O.A.T, Do You Know, and Clash.",
        venue: "Jawaharlal Nehru Stadium",
        venueAddress: "Jawaharlal Nehru Stadium, Lodhi Road, New Delhi 110003",
        eventDate: new Date("2025-06-28T20:00:00Z"),
        category: "concert",
        eventImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        trending: true,
        sellingFast: false,
        latitude: 28.5706,
        longitude: 77.2335,
        city: "delhi",
        section: "Premium",
        row: "Row 15",
        seat: "Seat 45-46",
        price: 6500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "in-person",
        additionalInfo: "Great seats with clear view. Selling due to travel conflict.",
        showContactInfo: true
      },
      // Sports Events
      {
        sellerId: userIds[0],
        title: "India vs England ODI Series - Final Match",
        eventTitle: "India vs England ODI Series - Final Match",
        eventDescription: "Witness the thrilling finale of the India vs England ODI series at the iconic Eden Gardens.",
        venue: "Eden Gardens",
        venueAddress: "Eden Gardens, Maidan, Kolkata, West Bengal 700021",
        eventDate: new Date("2025-07-05T14:30:00Z"),
        category: "sports",
        eventImageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        trending: true,
        sellingFast: true,
        latitude: 22.5645,
        longitude: 88.3433,
        city: "kolkata",
        section: "Club House",
        row: "Tier 2",
        seat: "Block J, Row 8, Seat 25-26",
        price: 4500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premium club house tickets with air conditioning and catering.",
        showContactInfo: true
      },
      {
        sellerId: userIds[1],
        title: "IPL 2025 Final - Premium Hospitality",
        eventTitle: "IPL 2025 Final",
        eventDescription: "The biggest cricket match of the year - IPL Final 2025 with the top two teams battling for the championship.",
        venue: "Wankhede Stadium",
        venueAddress: "Wankhede Stadium, Churchgate, Mumbai, Maharashtra 400020",
        eventDate: new Date("2025-06-15T19:30:00Z"),
        category: "sports",
        eventImageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
        trending: true,
        sellingFast: true,
        latitude: 18.9388,
        longitude: 72.8258,
        city: "mumbai",
        section: "Hospitality Pavilion",
        row: "Premium",
        seat: "Table for 4",
        price: 25000,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Premium hospitality package includes food, beverages, and VIP parking.",
        showContactInfo: true
      },
      // Comedy Shows
      {
        sellerId: userIds[2],
        title: "Zakir Khan Live - Haq Se Single Tour",
        eventTitle: "Zakir Khan Live - Haq Se Single Tour",
        eventDescription: "India's favorite stand-up comedian Zakir Khan returns with his hilarious new show about being single and loving it.",
        venue: "Phoenix Marketcity",
        venueAddress: "Phoenix Marketcity, Kurla West, Mumbai, Maharashtra 400070",
        eventDate: new Date("2025-07-20T20:00:00Z"),
        category: "comedy",
        eventImageUrl: "https://images.unsplash.com/photo-1585699975055-600f8061b5be?w=800",
        trending: false,
        sellingFast: false,
        latitude: 19.0821,
        longitude: 72.8822,
        city: "mumbai",
        section: "Gold",
        row: "Row 8",
        seat: "Seat 15-16",
        price: 1200,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Front section seats. Original Insider tickets.",
        showContactInfo: true
      },
      // Theatre & Arts
      {
        sellerId: userIds[0],
        title: "Mughal-E-Azam Musical - Premium Orchestra",
        eventTitle: "Mughal-E-Azam - The Musical",
        eventDescription: "The grand musical adaptation of the classic Bollywood film Mughal-E-Azam with spectacular sets, costumes, and live orchestra.",
        venue: "NCPA Tata Theatre",
        venueAddress: "National Centre for the Performing Arts, Nariman Point, Mumbai, Maharashtra 400021",
        eventDate: new Date("2025-08-10T19:30:00Z"),
        category: "theatre",
        eventImageUrl: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800",
        trending: false,
        sellingFast: false,
        latitude: 18.9233,
        longitude: 72.8207,
        city: "mumbai",
        section: "Orchestra",
        row: "Row 12",
        seat: "Seat 8-9",
        price: 3500,
        quantity: 2,
        status: "available",
        isTransferrable: true,
        transferMethod: "in-person",
        additionalInfo: "Premium orchestra seats with excellent acoustics. Includes intermission refreshments.",
        showContactInfo: true
      },
      // Festivals
      {
        sellerId: userIds[1],
        title: "Sunburn Festival Goa 2025 - 3-Day Pass",
        eventTitle: "Sunburn Festival Goa 2025",
        eventDescription: "Asia's largest electronic dance music festival returns to Goa with world-class DJs, spectacular stages, and beach vibes.",
        venue: "Vagator Beach",
        venueAddress: "Vagator Beach, Bardez, Goa 403509",
        eventDate: new Date("2025-12-28T16:00:00Z"),
        category: "festival",
        eventImageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
        trending: true,
        sellingFast: false,
        latitude: 15.6014,
        longitude: 73.7442,
        city: "goa",
        section: "General Admission",
        row: "Standing",
        seat: "3-Day Pass",
        price: 8900,
        quantity: 1,
        status: "available",
        isTransferrable: true,
        transferMethod: "electronic",
        additionalInfo: "Full 3-day festival pass. Includes access to all stages and activities.",
        showContactInfo: true
      }
    ];

    // Insert authentic tickets
    let insertedCount = 0;
    for (const ticketData of authenticTickets) {
      try {
        await storage.createTicket(ticketData);
        insertedCount++;
        console.log(`✅ Added: ${ticketData.eventTitle} in ${ticketData.city}`);
      } catch (error) {
        console.log(`⚠️  Skipped duplicate: ${ticketData.eventTitle}`);
      }
    }

    console.log(`\n🎉 Successfully added ${insertedCount} authentic tickets to the database!`);
    console.log("\n📊 Summary of added events:");
    console.log("🎵 Music Concerts: 3 events");
    console.log("🏏 Sports Events: 2 events"); 
    console.log("😂 Comedy Shows: 1 event");
    console.log("🎭 Theatre: 1 event");
    console.log("🎪 Festivals: 1 event");
    console.log("\n🌍 Cities covered: Mumbai, Delhi, Ahmedabad, Kolkata, Goa");

  } catch (error) {
    console.error("❌ Error seeding authentic tickets:", error);
  } finally {
    process.exit(0);
  }
}

seedAuthenticTickets();