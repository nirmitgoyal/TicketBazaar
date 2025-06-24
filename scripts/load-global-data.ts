#!/usr/bin/env node
/**
 * Load global dummy ticket data into the database
 * Creates realistic international ticket listings for testing and demonstration
 */

import { db } from "../server/db";
import { tickets, users } from "../shared/schema";
import { eq } from "drizzle-orm";

interface GlobalTicketData {
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
  state?: string;
  postalCode?: string;
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

async function loadGlobalData() {
  try {
    console.log("Loading global dummy ticket data...");

    // First, ensure we have some global users
    const existingUsers = await db.select().from(users).limit(5);
    if (existingUsers.length < 5) {
      console.log("Creating global dummy users...");
      await db.insert(users).values([
        {
          fullName: "John Smith",
          email: "john.smith@example.com",
          password: "hashedpassword123",
          instagram: "john_events_nyc",
          phone: "+1-555-0123",
          country: "US",
          timezone: "America/New_York",
          language: "en",
        },
        {
          fullName: "Emma Johnson",
          email: "emma.johnson@example.com",
          password: "hashedpassword123",
          instagram: "emma_london_shows",
          phone: "+44-20-7946-0958",
          country: "GB",
          timezone: "Europe/London",
          language: "en",
        },
        {
          fullName: "Pierre Dubois",
          email: "pierre.dubois@example.com",
          password: "hashedpassword123",
          instagram: "pierre_concerts_paris",
          phone: "+33-1-23-45-67-89",
          country: "FR",
          timezone: "Europe/Paris",
          language: "fr",
        },
        {
          fullName: "Yuki Tanaka",
          email: "yuki.tanaka@example.com",
          password: "hashedpassword123",
          instagram: "yuki_tokyo_events",
          phone: "+81-3-1234-5678",
          country: "JP",
          timezone: "Asia/Tokyo",
          language: "ja",
        },
        {
          fullName: "Miguel Rodriguez",
          email: "miguel.rodriguez@example.com",
          password: "hashedpassword123",
          instagram: "miguel_madrid_music",
          phone: "+34-91-123-4567",
          country: "ES",
          timezone: "Europe/Madrid",
          language: "es",
        },
        {
          fullName: "Sofia Petrov",
          email: "sofia.petrov@example.com",
          password: "hashedpassword123",
          instagram: "sofia_berlin_arts",
          phone: "+49-30-12345678",
          country: "DE",
          timezone: "Europe/Berlin",
          language: "de",
        },
        {
          fullName: "Marco Rossi",
          email: "marco.rossi@example.com",
          password: "hashedpassword123",
          instagram: "marco_rome_opera",
          phone: "+39-06-1234-5678",
          country: "IT",
          timezone: "Europe/Rome",
          language: "it",
        },
        {
          fullName: "Sarah Wilson",
          email: "sarah.wilson@example.com",
          password: "hashedpassword123",
          instagram: "sarah_sydney_events",
          phone: "+61-2-1234-5678",
          country: "AU",
          timezone: "Australia/Sydney",
          language: "en",
        }
      ]).onConflictDoNothing();
    }

    // Get users for seller IDs
    const allUsers = await db.select().from(users).limit(10);
    const userIds = allUsers.map(u => u.id);

    // Clear existing tickets
    await db.delete(tickets);

    const globalTickets: GlobalTicketData[] = [
      // USA - New York
      {
        sellerId: userIds[0] || 1,
        title: "Taylor Swift Eras Tour - VIP Package",
        eventTitle: "Taylor Swift | The Eras Tour",
        eventDescription: "An unforgettable night celebrating Taylor Swift's entire musical journey",
        venue: "MetLife Stadium",
        venueAddress: "1 MetLife Stadium Dr, East Rutherford, NJ 07073, USA",
        eventDate: new Date("2024-07-15T19:30:00"),
        category: "concerts",
        latitude: 40.8128,
        longitude: -74.0742,
        city: "East Rutherford",
        country: "US",
        state: "NJ",
        postalCode: "07073",
        section: "Floor",
        row: "A",
        seat: "15-16",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "VIP package includes early entry and exclusive merchandise",
        trending: true,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "America/New_York",
        ageRestriction: "All Ages"
      },
      
      // UK - London
      {
        sellerId: userIds[1] || 2,
        title: "Ed Sheeran Mathematics Tour Tickets",
        eventTitle: "Ed Sheeran: Mathematics Tour",
        eventDescription: "Ed Sheeran's biggest tour yet featuring hits from all albums",
        venue: "Wembley Stadium",
        venueAddress: "Wembley, London HA9 0WS, UK",
        eventDate: new Date("2024-08-20T19:00:00"),
        category: "concerts",
        latitude: 51.5559,
        longitude: -0.2796,
        city: "London",
        country: "GB",
        state: "England",
        postalCode: "HA9 0WS",
        section: "Block 134",
        row: "M",
        seat: "234-235",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Great view of the stage, electronic tickets via official app",
        trending: true,
        sellingFast: false,
        eventImageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Europe/London",
        ageRestriction: "All Ages"
      },

      // France - Paris
      {
        sellerId: userIds[2] || 3,
        title: "Billets pour Daft Punk Tribute Show",
        eventTitle: "Daft Punk Legacy: Electronic Night",
        eventDescription: "Célébration électronique en hommage aux légendes Daft Punk",
        venue: "AccorHotels Arena",
        venueAddress: "8 Bd de Bercy, 75012 Paris, France",
        eventDate: new Date("2024-09-10T21:00:00"),
        category: "concerts",
        latitude: 48.8399,
        longitude: 2.3785,
        city: "Paris",
        country: "FR",
        state: "Île-de-France",
        postalCode: "75012",
        section: "Parterre",
        row: "G",
        seat: "45-46",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Spectacle électronique immersif avec lasers et effets visuels",
        trending: false,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Europe/Paris",
        ageRestriction: "16+"
      },

      // Japan - Tokyo
      {
        sellerId: userIds[3] || 4,
        title: "東京ドーム BTS ワールドツアー チケット",
        eventTitle: "BTS World Tour: Yet To Come",
        eventDescription: "BTSの待望のワールドツアー東京公演",
        venue: "Tokyo Dome",
        venueAddress: "1-3-61 Koraku, Bunkyo City, Tokyo 112-0004, Japan",
        eventDate: new Date("2024-10-05T18:00:00"),
        category: "concerts",
        latitude: 35.7056,
        longitude: 139.7519,
        city: "Tokyo",
        country: "JP",
        state: "Tokyo",
        postalCode: "112-0004",
        section: "アリーナ",
        row: "5列",
        seat: "12-13番",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "正規チケット、電子チケットでの受け渡し",
        trending: true,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Asia/Tokyo",
        ageRestriction: "All Ages"
      },

      // Spain - Madrid
      {
        sellerId: userIds[4] || 5,
        title: "Real Madrid vs Barcelona - El Clásico",
        eventTitle: "El Clásico: Real Madrid vs FC Barcelona",
        eventDescription: "El partido más esperado del fútbol español",
        venue: "Santiago Bernabéu Stadium",
        venueAddress: "Av. de Concha Espina, 1, 28036 Madrid, Spain",
        eventDate: new Date("2024-11-26T21:00:00"),
        category: "sports",
        latitude: 40.4530,
        longitude: -3.6883,
        city: "Madrid",
        country: "ES",
        state: "Madrid",
        postalCode: "28036",
        section: "Tribuna Lateral",
        row: "15",
        seat: "234-235",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Entradas oficiales para el clásico más importante del año",
        trending: true,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Europe/Madrid",
        ageRestriction: "All Ages"
      },

      // Germany - Berlin
      {
        sellerId: userIds[5] || 6,
        title: "Berlin Philharmoniker - Beethoven Zyklus",
        eventTitle: "Berliner Philharmoniker: Beethoven Complete Symphonies",
        eventDescription: "Kompletter Beethoven-Zyklus mit den Berliner Philharmonikern",
        venue: "Berliner Philharmonie",
        venueAddress: "Herbert-von-Karajan-Straße 1, 10785 Berlin, Germany",
        eventDate: new Date("2024-12-15T20:00:00"),
        category: "classical",
        latitude: 52.5095,
        longitude: 13.3691,
        city: "Berlin",
        country: "DE",
        state: "Berlin",
        postalCode: "10785",
        section: "Parkett",
        row: "K",
        seat: "34-35",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Weltklasse-Aufführung mit dem renommierten Orchester",
        trending: false,
        sellingFast: false,
        eventImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Europe/Berlin",
        ageRestriction: "All Ages"
      },

      // Italy - Rome
      {
        sellerId: userIds[6] || 7,
        title: "La Traviata - Teatro dell'Opera di Roma",
        eventTitle: "Giuseppe Verdi: La Traviata",
        eventDescription: "Una delle opere più amate di Verdi nel prestigioso Teatro dell'Opera",
        venue: "Teatro dell'Opera di Roma",
        venueAddress: "Piazza Beniamino Gigli, 7, 00184 Roma RM, Italy",
        eventDate: new Date("2025-01-20T20:30:00"),
        category: "opera",
        latitude: 41.9009,
        longitude: 12.4959,
        city: "Rome",
        country: "IT",
        state: "Lazio",
        postalCode: "00184",
        section: "Platea",
        row: "H",
        seat: "15-16",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Produzione di alta qualità con cast internazionale",
        trending: false,
        sellingFast: false,
        eventImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Europe/Rome",
        ageRestriction: "All Ages"
      },

      // Australia - Sydney
      {
        sellerId: userIds[7] || 8,
        title: "Sydney Festival - Outdoor Cinema",
        eventTitle: "Sydney Festival: Moonlight Cinema",
        eventDescription: "Outdoor cinema experience under the Sydney stars",
        venue: "Royal Botanic Gardens",
        venueAddress: "Mrs Macquaries Rd, Sydney NSW 2000, Australia",
        eventDate: new Date("2025-02-14T19:30:00"),
        category: "movies",
        latitude: -33.8688,
        longitude: 151.2093,
        city: "Sydney",
        country: "AU",
        state: "NSW",
        postalCode: "2000",
        section: "Premium Grass",
        row: undefined,
        seat: undefined,
        quantity: 4,
        transferMethod: "electronic",
        additionalInfo: "BYO blanket and picnic, stunning harbour views",
        trending: true,
        sellingFast: false,
        eventImageUrl: "https://images.unsplash.com/photo-1489599004644-2ab1b2f15d97?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "Australia/Sydney",
        ageRestriction: "All Ages"
      },

      // Canada - Toronto
      {
        sellerId: userIds[0] || 1,
        title: "Toronto International Film Festival Gala",
        eventTitle: "TIFF 2024: Opening Night Gala",
        eventDescription: "Prestigious opening night of Toronto's premier film festival",
        venue: "Roy Thomson Hall",
        venueAddress: "60 Simcoe St, Toronto, ON M5J 2H5, Canada",
        eventDate: new Date("2024-09-05T19:00:00"),
        category: "movies",
        latitude: 43.6465,
        longitude: -79.3871,
        city: "Toronto",
        country: "CA",
        state: "ON",
        postalCode: "M5J 2H5",
        section: "Orchestra",
        row: "J",
        seat: "12-13",
        quantity: 2,
        transferMethod: "electronic",
        additionalInfo: "Red carpet event with celebrity appearances",
        trending: true,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1489599004644-2ab1b2f15d97?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "America/Toronto",
        ageRestriction: "18+"
      },

      // Brazil - São Paulo
      {
        sellerId: userIds[1] || 2,
        title: "Rock in Rio São Paulo - Foo Fighters",
        eventTitle: "Rock in Rio: Foo Fighters Headliner",
        eventDescription: "O maior festival de rock do mundo com Foo Fighters",
        venue: "Cidade do Rock",
        venueAddress: "Parque Olímpico, Barra da Tijuca, Rio de Janeiro, Brazil",
        eventDate: new Date("2024-09-28T22:00:00"),
        category: "festivals",
        latitude: -22.9068,
        longitude: -43.1729,
        city: "Rio de Janeiro",
        country: "BR",
        state: "RJ",
        postalCode: "22640-102",
        section: "Pista Premium",
        row: undefined,
        seat: undefined,
        quantity: 3,
        transferMethod: "electronic",
        additionalInfo: "Ingresso para o palco principal com Foo Fighters",
        trending: true,
        sellingFast: true,
        eventImageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        isTransferrable: true,
        showContactInfo: false,
        status: "available",
        eventTimezone: "America/Sao_Paulo",
        ageRestriction: "16+"
      }
    ];

    console.log(`Creating ${globalTickets.length} global ticket listings...`);

    // Insert tickets in batches to avoid overwhelming the database
    for (let i = 0; i < globalTickets.length; i += 5) {
      const batch = globalTickets.slice(i, i + 5);
      await db.insert(tickets).values(batch);
      console.log(`Inserted batch ${Math.floor(i/5) + 1}/${Math.ceil(globalTickets.length/5)}`);
    }

    // Validate setup
    console.log('Validating global database setup...');
    const userCount = await db.select().from(users);
    const ticketCount = await db.select().from(tickets);
    
    console.log(`Users created: ${userCount.length}`);
    console.log(`Global tickets created: ${ticketCount.length}`);
    
    if (userCount.length >= 5 && ticketCount.length >= 8) {
      console.log('✅ Global database setup completed successfully');
      console.log('Your global ticket marketplace is ready with international events!');
      
      // Log some statistics
      const countries = [...new Set(ticketCount.map(t => t.country))];
      // Global tickets loaded successfully
      const categories = [...new Set(ticketCount.map(t => t.category))];
      
      console.log(`Countries represented: ${countries.join(', ')}`);
      console.log(`Event categories: ${categories.join(', ')}`);
    } else {
      throw new Error('Global database validation failed - insufficient sample data');
    }
    
  } catch (error) {
    console.error('❌ Global database setup failed:', error);
    process.exit(1);
  }
}

loadGlobalData();