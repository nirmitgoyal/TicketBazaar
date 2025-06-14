import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchBar, SearchFilters } from "@/components/search-bar";
import { TicketCard } from "@/components/ticket-card";
import { EventCard } from "@/components/event-card";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { Loader2, AlertTriangle, MapPin, Search } from "lucide-react";
import { Ticket } from "@shared/schema";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoResultsMessage, setShowNoResultsMessage] = useState<boolean>(false);
  const [selectedSearchFilters, setSelectedSearchFilters] = useState<SearchFilters>({});

  // Get search query from URL if present
  const searchQuery = searchParams?.get("q") || "";

  // Temporarily disable queries to prevent resource issues
  const events: Ticket[] = [];
  const eventsLoading = false;
  const tickets: Ticket[] = [];
  const ticketsLoading = false;

  // Extract query parameters and URL path parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams(urlParams);

    // Handle category from URL path parameter
    if (params?.category) {
      setActiveCategory(params.category);
    }

    // Handle search filters from URL parameters
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
      searchFilters.category = category;
      setActiveCategory(category);
    }

    if (location) {
      searchFilters.location = location;
    }

    if (city) {
      searchFilters.city = city;
    }

    if (trending === "true") {
      searchFilters.trending = true;
    }

    if (sellingFast === "true") {
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

    setSelectedSearchFilters(searchFilters);
  }, [location, params]);

  const categories = [
    "All",
    "Concerts",
    "Sports", 
    "Festivals",
    "Theatre",
    "Comedy"
  ];

  const selectedCategory = activeCategory === "all" ? "All" : activeCategory;

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
    setSelectedSearchFilters({});
    setActiveCategory("all");
    window.history.replaceState({}, "", window.location.pathname);
  };

  const hasActiveFilters =
    Object.keys(selectedSearchFilters).length > 0 ||
    searchQuery;

  const dynamicTitle = searchQuery 
    ? `${searchQuery} Event Tickets - Global Marketplace | Ticket Bazaar`
    : selectedCategory === "All"
    ? "Global Ticket Discovery & Contact Platform - Ticket Bazaar"
    : `${selectedCategory} Event Tickets Worldwide | Ticket Bazaar`;

  const dynamicDescription = searchQuery
    ? `Find ${searchQuery} event tickets worldwide. Connect with verified sellers across multiple countries and currencies.`
    : `Find tickets for comedy, shows, movies, sport, concerts, sports events and connect with verified buyers and sellers.`;

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

      {/* Hero Section with Blue Background */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Global Ticket Discovery & Contact Platform
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
                Find tickets for comedy, shows, movies, sport, concerts, sports events and connect with verified buyers and sellers.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search Tickets..."
                  className="flex-1 p-2 text-gray-900 placeholder-gray-500 border-none outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <select className="p-2 text-gray-700 border-none outline-none bg-transparent">
                  <option>Any location</option>
                </select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-8 py-4">
            {categories.map((category) => (
              <button
                key={category}
                className={`whitespace-nowrap py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeCategory === category.toLowerCase() ||
                  (category === "All" && activeCategory === "all")
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-blue-600"
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

      {/* Upcoming Events Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Upcoming Events
            </h2>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <span>Filter</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>

          {/* Events Grid */}
          {eventsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48"></div>
                </div>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => openModal(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sample Event Cards to match the original design */}
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(2025, Math.floor(Math.random() * 12), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">MON</div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      Sample Event Title {i + 1}
                    </h3>
                    <p className="text-xs text-gray-600">Sample Venue</p>
                    <p className="text-xs text-gray-500">1:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              Load More Events
            </Button>
          </div>
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