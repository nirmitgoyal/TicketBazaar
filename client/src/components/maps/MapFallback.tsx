import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";

interface MapFallbackProps {
  venues: Array<{
    id: number;
    eventTitle: string;
    venue: string;
    venueAddress?: string;
    category: string;
  }>;
  className?: string;
}

export function MapFallback({ venues, className = "" }: MapFallbackProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Venue Locations ({venues.length} venues)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Interactive map requires Google Maps API configuration
          </p>
          <div className="space-y-3">
            {venues.slice(0, 5).map((venue) => (
              <div key={venue.id} className="text-left bg-white p-3 rounded border">
                <div className="font-medium text-sm">{venue.eventTitle}</div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {venue.venue}
                </div>
                {venue.venueAddress && (
                  <div className="text-xs text-gray-500 mt-1">{venue.venueAddress}</div>
                )}
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-2">
                  {venue.category}
                </div>
              </div>
            ))}
            {venues.length > 5 && (
              <div className="text-xs text-gray-500">
                +{venues.length - 5} more venues available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}