#!/usr/bin/env node
/**
 * Load dummy ticket data into the database
 * Creates realistic ticket listings for testing and demonstration
 */

import { db } from "../server/db";
import { tickets, users } from "../shared/schema";
import { eq } from "drizzle-orm";

interface DummyTicketData {
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

async function loadDummyData() {
  try {
    console.log("Loading dummy ticket data...");

    // First, ensure we have some users
    const existingUsers = await db.select().from(users).limit(5);
    if (existingUsers.length < 3) {
      console.log("Creating dummy users...");
      await db.insert(users).values([
        {
          fullName: "Arjun Sharma",
          email: "arjun.sharma@example.com",
          password: "hashedpassword123",
          instagram: "arjun_music_lover",
          phone: "+91 9876543210"
        },
        {
          fullName: "Priya Patel",
          email: "priya.patel@example.com",
          password: "hashedpassword123",
          instagram: "priya_eventgoer",
          phone: "+91 9876543211"
        },
        {
          fullName: "Vikram Singh",
          email: "vikram.singh@example.com",
          password: "hashedpassword123",
          instagram: "vikram_tickets",
          phone: "+91 9876543212"
        },
        {
          fullName: "Sneha Reddy",
          email: "sneha.reddy@example.com",
          password: "hashedpassword123",
          instagram: "sneha_concerts",
          phone: "+91 9876543213"
        },
        {
          fullName: "Rohit Gupta",
          email: "rohit.gupta@example.com",
          password: "hashedpassword123",
          instagram: "rohit_sports_fan",
          phone: "+91 9876543214"
        }
      ]).onConflictDoNothing();
    }

    // Get users for seller IDs
    const allUsers = await db.select().from(users).limit(10);
    const userIds = allUsers.map(u => u.id);

    // Clear existing tickets
    await db.delete(tickets);

    const dummyTickets: DummyTicketData[] = [
      // Concerts
      {
        sellerId: userIds[0] || 1,
        title: "Arijit Singh Live Concert Tickets",
        eventTitle: "Arijit Singh Live in Concert",
        eventDescription: "Experience the magic of Arijit Singh live with his biggest hits",
        venue: "NSCI Dome",
        venueAddress: "NSCI Dome, Worli, Mumbai, Maharashtra 400018",
        eventDate: new Date("2025-07-15T20:00:00"),
        category: "music",
        latitude: 19.0176,
        longitude: 72.8562,
        city: "Mumbai",
        section: "Premium",
        row: "A",
        seat: "15-16",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Amazing seats with clear view of the stage",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[1] || 2,
        title: "AR Rahman Concert Tickets",
        eventTitle: "AR Rahman - Jai Ho Concert",
        eventDescription: "The maestro AR Rahman performs his greatest compositions",
        venue: "Kanteerava Stadium",
        venueAddress: "Kanteerava Stadium, Bangalore, Karnataka 560001",
        eventDate: new Date("2025-08-20T19:30:00"),
        category: "music",
        latitude: 12.9716,
        longitude: 77.5946,
        city: "Bangalore",
        section: "VIP",
        row: "B",
        seat: "8-9",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "VIP section with complimentary refreshments",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Comedy Shows
      {
        sellerId: userIds[2] || 3,
        title: "Zakir Khan Stand-up Comedy",
        eventTitle: "Zakir Khan - Haq Se Single",
        eventDescription: "Zakir Khan's hilarious take on being single",
        venue: "Phoenix MarketCity",
        venueAddress: "Phoenix MarketCity, Kurla, Mumbai, Maharashtra 400070",
        eventDate: new Date("2025-06-25T20:00:00"),
        category: "comedy",
        latitude: 19.0788,
        longitude: 72.8856,
        city: "Mumbai",
        section: "Premium",
        row: "C",
        seat: "12",

        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "Center seats, perfect view",
        trending: false,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[3] || 4,
        title: "Biswa Kalyan Rath Comedy Show",
        eventTitle: "Biswa Kalyan Rath - Mood Kharab",
        eventDescription: "Biswa's witty observations on life and relationships",
        venue: "Siri Fort Auditorium",
        venueAddress: "Siri Fort Auditorium, New Delhi, Delhi 110049",
        eventDate: new Date("2025-07-10T19:00:00"),
        category: "comedy",
        latitude: 28.5494,
        longitude: 77.2197,
        city: "Delhi",
        section: "Balcony",
        row: "E",
        seat: "20-21",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Good seats, bought extra by mistake",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Sports Events
      {
        sellerId: userIds[4] || 5,
        title: "IPL Final Match Tickets",
        eventTitle: "IPL 2025 Final",
        eventDescription: "The ultimate cricket showdown - IPL Final 2025",
        venue: "Wankhede Stadium",
        venueAddress: "Wankhede Stadium, Churchgate, Mumbai, Maharashtra 400020",
        eventDate: new Date("2025-05-25T19:30:00"),
        category: "sports",
        latitude: 18.9388,
        longitude: 72.8258,
        city: "Mumbai",
        section: "Pavilion",
        row: "Upper",
        seat: "45-46",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Premium pavilion seats, includes parking",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[0] || 1,
        title: "India vs Australia ODI",
        eventTitle: "India vs Australia ODI Series",
        eventDescription: "Thrilling ODI match between India and Australia",
        venue: "M. Chinnaswamy Stadium",
        venueAddress: "M. Chinnaswamy Stadium, Bangalore, Karnataka 560001",
        eventDate: new Date("2025-06-15T14:30:00"),
        category: "sports",
        latitude: 12.9792,
        longitude: 77.5993,
        city: "Bangalore",
        section: "East Stand",
        row: "Lower",
        seat: "88-89",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Great view of the action, covered seating",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Theater & Cultural
      {
        sellerId: userIds[1] || 2,
        title: "Mughal-E-Azam Musical",
        eventTitle: "Mughal-E-Azam - The Musical",
        eventDescription: "The grand theatrical adaptation of the classic film",
        venue: "Nehru Centre Auditorium",
        venueAddress: "Nehru Centre, Worli, Mumbai, Maharashtra 400018",
        eventDate: new Date("2025-08-05T19:00:00"),
        category: "theater",
        latitude: 19.0144,
        longitude: 72.8160,
        city: "Mumbai",
        section: "Orchestra",
        row: "J",
        seat: "15-16",

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Amazing production, must-watch show",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Festivals
      {
        sellerId: userIds[2] || 3,
        title: "Sunburn Festival Goa Passes",
        eventTitle: "Sunburn Festival 2025",
        eventDescription: "India's biggest electronic dance music festival",
        venue: "Vagator Beach",
        venueAddress: "Vagator Beach, North Goa, Goa 403509",
        eventDate: new Date("2025-12-28T16:00:00"),
        category: "festival",
        latitude: 15.6073,
        longitude: 73.7364,
        city: "Goa",
        section: "General",
        row: undefined,
        seat: undefined,

        quantity: 3,
        transferMethod: "electronic",
        additionalInfo: "3-day festival passes, camping included",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[3] || 4,
        title: "NH7 Weekender Pune Tickets",
        eventTitle: "NH7 Weekender Pune",
        eventDescription: "Multi-genre music festival with international and Indian artists",
        venue: "Oxford Golf Resort",
        venueAddress: "Oxford Golf Resort, Pune, Maharashtra 412115",
        eventDate: new Date("2025-11-15T15:00:00"),
        category: "festival",
        latitude: 18.6298,
        longitude: 73.7997,
        city: "Pune",
        section: "General",
        row: undefined,
        seat: undefined,

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Weekend passes, food and drinks extra",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Tech/Conference
      {
        sellerId: userIds[4] || 5,
        title: "TechCrunch Disrupt Delhi",
        eventTitle: "TechCrunch Disrupt Delhi 2025",
        eventDescription: "Premier startup and technology conference",
        venue: "India Expo Mart",
        venueAddress: "India Expo Mart, Greater Noida, Uttar Pradesh 201308",
        eventDate: new Date("2025-09-10T09:00:00"),
        category: "conference",
        latitude: 28.4744,
        longitude: 77.5040,
        city: "Delhi",
        section: "VIP",
        row: undefined,
        seat: undefined,

        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "All access pass including networking events",
        trending: false,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Art & Exhibition
      {
        sellerId: userIds[0] || 1,
        title: "India Art Fair Tickets",
        eventTitle: "India Art Fair 2025",
        eventDescription: "South Asia's leading international art fair",
        venue: "NSIC Exhibition Complex",
        venueAddress: "NSIC Exhibition Complex, Okhla, New Delhi, Delhi 110020",
        eventDate: new Date("2025-02-07T10:00:00"),
        category: "art",
        latitude: 28.5355,
        longitude: 77.2761,
        city: "Delhi",
        section: "General",
        row: undefined,
        seat: undefined,

        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "Weekend passes, great for art enthusiasts",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      // Food Festival
      {
        sellerId: userIds[1] || 2,
        title: "Grub Fest Mumbai Passes",
        eventTitle: "Grub Fest Mumbai 2025",
        eventDescription: "Ultimate food and music festival",
        venue: "Jio Garden",
        venueAddress: "Jio Garden, BKC, Mumbai, Maharashtra 400051",
        eventDate: new Date("2025-03-20T12:00:00"),
        category: "food",
        latitude: 19.0660,
        longitude: 72.8777,
        city: "Mumbai",
        section: "General",
        row: undefined,
        seat: undefined,

        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Includes food vouchers worth ₹500",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      }
    ];

    // Insert dummy tickets
    console.log(`Inserting ${dummyTickets.length} dummy tickets...`);
    await db.insert(tickets).values(dummyTickets as any);

    console.log("✅ Dummy data loaded successfully!");
    console.log(`Created ${dummyTickets.length} ticket listings across various categories:`);
    
    const categories = [...new Set(dummyTickets.map(t => t.category))];
    categories.forEach(category => {
      const count = dummyTickets.filter(t => t.category === category).length;
      console.log(`  - ${category}: ${count} events`);
    });

    const cities = [...new Set(dummyTickets.map(t => t.city))];
    console.log(`Covering ${cities.length} cities: ${cities.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error loading dummy data:", error);
    process.exit(1);
  }
}

loadDummyData();