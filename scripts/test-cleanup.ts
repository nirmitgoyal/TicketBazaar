import { storage } from "../server/storage";
import { db } from "../server/db";

/**
 * Test script to demonstrate the expired tickets cleanup functionality
 */
async function testCleanup() {
  try {
    console.log("🧹 Testing expired tickets cleanup functionality...");
    
    // Get current ticket count
    const allTickets = await storage.getAllEvents();
    console.log(`📊 Current tickets in database: ${allTickets.length}`);
    
    // Show tickets with their event dates
    console.log("\n📅 Current tickets and their event dates:");
    allTickets.forEach(ticket => {
      const eventDate = new Date(ticket.eventDate);
      const isExpired = eventDate < new Date();
      console.log(`- ID: ${ticket.id}, Event: ${ticket.eventTitle}, Date: ${eventDate.toDateString()}, ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
    });
    
    // Run cleanup
    console.log("\n🧹 Running cleanup of expired tickets...");
    const deletedCount = await storage.deleteExpiredTickets();
    
    if (deletedCount > 0) {
      console.log(`✅ Successfully deleted ${deletedCount} expired tickets`);
    } else {
      console.log("ℹ️  No expired tickets found to delete");
    }
    
    // Get updated ticket count
    const remainingTickets = await storage.getAllEvents();
    console.log(`📊 Remaining tickets in database: ${remainingTickets.length}`);
    
    console.log("\n✨ Cleanup test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during cleanup test:", error);
  } finally {
    process.exit(0);
  }
}

testCleanup();