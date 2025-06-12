import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  addDays,
  addMonths,
  parseISO,
} from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EnhancedSEO from "@/components/enhanced-seo";
import { generateSearchResultsStructuredData, generateFAQStructuredData } from "@/utils/seo-utils";
import { GlobalMarketplaceStats } from "@/components/global-marketplace-stats";

import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const [location] = useLocation();
  const params = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoResultsMessage, setShowNoResultsMessage] =
    useState<boolean>(false);
  const [selectedSearchFilters, setSelectedSearchFilters] =
    useState<SearchFilters>({});

  // WebSocket connection for real-time updates
  useWebSocket();

  // Extract query parameters and URL path parameters
  useEffect(() => {
    // Force clear React Query cache to remove any cached ticket data
    queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    queryClient.removeQueries({ queryKey: ["/api/tickets"] });
    // Also invalidate events cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/events/search"] });

    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams(urlParams);

    // Set active category from URL path parameter first, then query parameter
    let categoryFromUrl = params.category || urlParams.get("category");
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl.toLowerCase());
    } else {
      setActiveCategory("all");
    }

    // Extract other filters from URL
    const minPrice = urlParams.get("minPrice");
    const maxPrice = urlParams.get("maxPrice");
    const dateRange = urlParams.get("dateRange");
    const location = urlParams.get("location");
    const date = urlParams.get("date");
    const sortBy = urlParams.get("sortBy");
    const verified = urlParams.get("verified");
    const trending = urlParams.get("trending");
    const sellingFast = urlParams.get("sellingFast");

    // Set filters from URL
    const urlFilters: FilterValues = {};
    if (dateRange) urlFilters.dateRange = dateRange;
    if (location) urlFilters.venueLocation = location;
    if (sortBy) urlFilters.sortBy = sortBy;
    if (verified === "true") urlFilters.showVerifiedOnly = true;

    // Set search filters
    const searchFilters: SearchFilters = {};
    if (categoryFromUrl) searchFilters.category = categoryFromUrl;
    if (location) searchFilters.location = location;
    if (date) {
      try {
        searchFilters.date = parseISO(date);
      } catch (e) {
        console.warn("Invalid date format in URL:", date);
      }
    }
    if (dateRange) searchFilters.dateRange = dateRange;
    if (trending === "true") searchFilters.trending = true;
    if (sellingFast === "true") searchFilters.sellingFast = true;

    setFilters(urlFilters);
    setSelectedSearchFilters(searchFilters);
  }, [location, params.category]);

  // Get search query from URL if present
  const searchQuery = searchParams?.get("q") || "";

  // Fetch events with search if query is provided
  const { data: events, isLoading: eventsLoading } = useQuery<Ticket[]>({
    queryKey: [
      searchQuery ? `/api/events/search` : `/api/events`,
      searchQuery,
      selectedSearchFilters,
    ],
    queryFn: async ({ queryKey }) => {
      const endpoint = queryKey[0] as string;
      const query = queryKey[1] as string;
      const filters = queryKey[2] as SearchFilters;

      // Build URL with all filters
      const params = new URLSearchParams();
      if (query) params.set("q", query);

      // Add all filters to query params
      if (filters.category) params.set("category", filters.category);
      if (filters.location) params.set("location", filters.location);
      if (filters.date) params.set("date", format(filters.date, "yyyy-MM-dd"));
      if (filters.dateRange) params.set("dateRange", filters.dateRange);
      if (filters.trending) params.set("trending", "true");
      if (filters.sellingFast) params.set("sellingFast", "true");

      const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;

      try {
        const res = await fetch(url, {
          credentials: "include",
          signal: AbortSignal.timeout(8000), // Add timeout to prevent hanging requests
        });

        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }

        return res.json();
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    },
    staleTime: 60000, // Cache results for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Fetch all available tickets - optimized single batch request
  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets/batch", events?.map((e) => e.id)],
    queryFn: async () => {
      if (!events || events.length === 0) return [];

      // Get all event IDs in a single batch request
      const eventIds = events.map(e => e.id).join(',');
      
      try {
        const response = await fetch(`/api/tickets/batch?eventIds=${eventIds}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching batch tickets:", error);
        return []; // Return empty array on error
      }
    },
    enabled: !!events && events.length > 0,
    staleTime: 60000, // Cache results for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Filter events based on category and other UI filters - search is handled by the backend API
  const filteredEvents = events?.filter((event) => {
    // Category filter
    const categoryMatch =
      activeCategory === "all" ||
      event.category.toLowerCase() === activeCategory;

    // Location filter from search bar
    const locationMatch =
      !selectedSearchFilters.location ||
      selectedSearchFilters.location === "any" ||
      event.venue
        .toLowerCase()
        .includes(selectedSearchFilters.location.toLowerCase());

    // Date filter from search bar
    let dateMatch = true;
    if (selectedSearchFilters.date) {
      const eventDate = new Date(event.eventDate);
      dateMatch = isSameDay(eventDate, selectedSearchFilters.date);
    }

    // Date range filter
    let dateRangeMatch = true;
    if (selectedSearchFilters.dateRange) {
      const eventDate = new Date(event.eventDate);
      const today = new Date();

      switch (selectedSearchFilters.dateRange) {
        case "today":
          dateRangeMatch = isSameDay(eventDate, today);
          break;
        case "tomorrow":
          dateRangeMatch = isSameDay(eventDate, addDays(today, 1));
          break;
        case "this-week":
          // Current day to next 7 days
          dateRangeMatch =
            isAfter(eventDate, today) && isBefore(eventDate, addDays(today, 7));
          break;
        case "this-weekend":
          // Get next Saturday and Sunday
          const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
          const daysToSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
          const saturday = addDays(today, daysToSaturday);
          const sunday = addDays(saturday, 1);
          dateRangeMatch =
            isSameDay(eventDate, saturday) || isSameDay(eventDate, sunday);
          break;
        case "this-month":
          dateRangeMatch = isSameMonth(eventDate, today);
          break;
        case "next-month":
          dateRangeMatch = isSameMonth(eventDate, addMonths(today, 1));
          break;
        default:
          // Custom date is handled by the date filter above
          break;
      }
    }

    // Category filter from search bar
    let categoryFromSearchMatch = true;
    if (
      selectedSearchFilters.category &&
      selectedSearchFilters.category !== "all"
    ) {
      categoryFromSearchMatch =
        event.category.toLowerCase() ===
        selectedSearchFilters.category.toLowerCase();
    }

    // Trending filter
    let trendingMatch = true;
    if (selectedSearchFilters.trending) {
      trendingMatch = event.trending === true;
    }

    // Selling fast filter
    let sellingFastMatch = true;
    if (selectedSearchFilters.sellingFast) {
      sellingFastMatch = event.sellingFast === true;
    }

    return (
      categoryMatch &&
      locationMatch &&
      dateMatch &&
      dateRangeMatch &&
      categoryFromSearchMatch &&
      trendingMatch &&
      sellingFastMatch
    );
  });

  // Filter events based on additional filters
  const filteredAndSortedEvents = filteredEvents?.filter((event) => {
    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      const eventDate = new Date(event.eventDate);

      if (filters.dateRange === "today") {
        return isSameDay(eventDate, now);
      } else if (filters.dateRange === "tomorrow") {
        const tomorrow = addDays(now, 1);
        return isSameDay(eventDate, tomorrow);
      } else if (filters.dateRange === "weekend") {
        const todayDay = now.getDay(); // 0 is Sunday, 6 is Saturday
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + (6 - todayDay));
        const sunday = new Date(now);
        sunday.setDate(now.getDate() + (7 - todayDay));

        return (
          isAfter(eventDate, now) && isBefore(eventDate, addDays(sunday, 1))
        );
      } else if (filters.dateRange === "week") {
        const nextWeek = addDays(now, 7);
        return isAfter(eventDate, now) && isBefore(eventDate, nextWeek);
      } else if (filters.dateRange === "nextWeek") {
        const nextWeekStart = addDays(now, 7);
        const nextWeekEnd = addDays(now, 14);
        return (
          isAfter(eventDate, nextWeekStart) && isBefore(eventDate, nextWeekEnd)
        );
      } else if (filters.dateRange === "month") {
        const nextMonth = addMonths(now, 1);
        return isAfter(eventDate, now) && isBefore(eventDate, nextMonth);
      } else if (filters.dateRange === "nextMonth") {
        const nextMonthStart = addMonths(now, 1);
        const nextMonthEnd = addMonths(now, 2);
        return (
          isAfter(eventDate, nextMonthStart) &&
          isBefore(eventDate, nextMonthEnd)
        );
      }
    }

    // Venue location filter
    if (filters.venueLocation) {
      if (
        !event.venue.toLowerCase().includes(filters.venueLocation.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });

  // Check if events have available tickets (for filtering purposes only)
  const eventsWithTickets = new Set<number>();

  if (tickets && Array.isArray(tickets) && tickets.length > 0) {
    tickets.forEach((ticket: Ticket) => {
      if (ticket.status === "available") {
        eventsWithTickets.add(ticket.id);
      }
    });
  }

  // Filter events by availability and other filters
  const finalFilteredEvents = filteredAndSortedEvents?.filter((event) => {
    // Filter by seating types
    if (
      filters.seatingTypes &&
      filters.seatingTypes.length > 0 &&
      tickets &&
      Array.isArray(tickets)
    ) {
      const eventTickets = tickets.filter(
        (ticket: Ticket) => ticket.eventTitle === event.eventTitle,
      );
      const hasMatchingSeatingType = eventTickets.some((ticket: Ticket) =>
        filters.seatingTypes?.includes(ticket.section.toLowerCase()),
      );

      if (!hasMatchingSeatingType) {
        return false;
      }
    }

    // Filter by verified only
    if (filters.showVerifiedOnly && tickets && Array.isArray(tickets)) {
      const eventTickets = tickets.filter(
        (ticket: Ticket) => ticket.eventTitle === event.eventTitle,
      );
      const hasVerifiedTickets = eventTickets.some(
        (ticket: Ticket) => ticket.status === "available",
      );

      if (!hasVerifiedTickets) {
        return false;
      }
    }

    // Filter by availability
    if (
      filters.availability &&
      filters.availability !== "all" &&
      tickets &&
      Array.isArray(tickets)
    ) {
      const eventTickets = tickets.filter(
        (ticket: Ticket) => ticket.eventTitle === event.eventTitle,
      );

      if (filters.availability === "available") {
        const hasAvailableTickets = eventTickets.some(
          (ticket: Ticket) => ticket.status === "available",
        );
        if (!hasAvailableTickets) return false;
      } else if (filters.availability === "lastMinute") {
        const eventDate = new Date(event.eventDate);
        const now = new Date();
        const threeDaysFromNow = addDays(now, 3);

        if (!isBefore(eventDate, threeDaysFromNow)) return false;
      }
    }

    return true;
  });

  // Apply sorting
  let sortedEvents = [...(finalFilteredEvents || [])];

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "availability":
        sortedEvents.sort((a, b) => {
          const aHasTickets = eventsWithTickets.has(a.id) ? 1 : 0;
          const bHasTickets = eventsWithTickets.has(b.id) ? 1 : 0;
          return bHasTickets - aHasTickets;
        });
        break;
      case "dateAsc":
        sortedEvents.sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        );
        break;
      case "dateDesc":
        sortedEvents.sort(
          (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
        );
        break;
      case "popular":
        sortedEvents.sort((a, b) => {
          const aIsPopular = a.trending || a.sellingFast ? 1 : 0;
          const bIsPopular = b.trending || b.sellingFast ? 1 : 0;
          return bIsPopular - aIsPopular;
        });
        break;
    }
  }

  // Get featured events (trending or selling fast)
  const featuredEvents =
    events?.filter((event) => event.trending || event.sellingFast) || [];

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);

    // Update URL with filters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Clear existing filter params
      [
        "minPrice",
        "maxPrice",
        "dateRange",
        "venueLocation",
        "sortBy",
        "verified",
      ].forEach((param) => {
        params.delete(param);
      });

      // Add new filter params
      if (newFilters.dateRange) params.set("dateRange", newFilters.dateRange);
      if (newFilters.venueLocation)
        params.set("venueLocation", newFilters.venueLocation);
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.showVerifiedOnly) params.set("verified", "true");

      window.history.replaceState({}, "", `?${params.toString()}`);
    }
  };

  const handleSearch = (query: string, searchFilters: SearchFilters) => {
    setIsLoading(true);
    setSelectedSearchFilters(searchFilters);

    // Update URL with search params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Update search query
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      // Update category
      if (searchFilters.category) {
        params.set("category", searchFilters.category);
        setActiveCategory(searchFilters.category.toLowerCase());
      } else {
        params.delete("category");
      }

      // Update location
      if (searchFilters.location) {
        params.set("location", searchFilters.location);
      } else {
        params.delete("location");
      }

      // Update date
      if (searchFilters.date) {
        params.set("date", format(searchFilters.date, "yyyy-MM-dd"));
      } else {
        params.delete("date");
      }

      // Update date range
      if (searchFilters.dateRange) {
        params.set("dateRange", searchFilters.dateRange);
      } else {
        params.delete("dateRange");
      }

      // Update trending and selling fast filters
      if (searchFilters.trending) {
        params.set("trending", "true");
      } else {
        params.delete("trending");
      }

      if (searchFilters.sellingFast) {
        params.set("sellingFast", "true");
      } else {
        params.delete("sellingFast");
      }

      window.history.replaceState({}, "", `?${params.toString()}`);
    }

    // Refetch events with appropriate query key
    // Create a unique query key based on all filters to ensure proper cache invalidation
    const queryKey = query
      ? ["/api/events/search", query, JSON.stringify(searchFilters)]
      : ["/api/events", "", JSON.stringify(searchFilters)];

    queryClient.invalidateQueries({ queryKey });

    // Reduced timeout to improve perceived performance
    setTimeout(() => {
      setIsLoading(false);

      // Check if there are no results
      if (sortedEvents.length === 0) {
        setShowNoResultsMessage(true);
      } else {
        setShowNoResultsMessage(false);
      }
    }, 600); // Reduced from 1000ms to 600ms for better user experience
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

    // Reset URL
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Refetch events
    queryClient.invalidateQueries({ queryKey: ["/api/events", ""] });
  };

  const categories = [
    "All",
    "Concerts",
    "Sports",
    "Festivals",
    "Theatre",
    "Comedy",
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

    useEffect(() => {
        if (params.category) {
            setSelectedCategory(params.category.toLowerCase());
        } else {
            setSelectedCategory("all");
        }
    }, [params.category]);

  const ticketBazaarFAQs = [
        {
            question: "Is Ticket Bazaar a safe platform to buy and sell tickets?",
            answer: "Yes, Ticket Bazaar is a discovery and contact platform that connects verified buyers and sellers. We are not a reseller or broker - we don't handle payments, hold inventory, or facilitate transactions. We ensure full legal compliance while improving trust in peer-to-peer transfers through verified profiles and secure communication."
        },
        {
            question: "What types of tickets can I find on Ticket Bazaar?",
            answer: "You can find second hand tickets for a variety of events including concerts, sports events, festivals, theatre, and comedy shows across India."
        },
        {
            question: "How does Ticket Bazaar ensure the authenticity of tickets?",
            answer: "We verify all tickets listed on our platform to ensure they are legitimate, providing buyers with confidence in their purchase."
        },
        {
            question: "Can I sell tickets on Ticket Bazaar even if I am not a resident of India?",
            answer: "Currently, selling tickets on Ticket Bazaar is restricted to Indian residents due to payment and verification processes."
        },
        {
            question: "What happens if the event is canceled?",
            answer: "Since we are a discovery platform that doesn't handle payments or transactions, refund arrangements depend on your agreement with the seller. We recommend discussing cancellation policies before any transaction. Contact the seller directly for refund arrangements."
        }
    ];
  // Generate structured data for the homepage
  const faqStructuredData = generateFAQStructuredData(ticketBazaarFAQs);
  const searchResultsData = searchQuery && events ? 
    generateSearchResultsStructuredData(searchQuery, events.length, events.map(event => ({
      title: event.eventTitle || event.title,
      description: event.eventDescription || '',
      venue: event.venue,
      date: event.eventDate.toISOString(),
      category: event.category,
      city: event.city || '',
      imageUrl: event.eventImageUrl ? event.eventImageUrl : undefined
    }))) : null;

  const structuredDataArray: object[] = [];
  structuredDataArray.push(faqStructuredData);
  if (searchResultsData) structuredDataArray.push(searchResultsData);

  return (
    <>
      <EnhancedSEO
        type={searchQuery ? "search" : selectedCategory === "all" ? "general" : "category"}
        data={{
          category: selectedCategory,
          query: searchQuery,
          city: selectedCity
        }}
        structuredData={structuredDataArray}
      />
      {/* Hero Section */}
      <section data-testid="hero-section" className="bg-primary text-white py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl font-bold font-poppins mb-3 md:mb-4">
              India's Secure Ticket Resale Marketplace
            </h2>
            <p className="text-base md:text-lg mb-4 md:mb-6">
              Sell and Buy tickets safely for concerts, sports, and events
              across India
            </p>

            <SearchBar
              className="max-w-2xl mx-auto"
              initialQuery={searchQuery}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Main Tab Navigation */}
      <section className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 md:px-4 py-3 md:py-4 font-medium text-sm md:text-base whitespace-nowrap touch-manipulation ${
                  activeCategory === category.toLowerCase() ||
                  (activeCategory === "all" && category === "All")
                    ? "border-b-2 md:border-b-3 border-primary text-primary font-medium"
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
      {(Object.keys(filters).length > 0 ||
        Object.keys(selectedSearchFilters).length > 0 ||
        searchQuery) && (
        <section className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Search: {searchQuery}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const params = new URLSearchParams(
                          window.location.search,
                        );
                        params.delete("q");
                        window.history.replaceState(
                          {},
                          "",
                          params.toString()
                            ? `?${params}`
                            : window.location.pathname,
                        );
                        handleSearch("", selectedSearchFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.category && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Category: {selectedSearchFilters.category}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.category;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.location && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Location: {selectedSearchFilters.location}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.location;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.date && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Date: {format(selectedSearchFilters.date, "dd MMM yyyy")}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.date;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.dateRange && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Date Range:{" "}
                    {selectedSearchFilters.dateRange
                      .replace(/-/g, " ")
                      .replace(/^(.)|\s+(.)/g, ($1) => $1.toUpperCase())}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.dateRange;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.trending && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-800 border-orange-200"
                  >
                    Trending
                    <button
                      className="ml-2 text-orange-500 hover:text-orange-700"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.trending;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {selectedSearchFilters.sellingFast && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 border-yellow-200"
                  >
                    Selling Fast
                    <button
                      className="ml-2 text-yellow-500 hover:text-yellow-700"
                      onClick={() => {
                        const newFilters = { ...selectedSearchFilters };
                        delete newFilters.sellingFast;
                        handleSearch(searchQuery, newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {filters.dateRange && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Date: {filters.dateRange.replace(/([A-Z])/g, " $1").trim()}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters.dateRange;
                        handleFilterChange(newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {filters.venueLocation && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Venue:{" "}
                    {filters.venueLocation.charAt(0).toUpperCase() +
                      filters.venueLocation.slice(1)}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters.venueLocation;
                        handleFilterChange(newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {filters.seatingTypes && filters.seatingTypes.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Seating: {filters.seatingTypes.join(", ")}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters.seatingTypes;
                        handleFilterChange(newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {filters.showVerifiedOnly && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Verified Only
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters.showVerifiedOnly;
                        handleFilterChange(newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}

                {filters.sortBy && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Sort: {filters.sortBy.replace(/([A-Z])/g, " $1").trim()}
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters.sortBy;
                        handleFilterChange(newFilters);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="text-muted-foreground mt-2 md:mt-0"
              >
                Clear All
              </Button>
            </div>
          </div>
        </section>
      )}



      {/* Upcoming Events Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold font-poppins mb-4 md:mb-0">
              {searchQuery
                ? "Search Results for \"" + searchQuery + "\""
                : "Upcoming Events"}
            </h2>

            <FilterDropdown
              onFilter={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* No Results Message */}
          {showNoResultsMessage &&
            sortedEvents.length === 0 &&
            !eventsLoading &&
            !ticketsLoading &&
            !isLoading && (
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Results Found</AlertTitle>
                <AlertDescription>
                  We couldn't find any events matching your search criteria. Try
                  adjusting your filters or search query.
                </AlertDescription>
              </Alert>
            )}

          {eventsLoading || ticketsLoading || isLoading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : sortedEvents && sortedEvents.length > 0 ? (
            <div data-testid="event-grid" className="mobile-grid gap-3 sm:gap-4 lg:gap-6">
              {sortedEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => openModal(event.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-textSecondary">
                No events found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={resetAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {sortedEvents && sortedEvents.length > 6 && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
              >
                Load More Events
              </Button>
            </div>
          )}
        </div>
      </section>



      {/* Ticket Detail Modal */}
      {selectedEventId !== null && (
        <TicketDetailModal
          eventId={selectedEventId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}