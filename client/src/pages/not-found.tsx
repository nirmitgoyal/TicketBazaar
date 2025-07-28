import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <SEOManager
        title="Page Not Found | 404 Error - Ticket Bazaar"
        description="The page you are looking for could not be found. Browse available events and tickets on India's leading ticket marketplace - Ticket Bazaar."
        canonicalUrl="https://ticketbazaar.co.in/404"
      />
      <UnifiedSchema />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
            <p className="mt-2 text-gray-600">
              Sorry, the page you are looking for doesn't exist or has been
              moved.
            </p>
          </div>

          <div className="flex flex-col">
            <a
              href="/"
              className="w-full py-2 px-4 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
