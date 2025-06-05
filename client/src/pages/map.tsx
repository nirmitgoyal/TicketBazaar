import { useQuery } from "@tanstack/react-query";
import { LoadScript } from "@react-google-maps/api";
import { VenueMap } from "@/components/venue-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, IndianRupee } from "lucide-react";
import { SEOManager } from "@/components/helmet-manager";
import { OrganizationSchema } from "@/components/schema/organization-schema";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";

interface TicketEvent {
  id: number;
  sellerId: number;
  title: string;
  eventTitle: string;
  venue: string;
  venueAddress?: string;
  eventDate: string;
  category: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  price: number;
  quantity: number;
  status: string;
}

export default function MapPage() {
  const { data: events, isLoading, error } = useQuery<TicketEvent[]>({
    queryKey: ["/api/events"],
  });

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Map</CardTitle>
            <CardDescription>Unable to load venue locations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please try refreshing the page or check your internet connection.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const venuesForMap = events?.filter(event => event.latitude && event.longitude).map(event => ({
    id: event.id,
    eventTitle: event.eventTitle,
    venue: event.venue,
    venueAddress: event.venueAddress,
    latitude: event.latitude!,
    longitude: event.longitude!,
    price: event.price,
    category: event.category,
  })) || [];

  const totalEvents = events?.length || 0;
  const eventsWithLocation = venuesForMap.length;
  const categories = Array.from(new Set(events?.map(e => e.category) || []));

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<div>Loading Maps...</div>}
    >
      <div className="container mx-auto px-4 py-8">
        <SEOManager
          title="Event Map - Find Second Hand Tickets Near You | Interactive Event Map | Ticket Bazaar"
          description="Discover events and second hand tickets near you with our interactive map. Find concerts, sports events, festivals and more across India. Real-time event locations with available 2nd hand tickets."
          canonicalUrl="https://ticketbazaar.co.in/map"
          keywords="event map, events near me, ticket map, second hand tickets map, event locations, interactive map, concerts near me, sports events map, festival map, India events map"
        >
          <OrganizationSchema />
          <BreadcrumbSchema items={[
            { name: "Home", url: "/" },
            { name: "Event Map", url: "/map" }
          ]} />
        </SEOManager>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-2">
            Event Venue Map
          </h1>
          <p className="text-muted-foreground">
            Discover events happening near you with our interactive venue map
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Mapped Venues</p>
                  <p className="text-2xl font-bold">{eventsWithLocation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Price</p>
                  <p className="text-2xl font-bold">
                    ₹{Math.round((events?.reduce((sum, e) => sum + e.price, 0) || 0) / (events?.length || 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Badges */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Event Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Map Component */}
        <VenueMap venues={venuesForMap} className="mb-6" />

        {/* Event List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Browse all available events and their locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events?.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {event.eventTitle}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>

                        {event.venueAddress && (
                          <p className="line-clamp-1 pl-4">
                            {event.venueAddress}
                          </p>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg">₹{event.price}</span>
                        <Badge variant={event.status === "available" ? "default" : "secondary"}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LoadScript>
  );
}