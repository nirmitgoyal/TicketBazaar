#!/usr/bin/env node
/**
 * Load 20 additional diverse events into the database
 */

import { db } from "../server/db";
import { tickets, users } from "../shared/schema";

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

async function loadMoreEvents() {
  try {
    console.log("Loading 20 additional events...");

    // Get existing users for seller IDs
    const allUsers = await db.select().from(users).limit(10);
    const userIds = allUsers.map(u => u.id);

    const moreEvents: DummyTicketData[] = [
      // More Music Events
      {
        sellerId: userIds[0] || 1,
        title: "Shreya Ghoshal Live Concert",
        eventTitle: "Shreya Ghoshal - Sur Ka Safar",
        eventDescription: "The melodious queen Shreya Ghoshal performs her greatest hits",
        venue: "Shilpakala Vedika",
        venueAddress: "Shilpakala Vedika, Hyderabad, Telangana 500082",
        eventDate: new Date("2025-09-12T19:30:00"),
        category: "music",
        latitude: 17.4239,
        longitude: 78.4738,
        city: "Hyderabad",
        section: "Gold",
        row: "D",
        seat: "25-26",
        price: 2800,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Excellent acoustics, premium seating",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[1] || 2,
        title: "Rahat Fateh Ali Khan Sufi Night",
        eventTitle: "Rahat Fateh Ali Khan - Sufi Night",
        eventDescription: "Soul-stirring Sufi music by the legendary Rahat Fateh Ali Khan",
        venue: "Tagore Theatre",
        venueAddress: "Tagore Theatre, Chandigarh, Punjab 160017",
        eventDate: new Date("2025-10-08T20:00:00"),
        category: "music",
        latitude: 30.7333,
        longitude: 76.7794,
        city: "Chandigarh",
        section: "VIP",
        row: "A",
        seat: "10-11",
        price: 3500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Front row VIP experience",
        trending: false,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[2] || 3,
        title: "Kailash Kher Folk Fusion",
        eventTitle: "Kailash Kher - Rang Barse",
        eventDescription: "Folk fusion concert by Kailash Kher and Kailasa band",
        venue: "Ravindra Natya Mandir",
        venueAddress: "Ravindra Natya Mandir, Dadar, Mumbai, Maharashtra 400028",
        eventDate: new Date("2025-11-22T19:00:00"),
        category: "music",
        latitude: 19.0330,
        longitude: 72.8570,
        city: "Mumbai",
        section: "Balcony",
        row: "B",
        seat: "35",
        price: 1800,
        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "Balcony view, good sound quality",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // More Comedy Shows
      {
        sellerId: userIds[3] || 4,
        title: "Kapil Sharma Live Show",
        eventTitle: "Kapil Sharma - Comedy Nights",
        eventDescription: "India's favorite comedian Kapil Sharma live on stage",
        venue: "Indira Gandhi Indoor Stadium",
        venueAddress: "Indira Gandhi Indoor Stadium, New Delhi, Delhi 110001",
        eventDate: new Date("2025-08-30T20:00:00"),
        category: "comedy",
        latitude: 28.6139,
        longitude: 77.2090,
        city: "Delhi",
        section: "Premium",
        row: "F",
        seat: "18-19",
        price: 2200,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Close to stage, great view",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[4] || 5,
        title: "Vir Das International Tour",
        eventTitle: "Vir Das - Landing",
        eventDescription: "Vir Das brings his international comedy tour to India",
        venue: "Phoenix Marketcity Arena",
        venueAddress: "Phoenix Marketcity, Velachery, Chennai, Tamil Nadu 600042",
        eventDate: new Date("2025-07-18T19:30:00"),
        category: "comedy",
        latitude: 12.9752,
        longitude: 80.2212,
        city: "Chennai",
        section: "VIP",
        row: "C",
        seat: "5-6",
        price: 1500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "VIP seating with refreshments",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Sports Events
      {
        sellerId: userIds[0] || 1,
        title: "Pro Kabaddi League Final",
        eventTitle: "Pro Kabaddi League 2025 Final",
        eventDescription: "The ultimate Kabaddi championship final",
        venue: "Dome NSCI",
        venueAddress: "Dome NSCI, Worli, Mumbai, Maharashtra 400018",
        eventDate: new Date("2025-12-15T19:00:00"),
        category: "sports",
        latitude: 19.0176,
        longitude: 72.8562,
        city: "Mumbai",
        section: "Courtside",
        row: "AA",
        seat: "12-13",
        price: 4500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Courtside premium seats, includes refreshments",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[1] || 2,
        title: "Indian Super League Match",
        eventTitle: "Mumbai City FC vs Bengaluru FC",
        eventDescription: "Exciting ISL match between top teams",
        venue: "Mumbai Football Arena",
        venueAddress: "Mumbai Football Arena, Andheri, Mumbai, Maharashtra 400059",
        eventDate: new Date("2025-01-25T19:30:00"),
        category: "sports",
        latitude: 19.1136,
        longitude: 72.8697,
        city: "Mumbai",
        section: "North Stand",
        row: "M",
        seat: "45-46",
        price: 1200,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Great atmosphere section, fan zone",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[2] || 3,
        title: "Formula 1 Bharat Grand Prix",
        eventTitle: "Formula 1 Bharat Grand Prix 2025",
        eventDescription: "India's return to Formula 1 racing",
        venue: "Buddh International Circuit",
        venueAddress: "Buddh International Circuit, Greater Noida, Uttar Pradesh 201310",
        eventDate: new Date("2025-03-30T14:00:00"),
        category: "sports",
        latitude: 28.3487,
        longitude: 77.5331,
        city: "Delhi",
        section: "Grandstand",
        row: "T1",
        seat: "88-89",
        price: 25000,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Premium grandstand view of main straight",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Theater & Arts
      {
        sellerId: userIds[3] || 4,
        title: "Tumhari Sulu Musical",
        eventTitle: "Tumhari Sulu - The Musical",
        eventDescription: "Bollywood musical adaptation of the hit film",
        venue: "National Centre for Performing Arts",
        venueAddress: "NCPA, Nariman Point, Mumbai, Maharashtra 400021",
        eventDate: new Date("2025-06-14T19:30:00"),
        category: "theater",
        latitude: 18.9230,
        longitude: 72.8227,
        city: "Mumbai",
        section: "Orchestra",
        row: "H",
        seat: "22-23",
        price: 2800,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Center orchestra, perfect view",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[4] || 5,
        title: "Ramayana Ballet Performance",
        eventTitle: "Ramayana - Classical Dance Ballet",
        eventDescription: "Traditional Indian classical dance performance of Ramayana",
        venue: "Kalakshetra Foundation",
        venueAddress: "Kalakshetra Foundation, Thiruvanmiyur, Chennai, Tamil Nadu 600041",
        eventDate: new Date("2025-10-02T18:00:00"),
        category: "theater",
        latitude: 12.9899,
        longitude: 80.2609,
        city: "Chennai",
        section: "Premium",
        row: "D",
        seat: "15-16",
        price: 1500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Cultural heritage performance, English subtitles",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Festivals & Events
      {
        sellerId: userIds[0] || 1,
        title: "Hornbill Festival Nagaland",
        eventTitle: "Hornbill Festival 2025",
        eventDescription: "Festival of Festivals - Nagaland's cultural extravaganza",
        venue: "Naga Heritage Village",
        venueAddress: "Naga Heritage Village, Kisama, Nagaland 797001",
        eventDate: new Date("2025-12-03T10:00:00"),
        category: "festival",
        latitude: 25.6751,
        longitude: 94.1086,
        city: "Kohima",
        section: "General",
        row: null,
        seat: null,
        price: 3200,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "7-day festival pass, includes cultural programs",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[1] || 2,
        title: "Kumbh Mela VIP Packages",
        eventTitle: "Kumbh Mela 2025 - VIP Experience",
        eventDescription: "Premium packages for the grand Kumbh Mela",
        venue: "Triveni Sangam",
        venueAddress: "Triveni Sangam, Prayagraj, Uttar Pradesh 211001",
        eventDate: new Date("2025-01-29T06:00:00"),
        category: "festival",
        latitude: 25.4358,
        longitude: 81.8463,
        city: "Prayagraj",
        section: "VIP",
        row: null,
        seat: null,
        price: 5500,
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "VIP darshan, accommodation, and meals included",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Tech & Business Events
      {
        sellerId: userIds[2] || 3,
        title: "Global Fintech Festival",
        eventTitle: "Global Fintech Festival Mumbai 2025",
        eventDescription: "Premier fintech and digital banking conference",
        venue: "Bombay Exhibition Centre",
        venueAddress: "Bombay Exhibition Centre, Goregaon, Mumbai, Maharashtra 400063",
        eventDate: new Date("2025-04-22T09:00:00"),
        category: "conference",
        latitude: 19.1647,
        longitude: 72.8492,
        city: "Mumbai",
        section: "Platinum",
        row: null,
        seat: null,
        price: 12000,
        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "All access pass, networking dinners included",
        trending: false,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[3] || 4,
        title: "India Mobile Congress",
        eventTitle: "India Mobile Congress 2025",
        eventDescription: "Asia's largest telecom, media and technology conference",
        venue: "Pragati Maidan",
        venueAddress: "Pragati Maidan, New Delhi, Delhi 110001",
        eventDate: new Date("2025-09-28T09:00:00"),
        category: "conference",
        latitude: 28.6103,
        longitude: 77.2481,
        city: "Delhi",
        section: "Premium",
        row: null,
        seat: null,
        price: 8500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "3-day conference pass, exhibition access",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Food & Lifestyle
      {
        sellerId: userIds[4] || 5,
        title: "Wine & Food Festival",
        eventTitle: "India Wine & Food Festival 2025",
        eventDescription: "Premium wine tasting and gourmet food festival",
        venue: "JW Marriott Hotel",
        venueAddress: "JW Marriott Hotel, Aerocity, New Delhi, Delhi 110037",
        eventDate: new Date("2025-11-08T18:00:00"),
        category: "food",
        latitude: 28.5562,
        longitude: 77.1180,
        city: "Delhi",
        section: "Premium",
        row: null,
        seat: null,
        price: 4500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Premium tastings, celebrity chef sessions",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },
      {
        sellerId: userIds[0] || 1,
        title: "Street Food Festival Mumbai",
        eventTitle: "Mumbai Street Food Carnival",
        eventDescription: "Celebration of Mumbai's iconic street food culture",
        venue: "Oval Maidan",
        venueAddress: "Oval Maidan, Fort, Mumbai, Maharashtra 400001",
        eventDate: new Date("2025-02-16T16:00:00"),
        category: "food",
        latitude: 18.9298,
        longitude: 72.8312,
        city: "Mumbai",
        section: "General",
        row: null,
        seat: null,
        price: 800,
        quantity: 5,
        transferMethod: "electronic",
        additionalInfo: "Food vouchers included, family-friendly",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Fashion & Lifestyle
      {
        sellerId: userIds[1] || 2,
        title: "Lakme Fashion Week",
        eventTitle: "Lakme Fashion Week 2025",
        eventDescription: "India's premier fashion event showcasing top designers",
        venue: "Grand Hyatt Mumbai",
        venueAddress: "Grand Hyatt Mumbai, Santacruz, Mumbai, Maharashtra 400055",
        eventDate: new Date("2025-08-12T19:00:00"),
        category: "fashion",
        latitude: 19.0896,
        longitude: 72.8656,
        city: "Mumbai",
        section: "Front Row",
        row: "A",
        seat: "8-9",
        price: 8000,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Front row fashion show seats, after-party access",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Adventure & Travel
      {
        sellerId: userIds[2] || 3,
        title: "Adventure Travel Expo",
        eventTitle: "India Adventure Travel Expo 2025",
        eventDescription: "Explore adventure destinations and experiences across India",
        venue: "Bangalore Palace Grounds",
        venueAddress: "Bangalore Palace Grounds, Bangalore, Karnataka 560052",
        eventDate: new Date("2025-05-18T10:00:00"),
        category: "travel",
        latitude: 12.9986,
        longitude: 77.5937,
        city: "Bangalore",
        section: "Explorer",
        row: null,
        seat: null,
        price: 1200,
        quantity: 3,
        transferMethod: "electronic",
        additionalInfo: "Adventure activities, travel deals, workshops",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Film & Entertainment
      {
        sellerId: userIds[3] || 4,
        title: "Mumbai Film Festival",
        eventTitle: "Mumbai International Film Festival 2025",
        eventDescription: "Celebrating cinema from around the world",
        venue: "PVR ICON Phoenix Mills",
        venueAddress: "PVR ICON, Phoenix Mills, Lower Parel, Mumbai, Maharashtra 400013",
        eventDate: new Date("2025-10-28T14:00:00"),
        category: "film",
        latitude: 19.0134,
        longitude: 72.8302,
        city: "Mumbai",
        section: "Premium",
        row: "D",
        seat: "10-11",
        price: 2500,
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Film festival pass, screenings and premieres",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      },

      // Religious & Cultural
      {
        sellerId: userIds[4] || 5,
        title: "Isha Mahashivratri",
        eventTitle: "Isha Mahashivratri 2025",
        eventDescription: "Spiritual celebration at Isha Yoga Center",
        venue: "Isha Yoga Center",
        venueAddress: "Isha Yoga Center, Coimbatore, Tamil Nadu 641114",
        eventDate: new Date("2025-02-26T18:00:00"),
        category: "spiritual",
        latitude: 11.1271,
        longitude: 76.9558,
        city: "Coimbatore",
        section: "General",
        row: null,
        seat: null,
        price: 500,
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "All-night spiritual celebration, meditation sessions",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: true,
        status: "available"
      }
    ];

    console.log(`Inserting ${moreEvents.length} additional events...`);
    await db.insert(tickets).values(moreEvents as any);

    console.log("✅ Successfully added 20 more events!");
    console.log("New categories added:");
    
    const categories = [...new Set(moreEvents.map(t => t.category))];
    categories.forEach(category => {
      const count = moreEvents.filter(t => t.category === category).length;
      console.log(`  - ${category}: ${count} events`);
    });

    const cities = [...new Set(moreEvents.map(t => t.city))];
    console.log(`New cities covered: ${cities.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error loading additional events:", error);
    process.exit(1);
  }
}

loadMoreEvents();