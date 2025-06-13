import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/core/search-bar";
import { EventCard } from "@/components/core/event-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, TrendingUp } from "lucide-react";
import type { Ticket } from "@shared/schema";

const CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "concerts", label: "Concerts" },
  { id: "sports", label: "Sports" },
  { id: "theater", label: "Theater" },
  { id: "comedy", label: "Comedy" },
  { id: "festivals", label: "Festivals" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: events = [], isLoading, error } = useQuery<Ticket[]>({
    queryKey: ["/api/events"],
  });

  const { data: trendingEvents = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/events/trending"],
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch = !searchQuery || 
      event.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || event.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEventClick = (event: Ticket) => {
    // Navigate to event details or open modal
    console.log("Event clicked:", event.id);
  };

  if (error) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertDescription>
          Unable to load events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">Find Your Perfect Tickets</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover amazing events and connect directly with trusted sellers in your area
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Trending Section */}
      {trendingEvents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-500" />
            <h2 className="text-2xl font-semibold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingEvents.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-6 w-full max-w-2xl mx-auto">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || activeCategory !== "all" 
                  ? "No events found matching your criteria" 
                  : "No events available"}
              </p>
              {(searchQuery || activeCategory !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                {searchQuery && (
                  <Badge variant="secondary">
                    Searching: "{searchQuery}"
                  </Badge>
                )}
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    showSellerInfo
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h3 className="text-2xl font-semibold mb-4">Have tickets to sell?</h3>
        <p className="text-muted-foreground mb-6">
          List your tickets and connect with buyers in your area
        </p>
        <Button size="lg">
          Sell Your Tickets
        </Button>
      </section>
    </div>
  );
}