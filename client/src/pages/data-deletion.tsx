import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, User, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/seo";

interface DeletionInstructions {
  title: string;
  description: string;
  instructions: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  dataTypes: string[];
  retention: string;
  contact: {
    email: string;
    description: string;
  };
}

export default function DataDeletion() {
  // Get deletion instructions from the API
  const { data: instructions, isLoading } = useQuery<DeletionInstructions>({
    queryKey: ["/api/data-privacy/deletion-instructions"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Data Deletion Instructions - Ticket Bazaar"
        description="Learn how to request deletion of your personal data from Ticket Bazaar. Complete guide for account and data removal."
        keywords="data deletion, privacy, account deletion, GDPR, data protection, user rights"
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
            {instructions?.title || "Data Deletion Instructions"}
          </h1>
          <p className="text-lg text-textSecondary">
            {instructions?.description || "How to request deletion of your personal data from Ticket Bazaar"}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                How to Delete Your Account and Data
              </CardTitle>
              <CardDescription>
                Follow these steps to permanently remove your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {instructions?.instructions?.map((step: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-textSecondary text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <Link href="/profile">
                  <Button size="lg" className="mb-4">
                    <User className="h-4 w-4 mr-2" />
                    Go to My Account
                  </Button>
                </Link>
                <p className="text-sm text-textSecondary">
                  You must be signed in to delete your account
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Types Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                What Data Will Be Deleted
              </CardTitle>
              <CardDescription>
                The following information will be permanently removed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {instructions?.dataTypes?.map((dataType: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{dataType}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> {instructions?.retention || "Data is deleted immediately upon confirmation. This action cannot be undone."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Need Help?
              </CardTitle>
              <CardDescription>
                Contact our privacy team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Privacy Support</h4>
                  <p className="text-sm text-textSecondary mb-3">
                    {instructions?.contact?.description || "For questions about data deletion or if you need assistance, contact our privacy team"}
                  </p>
                  <a 
                    href={`mailto:${instructions?.contact?.email || 'privacy@ticketbazaar.co.in'}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {instructions?.contact?.email || 'privacy@ticketbazaar.co.in'}
                  </a>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Additional Resources</h4>
                  <div className="space-y-2">
                    <Link href="/privacy-policy">
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Privacy Policy
                      </Button>
                    </Link>
                    <br />
                    <Link href="/terms-of-service">
                      <Button variant="link" className="p-0 h-auto text-sm">
                        Terms of Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Methods Card */}
          <Card>
            <CardHeader>
              <CardTitle>Alternative Deletion Methods</CardTitle>
              <CardDescription>
                Other ways to request data deletion if you can't access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Request</h4>
                  <p className="text-sm text-textSecondary mb-2">
                    Send an email to our privacy team with the following information:
                  </p>
                  <ul className="text-sm text-textSecondary list-disc list-inside space-y-1">
                    <li>Your full name as registered on the account</li>
                    <li>Email address associated with your account</li>
                    <li>Phone number (if provided during registration)</li>
                    <li>Subject line: "Data Deletion Request"</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> For security purposes, we may require additional verification 
                    before processing deletion requests made via email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}