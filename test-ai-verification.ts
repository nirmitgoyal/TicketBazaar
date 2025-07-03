#!/usr/bin/env tsx

/**
 * Test script to verify that the AI verification service lazy loading works correctly
 * This should work even without PERPLEXITY_API_KEY when NODE_ENV=test
 */

// Set test environment before importing
process.env.NODE_ENV = 'test';

// Remove PERPLEXITY_API_KEY to test fallback
delete process.env.PERPLEXITY_API_KEY;

async function testAIVerificationService() {
  console.log('Testing AI verification service lazy loading...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? 'SET' : 'NOT SET');

  try {
    // This should work without throwing an error
    const { aiVerificationService } = await import('./server/services/ai-verification.service.js');
    
    console.log('✅ AI verification service imported successfully (lazy loading worked!)');
    
    // Test verification with mock data
    const mockTicket = {
      id: 1,
      sellerId: 1,
      title: 'Test Ticket',
      eventTitle: 'Test Event',
      eventDescription: 'Test event description',
      venue: 'Test Venue',
      venueAddress: 'Test Address',
      eventDate: new Date(),
      category: 'Music',
      eventImageUrl: 'test.jpg',
      section: 'A',
      row: '10',
      seat: '5',
      seatType: 'Standard',
      price: 100,
      originalPrice: 120,
      isTransferrable: true,
      isResellable: true,
      listingType: 'individual',
      notes: 'Test notes',
      status: 'active',
      condition: 'excellent',
      deliveryMethod: 'mobile',
      paymentMethods: 'all',
      tags: 'concert',
      verificationStatus: 'pending',
      lastVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null,
      featuredUntil: null,
      viewCount: 0,
      favoriteCount: 0,
      contactCount: 0,
      priceHistory: '[]',
      availabilityStatus: 'available'
    } as any;

    const mockSeller = {
      id: 1,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      country: 'US',
      password: 'hashed',
      whatsapp: '',
      instagram: '',
      googleId: '',
      preferredContactMethod: 'email',
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      emailVerified: true,
      phoneVerified: false,
      profileCompleted: true,
      bio: 'Test bio',
      profileImageUrl: '',
      trustScore: 85,
      isVerified: true,
      verificationLevel: 'email',
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      accountStatus: 'active',
      privacySettings: '{}',
      notificationPreferences: '{}',
      accountFlags: '{}'
    } as any;
    
    const verificationResult = await aiVerificationService.verifyTicketAndSeller(mockTicket, mockSeller);
    console.log('✅ AI verification completed (mocked):', {
      isVerified: verificationResult.overall.isVerified,
      confidence: verificationResult.overall.confidence,
      fraudRisk: verificationResult.overall.fraudRisk
    });
    
    console.log('🎉 All tests passed! AI verification lazy loading and test mode work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAIVerificationService();

export {}; // Make this a module
