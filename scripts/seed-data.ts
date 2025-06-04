import { db } from "../server/db";
import { users, events, tickets } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";

async function getOrCreateUser(userData: any) {
  // First check if user exists
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(
        `User ${userData.username} already exists, skipping creation`,
      );
      return existingUser[0];
    }

    // User doesn't exist, create it
    const hashedPassword = await hash(userData.password, 10);
    // Map userData fields to match database column names
    const userToInsert = {
      username: userData.username,
      password: hashedPassword,
      // Ensure full_name is not null by using an empty string as fallback
      full_name: userData.fullName || "",
      email: userData.email,
      phone: userData.phone,
      whatsapp: userData.whatsapp,
      google_id: userData.googleId,
      rating: userData.rating || 0,
      ratings_count: userData.ratingsCount || 0,
      preferred_contact_method: userData.preferredContactMethod || "whatsapp",
    };

    console.log("Inserting user with full_name:", userToInsert.full_name);

    // Using the pool.query
    const { rows } = await pool.query(
      `
      INSERT INTO users (
        username, password, full_name, email, phone, whatsapp, 
        google_id, rating, ratings_count, preferred_contact_method
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *
    `,
      [
        userToInsert.username,
        userToInsert.password,
        userToInsert.full_name,
        userToInsert.email,
        userToInsert.phone || "",
        userToInsert.whatsapp || "",
        userToInsert.google_id || null,
        userToInsert.rating,
        userToInsert.ratings_count,
        userToInsert.preferred_contact_method,
      ],
    );

    // Return the first row
    return rows[0];
  } catch (error) {
    console.error(`Error with user ${userData.username}:`, error);
    throw error;
  }
}

async function seedData() {
  try {
    console.log("Seeding database...");

    // Create test users
    console.log("Creating users...");
    const demoUser = await getOrCreateUser({
      username: "demouser",
      password: "password123",
      fullName: "Demo User",
      email: "demo@example.com",
      phone: "9876543210",
      whatsapp: "919876543210",
      rating: 4.5,
      ratingsCount: 10,
      preferredContactMethod: "whatsapp",
    });

    const seller1 = await getOrCreateUser({
      username: "seller1",
      password: "password123",
      fullName: "Seller One",
      email: "seller1@example.com",
      phone: "9876543211",
      whatsapp: "919876543211",
      instagram: "seller_one_official",
      rating: 4.7,
      ratingsCount: 25,
      preferredContactMethod: "whatsapp",
    });

    const seller2 = await getOrCreateUser({
      username: "seller2",
      password: "password123",
      fullName: "Seller Two",
      email: "seller2@example.com",
      phone: "9876543212",
      whatsapp: "919876543212",
      instagram: "seller_two_tickets",
      rating: 4.2,
      ratingsCount: 15,
      preferredContactMethod: "phone",
    });

    console.log("Users created");

    // Create events
    console.log("Creating events...");
    // Create events with database column names
    // Create events with the correct database column names
    const eventsRaw = [
      {
        title: "IPL Final 2023",
        description:
          "The Indian Premier League Final match between Chennai Super Kings and Gujarat Titans",
        venue: "Narendra Modi Stadium, Ahmedabad",
        date: new Date("2023-05-28T19:30:00+05:30"),
        category: "sports",
        imageUrl: "https://picsum.photos/seed/ipl_final/800/600",
        trending: true,
        sellingFast: true,
        latitude: 23.091848,
        longitude: 72.596487,
        city: "Ahmedabad",
      },
      {
        title: "Arijit Singh Live in Concert",
        description: "Arijit Singh performing live with a full orchestra",
        venue: "DY Patil Stadium, Mumbai",
        date: new Date("2023-06-15T19:00:00+05:30"),
        category: "events",
        imageUrl: "https://picsum.photos/seed/arijit_concert/800/600",
        trending: true,
        sellingFast: true,
        latitude: 19.045904,
        longitude: 73.02848,
        city: "Mumbai",
      },
      {
        title: "Sunburn Festival 2023",
        description:
          "Asia's biggest EDM festival featuring top international DJs",
        venue: "Candolim Beach, Goa",
        date: new Date("2023-12-28T14:00:00+05:30"),
        category: "events",
        imageUrl: "https://picsum.photos/seed/sunburn/800/600",
        trending: true,
        sellingFast: false,
        latitude: 15.513814,
        longitude: 73.764956,
        city: "Goa",
      },
      {
        title: "Oppenheimer - IMAX Experience",
        description:
          "Christopher Nolan's epic thriller about J. Robert Oppenheimer",
        venue: "PVR Select Citywalk, Delhi",
        date: new Date("2023-07-21T19:00:00+05:30"),
        category: "movies",
        imageUrl: "https://picsum.photos/seed/oppenheimer/800/600",
        trending: true,
        sellingFast: false,
        latitude: 28.529198,
        longitude: 77.219257,
        city: "Delhi",
      },
      {
        title: "Delhi to Manali Express",
        description:
          "Luxury bus journey from Delhi to Manali with overnight travel",
        venue: "ISBT Kashmere Gate, Delhi",
        date: new Date("2023-06-30T20:00:00+05:30"),
        category: "buses",
        imageUrl: "https://picsum.photos/seed/delhi_manali/800/600",
        trending: false,
        sellingFast: false,
        latitude: 28.675007,
        longitude: 77.230851,
        city: "Delhi",
      },
      {
        title: "Coldplay Music of the Spheres World Tour",
        description:
          "Coldplay's world tour featuring their latest album and classic hits",
        venue: "DY Patil Stadium, Mumbai",
        date: new Date("2024-01-18T19:30:00+05:30"),
        category: "events",
        imageUrl: "https://picsum.photos/seed/coldplay/800/600",
        trending: true,
        sellingFast: true,
        latitude: 19.045904,
        longitude: 73.02848,
        city: "Mumbai",
      },
      {
        title: "India vs Australia Test Match",
        description: "Border-Gavaskar Trophy 2023: 1st Test Match",
        venue: "M. Chinnaswamy Stadium, Bangalore",
        date: new Date("2023-09-10T09:30:00+05:30"),
        category: "sports",
        imageUrl: "https://picsum.photos/seed/ind_aus/800/600",
        trending: false,
        sellingFast: true,
        latitude: 12.978731,
        longitude: 77.599416,
        city: "Bangalore",
      },
    ];

    // Convert to database column names
    const eventData = eventsRaw.map((event) => ({
      title: event.title,
      description: event.description,
      venue: event.venue,
      date: event.date,
      category: event.category,
      image_url: event.imageUrl,
      trending: event.trending,
      selling_fast: event.sellingFast,
      latitude: event.latitude,
      longitude: event.longitude,
      city: event.city,
    }));

    // Insert events using direct SQL
    const createdEvents = [];
    for (const event of eventData) {
      try {
        console.log(`Inserting event: ${event.title}`);
        const { rows } = await pool.query(
          `
          INSERT INTO events (
            title, description, venue, date, category, image_url,
            trending, selling_fast, latitude, longitude, city
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
          RETURNING *
        `,
          [
            event.title,
            event.description,
            event.venue,
            event.date,
            event.category,
            event.image_url,
            event.trending,
            event.selling_fast,
            event.latitude,
            event.longitude,
            event.city,
          ],
        );

        createdEvents.push(rows[0]);
      } catch (error) {
        console.error(`Error inserting event ${event.title}:`, error);
        throw error;
      }
    }
    console.log("Events created");

    // Tickets will be created by users through the P2P listing system
    console.log("Skipping dummy ticket creation - using P2P model");

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

seedData();
