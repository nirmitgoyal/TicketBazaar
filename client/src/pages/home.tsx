import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SearchBar, SearchFilters } from "@/components/search-bar";
import { FilterDropdown, FilterValues } from "@/components/filter-dropdown";
import { TicketCard } from "@/components/ticket-card";
import { EventCard } from "@/components/event-card";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Ticket } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SEOManager } from "@/components/helmet-manager";

export default function Home() {
  const [location] = useLocation();
  const params = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoResultsMessage, setShowNoResultsMessage] = useState<boolean>(false);
  const [selectedSearchFilters, setSelectedSearchFilters] = useState<SearchFilters>({});

  // Get search query from URL if present
  const searchQuery = searchParams?.get("q") || "";

  // Temporarily disable queries to fix resource exhaustion
  const events: Ticket[] = [];
  const eventsLoading = false;
  const tickets: Ticket[] = [];
  const ticketsLoading = false;

  // Extract query parameters and URL path parameters
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    queryClient.removeQueries({ queryKey: ["/api/tickets"] });
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/events/search"] });

    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams(urlParams);

    // Handle category from URL path parameter
    if (params?.category) {
      setActiveCategory(params.category);
    }

    // Handle search filters from URL parameters
    const urlFilters: FilterValues = {};
    const searchFilters: SearchFilters = {};

    // Basic filters
    const category = urlParams.get("category");
    const location = urlParams.get("location");
    const city = urlParams.get("city");
    const trending = urlParams.get("trending");
    const sellingFast = urlParams.get("sellingFast");
    const date = urlParams.get("date");
    const dateRange = urlParams.get("dateRange");

    if (category) {
      urlFilters.category = category;
      searchFilters.category = category;
      setActiveCategory(category);
    }

    if (location) {
      urlFilters.location = location;
      searchFilters.location = location;
    }

    if (city) {
      searchFilters.city = city;
    }

    if (trending === "true") {
      urlFilters.trending = true;
      searchFilters.trending = true;
    }

    if (sellingFast === "true") {
      urlFilters.sellingFast = true;
      searchFilters.sellingFast = true;
    }

    if (date) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          searchFilters.date = parsedDate;
        }
      } catch (error) {
        console.warn("Invalid date parameter:", date);
      }
    }

    if (dateRange) {
      searchFilters.dateRange = dateRange;
    }

    setFilters(urlFilters);
    setSelectedSearchFilters(searchFilters);
  }, [location, params]);

  const categories = [
    "All",
    "Music",
    "Sports",
    "Comedy",
    "Arts & Theatre",
    "Family",
    "Movies",
    "Festivals",
    "Business",
    "Dance",
    "Education",
    "Fashion",
    "Food & Drink",
    "Health",
    "Auto",
    "Charity",
    "Community",
    "Government",
    "Spirituality",
    "Technology",
    "Travel",
    "Other",
  ];

  const selectedCategory = activeCategory === "all" ? "All" : activeCategory;

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    const params = new URLSearchParams(window.location.search);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "any") {
        if (typeof value === "boolean" && value) {
          params.set(key, "true");
        } else if (typeof value === "string") {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });

    window.history.replaceState(
      {},
      "",
      params.toString() ? `?${params}` : window.location.pathname,
    );
  };

  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    setSelectedSearchFilters(searchFilters);
    
    const params = new URLSearchParams();
    if (query) params.set("q", query);

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "boolean") {
          params.set(key, value.toString());
        } else if (value instanceof Date) {
          params.set(key, value.toISOString());
        } else {
          params.set(key, value.toString());
        }
      }
    });

    window.history.replaceState(
      {},
      "",
      params.toString() ? `?${params}` : window.location.pathname,
    );

    setTimeout(() => {
      setIsLoading(false);
      if (query && !events?.length) {
        setShowNoResultsMessage(true);
      } else {
        setShowNoResultsMessage(false);
      }
    }, 1500);
  };

  const openModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  const resetAllFilters = () => {
    setFilters({});
    setSelectedSearchFilters({});
    setActiveCategory("all");
    window.history.replaceState({}, "", window.location.pathname);
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 ||
    Object.keys(selectedSearchFilters).length > 0 ||
    searchQuery;

  const dynamicTitle = searchQuery 
    ? `${searchQuery} Event Tickets - Global Marketplace | Ticket Bazaar`
    : selectedCategory === "All"
    ? "Global Event Tickets Marketplace - Ticket Bazaar"
    : `${selectedCategory} Event Tickets Worldwide | Ticket Bazaar`;

  const dynamicDescription = searchQuery
    ? `Find ${searchQuery} event tickets worldwide. Connect with verified sellers across multiple countries and currencies.`
    : `Discover and buy event tickets globally. Secure marketplace with verified sellers across multiple countries and currencies.`;

  return (
    <>
      <SEOManager
        title={dynamicTitle}
        description={dynamicDescription}
        keywords="event tickets, global marketplace, verified sellers, worldwide events"
        canonicalUrl={selectedCategory === "All" ? 
          "https://ticketbazaar.global" : 
          `https://ticketbazaar.global/category/${selectedCategory.toLowerCase()}`}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Global Event Tickets
                <br />
                <span className="text-primary">Marketplace</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                Discover and buy tickets for events worldwide. Connect with verified sellers across multiple countries and currencies.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                className="w-full"
                initialQuery={searchQuery}
                onSearch={handleSearch}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50K+</div>
                <div className="text-sm text-gray-600">Events Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-gray-600">Verified Sellers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Finding events...</span>
            </div>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {showNoResultsMessage && !isLoading && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No events found</AlertTitle>
              <AlertDescription>
                Try adjusting your search criteria or browse all events below.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Category Navigation */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Browse Events by Category
            </h2>
          </div>
          <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.toLowerCase() ||
                  (category === "All" && activeCategory === "all")
                    ? "bg-primary text-white"
                    : "text-textSecondary hover:text-primary transition-colors"
                }`}
                onClick={() => {
                  setActiveCategory(category.toLowerCase());
                  const params = new URLSearchParams(window.location.search);
                  if (category.toLowerCase() !== "all") {
                    params.set("category", category);
                  } else {
                    params.delete("category");
                  }
                  window.history.replaceState(
                    {},
                    "",
                    params.toString() ? `?${params}` : window.location.pathname,
                  );
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Filters Section */}
      {hasActiveFilters && (
        <section className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Search: {searchQuery}
                  </Badge>
                )}
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  Category: {selectedCategory}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="events" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-4">
                <FilterDropdown
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                />
              </div>
            </div>

            <TabsContent value="events" className="space-y-6">
              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48"></div>
                    </div>
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => openModal(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No events available
                  </h3>
                  <p className="text-gray-600">
                    Check back later for new events in this category.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tickets" className="space-y-6">
              {ticketsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-32"></div>
                    </div>
                  ))}
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets available
                  </h3>
                  <p className="text-gray-600">
                    Check back later for new tickets in this category.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Modal */}
      {selectedEventId && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          eventId={selectedEventId}
        />
      )}
    </>
  );
}