import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { z } from "zod";
import { insertReferralSchema, insertCreditTransactionSchema } from "@shared/schema";

const router = Router();

// Generate or get user's referral code
router.get("/my-code", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    let user = await storage.getUser(userId);
    
    if (!user?.referralCode) {
      const referralCode = await storage.generateReferralCode(userId);
      user = await storage.getUser(userId); // Refresh user data
    }
    
    res.json({ referralCode: user?.referralCode });
  } catch (error) {
    console.error("Error getting referral code:", error);
    res.status(500).json({ message: "Failed to get referral code" });
  }
});

// Get user's referral statistics
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const referrals = await storage.getUserReferrals(userId);
    
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      rewardedReferrals: referrals.filter(r => r.status === 'rewarded').length,
      totalEarnings: referrals
        .filter(r => r.status === 'rewarded')
        .length * 50, // ₹50 per successful referral
    };
    
    res.json({ stats, referrals });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ message: "Failed to get referral statistics" });
  }
});

// Apply referral code during registration
router.post("/apply-code", async (req, res) => {
  try {
    const { referralCode, refereeId } = req.body;
    
    if (!referralCode || !refereeId) {
      return res.status(400).json({ message: "Referral code and referee ID are required" });
    }
    
    // Find the referrer by their referral code
    const referrer = await storage.getUserByEmail(''); // We need to find by referral code
    // Actually, let's query the users table directly for referral code
    
    // For now, let's create a method to find user by referral code
    const users = await storage.getAllEvents(); // This is wrong, we need a proper method
    
    // Let me implement this properly in the storage
    res.status(500).json({ message: "Method needs implementation" });
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({ message: "Failed to apply referral code" });
  }
});

// Get user's credit balance
router.get("/credits", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const credits = await storage.getUserCredits(userId);
    res.json({ credits });
  } catch (error) {
    console.error("Error getting credits:", error);
    res.status(500).json({ message: "Failed to get credits" });
  }
});

// Get user's credit transaction history
router.get("/credits/history", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const transactions = await storage.getCreditTransactions(userId);
    res.json({ transactions });
  } catch (error) {
    console.error("Error getting credit history:", error);
    res.status(500).json({ message: "Failed to get credit history" });
  }
});

// Use credits for ticket purchase discount
router.post("/credits/use", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { amount, ticketId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }
    
    const transaction = await storage.deductCredits(
      userId,
      amount,
      'credit_redemption',
      `Used credits for ticket purchase${ticketId ? ` (Ticket #${ticketId})` : ''}`,
      ticketId
    );
    
    res.json({ 
      message: "Credits used successfully",
      transaction,
      remainingCredits: await storage.getUserCredits(userId)
    });
  } catch (error) {
    console.error("Error using credits:", error);
    if (error.message === 'Insufficient credits') {
      res.status(400).json({ message: "Insufficient credits" });
    } else {
      res.status(500).json({ message: "Failed to use credits" });
    }
  }
});

export default router;