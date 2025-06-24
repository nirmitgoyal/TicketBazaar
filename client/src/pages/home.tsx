import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchBar, SearchFilters } from "@/components/search-bar";
import { TicketCard } from "@/components/ticket-card";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { SellerDetailsModal } from "@/components/seller-details-modal";
import { SkeletonGrid } from "@/components/skeletons/skeleton-grid";
import { Loader2, AlertTriangle, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SEOManager } from "@/components/helmet-manager";
import { useAnalytics } from "@/hooks/use-analytics";

import { Ticket } from "@shared/schema";

export default function Home() {
  const [location] = useLocation();
  const params = useParams<{ category?: string }>();
  const { trackEvent, trackUserAction } = useAnalytics();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoResultsMessage, setShowNoResultsMessage] = useState<boolean>(false);
  const [selectedSearchFilters, setSelectedSearchFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Pagination state with localStorage persistence
  const TICKETS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('home-current-page');
      return saved ? parseInt(saved) : 1;
    } catch {
      return 1;
    }
  });
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreTickets, setHasMoreTickets] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('home-has-more');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [defaultTickets, setDefaultTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem('home-tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('home-current-page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('home-has-more', JSON.stringify(hasMoreTickets));
  }, [hasMoreTickets]);

  useEffect(() => {
    localStorage.setItem('home-tickets', JSON.stringify(defaultTickets));
  }, [defaultTickets]);

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [displayedTicketsCount, setDisplayedTicketsCount] = useState<number>(TICKETS_PER_PAGE);
  
  // Clear cached data when filters change
  useEffect(() => {
    const filterKey = JSON.stringify({ selectedSearchFilters, activeCategory, searchQuery });
    const lastFilterKey = localStorage.getItem('home-filter-key');
    
    if (lastFilterKey && lastFilterKey !== filterKey) {
      // Filters changed, reset pagination
      setCurrentPage(1);
      setHasMoreTickets(true);
      setDefaultTickets([]);
      setAllTickets([]);
      setDisplayedTicketsCount(TICKETS_PER_PAGE);
      localStorage.removeItem('home-current-page');
      localStorage.removeItem('home-has-more');
      localStorage.removeItem('home-tickets');
    }
    
    localStorage.setItem('home-filter-key', filterKey);
  }, [selectedSearchFilters, activeCategory, searchQuery]);
  



  // Helper function to filter tickets based on venue timezone
  const isFutureTicket = (ticket: Ticket): boolean => {
    try {
      const eventTimezone = ticket.eventTimezone || 'UTC';
      
      // Get current time in milliseconds
      const nowMs = Date.now();
      
      // Parse event datetime (assumed to be in UTC in database)
      const eventDateTimeMs = new Date(ticket.eventDate).getTime();
      
      // Create a reference date to determine timezone offset
      const referenceDate = new Date();
      
      // Get current time formatted in venue timezone
      const nowInVenueTimezoneString = referenceDate.toLocaleString("en-CA", { 
        timeZone: eventTimezone,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Get event time formatted in venue timezone
      const eventInVenueTimezoneString = new Date(eventDateTimeMs).toLocaleString("en-CA", {
        timeZone: eventTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit', 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Convert strings back to Date objects for comparison
      // Format: "YYYY-MM-DD, HH:mm:ss"
      const nowInVenueMs = new Date(nowInVenueTimezoneString.replace(', ', 'T')).getTime();
      const eventInVenueMs = new Date(eventInVenueTimezoneString.replace(', ', 'T')).getTime();
      
      // Only show tickets with events strictly after current venue time (no equality)
      return eventInVenueMs > nowInVenueMs;
    } catch (error) {
      console.error('Error filtering ticket by timezone:', error);
      // Fallback to basic UTC comparison if timezone parsing fails
      return new Date(ticket.eventDate).getTime() > Date.now();
    }
  };

  // Get search query from URL if present
  const urlSearchQuery = searchParams?.get("q") || "";



  // Fetch initial tickets data
  const {
    data: initialTickets = [],
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets", urlSearchQuery, selectedSearchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (urlSearchQuery) params.set("q", urlSearchQuery);
      params.set("page", "1");
      params.set("limit", TICKETS_PER_PAGE.toString());
      
      Object.entries(selectedSearchFilters).forEach(([key, value]) => {
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

      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      
      // Sort tickets by event date and time in ascending order
      const sortedData = data.sort((a: Ticket, b: Ticket) => 
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
      
      // Only update tickets if we don't have any cached or if filters are active
      if (defaultTickets.length === 0 || Object.keys(selectedSearchFilters).length > 0 || urlSearchQuery) {
        setCurrentPage(1);
        setDefaultTickets(sortedData);
        setHasMoreTickets(sortedData.length === TICKETS_PER_PAGE);
      }
      
      return sortedData;
    },
    enabled: true,
  });

  // Search tickets query - triggered by search input
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    error: searchError,
  } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets/search", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      
      // Sort search results by event date and time in ascending order
      return data.sort((a: Ticket, b: Ticket) => 
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
    },
    enabled: searchQuery.length >= 2, // Only search when user has typed at least 2 characters
    staleTime: 30000, // Cache results for 30 seconds
  });



  // Load more tickets functionality
  const handleLoadMore = async () => {
    const futureTickets = defaultTickets.filter(isFutureTicket);
    const canShowMoreFromCurrent = futureTickets.length > displayedTicketsCount;
    
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      if (canShowMoreFromCurrent) {
        // Show more tickets from current data
        setDisplayedTicketsCount(prev => prev + TICKETS_PER_PAGE);
      } else if (hasMoreTickets) {
        // Fetch new tickets from API
        const nextPage = currentPage + 1;
        const params = new URLSearchParams();
        if (urlSearchQuery) params.set("q", urlSearchQuery);
        params.set("page", nextPage.toString());
        params.set("limit", TICKETS_PER_PAGE.toString());
        
        Object.entries(selectedSearchFilters).forEach(([key, value]) => {
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

        const response = await fetch(`/api/tickets?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch more tickets');
        }
        const newTickets = await response.json();
        
        // Sort new tickets by date and append to existing ones
        const sortedNewTickets = newTickets.sort((a: Ticket, b: Ticket) => {
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        });
        
        setDefaultTickets(prev => [...prev, ...sortedNewTickets]);
        setCurrentPage(nextPage);
        setHasMoreTickets(newTickets.length === TICKETS_PER_PAGE);
        setDisplayedTicketsCount(prev => prev + TICKETS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading more tickets:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Set up scroll listener - removed to fix handleScroll undefined error

  // Pagination reset is now handled by the localStorage logic above

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
    
    // Track search event in Google Analytics
    trackUserAction('search', {
      search_term: query,
      search_filters: JSON.stringify(searchFilters),
      search_category: searchFilters.category || 'all',
      search_location: searchFilters.city || searchFilters.location || 'any'
    });
    
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

    setTimeout(() => {
      setIsLoading(false);
      if (query && !searchResults?.length) {
        setShowNoResultsMessage(true);
        // Track no results event
        trackEvent('search_no_results', 'search', query);
      } else {
        setShowNoResultsMessage(false);
        // Track successful search
        trackEvent('search_results', 'search', query, searchResults?.length || 0);
      }
    }, 1500);
  };

  const openModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
    
    // Track event view in Google Analytics
    trackUserAction('view_item', {
      item_id: eventId.toString(),
      item_name: 'Event Details',
      item_category: 'Event'
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  const openSellerModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsSellerModalOpen(true);
    
    // Track seller contact intent
    trackEvent('contact_seller', 'engagement', ticket.title, 0);
    trackUserAction('view_item', {
      item_id: ticket.id.toString(),
      item_name: ticket.title,
      item_category: ticket.category,
      price: 0,
      currency: 'INR'
    });
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
                Second-Hand Ticket Discovery & Contact Platform
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto" itemProp="description">
                Resell or Buy tickets for comedy shows, movies, bus, concerts, sports, etc
              </p>
            </header>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-2" role="search" aria-label="Search for second-hand event tickets">
              <div className="flex-1 flex items-center space-x-2 py-1">
                <div className="pl-1">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search Ticket..."
                  className="flex-1 p-2 text-gray-900 placeholder-gray-500 border-none outline-none min-w-0"
                  aria-label="Search for event tickets by artist, team, venue, or event name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="flex items-center space-x-2 flex-1 sm:flex-none py-1">
                  <div className="pl-1">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <select className="p-2 text-gray-700 border-none outline-none bg-transparent flex-1 sm:flex-none min-w-0" aria-label="Select location">
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 flex-shrink-0 touch-target" aria-label="Search for tickets">
                  Search
                </Button>
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

      {/* Upcoming Events Section */}
      <section className="py-8" itemScope itemType="https://schema.org/ItemList" role="main" aria-label="Available second-hand tickets">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900" itemProp="name">
                {searchQuery.length >= 2 ? `Search Results for "${searchQuery}"` : "Tickets Available"}
              </h2>
              {searchQuery.length >= 2 ? (
                searchResults.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {Math.min(searchResults.filter(isFutureTicket).length, TICKETS_PER_PAGE)} ticket{Math.min(searchResults.filter(isFutureTicket).length, TICKETS_PER_PAGE) !== 1 ? 's' : ''}
                  </p>
                )
              ) : (
                ((defaultTickets.length > 0) || (initialTickets && initialTickets.length > 0)) && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {Math.min((defaultTickets.length > 0 ? defaultTickets : initialTickets).filter(isFutureTicket).length, displayedTicketsCount)} ticket{Math.min((defaultTickets.length > 0 ? defaultTickets : initialTickets).filter(isFutureTicket).length, displayedTicketsCount) !== 1 ? 's' : ''}
                  </p>
                )
              )}
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-2" aria-label="Filter ticket results">
              <span>Filter</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>

          {/* Search Results or Events Grid */}
          {searchQuery.length >= 2 ? (
            // Show search results
            searchLoading ? (
              <SkeletonGrid 
                type="events" 
                count={8} 
                className="grid-cols-2 lg:grid-cols-4" 
              />
            ) : searchResults.length > 0 ? (
              <div className="mobile-grid gap-3 sm:gap-4 lg:gap-6">
                {searchResults.filter(isFutureTicket).slice(0, TICKETS_PER_PAGE).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="bg-white rounded-lg border p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openModal(ticket.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {String(new Date(ticket.eventDate).getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(ticket.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ticket.eventDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {ticket.eventTitle}
                      </h3>
                      <p className="text-xs text-gray-500">{ticket.city}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600">
                  No tickets match your search for "{searchQuery}". Try different keywords.
                </p>
              </div>
            )
          ) : (
            // Show default tickets grid - use initialTickets or defaultTickets, prioritize real data
            ticketsLoading ? (
              <SkeletonGrid 
                type="events" 
                count={8} 
                className="grid-cols-2 lg:grid-cols-4" 
              />
            ) : (initialTickets && initialTickets.length > 0) || (defaultTickets && defaultTickets.length > 0) ? (
              <div className="mobile-grid gap-3 sm:gap-4 lg:gap-6">
                {(defaultTickets.length > 0 ? defaultTickets : initialTickets).filter(isFutureTicket).slice(0, displayedTicketsCount).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="bg-white rounded-lg border p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openModal(ticket.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {String(new Date(ticket.eventDate).getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(ticket.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ticket.eventDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {ticket.eventTitle}
                      </h3>
                      <p className="text-xs text-gray-500">{ticket.city}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : !ticketsLoading && (
              <div className="mobile-grid gap-3 sm:gap-4 lg:gap-6">
                {/* Sample Event Cards to match the original design */}
                {(() => {
                  // Create sample tickets array first - limit to TICKETS_PER_PAGE for first load
                  const sampleTickets = Array.from({ length: TICKETS_PER_PAGE }, (_, i) => ({
                    id: i + 1000,
                    sellerId: Math.floor(Math.random() * 5) + 1,
                    title: `Sample Event Ticket ${i + 1}`,
                    eventTitle: `Sample Event Title ${i + 1}`,
                    eventDescription: `Description for sample event ${i + 1}`,
                    venue: `Sample Venue ${i + 1}`,
                    venueAddress: `123 Sample St, City ${i + 1}`,
                    eventDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000), // Future dates within next year
                    category: ['Concerts', 'Sports', 'Festivals', 'Theatre', 'Comedy'][Math.floor(Math.random() * 5)],
                    eventImageUrl: null,
                    trending: Math.random() > 0.7,
                    sellingFast: Math.random() > 0.8,
                    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
                    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'][i % 12],
                    country: 'US',
                    state: 'NY',
                    postalCode: '10001',
                    section: `Section ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
                    row: Math.floor(Math.random() * 20) + 1 + '',
                    seat: Math.floor(Math.random() * 30) + 1 + '',

                    quantity: Math.floor(Math.random() * 4) + 1,
                    status: 'available',
                    isTransferrable: true,
                    transferMethod: 'mobile_transfer',
                    additionalInfo: `Additional info for ticket ${i + 1}`,
                    showContactInfo: false,
                    eventTimezone: 'America/New_York',
                    ageRestriction: '18+',
                    createdAt: new Date(),
                    expiresAt: new Date(2025, 11, 31),
                    viewCount: Math.floor(Math.random() * 100),
                    contactCount: Math.floor(Math.random() * 20),
                    isFeatured: false,
                    boostScore: Math.floor(Math.random() * 10),
                    availabilityStatus: 'available'
                  } as Ticket));

                  // Filter to show only future tickets, then sort by event date in ascending order
                  const futureSampleTickets = sampleTickets.filter(isFutureTicket);
                  const sortedSampleTickets = futureSampleTickets.sort((a, b) => {
                    const dateA = new Date(a.eventDate).getTime();
                    const dateB = new Date(b.eventDate).getTime();
                    return dateA - dateB;
                  });

                  // Return JSX elements
                  return sortedSampleTickets.map((sampleTicket, i) => {
                    const eventDate = sampleTicket.eventDate;
                    return (
                      <div 
                        key={sampleTicket.id} 
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
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )
          )}

          {/* Load More Button - Only show for real ticket data */}
          {!searchQuery.length && ((defaultTickets.length > 0) || (initialTickets && initialTickets.length > 0)) && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-600 hover:bg-blue-50" 
                aria-label="Load more second-hand tickets"
                onClick={handleLoadMore}
                disabled={!(hasMoreTickets || defaultTickets.filter(isFutureTicket).length > displayedTicketsCount) || isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (hasMoreTickets || defaultTickets.filter(isFutureTicket).length > displayedTicketsCount) ? (
                  "Load More Tickets"
                ) : (
                  "No More Tickets"
                )}
              </Button>
            </div>
          )}
        </div>
      </section>



      {/* Modals */}
      {selectedEventId && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          eventId={selectedEventId}
          onOpenSellerModal={openSellerModal}
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