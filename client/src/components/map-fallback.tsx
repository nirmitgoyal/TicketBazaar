import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Navigation, AlertTriangle } from "lucide-react";

interface Venue {
  id: number;
  eventTitle: string;
  venue: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  category: string;
  distance?: number;
  price?: number;
  status?: string;
}

interface MapFallbackProps {
  venues: Venue[];
  className?: string;
  error?: string;
}

export function MapFallback({ venues, className = "", error }: MapFallbackProps) {
  const venuesWithCoordinates = venues.filter(
    (venue) => venue.latitude && venue.longitude
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Map Unavailable - Event List View
        </CardTitle>
        <CardDescription>
          {error ? (
            <span className="text-red-600">Map Error: {error}</span>
          ) : (
            "The interactive map is temporarily unavailable. Here are the events in list format."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {venuesWithCoordinates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No venue locations available
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Showing {venuesWithCoordinates.length} events with location data
            </div>
            
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {venuesWithCoordinates.map((venue) => (
                <Card key={venue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {venue.eventTitle}
                        </h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {venue.category}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{venue.venue}</span>
                        </div>

                        {venue.venueAddress && (
                          <p className="line-clamp-1 pl-4 text-gray-500">
                            {venue.venueAddress}
                          </p>
                        )}

                        {venue.latitude && venue.longitude && (
                          <div className="flex items-center gap-1 pl-4">
                            <Navigation className="h-3 w-3 flex-shrink-0" />
                            <span className="text-gray-500">
                              {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}

                        {venue.distance && (
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium text-primary">
                              {venue.distance}km away
                            </span>
                          </div>
                        )}
                      </div>

                      {venue.status && (
                        <div className="flex justify-end items-center pt-2 border-t">
                          <Badge 
                            variant={venue.status === "available" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {venue.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}