import React from "react";
import { Event } from "@shared/schema";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SimpleMapProps {
  events: Event[];
  onViewportChange?: (bounds: any) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ events, onViewportChange }) => {
  // Group events by city for better organization
  const eventsByCity = events.reduce((acc, event) => {
    const city = event.city || "Unknown Location";
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const cities = Object.keys(eventsByCity).sort();

  return (
    <div className="h-[600px] overflow-y-auto space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Event Locations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Explore events across {cities.length} cities in India
        </p>
      </div>

      {cities.map((city) => (
        <Card key={city} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-4 w-4 text-primary" />
              {city}
              <Badge variant="secondary" className="ml-auto">
                {eventsByCity[city].length} event{eventsByCity[city].length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsByCity[city].slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {event.eventTitle}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <span className="text-sm font-semibold text-primary">
                      ₹{event.price}
                    </span>
                  </div>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button size="sm" variant="outline" className="flex-shrink-0">
                    View
                  </Button>
                </Link>
              </div>
            ))}
            {eventsByCity[city].length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View {eventsByCity[city].length - 3} more events in {city}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {cities.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Events Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search filters to find events.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;