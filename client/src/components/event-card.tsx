import { Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@shared/schema";

interface EventCardProps {
  event: Ticket;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/event/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{event.eventTitle}</CardTitle>
            <Badge variant="secondary">{event.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.eventDate), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">₹{event.price}</p>
            <Badge variant={event.status === "available" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
          {event.eventDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.eventDescription}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}