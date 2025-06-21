import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Send, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: boolean | null }>({});
  const [resetEmail, setResetEmail] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, test: true }));
        toast({
          title: "Test email sent!",
          description: "Check your inbox for the test email from TicketBazaar.",
        });
      } else {
        const error = await response.json();
        setTestResults(prev => ({ ...prev, test: false }));
        toast({
          title: "Failed to send test email",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, test: false }));
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your connection.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const requestPasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, passwordReset: true }));
        toast({
          title: "Password reset email sent!",
          description: "Check your inbox for the password reset link.",
        });
      } else {
        const error = await response.json();
        setTestResults(prev => ({ ...prev, passwordReset: false }));
        toast({
          title: "Failed to send password reset",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, passwordReset: false }));
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const requestVerification = async () => {
    if (!verificationEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/verification/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verificationEmail }),
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, verification: true }));
        toast({
          title: "Verification email sent!",
          description: "Check your inbox for the verification code.",
        });
      } else {
        const error = await response.json();
        setTestResults(prev => ({ ...prev, verification: false }));
        toast({
          title: "Failed to send verification email",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, verification: false }));
      toast({
        title: "Error",
        description: "Failed to send verification email.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email System Test</h1>
        <p className="text-gray-600">
          Test the SendGrid email integration to ensure all email features are working correctly.
        </p>
      </div>

      <Alert className="mb-6">
        <Mail className="h-4 w-4" />
        <AlertDescription>
          This page allows you to test various email functionalities. Make sure you're logged in to test the authenticated email features.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Basic Test Email
              {getStatusIcon(testResults.test)}
            </CardTitle>
            <CardDescription>
              Send a simple test email to verify SendGrid integration is working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={sendTestEmail} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Requires authentication. Will send to your registered email address.
            </p>
          </CardContent>
        </Card>

        {/* Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Password Reset
              {getStatusIcon(testResults.passwordReset)}
            </CardTitle>
            <CardDescription>
              Test the password reset email functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="Enter email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={requestPasswordReset} 
              disabled={isLoading || !resetEmail}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Email Verification
              {getStatusIcon(testResults.verification)}
            </CardTitle>
            <CardDescription>
              Test the email verification functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verificationEmail">Email Address</Label>
              <Input
                id="verificationEmail"
                type="email"
                placeholder="Enter email address"
                value={verificationEmail}
                onChange={(e) => setVerificationEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={requestVerification} 
              disabled={isLoading || !verificationEmail}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Email Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Statistics
            </CardTitle>
            <CardDescription>
              View email system statistics and metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch("/api/email/stats", {
                    credentials: "include",
                  });
                  if (response.ok) {
                    const stats = await response.json();
                    toast({
                      title: "Email Statistics",
                      description: `Active reset tokens: ${stats.activeResetTokens}, Active verification codes: ${stats.activeVerificationCodes}`,
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to fetch email statistics.",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Integration Status</CardTitle>
            <CardDescription>
              Overview of SendGrid email integration features implemented:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✓ Implemented Features</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Welcome emails for new users</li>
                  <li>• Contact request notifications to sellers</li>
                  <li>• Ticket sold confirmations</li>
                  <li>• Price drop alerts</li>
                  <li>• New listing notifications</li>
                  <li>• Email verification system</li>
                  <li>• Password reset emails</li>
                  <li>• Responsive HTML email templates</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">📧 Email Types</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Transactional notifications</li>
                  <li>• Authentication emails</li>
                  <li>• Marketing communications</li>
                  <li>• System alerts</li>
                  <li>• User engagement emails</li>
                  <li>• Security notifications</li>
                  <li>• Account management emails</li>
                  <li>• Test and debugging emails</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}