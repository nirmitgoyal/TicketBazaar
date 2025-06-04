
import { db } from "../server/db";
import { users } from "@shared/schema";
import { hash } from "bcrypt";

interface UserData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  rating: number;
  ratingsCount: number;
  preferredContactMethod: string;
}

const userData: UserData[] = [
  {
    username: "musiclover_raj",
    password: "password123",
    fullName: "Raj Patel",
    email: "raj.patel@gmail.com",
    phone: "9876543210",
    whatsapp: "919876543210",
    instagram: "raj_musiclover",
    rating: 4.8,
    ratingsCount: 25,
    preferredContactMethod: "whatsapp",
  },
  {
    username: "sportsticket_priya",
    password: "password123",
    fullName: "Priya Sharma",
    email: "priya.sharma@yahoo.com",
    phone: "9876543211",
    whatsapp: "919876543211",
    instagram: "priya_sportstickets",
    rating: 4.6,
    ratingsCount: 18,
    preferredContactMethod: "phone",
  },
  {
    username: "event_enthusiast_amit",
    password: "password123",
    fullName: "Amit Kumar",
    email: "amit.kumar@outlook.com",
    phone: "9876543212",
    whatsapp: "919876543212",
    instagram: "amit_eventlife",
    rating: 4.3,
    ratingsCount: 12,
    preferredContactMethod: "whatsapp",
  },
  {
    username: "concert_dealer_kavya",
    password: "password123",
    fullName: "Kavya Singh",
    email: "kavya.singh@gmail.com",
    phone: "9876543213",
    whatsapp: "919876543213",
    instagram: "kavya_concerts",
    rating: 4.9,
    ratingsCount: 42,
    preferredContactMethod: "whatsapp",
  },
  {
    username: "bollywood_fan_rohit",
    password: "password123",
    fullName: "Rohit Mehta",
    email: "rohit.mehta@rediffmail.com",
    phone: "9876543214",
    whatsapp: "919876543214",
    instagram: "rohit_bollywoodfan",
    rating: 4.2,
    ratingsCount: 8,
    preferredContactMethod: "phone",
  },
];

async function getOrCreateUser(userData: UserData) {
  try {
    // Check if user exists by email
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUsers.length > 0) {
      console.log(`User ${userData.email} already exists, skipping creation`);
      return existingUsers[0];
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 10);

    // Create user
    const newUsers = await db
      .insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        whatsapp: userData.whatsapp,
        instagram: userData.instagram,
        rating: userData.rating,
        ratingsCount: userData.ratingsCount,
        preferredContactMethod: userData.preferredContactMethod,
      })
      .returning();

    console.log(`Created user: ${userData.fullName} (${userData.email})`);
    return newUsers[0];
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error);
    throw error;
  }
}

async function seedUsers() {
  try {
    console.log("Seeding users...");

    const createdUsers = [];
    for (const user of userData) {
      const createdUser = await getOrCreateUser(user);
      createdUsers.push(createdUser);
    }

    console.log(`Successfully seeded ${createdUsers.length} users`);
    console.log("User details:");
    createdUsers.forEach((user) => {
      console.log(`- ${user.fullName} (@${user.username}) - Rating: ${user.rating}/5.0`);
    });

  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

seedUsers();
