import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Ticket } from "@shared/schema";
import { format } from "date-fns";

export default function MyTickets() {
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/seller/${user?.id}`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">Manage your listed tickets</p>
        </div>
        <Link href="/list-ticket">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            List New Ticket
          </Button>
        </Link>
      </div>

      {tickets && tickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't listed any tickets yet.</p>
            <Link href="/list-ticket">
              <Button>List Your First Ticket</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets?.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">{ticket.category}</Badge>
                <Badge 
                  variant={ticket.status === "available" ? "default" : "secondary"}
                >
                  {ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{ticket.eventTitle}</p>
                <p className="text-sm text-muted-foreground">{ticket.venue}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(ticket.eventDate), "PPP 'at' p")}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">₹{ticket.price}</p>
                <p className="text-sm text-muted-foreground">Qty: {ticket.quantity}</p>
              </div>
              <div>
                <p className="text-sm">
                  Section: {ticket.section}
                  {ticket.row && `, Row: ${ticket.row}`}
                  {ticket.seat && `, Seat: ${ticket.seat}`}
                </p>
              </div>
              {ticket.additionalInfo && (
                <p className="text-sm text-muted-foreground">
                  {ticket.additionalInfo}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}