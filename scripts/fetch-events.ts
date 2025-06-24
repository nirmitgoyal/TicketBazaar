import {
  fetchEventsFromInternet,
  saveEventsToDatabase,
} from "../server/event-fetcher";

async function main() {
  try {
    console.log("Fetching real events from the internet...");

    // Fetch events from various sources
    const events = await fetchEventsFromInternet();

    if (events.length === 0) {
      console.log("No events found from internet sources");
      return;
    }

    // Save events to database
    await saveEventsToDatabase(events);

    console.log(`Successfully fetched and saved ${events.length} real events`);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

main();
