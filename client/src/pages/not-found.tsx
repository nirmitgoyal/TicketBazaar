import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { UnifiedSEO } from "@/components/unified-seo-component";
import { UnifiedSchema } from "@/components/schema/unified-schema";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <UnifiedSEO
        title="Page Not Found | 404 Error - Ticket Bazaar"
        description="The page you are looking for could not be found. Browse available events and tickets on India's leading ticket marketplace - Ticket Bazaar."
        canonical="https://ticketbazaar.co.in/404"
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

          <div className="flex flex-col space-y-4">
            <a
              href="/"
              className="w-full py-2 px-4 bg-primary text-white rounded-md text-center hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </a>
            <a
              href="/events/map"
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-center hover:bg-gray-50 transition-colors"
            >
              Explore Events Map
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
