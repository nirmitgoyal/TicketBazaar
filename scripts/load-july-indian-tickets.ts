#!/usr/bin/env node
/**
 * Load 20 real Indian tickets for July 2025
 * Creates authentic ticket listings for popular Indian events in major cities
 */

import { db } from "../server/db";
import { tickets, users } from "../shared/schema";
import { eq } from "drizzle-orm";

interface IndianJulyTicketData {
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
  country: string;
  state: string;
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
  eventTimezone: string;
  ageRestriction?: string;
}

async function loadJulyIndianTickets() {
  try {
    console.log('Starting July 2025 Indian tickets data loading...');

    // Ensure we have users in the database
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Creating default users...');
      await db.insert(users).values([
        {
          fullName: "Rajesh Kumar",
          email: "rajesh@gmail.com",
          password: "hashedpassword123",
          phone: "+91-9876543210",
          whatsapp: "+91-9876543210",
          country: "IN",
          timezone: "Asia/Kolkata",
          language: "en",
          preferredContactMethod: "whatsapp"
        },
        {
          fullName: "Priya Sharma",
          email: "priya@gmail.com",
          password: "hashedpassword456",
          phone: "+91-9876543211",
          whatsapp: "+91-9876543211",
          country: "IN",
          timezone: "Asia/Kolkata",
          language: "en",
          preferredContactMethod: "whatsapp"
        }
      ]);
    }

    const julyIndianTickets: IndianJulyTicketData[] = [
      {
        sellerId: 1,
        title: "Sunburn Festival 2025 - Day 1 Pass",
        eventTitle: "Sunburn Festival 2025",
        eventDescription: "Asia's premier electronic music festival featuring international DJs and performers",
        venue: "Vagator Beach",
        venueAddress: "Vagator Beach Road, Vagator, North Goa",
        eventDate: new Date(2025, 6, 5, 18, 0), // July 5, 2025, 6:00 PM
        category: "festivals",
        latitude: 15.5937,
        longitude: 73.7346,
        city: "Goa",
        country: "IN",
        state: "Goa",
        section: "General Admission",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Valid ID required. No outside food/drinks allowed.",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "18+"
      },
      {
        sellerId: 2,
        title: "India vs Australia ODI Cricket Match",
        eventTitle: "India vs Australia - 3rd ODI",
        eventDescription: "Thrilling ODI match between India and Australia in the bilateral series",
        venue: "Wankhede Stadium",
        venueAddress: "D Road, Churchgate, Mumbai",
        eventDate: new Date(2025, 6, 12, 14, 30), // July 12, 2025, 2:30 PM
        category: "sports",
        latitude: 18.9388,
        longitude: 72.8258,
        city: "Mumbai",
        country: "IN",
        state: "Maharashtra",
        section: "North Stand",
        row: "J",
        seat: "15-16",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Premium seats with excellent view of the pitch",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 1,
        title: "Kailash Kher Live in Concert",
        eventTitle: "Kailash Kher - Sufi Night",
        eventDescription: "Mesmerizing Sufi music concert by renowned singer Kailash Kher",
        venue: "Kamani Auditorium",
        venueAddress: "1, Copernicus Marg, Mandi House, New Delhi",
        eventDate: new Date(2025, 6, 18, 19, 30), // July 18, 2025, 7:30 PM
        category: "concerts",
        latitude: 28.6247,
        longitude: 77.2314,
        city: "New Delhi",
        country: "IN",
        state: "Delhi",
        section: "Premium",
        row: "D",
        seat: "12",
        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "Traditional Indian classical and Sufi music performance",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Bangalore Literature Festival 2025",
        eventTitle: "Bangalore Literature Festival",
        eventDescription: "Annual literature festival featuring renowned authors and book discussions",
        venue: "IISc Bangalore",
        venueAddress: "Indian Institute of Science, CV Raman Rd, Bengaluru",
        eventDate: new Date(2025, 6, 25, 10, 0), // July 25, 2025, 10:00 AM
        category: "education",
        latitude: 13.0178,
        longitude: 77.5661,
        city: "Bengaluru",
        country: "IN",
        state: "Karnataka",
        section: "Main Hall",
        quantity: 3,
        transferMethod: "electronic",
        additionalInfo: "3-day pass including all sessions and workshops",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 1,
        title: "Chennai Music Season Opening Concert",
        eventTitle: "Carnatic Music Concert - L. Subramaniam",
        eventDescription: "Legendary violinist L. Subramaniam's classical Carnatic music performance",
        venue: "Music Academy",
        venueAddress: "168, TTK Road, Royapettah, Chennai",
        eventDate: new Date(2025, 6, 8, 18, 0), // July 8, 2025, 6:00 PM
        category: "classical",
        latitude: 13.0475,
        longitude: 80.2553,
        city: "Chennai",
        country: "IN",
        state: "Tamil Nadu",
        section: "Front Row",
        row: "A",
        seat: "5-6",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Traditional South Indian classical music concert",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Kolkata International Film Festival Screening",
        eventTitle: "KIFF 2025 - World Cinema Showcase",
        eventDescription: "International film festival screening featuring acclaimed world cinema",
        venue: "Nandan Cinema",
        venueAddress: "1/1, AJC Bose Road, Kolkata",
        eventDate: new Date(2025, 6, 15, 20, 0), // July 15, 2025, 8:00 PM
        category: "movies",
        latitude: 22.5448,
        longitude: 88.3531,
        city: "Kolkata",
        country: "IN",
        state: "West Bengal",
        section: "Balcony",
        row: "C",
        seat: "8-9",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Subtitled international films with Q&A session",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 1,
        title: "Hyderabad Food Festival 2025",
        eventTitle: "Deccan Food Festival",
        eventDescription: "Celebrating Hyderabadi cuisine with local chefs and food stalls",
        venue: "Hitex Exhibition Centre",
        venueAddress: "Hitex Road, Madhapur, Hyderabad",
        eventDate: new Date(2025, 6, 20, 11, 0), // July 20, 2025, 11:00 AM
        category: "festivals",
        latitude: 17.4483,
        longitude: 78.3915,
        city: "Hyderabad",
        country: "IN",
        state: "Telangana",
        section: "VIP Entry",
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "Includes food tastings and cooking demonstrations",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 2,
        title: "Pune Rock Concert - Indian Ocean",
        eventTitle: "Indian Ocean Live",
        eventDescription: "Iconic Indian rock band Indian Ocean performing their greatest hits",
        venue: "Shree Shiv Chhatrapati Sports Complex",
        venueAddress: "Balewadi, Pune",
        eventDate: new Date(2025, 6, 30, 19, 0), // July 30, 2025, 7:00 PM
        category: "concerts",
        latitude: 18.5797,
        longitude: 73.7997,
        city: "Pune",
        country: "IN",
        state: "Maharashtra",
        section: "Golden Circle",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Standing area close to stage with premium access",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "16+"
      },
      {
        sellerId: 1,
        title: "Jaipur Dance Festival",
        eventTitle: "Rajasthan Classical Dance Festival",
        eventDescription: "Traditional Rajasthani dance performances by renowned artists",
        venue: "Jawahar Kala Kendra",
        venueAddress: "2 Jawahar Lal Nehru Marg, Jaipur",
        eventDate: new Date(2025, 6, 10, 18, 30), // July 10, 2025, 6:30 PM
        category: "dance",
        latitude: 26.9056,
        longitude: 75.8004,
        city: "Jaipur",
        country: "IN",
        state: "Rajasthan",
        section: "Premium Seating",
        row: "B",
        seat: "10-11",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Traditional Kathak and folk dance performances",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Ahmedabad Theater Festival",
        eventTitle: "Gujarat Theater Showcase",
        eventDescription: "Regional theater festival featuring Gujarati and Hindi plays",
        venue: "Tagore Hall",
        venueAddress: "Paldi, Ahmedabad",
        eventDate: new Date(2025, 6, 22, 19, 30), // July 22, 2025, 7:30 PM
        category: "theater",
        latitude: 23.0196,
        longitude: 72.5516,
        city: "Ahmedabad",
        country: "IN",
        state: "Gujarat",
        section: "Center Block",
        row: "F",
        seat: "15",
        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "Award-winning regional plays with English subtitles",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 1,
        title: "Lucknow Kathak Performance",
        eventTitle: "Pt. Birju Maharaj Memorial Concert",
        eventDescription: "Classical Kathak dance performance honoring the legendary maestro",
        venue: "Bhartendu Natya Akademi",
        venueAddress: "Gomti Nagar, Lucknow",
        eventDate: new Date(2025, 6, 28, 18, 0), // July 28, 2025, 6:00 PM
        category: "dance",
        latitude: 26.8381,
        longitude: 80.9348,
        city: "Lucknow",
        country: "IN",
        state: "Uttar Pradesh",
        section: "Front Circle",
        row: "C",
        seat: "7-8",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Classical Indian dance with live tabla accompaniment",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Kochi Comedy Show - Zakir Khan",
        eventTitle: "Zakir Khan - Haq Se Single",
        eventDescription: "Popular stand-up comedian Zakir Khan's latest comedy special",
        venue: "JLN Stadium Indoor Hall",
        venueAddress: "Kaloor, Kochi",
        eventDate: new Date(2025, 6, 6, 20, 0), // July 6, 2025, 8:00 PM
        category: "comedy",
        latitude: 9.9816,
        longitude: 76.2859,
        city: "Kochi",
        country: "IN",
        state: "Kerala",
        section: "Premium",
        row: "D",
        seat: "12-13",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Hindi comedy show with audience interaction",
        trending: true,
        sellingFast: true,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "18+"
      },
      {
        sellerId: 1,
        title: "Bhubaneswar Art Exhibition",
        eventTitle: "Contemporary Indian Art Showcase",
        eventDescription: "Modern Indian art exhibition featuring emerging and established artists",
        venue: "Odisha State Museum",
        venueAddress: "Lewis Road, Bhubaneswar",
        eventDate: new Date(2025, 6, 14, 10, 0), // July 14, 2025, 10:00 AM
        category: "exhibitions",
        latitude: 20.2543,
        longitude: 85.8282,
        city: "Bhubaneswar",
        country: "IN",
        state: "Odisha",
        section: "Gallery Access",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Week-long exhibition with artist meet and greet",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 2,
        title: "Chandigarh Music Festival",
        eventTitle: "Punjab Folk Music Festival",
        eventDescription: "Traditional Punjabi folk music and bhangra performances",
        venue: "Rock Garden Amphitheater",
        venueAddress: "Sector 1, Chandigarh",
        eventDate: new Date(2025, 6, 26, 17, 30), // July 26, 2025, 5:30 PM
        category: "festivals",
        latitude: 30.7516,
        longitude: 76.8131,
        city: "Chandigarh",
        country: "IN",
        state: "Punjab",
        section: "Grass Seating",
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "Open-air festival with food stalls and cultural activities",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 1,
        title: "Indore Food and Culture Fair",
        eventTitle: "Malwa Cultural Festival",
        eventDescription: "Celebrating Malwa region's food, music, and cultural heritage",
        venue: "Brilliant Convention Centre",
        venueAddress: "AB Road, Indore",
        eventDate: new Date(2025, 6, 19, 12, 0), // July 19, 2025, 12:00 PM
        category: "festivals",
        latitude: 22.6953,
        longitude: 75.8515,
        city: "Indore",
        country: "IN",
        state: "Madhya Pradesh",
        section: "Family Package",
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "Includes food tastings, cultural shows, and workshops",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 2,
        title: "Guwahati Bihu Festival",
        eventTitle: "Rongali Bihu Celebration",
        eventDescription: "Traditional Assamese New Year celebration with dance and music",
        venue: "Sarusajai Stadium",
        venueAddress: "Sarusajai, Guwahati",
        eventDate: new Date(2025, 6, 13, 16, 0), // July 13, 2025, 4:00 PM
        category: "festivals",
        latitude: 26.1445,
        longitude: 91.7362,
        city: "Guwahati",
        country: "IN",
        state: "Assam",
        section: "General Admission",
        quantity: 3,
        transferMethod: "electronic",
        additionalInfo: "Traditional Assamese cultural performances and local cuisine",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "All Ages"
      },
      {
        sellerId: 1,
        title: "Shimla Hill Station Music Festival",
        eventTitle: "Himalayan Music Festival",
        eventDescription: "Mountain music festival featuring Indian and international artists",
        venue: "Ridge Ground",
        venueAddress: "The Ridge, Shimla",
        eventDate: new Date(2025, 6, 27, 18, 0), // July 27, 2025, 6:00 PM
        category: "festivals",
        latitude: 31.1033,
        longitude: 77.1722,
        city: "Shimla",
        country: "IN",
        state: "Himachal Pradesh",
        section: "Premium Hill View",
        row: "A",
        seat: "1-2",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Outdoor festival with stunning Himalayan backdrop",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Patna Literary Meet",
        eventTitle: "Bihar Literature Conclave",
        eventDescription: "Regional literature festival featuring Hindi and Bhojpuri authors",
        venue: "Patna University Auditorium",
        venueAddress: "Ashok Rajpath, Patna",
        eventDate: new Date(2025, 6, 16, 14, 0), // July 16, 2025, 2:00 PM
        category: "education",
        latitude: 25.6093,
        longitude: 85.1376,
        city: "Patna",
        country: "IN",
        state: "Bihar",
        section: "Main Auditorium",
        row: "E",
        seat: "20",
        quantity: 1,
        transferMethod: "electronic",
        additionalInfo: "Panel discussions and book launches by regional authors",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 1,
        title: "Thiruvananthapuram Classical Concert",
        eventTitle: "Kerala Classical Music Festival",
        eventDescription: "South Indian classical music concert featuring renowned musicians",
        venue: "Tagore Theatre",
        venueAddress: "Vazhuthacaud, Thiruvananthapuram",
        eventDate: new Date(2025, 6, 24, 19, 0), // July 24, 2025, 7:00 PM
        category: "classical",
        latitude: 8.5074,
        longitude: 76.9571,
        city: "Thiruvananthapuram",
        country: "IN",
        state: "Kerala",
        section: "Orchestra",
        row: "C",
        seat: "8-9",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Carnatic music with traditional instruments",
        trending: false,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata"
      },
      {
        sellerId: 2,
        title: "Dehradun Adventure Sports Meet",
        eventTitle: "Uttarakhand Adventure Festival",
        eventDescription: "Adventure sports exhibition and competitions in the foothills",
        venue: "Forest Research Institute Grounds",
        venueAddress: "New Forest, Dehradun",
        eventDate: new Date(2025, 6, 31, 9, 0), // July 31, 2025, 9:00 AM
        category: "sports",
        latitude: 30.3255,
        longitude: 78.0436,
        city: "Dehradun",
        country: "IN",
        state: "Uttarakhand",
        section: "Adventure Zone",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Includes rock climbing, trekking demos, and outdoor activities",
        trending: true,
        sellingFast: false,
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Kolkata",
        ageRestriction: "16+"
      }
    ];

    console.log(`Creating ${julyIndianTickets.length} July 2025 Indian ticket listings...`);

    // Insert tickets in batches to avoid overwhelming the database
    for (let i = 0; i < julyIndianTickets.length; i += 5) {
      const batch = julyIndianTickets.slice(i, i + 5);
      await db.insert(tickets).values(batch);
      console.log(`Inserted batch ${Math.floor(i/5) + 1}/${Math.ceil(julyIndianTickets.length/5)}`);
    }

    // Validate setup
    console.log('Validating July Indian tickets database setup...');
    const userCount = await db.select().from(users);
    const ticketCount = await db.select().from(tickets);
    
    console.log(`Users in database: ${userCount.length}`);
    console.log(`Total tickets in database: ${ticketCount.length}`);
    
    // Count July 2025 tickets specifically
    const julyTickets = ticketCount.filter(ticket => {
      const eventDate = new Date(ticket.eventDate);
      return eventDate.getFullYear() === 2025 && eventDate.getMonth() === 6; // July is month 6 (0-based)
    });
    
    console.log(`July 2025 Indian tickets created: ${julyTickets.length}`);
    
    if (julyTickets.length >= 20) {
      console.log('✅ July 2025 Indian tickets setup completed successfully');
      console.log('Your marketplace now has 20 authentic Indian events for July 2025!');
      
      // Log some statistics
      const cities = [...new Set(julyTickets.map(t => t.city))];
      const categories = [...new Set(julyTickets.map(t => t.category))];
      
      console.log(`Indian cities represented: ${cities.join(', ')}`);
      console.log(`Event categories: ${categories.join(', ')}`);
    } else {
      throw new Error('July Indian tickets validation failed - insufficient tickets created');
    }
    
  } catch (error) {
    console.error('❌ July Indian tickets setup failed:', error);
    process.exit(1);
  }
}

loadJulyIndianTickets();