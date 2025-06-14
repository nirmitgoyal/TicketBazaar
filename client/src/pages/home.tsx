import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchBar, SearchFilters } from "@/components/search-bar";
import { TicketCard } from "@/components/ticket-card";
import { EventCard } from "@/components/event-card";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { SellerDetailsModal } from "@/components/seller-details-modal";
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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
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

  const openSellerModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsSellerModalOpen(true);
  };

  const closeSellerModal = () => {
    setIsSellerModalOpen(false);
    setSelectedTicket(null);
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
    ? `${searchQuery} Second-Hand Tickets | Resale Marketplace | Ticket Bazaar`
    : selectedCategory === "All"
    ? "Second-Hand Ticket Discovery Platform | Buy & Sell Event Tickets Worldwide | Ticket Bazaar"
    : `${selectedCategory} Resale Tickets | Second-Hand ${selectedCategory} Events | Ticket Bazaar`;

  const dynamicDescription = searchQuery
    ? `Find authentic ${searchQuery} resale tickets from verified sellers worldwide. Secure second-hand ticket marketplace with buyer protection across 50+ countries.`
    : `Discover authentic resale tickets for concerts, sports, theatre, comedy shows & festivals. Connect with verified sellers globally in our secure second-hand ticket marketplace. Buy and sell tickets with confidence across 50+ countries.`;

  return (
    <>
      <SEOManager
        title={dynamicTitle}
        description={dynamicDescription}
        keywords="second hand tickets, resale tickets, ticket marketplace, buy sell tickets, concert tickets resale, sports tickets secondhand, theatre tickets resale, festival tickets marketplace, verified ticket sellers, authentic resale tickets, ticket exchange platform, global ticket marketplace, event tickets worldwide, secure ticket resale, ticket buyer protection"
        canonicalUrl={selectedCategory === "All" ? 
          "https://ticketbazaar.global" : 
          `https://ticketbazaar.global/category/${selectedCategory.toLowerCase()}`}
      />

      {/* Structured Data for SEO/GEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Ticket Bazaar - Second-Hand Ticket Marketplace",
          "description": "Global second-hand ticket marketplace for authentic resale tickets. Buy and sell concert, sports, theatre, comedy and festival tickets worldwide.",
          "url": "https://ticketbazaar.global",
          "applicationCategory": "Marketplace",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "category": "Event Tickets",
            "availability": "https://schema.org/InStock",
            "priceCurrency": "USD"
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "Event Ticket Buyers and Sellers",
            "geographicArea": "Worldwide"
          },
          "serviceArea": {
            "@type": "Place",
            "name": "Global",
            "description": "50+ countries worldwide"
          }
        })}
      </script>

      {/* Hero Section with Blue Background */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white" itemScope itemType="https://schema.org/WebApplication">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight" itemProp="name">
                Global Second-Hand Ticket Discovery & Contact Platform
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto" itemProp="description">
                Resell tickets for comedy shows, movies, bus, concerts, sports, events and connect with verified buyers and sellers.
              </p>
            </header>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 flex items-center space-x-2" role="search" aria-label="Search for second-hand event tickets">
              <div className="flex-1 flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400 ml-3" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search Ticket..."
                  className="flex-1 p-2 text-gray-900 placeholder-gray-500 border-none outline-none"
                  aria-label="Search for event tickets by artist, team, venue, or event name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <select className="p-2 text-gray-700 border-none outline-none bg-transparent" aria-label="Select location">
                  <option>Any location</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>India</option>
                  <option>Japan</option>
                </select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6" aria-label="Search for tickets">
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
      <section className="py-8" itemScope itemType="https://schema.org/ItemList" role="main" aria-label="Available second-hand tickets">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900" itemProp="name">
              Second-Hand Tickets Available
            </h2>
            <Button variant="outline" size="sm" className="flex items-center space-x-2" aria-label="Filter ticket results">
              <span>Filter</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              {Array.from({ length: 16 }, (_, i) => {
                // Create sample ticket data for each card
                const sampleTicket: Ticket = {
                  id: i + 1000, // Unique ID for sample tickets
                  sellerId: Math.floor(Math.random() * 5) + 1, // Random seller ID 1-5
                  title: `Sample Event Ticket ${i + 1}`,
                  eventTitle: `Sample Event Title ${i + 1}`,
                  eventDescription: `Description for sample event ${i + 1}`,
                  venue: `Sample Venue ${i + 1}`,
                  venueAddress: `123 Sample St, City ${i + 1}`,
                  eventDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                  category: ['Concerts', 'Sports', 'Festivals', 'Theatre', 'Comedy'][Math.floor(Math.random() * 5)],
                  eventImageUrl: null,
                  trending: Math.random() > 0.7,
                  sellingFast: Math.random() > 0.8,
                  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
                  city: `City ${i + 1}`,
                  country: 'US',
                  state: 'NY',
                  postalCode: '10001',
                  section: `Section ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
                  row: Math.floor(Math.random() * 20) + 1 + '',
                  seat: Math.floor(Math.random() * 30) + 1 + '',
                  price: Math.floor(Math.random() * 200) + 50,
                  quantity: Math.floor(Math.random() * 4) + 1,
                  status: 'available',
                  isTransferrable: true,
                  transferMethod: 'mobile_transfer',
                  additionalInfo: `Additional info for ticket ${i + 1}`,
                  showContactInfo: false,
                  eventTimezone: 'America/New_York',
                  ageRestriction: '18+',
                  createdAt: new Date(),
                  expiresAt: new Date(2025, 11, 31)
                };

                const eventDate = sampleTicket.eventDate;
                return (
                  <div 
                    key={i} 
                    className="bg-white rounded-lg border p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openSellerModal(sampleTicket)}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {String(eventDate.getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {eventDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {eventDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {sampleTicket.eventTitle}
                      </h3>
                      <p className="text-xs text-gray-600">{sampleTicket.venue}</p>
                      <p className="text-xs text-gray-500">
                        {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50" aria-label="Load more second-hand tickets">
              Load More Tickets
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section for GEO optimization */}
      <section className="py-12 bg-gray-50" itemScope itemType="https://schema.org/FAQPage">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions About Second-Hand Tickets
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div itemScope itemType="https://schema.org/Question" className="bg-white rounded-lg p-6 shadow-sm">
              <h3 itemProp="name" className="text-lg font-semibold text-gray-900 mb-3">
                What is a second-hand ticket marketplace?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p itemProp="text" className="text-gray-600">
                  A second-hand ticket marketplace is a platform where people can buy and sell authentic resale event tickets. 
                  It connects verified sellers with buyers looking for tickets to concerts, sports events, theatre shows, comedy performances, and festivals worldwide.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-white rounded-lg p-6 shadow-sm">
              <h3 itemProp="name" className="text-lg font-semibold text-gray-900 mb-3">
                How do I know if second-hand tickets are authentic?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p itemProp="text" className="text-gray-600">
                  Our platform verifies sellers and provides authentication services for resale tickets. 
                  We check seller credentials, ticket validity, and offer buyer protection across 50+ countries to ensure authentic ticket transactions.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-white rounded-lg p-6 shadow-sm">
              <h3 itemProp="name" className="text-lg font-semibold text-gray-900 mb-3">
                Can I sell my event tickets on this platform?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p itemProp="text" className="text-gray-600">
                  Yes, you can list your event tickets for resale on our global marketplace. 
                  Simply create an account, verify your identity, and list your tickets with details about the event, seating, and pricing.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-white rounded-lg p-6 shadow-sm">
              <h3 itemProp="name" className="text-lg font-semibold text-gray-900 mb-3">
                What types of events can I find tickets for?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p itemProp="text" className="text-gray-600">
                  Our second-hand ticket marketplace covers concerts, sports events, theatre shows, comedy performances, festivals, 
                  and other live entertainment events across multiple countries and currencies.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedEventId && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          eventId={selectedEventId}
        />
      )}

      {selectedTicket && (
        <SellerDetailsModal
          isOpen={isSellerModalOpen}
          onClose={closeSellerModal}
          ticket={selectedTicket}
        />
      )}
    </>
  );
}