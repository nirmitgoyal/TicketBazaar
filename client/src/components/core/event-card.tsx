import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Ticket } from "@shared/schema";

interface EventCardProps {
  event: Ticket;
  onClick?: () => void;
  showSellerInfo?: boolean;
}

export function EventCard({ event, onClick, showSellerInfo = false }: EventCardProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2">{event.eventTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">{event.title}</p>
          </div>
          <div className="flex gap-1 ml-2">
            {event.trending && (
              <Badge variant="destructive" className="text-xs">Trending</Badge>
            )}
            {event.sellingFast && (
              <Badge variant="secondary" className="text-xs">Selling Fast</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{event.quantity} ticket{event.quantity > 1 ? 's' : ''} available</span>
          </div>

          {event.section && (
            <div className="text-xs text-muted-foreground">
              Section: {event.section}
              {event.row && `, Row: ${event.row}`}
              {event.seat && `, Seat: ${event.seat}`}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{event.category}</Badge>
            <Badge variant="outline">{event.transferMethod}</Badge>
          </div>
          
          {showSellerInfo && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs">4.5</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}