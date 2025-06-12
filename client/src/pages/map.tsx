import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadScript } from "@react-google-maps/api";
import { VenueMap } from "@/components/venue-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Calendar, Users, Search, Navigation, Filter, Locate } from "lucide-react";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";
import { useToast } from "@/hooks/use-toast";

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
  distance?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface LocationFilters {
  searchQuery: string;
  category: string;
  radius: number;
  sortBy: string;
  userLocation: UserLocation | null;
}

export default function MapPage() {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [filters, setFilters] = useState<LocationFilters>({
    searchQuery: "",
    category: "all",
    radius: 50, // kilometers
    sortBy: "distance",
    userLocation: null
  });

  const { data: events, isLoading, error } = useQuery<TicketEvent[]>({
    queryKey: ["/api/events"],
  });

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo";

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setFilters(prev => ({ ...prev, userLocation: location }));
        setIsLoadingLocation(false);
        toast({
          title: "Location detected",
          description: "Found your location! Events are now sorted by distance."
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        let message = "Unable to get your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [toast]);

  // Filter and sort events based on location and filters
  const filteredEvents = useCallback(() => {
    if (!events) return [];

    let filtered = events.filter(event => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          event.eventTitle.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.city?.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all" && event.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // Location filter - only include events with coordinates
      if (!event.latitude || !event.longitude) return false;

      // Distance filter (if user location is available)
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          event.latitude, event.longitude
        );
        
        if (distance > filters.radius) return false;
        
        // Add distance to event object
        const updatedEvent = { ...event, distance: Math.round(distance * 10) / 10 }; // Round to 1 decimal
        return updatedEvent;
      }

      return { ...event };
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "distance":
          if (!userLocation || !a.distance || !b.distance) return 0;
          return a.distance - b.distance;
        case "date":
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case "price":
          return a.price - b.price;
        case "name":
          return a.eventTitle.localeCompare(b.eventTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, filters, userLocation, calculateDistance]);

  const processedEvents = useMemo(() => filteredEvents(), [filteredEvents]);

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

  const venuesForMap = processedEvents.map(event => ({
    id: event.id,
    eventTitle: event.eventTitle,
    venue: event.venue,
    venueAddress: event.venueAddress,
    latitude: event.latitude!,
    longitude: event.longitude!,
    category: event.category,
    distance: event.distance,
    price: event.price,
    status: event.status
  }));

  const totalEvents = events?.length || 0;
  const eventsWithLocation = processedEvents.length;
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
            Event Map
          </h1>
          <p className="text-muted-foreground">
            Discover events happening near you with our interactive venue map
          </p>
        </div>

        {/* Location-based Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Location-Based Discovery
            </CardTitle>
            <CardDescription>
              Find events near you with advanced location filtering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Detection */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button 
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="flex items-center gap-2"
                variant={userLocation ? "secondary" : "default"}
              >
                {isLoadingLocation ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Detecting Location...
                  </>
                ) : userLocation ? (
                  <>
                    <Navigation className="h-4 w-4" />
                    Location Detected
                  </>
                ) : (
                  <>
                    <Locate className="h-4 w-4" />
                    Use My Location
                  </>
                )}
              </Button>
              
              {userLocation && (
                <div className="text-sm text-muted-foreground">
                  Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Query */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Event, venue, or city..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Distance Radius */}
              <div className="space-y-2">
                <Label htmlFor="radius">
                  Radius: {filters.radius}km
                  {!userLocation && <span className="text-muted-foreground text-xs"> (enable location)</span>}
                </Label>
                <Slider
                  id="radius"
                  min={5}
                  max={200}
                  step={5}
                  value={[filters.radius]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value[0] }))}
                  disabled={!userLocation}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.searchQuery || filters.category !== "all" || userLocation) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {filters.searchQuery && (
                  <Badge variant="secondary">
                    Search: {filters.searchQuery}
                  </Badge>
                )}
                {filters.category !== "all" && (
                  <Badge variant="secondary">
                    Category: {filters.category}
                  </Badge>
                )}
                {userLocation && (
                  <Badge variant="secondary">
                    Within {filters.radius}km of your location
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Tickets</p>
                  <p className="text-2xl font-bold">
                    {events?.reduce((sum, e) => sum + e.quantity, 0) || 0}
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
            <CardTitle className="flex items-center justify-between">
              <span>Nearby Events</span>
              <Badge variant="outline">{processedEvents.length} events found</Badge>
            </CardTitle>
            <CardDescription>
              {userLocation 
                ? `Events within ${filters.radius}km of your location, sorted by ${filters.sortBy}`
                : "Enable location to see distance-based results"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {event.eventTitle}
                          </h3>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {event.category}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>

                          {(event.city || event.venueAddress) && (
                            <p className="line-clamp-1 pl-4">
                              {event.venueAddress ? `${event.venueAddress}, ` : ""}
                              {event.city}
                            </p>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                          </div>

                          {event.distance && (
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium text-primary">
                                {event.distance}km away
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="text-sm font-medium">
                            ₹{event.price.toLocaleString()}
                          </div>
                          <Badge 
                            variant={event.status === "available" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  {userLocation 
                    ? `No events found within ${filters.radius}km of your location. Try increasing the radius or adjusting your filters.`
                    : "Enable location services to discover events near you, or try adjusting your search filters."
                  }
                </p>
                {userLocation && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters(prev => ({ ...prev, radius: Math.min(prev.radius * 2, 200) }))}
                  >
                    Increase Radius to {Math.min(filters.radius * 2, 200)}km
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LoadScript>
  );
}