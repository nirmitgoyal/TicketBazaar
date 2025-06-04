import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCcw,
  Eye,
  Clock,
} from "lucide-react";
import { Ticket } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DisputeModal } from "@/components/dispute-modal";
import { SEOManager } from "@/components/helmet-manager";
import { OrganizationSchema } from "@/components/schema/organization-schema";
import { SocialShare } from "@/components/social-share";

// ViewedTicketsSection component
function ViewedTicketsSection() {
  const [, navigate] = useLocation();

  const {
    data: viewedTickets = [],
    isLoading: viewsLoading,
    error: viewsError,
  } = useQuery<any[]>({
    queryKey: ["/api/ticket-views/user"],
    enabled: true,
  });

  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "Date unavailable";
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const viewedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - viewedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (viewsLoading) {
    return <p className="text-center py-8">Loading your viewing history...</p>;
  }

  if (viewsError) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">Error loading viewing history</p>
        </CardContent>
      </Card>
    );
  }

  if (viewedTickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-textSecondary mb-2">
            You haven't viewed any tickets yet.
          </p>
          <p className="text-sm text-textSecondary mb-4">
            Start browsing events to see your viewing history here.
          </p>
          <Button className="mt-2" onClick={() => navigate("/")}>
            Browse Events
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group viewed tickets by event
  const viewedTicketsByEvent = viewedTickets.reduce((acc: any, view: any) => {
    const eventId = view.event?.id || 0;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: view.event,
        views: [],
      };
    }
    acc[eventId].views.push(view);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(viewedTicketsByEvent).map(([eventId, data]: [string, any]) => {
        const { event, views } = data;

        return (
          <Card key={eventId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {event?.title || "Unknown Event"}
              </CardTitle>
              <CardDescription>
                {event ? (
                  <>
                    {event.venue} • {formatDate(event.date)}
                  </>
                ) : (
                  "Event details not available"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {views.map((view: any) => (
                  <div key={view.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-medium">
                          {view.ticket?.section || "General"}
                          {view.ticket?.row ? ` - Row ${view.ticket.row}` : ""}
                          {view.ticket?.seat ? `, Seat ${view.ticket.seat}` : ""}
                        </p>
                        <p className="text-sm text-textSecondary mt-1">
                          {view.ticket?.quantity > 1
                            ? `${view.ticket.quantity} tickets`
                            : "1 ticket"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(view.viewedAt)}
                        </Badge>
                        {view.ticket?.status && (
                          <Badge 
                            variant={view.ticket.status === "available" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {view.ticket.status.charAt(0).toUpperCase() + view.ticket.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-textSecondary">
                        <p>Viewed on {formatDate(view.viewedAt)}</p>
                        {view.ticket?.sellerId && (
                          <p>Seller ID: #{view.ticket.sellerId}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {event && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/event/${event.id}`)}
                          >
                            View Event
                          </Button>
                        )}
                        {view.ticket?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary"
                            onClick={() => navigate(`/ticket/${view.ticket.id}`)}
                          >
                            View Ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MyTickets() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your tickets.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated]);

  // Fetch user's tickets (selling)
  const { data: myListings, isLoading: listingsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/seller/${user?.id}`],
    enabled: !!user,
  });

  // Fetch all tickets for reference (events are embedded in tickets)
  const { data: events } = useQuery<Ticket[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const getEventById = (id: number) => {
    if (!id || !events || events.length === 0) return undefined;
    return events.find((ticket) => ticket.id === id);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd MMM yyyy, h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-blue-600 bg-blue-100";
      case "sold":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "disputed":
        return "text-red-600 bg-red-100";
      case "refunded":
        return "text-slate-600 bg-slate-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "sold":
      case "pending":
        return <RefreshCcw className="h-4 w-4" />;
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Handler for removing ticket listing
  const handleRemoveListing = async (ticketId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/tickets/${ticketId}`);
      if (response.ok) {
        toast({
          title: "Success",
          description: "Ticket listing removed successfully",
        });
        // Invalidate and refetch the relevant queries
        await queryClient.invalidateQueries({ 
          queryKey: [`/api/tickets/seller/${user?.id}`] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ["/api/events"] 
        });
      } else {
        throw new Error("Failed to remove listing");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove ticket listing",
      });
    }
  };

  // Handler for viewing contact requests
  const handleViewContactRequests = (ticketId: number) => {
    // Navigate to contact requests page or open modal
    navigate(`/contact-requests/${ticketId}`);
  };

  const listedTicketsByEvent: Record<number, Ticket[]> = {};

  if (myListings) {
    // Log for debugging
    console.log("My listings:", myListings);

    myListings.forEach((ticket) => {
      // Use ticket ID as the key since we don't have eventId
      const eventId = ticket.id;

      if (!listedTicketsByEvent[eventId]) {
        listedTicketsByEvent[eventId] = [];
      }
      listedTicketsByEvent[eventId].push(ticket);
    });

    console.log("Listed tickets by event:", listedTicketsByEvent);
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOManager
        title="My Tickets | Manage Your Purchases and Listings - Ticket Bazaar"
        description="View and manage all your purchased tickets and active ticket listings in one place. Access your ticket QR codes, transaction history, and update your listings."
        canonicalUrl="https://ticketbazaar.co.in/my-tickets"
      >
        <OrganizationSchema />
      </SEOManager>
      <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">
        My Tickets
      </h1>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="listings">Tickets I'm Selling</TabsTrigger>
          <TabsTrigger value="viewed">Tickets I've Viewed</TabsTrigger>
        </TabsList>

        <TabsContent value="viewed" className="space-y-6">
          <ViewedTicketsSection />
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          {listingsLoading ? (
            <p className="text-center py-8">Loading your listings...</p>
          ) : Object.keys(listedTicketsByEvent).length > 0 ? (
            Object.entries(listedTicketsByEvent).map(([eventId, tickets]) => {
              const event = getEventById(parseInt(eventId));

              return (
                <Card key={eventId}>
                  <CardHeader>
                    <CardTitle>
                      {parseInt(eventId) === 0
                        ? "Unknown Event"
                        : event?.eventTitle || "Event"}
                    </CardTitle>
                    <CardDescription>
                      {parseInt(eventId) === 0 ? (
                        "Ticket details available below"
                      ) : event ? (
                        <>
                          {event.venue} • {formatDate(event.eventDate)}
                        </>
                      ) : (
                        "Event details not available"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-medium">
                                {ticket.section}
                                {ticket.row ? ` - Row ${ticket.row}` : ""}
                                {ticket.seat ? `, Seat ${ticket.seat}` : ""}
                              </p>
                              <p className="text-sm text-textSecondary mt-1">
                                {ticket.quantity > 1
                                  ? `${ticket.quantity} tickets`
                                  : "1 ticket"}
                              </p>
                            </div>
                            <Badge className={getStatusColor(ticket.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                {ticket.status.charAt(0).toUpperCase() +
                                  ticket.status.slice(1)}
                              </span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-textSecondary">
                                Section
                              </p>
                              <p className="font-medium">
                                {ticket.section}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-textSecondary">
                                Quantity
                              </p>
                              <p className="font-medium text-primary">
                                {ticket.quantity}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <SocialShare
                                ticket={ticket}
                                event={event}
                                variant="outline"
                              />

                              {ticket.status === "available" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500"
                                  onClick={() => handleRemoveListing(ticket.id)}
                                >
                                  Remove Listing
                                </Button>
                              )}

                              {ticket.status === "contacted" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500"
                                  onClick={() => handleViewContactRequests(ticket.id)}
                                >
                                  View Contact Requests
                                </Button>
                              )}

                              {ticket.status === "sold" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-500"
                                >
                                  Sold ✓
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-textSecondary">
                  You haven't listed any tickets for sale yet.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/list-ticket")}
                >
                  Sell Tickets
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
