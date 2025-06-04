import { db } from "../server/db";
import { events } from "@shared/schema";

interface EventData {
  title: string;
  description: string;
  venue: string;
  date: Date;
  category: string;
  imageUrl: string;
  city: string;
  latitude: number;
  longitude: number;
  trending: boolean;
  sellingFast: boolean;
}

const realisticEvents: EventData[] = [
  // Mumbai Events
  {
    title: "Arijit Singh Live in Concert",
    description:
      "Experience the magic of Bollywood's most beloved playback singer in an unforgettable live performance featuring his greatest hits.",
    venue: "NSCI Dome, Worli",
    date: new Date("2025-07-15T19:30:00.000Z"),
    category: "Concert",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    city: "Mumbai",
    latitude: 19.0176,
    longitude: 72.8292,
    trending: true,
    sellingFast: true,
  },
  {
    title: "Mumbai Indians vs Chennai Super Kings",
    description:
      "Catch the thrilling IPL action as Mumbai Indians take on Chennai Super Kings in this high-stakes cricket match.",
    venue: "Wankhede Stadium",
    date: new Date("2025-06-20T19:30:00.000Z"),
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    city: "Mumbai",
    latitude: 18.9388,
    longitude: 72.8258,
    trending: true,
    sellingFast: true,
  },
  {
    title: "Comedy Nights with Kapil Sharma",
    description:
      "Get ready to laugh out loud with India's favorite comedian in this special live comedy show filled with humor and entertainment.",
    venue: "Jio Garden, BKC",
    date: new Date("2025-08-10T20:00:00.000Z"),
    category: "Comedy",
    imageUrl:
      "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800",
    city: "Mumbai",
    latitude: 19.0728,
    longitude: 72.8826,
    trending: false,
    sellingFast: false,
  },

  // Delhi Events
  {
    title: "AR Rahman Musical Concert",
    description:
      "The Mozart of Madras presents his iconic compositions live with a full orchestra in this spectacular musical evening.",
    venue: "Jawaharlal Nehru Stadium",
    date: new Date("2025-07-05T19:00:00.000Z"),
    category: "Concert",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    city: "Delhi",
    latitude: 28.5833,
    longitude: 77.2342,
    trending: true,
    sellingFast: false,
  },
  {
    title: "Delhi Daredevils vs Royal Challengers",
    description:
      "Witness the electrifying IPL match between Delhi Daredevils and Royal Challengers Bangalore at the iconic Feroz Shah Kotla.",
    venue: "Feroz Shah Kotla Stadium",
    date: new Date("2025-06-25T15:30:00.000Z"),
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    city: "Delhi",
    latitude: 28.6358,
    longitude: 77.2424,
    trending: false,
    sellingFast: true,
  },
  {
    title: "TechCrunch Disrupt Delhi",
    description:
      "Join India's biggest startup and technology conference featuring leading entrepreneurs, investors, and innovators.",
    venue: "India Expo Centre, Greater Noida",
    date: new Date("2025-09-15T09:00:00.000Z"),
    category: "Conference",
    imageUrl:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    city: "Delhi",
    latitude: 28.4595,
    longitude: 77.5041,
    trending: false,
    sellingFast: false,
  },

  // Bangalore Events
  {
    title: "Sunburn Festival Bangalore",
    description:
      "India's premier electronic dance music festival featuring top international and domestic DJs for an unforgettable weekend.",
    venue: "Jayamahal Palace Grounds",
    date: new Date("2025-08-02T16:00:00.000Z"),
    category: "Festival",
    imageUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    city: "Bangalore",
    latitude: 12.9916,
    longitude: 77.5912,
    trending: true,
    sellingFast: true,
  },
  {
    title: "RCB vs KKR Cricket Match",
    description:
      "Royal Challengers Bangalore takes on Kolkata Knight Riders in this exciting IPL encounter at the M. Chinnaswamy Stadium.",
    venue: "M. Chinnaswamy Stadium",
    date: new Date("2025-06-30T19:30:00.000Z"),
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    city: "Bangalore",
    latitude: 12.9793,
    longitude: 77.5998,
    trending: false,
    sellingFast: true,
  },
  {
    title: "Bangalore Literature Festival",
    description:
      "Celebrate literature and arts with renowned authors, poets, and thinkers from around the world in this cultural extravaganza.",
    venue: "UB City Mall",
    date: new Date("2025-09-20T10:00:00.000Z"),
    category: "Conference",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    city: "Bangalore",
    latitude: 12.9721,
    longitude: 77.6101,
    trending: false,
    sellingFast: false,
  },

  // Chennai Events
  {
    title: "Ilaiyaraaja Live Concert",
    description:
      "The Maestro Ilaiyaraaja performs his timeless compositions live with a symphony orchestra in this rare musical treat.",
    venue: "Music Academy",
    date: new Date("2025-07-25T18:30:00.000Z"),
    category: "Concert",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    city: "Chennai",
    latitude: 13.0369,
    longitude: 80.2548,
    trending: true,
    sellingFast: false,
  },
  {
    title: "Chennai Super Kings vs Punjab Kings",
    description:
      "The Chennai Super Kings face off against Punjab Kings in this thrilling IPL match at the iconic M.A. Chidambaram Stadium.",
    venue: "M.A. Chidambaram Stadium",
    date: new Date("2025-06-18T19:30:00.000Z"),
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    city: "Chennai",
    latitude: 13.0646,
    longitude: 80.2796,
    trending: false,
    sellingFast: true,
  },

  // Hyderabad Events
  {
    title: "Diljit Dosanjh Live Concert",
    description:
      "Punjabi superstar Diljit Dosanjh brings his high-energy performance to Hyderabad with his biggest hits and new tracks.",
    venue: "Hitex Exhibition Centre",
    date: new Date("2025-08-20T19:00:00.000Z"),
    category: "Concert",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    city: "Hyderabad",
    latitude: 17.4399,
    longitude: 78.4983,
    trending: true,
    sellingFast: true,
  },
  {
    title: "SRH vs GT IPL Match",
    description:
      "Sunrisers Hyderabad takes on Gujarat Titans in this exciting IPL clash at the Rajiv Gandhi International Stadium.",
    venue: "Rajiv Gandhi International Stadium",
    date: new Date("2025-06-28T15:30:00.000Z"),
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    city: "Hyderabad",
    latitude: 17.4036,
    longitude: 78.35,
    trending: false,
    sellingFast: false,
  },

  // Pune Events
  {
    title: "Zakir Khan Comedy Show",
    description:
      "India's beloved stand-up comedian Zakir Khan presents his latest comedy special filled with relatable humor and storytelling.",
    venue: "Pune International Centre",
    date: new Date("2025-08-05T20:00:00.000Z"),
    category: "Comedy",
    imageUrl:
      "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800",
    city: "Pune",
    latitude: 18.5308,
    longitude: 73.8264,
    trending: false,
    sellingFast: false,
  },
  {
    title: "NH7 Weekender Pune",
    description:
      "India's premier multi-genre music festival featuring rock, electronic, folk, and indie artists from across the globe.",
    venue: "Oxford Golf Resort",
    date: new Date("2025-09-01T14:00:00.000Z"),
    category: "Festival",
    imageUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    city: "Pune",
    latitude: 18.4386,
    longitude: 73.9221,
    trending: true,
    sellingFast: false,
  },

  // Kolkata Events
  {
    title: "Sonu Nigam Live in Concert",
    description:
      "The legendary playback singer Sonu Nigam performs his greatest hits in this melodious evening of Indian classical and contemporary music.",
    venue: "Netaji Indoor Stadium",
    date: new Date("2025-07-12T19:00:00.000Z"),
    category: "Concert",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    city: "Kolkata",
    latitude: 22.5646,
    longitude: 88.3433,
    trending: false,
    sellingFast: false,
  },
  {
    title: "KKR vs LSG Cricket Match",
    description:
      "Kolkata Knight Riders battles Lucknow Super Giants in this thrilling IPL encounter at the historic Eden Gardens.",
    venue: "Eden Gardens",
    date: new Date("2025-06-22T19:30:00.000Z"),
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    city: "Kolkata",
    latitude: 22.5648,
    longitude: 88.3434,
    trending: false,
    sellingFast: true,
  },
];

async function seedRealisticEvents() {
  try {
    console.log("Seeding realistic events...");

    for (const eventData of realisticEvents) {
      await db.insert(events).values(eventData);
    }

    console.log(
      `Successfully seeded ${realisticEvents.length} realistic events`,
    );
  } catch (error) {
    console.error("Error seeding events:", error);
    throw error;
  }
}

seedRealisticEvents();
