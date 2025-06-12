import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import EventMap from "@/components/ui/google-map";
import { Event } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Search,
  MapPin,
  Calendar,
  Tag,
  Navigation,
  Locate,
  Home,
  ArrowLeft,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import SEO from "@/components/seo";
import { UnifiedSchema } from "@/components/schema/unified-schema";

const EventMapPage: React.FC = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(
    null,
  );

  // Function to navigate back to homepage using our special transition route
  const navigateToHome = () => {
    // Use setLocation for a proper route transition through our special route
    setLocation("/map-to-home");
  };

  // Fetch all events
  const {
    data: events,
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Handle map bounds change
  const handleViewportChange = (bounds: google.maps.LatLngBounds | null) => {
    setMapBounds(bounds);
  };

  // Initial load processing
  useEffect(() => {
    if (events && events.length > 0 && initialLoad) {
      // Keep using all cities as the default (set in useState above)
      setInitialLoad(false);
    }
  }, [events, initialLoad]);

  // Filter events based on search query, category, city and map bounds
  useEffect(() => {
    if (!events) return;

    console.log("Filtering events with params:", {
      searchQuery,
      category,
      city,
    });
    let filtered = [...events];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(query) ||
          (event.eventDescription &&
            event.eventDescription.toLowerCase().includes(query)) ||
          event.venue.toLowerCase().includes(query),
      );
    }

    // Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter((event) => event.category === category);
    }

    // Filter by city
    if (city && city !== "all") {
      const cityLower = city.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          (event.city && event.city.toLowerCase() === cityLower) ||
          (event.venue && event.venue.toLowerCase().includes(cityLower)),
      );
    }

    // Filter by map bounds
    if (mapBounds && filtered.length > 0) {
      filtered = filtered.filter((event) => {
        if (!event.latitude || !event.longitude) return false;

        const eventLatLng = new google.maps.LatLng(
          event.latitude,
          event.longitude,
        );
        return mapBounds.contains(eventLatLng);
      });
    }

    console.log(`Filtered to ${filtered.length} events`);
    setVisibleEvents(filtered);
  }, [events, searchQuery, category, city, mapBounds]);

  // Extract unique categories and cities from events
  const categories = events
    ? events
        .map((event) => event.category)
        .filter((category, index, self) => self.indexOf(category) === index)
        .sort()
    : [];

  const cities = events
    ? events
        .filter((e) => e.city)
        .map((event) => event.city!)
        .filter((city, index, self) => self.indexOf(city) === index)
        .sort()
    : [];

  if (error) {
    toast({
      title: "Error loading events",
      description: "Could not load event data. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto p-4">
      <SEO
        title="Events Near You on Map | Find Local Tickets - Ticket Bazaar"
        description="Discover upcoming events near you on our interactive map. Find and buy verified tickets for concerts, sports events, and festivals across India with secure transactions and escrow protection."
        canonicalUrl="https://ticketbazaar.co.in/events/map"
      />
      <OrganizationSchema />

      {/* Added back to home button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={navigateToHome}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Homepage</span>
        </Button>
        <h1 className="text-3xl font-bold text-center">Events Near You</h1>
        <div className="w-[120px]"></div> {/* Empty div for balance */}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map and Events List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <EventMap
              events={visibleEvents}
              onViewportChange={handleViewportChange}
            />
          )}
        </div>

        {/* Events List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <h2 className="text-xl font-semibold sticky top-0 bg-background p-2 z-10">
            {visibleEvents.length} Events Found
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events found matching your criteria.
            </div>
          ) : (
            visibleEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <Link href={`/events/${event.id}`} className="block">
                    <h3 className="font-semibold text-lg hover:text-primary">
                      {event.title}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.venue}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{event.category}</span>
                    </div>

                    <Button variant="outline" className="w-full mt-3">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMapPage;
