import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "@shared/schema";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/event/${eventId}`],
    enabled: !isNaN(eventId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found or no tickets available.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const event = tickets[0]; // Use first ticket as event reference

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{event.eventTitle}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{format(new Date(event.eventDate), "PPP 'at' p")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{event.venue}</span>
              </div>
              <div>
                <Badge variant="secondary">{event.category}</Badge>
              </div>
              <p className="text-muted-foreground">{event.eventDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Tickets ({tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Section: {ticket.section}
                          {ticket.row && `, Row: ${ticket.row}`}
                          {ticket.seat && `, Seat: ${ticket.seat}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {ticket.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{ticket.price}</p>
                        <Badge 
                          variant={ticket.status === "available" ? "default" : "secondary"}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    {ticket.additionalInfo && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {ticket.additionalInfo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Tickets:</span>
                <span>{tickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Range:</span>
                <span>
                  ₹{Math.min(...tickets.map(t => t.price))} - 
                  ₹{Math.max(...tickets.map(t => t.price))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span>{tickets.filter(t => t.status === "available").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}