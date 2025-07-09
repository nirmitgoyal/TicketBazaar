import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import { SearchBar } from "@/components/search-bar";
import { EventCard } from "@/components/event-card";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import { AnimatedEmptyState } from "@/components/empty-states/animated-empty-state";
import { FloatingBackground } from "@/components/empty-states/floating-elements";
import { Ticket } from "@shared/schema";
import { 
  generateCitySEO, 
  GLOBAL_CITIES,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData 
} from "@/utils/global-seo-utils";

export default function CityEvents() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [location, setLocation] = useLocation();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const cityData = GLOBAL_CITIES[citySlug as keyof typeof GLOBAL_CITIES];
  
  if (!cityData) {
    setLocation("/404");
    return null;
  }

  // Fetch tickets for this city (tickets contain all event information)
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["/api/tickets", "city", citySlug],
    queryFn: async () => {
      const response = await fetch(`/api/tickets?city=${encodeURIComponent(cityData.name)}`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ["/api/tickets/batch", "city", citySlug],
    queryFn: async () => {
      if (!events?.length) return [];
      const eventIds = events.map((event: any) => event.id).join(',');
      const response = await fetch(`/api/tickets/batch?eventIds=${eventIds}`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !!events?.length,
  });

  // Filter events based on search
  const filteredEvents = events?.filter((event: any) => {
    if (!searchQuery) return true;
    return event.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.venue?.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Generate SEO data
  const seoData = generateCitySEO(citySlug);
  
  // Generate breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Cities", url: "/cities" },
    { name: cityData.name, url: `/city/${citySlug}` }
  ];

  // City-specific FAQs
  const cityFAQs = [
    {
      question: `What types of events can I find in ${cityData.name}?`,
      answer: `You can discover tickets for concerts, comedy shows, sports events, theater performances, festivals, and more in ${cityData.name}. Our platform connects you with verified local sellers offering authentic tickets.`
    },
    {
      question: `How do I connect with ticket sellers in ${cityData.name}?`,
      answer: `Simply browse events in ${cityData.name}, click on any listing, and use our secure contact system to connect with verified sellers. All communications are protected and sellers are verified.`
    },
    {
      question: `Are tickets in ${cityData.name} sold in local currency?`,
      answer: `Yes, tickets in ${cityData.name} are typically listed in ${cityData.currency}. Our platform supports multiple currencies and provides currency conversion for international buyers.`
    },
    {
      question: `What makes Ticket Bazaar safe for ${cityData.name} events?`,
      answer: `Ticket Bazaar verifies all sellers in ${cityData.name} and provides secure communication channels. We're a discovery platform that connects you safely with local ticket holders without handling transactions directly.`
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const openModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEventId(null);
    setIsModalOpen(false);
  };

  // Get event statistics
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter((event: any) => new Date(event.eventDate) > new Date()).length;
  const categoriesCount = new Set(filteredEvents.map((event: any) => event.category)).size;

  return (
    <>
      <SEOManager
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords.join(", ")}
        canonicalUrl={seoData.canonicalUrl}
      />
      
      <UnifiedSchema
        faqs={cityFAQs}
        includeOrganization={true}
      />

      <script type="application/ld+json">
        {JSON.stringify(generateBreadcrumbStructuredData(breadcrumbs))}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(generateFAQStructuredData(cityFAQs))}
      </script>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-6 w-6" />
              <span className="text-lg font-medium">{cityData.country}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              {cityData.name} Event Tickets
            </h1>
            
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Discover and connect with verified ticket sellers for events in {cityData.name}. 
              From concerts and comedy shows to sports and festivals.
            </p>

            <SearchBar
              className="max-w-2xl mx-auto"
              initialQuery={searchQuery}
              onSearch={handleSearch}
              placeholder={`Search events in ${cityData.name}...`}
            />
          </div>
        </div>
      </section>

      {/* City Stats */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{upcomingEvents}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Star className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{categoriesCount}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{cityData.currency}</div>
              <div className="text-sm text-gray-600">Local Currency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Events in {cityData.name}
              </h2>
              {searchQuery && (
                <p className="text-gray-600 mt-1">
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>
            
            <Badge variant="secondary" className="px-3 py-1">
              {filteredEvents.length} events found
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Error loading events. Please try again.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <FloatingBackground>
              <AnimatedEmptyState
                icon={MapPin}
                title={`No events found in ${cityData.name}`}
                description={
                  searchQuery 
                    ? `No events match your search "${searchQuery}"` 
                    : `No events currently available in ${cityData.name}`
                }
                actionText={searchQuery ? "Clear Search" : undefined}
                onAction={searchQuery ? () => setSearchQuery("") : undefined}
                animation="bounce"
              />
            </FloatingBackground>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => openModal(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions about {cityData.name} Events
            </h2>
            
            <div className="space-y-6">
              {cityFAQs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedEventId && (
        <TicketDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          eventId={selectedEventId}
        />
      )}
    </>
  );
}