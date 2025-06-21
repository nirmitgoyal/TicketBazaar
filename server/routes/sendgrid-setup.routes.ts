import { Router, Request, Response } from 'express';
import sgMail from '@sendgrid/mail';

const router = Router();

// Test different sender addresses to find working ones
router.post('/test-senders', async (req: Request, res: Response) => {
  const { testEmail } = req.body;
  
  if (!testEmail) {
    return res.status(400).json({ error: 'Test email address required' });
  }

  const testSenders = [
    testEmail, // User's own email
    'noreply@ticketbazaar.com',
    'admin@ticketbazaar.com',
    'notifications@ticketbazaar.com'
  ];

  const results = [];

  for (const sender of testSenders) {
    try {
      console.log(`Testing sender: ${sender}`);
      
      const msg = {
        to: testEmail,
        from: sender,
        subject: `Sender Test: ${sender}`,
        text: `This is a test from ${sender} to verify sender identity.`,
        html: `<p>This is a test from <strong>${sender}</strong> to verify sender identity.</p>`
      };

      await sgMail.send(msg);
      
      results.push({
        sender,
        status: 'success',
        message: 'Email sent successfully'
      });
      
      console.log(`✓ Success with sender: ${sender}`);
      
    } catch (error: any) {
      const errorMessage = error.response?.body?.errors?.[0]?.message || error.message;
      
      results.push({
        sender,
        status: 'failed',
        message: errorMessage
      });
      
      console.log(`✗ Failed with sender ${sender}: ${errorMessage}`);
    }
  }

  res.json({ results });
});

// Get detailed error information for troubleshooting
router.get('/error-details', async (req: Request, res: Response) => {
  try {
    // Test with a simple email to get detailed error info
    const msg = {
      to: 'nirmitgoyal.goyal@gmail.com',
      from: 'nirmitgoyal.goyal@gmail.com',
      subject: 'Diagnostic Test',
      text: 'Testing SendGrid configuration'
    };

    await sgMail.send(msg);
    res.json({ status: 'success', message: 'Email sent successfully' });
    
  } catch (error: any) {
    const errorDetails = {
      statusCode: error.code || error.response?.status,
      message: error.message,
      response: error.response?.body,
      headers: error.response?.headers
    };
    
    res.json({ 
      status: 'error', 
      details: errorDetails,
      troubleshooting: {
        commonCauses: [
          'Sender identity not verified in SendGrid',
          'Domain authentication required',
          'API key permissions insufficient',
          'Account suspended or restricted'
        ],
        nextSteps: [
          'Verify sender identity at https://app.sendgrid.com/settings/sender_auth',
          'Check domain authentication status',
          'Ensure API key has mail sending permissions',
          'Contact SendGrid support if issues persist'
        ]
      }
    });
  }
});

// Check if specific email address is verified
router.post('/check-sender', async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const msg = {
      to: email,
      from: email,
      subject: 'Sender Verification Check',
      text: 'If you receive this email, the sender is verified.'
    };

    await sgMail.send(msg);
    res.json({ verified: true, message: 'Sender appears to be verified' });
    
  } catch (error: any) {
    const isVerificationError = error.response?.body?.errors?.some((err: any) => 
      err.message?.includes('verified Sender Identity')
    );
    
    res.json({ 
      verified: false, 
      isVerificationError,
      message: error.response?.body?.errors?.[0]?.message || error.message
    });
  }
});

export default router;