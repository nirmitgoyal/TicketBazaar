#!/usr/bin/env tsx

/**
 * Test script to verify that the email service lazy loading works correctly
 * This should work even without SENDGRID_API_KEY when NODE_ENV=test
 */

// Set test environment before importing
process.env.NODE_ENV = 'test';

// Remove SENDGRID_API_KEY to test fallback
delete process.env.SENDGRID_API_KEY;

async function testEmailService() {
  console.log('Testing email service lazy loading...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');

  try {
    // This should work without throwing an error
    const { emailService } = await import('./server/services/email.service.js');
    
    console.log('✅ Email service imported successfully (lazy loading worked!)');
    
    // Test getting data residency info (should trigger lazy initialization)
    const residencyInfo = emailService.getDataResidencyInfo();
    console.log('✅ Data residency info retrieved:', residencyInfo);
    
    // Test sending an email (should use mock in test mode)
    const emailSent = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email in test mode</p>',
      text: 'This is a test email in test mode'
    });
    
    console.log('✅ Email sent (mocked):', emailSent);
    console.log('🎉 All tests passed! Lazy loading and test mode work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testEmailService();

export {}; // Make this a module
