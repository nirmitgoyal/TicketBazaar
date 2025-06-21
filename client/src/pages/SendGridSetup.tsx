import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, ExternalLink, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SendGridSetup() {
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'unverified'>('checking');

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/email-debug/connectivity');
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.status === 200 ? 'verified' : 'unverified');
      } else {
        setVerificationStatus('unverified');
      }
    } catch (error) {
      setVerificationStatus('unverified');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SendGrid Setup Required</h1>
        <p className="text-gray-600">
          Your SendGrid integration needs a verified sender identity to send emails.
        </p>
      </div>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Email delivery blocked:</strong> SendGrid requires verified sender identities before emails can be sent. 
          Follow the steps below to complete your setup.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step 1: Access SendGrid Dashboard
            </CardTitle>
            <CardDescription>
              Log in to your SendGrid account to configure sender verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to verify a sender identity in your SendGrid account before emails can be sent.
            </p>
            <a 
              href="https://app.sendgrid.com/settings/sender_auth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
            >
              Open SendGrid Sender Authentication
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Step 2: Add Sender Identity
            </CardTitle>
            <CardDescription>
              Create a verified sender identity for your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Option A: Single Sender Verification (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Create New Sender" in SendGrid dashboard</li>
                <li>Use your email: <code className="bg-gray-100 px-2 py-1 rounded">nirmitgoyal.goyal@gmail.com</code></li>
                <li>Fill in sender details (name, address, etc.)</li>
                <li>Check your email and click the verification link</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Option B: Domain Authentication (Production)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to "Authenticate Your Domain" in SendGrid</li>
                <li>Add your domain (e.g., ticketbazaar.com)</li>
                <li>Add the DNS records to your domain provider</li>
                <li>Wait for DNS propagation and verification</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 3: Test Email Functionality
            </CardTitle>
            <CardDescription>
              Verify your setup is working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              After completing sender verification, test your email functionality:
            </p>
            <div className="space-y-2">
              <Button 
                onClick={checkVerificationStatus}
                variant="outline"
                className="w-full"
              >
                Check Verification Status
              </Button>
              <a href="/email-test" className="block">
                <Button className="w-full">
                  Go to Email Test Page
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✓ Working Components</h4>
                <ul className="space-y-1 text-sm">
                  <li>• SendGrid API key configured</li>
                  <li>• Email service implementation ready</li>
                  <li>• HTML email templates created</li>
                  <li>• EU Data Residency support</li>
                  <li>• Error handling and logging</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-700">⚠ Pending Setup</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Sender identity verification</li>
                  <li>• Email delivery testing</li>
                  <li>• Production domain setup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps After Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Once you've verified your sender identity, your application will automatically start sending:
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Welcome emails for new user registrations</li>
              <li>• Contact request notifications to sellers</li>
              <li>• Ticket sale confirmations</li>
              <li>• Password reset emails</li>
              <li>• Email verification codes</li>
              <li>• Price drop alerts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}