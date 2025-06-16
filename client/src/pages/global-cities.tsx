import { useState } from "react";
import { useLocation } from "wouter";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import SearchBar from "@/components/search-bar-simple";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Users, Calendar, TrendingUp } from "lucide-react";
import { GLOBAL_CITIES, generateBreadcrumbStructuredData, generateFAQStructuredData } from "@/utils/global-seo-utils";

export default function GlobalCities() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter cities based on search
  const filteredCities = Object.entries(GLOBAL_CITIES).filter(([slug, city]) => {
    if (!searchQuery) return true;
    return city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Group cities by continent/region
  const citiesByRegion = {
    "North America": filteredCities.filter(([, city]) =>
      ["United States", "Canada"].includes(city.country)
    ),
    "Europe": filteredCities.filter(([, city]) =>
      ["United Kingdom", "Germany", "France", "Spain", "Italy"].includes(city.country)
    ),
    "Asia Pacific": filteredCities.filter(([, city]) =>
      ["Japan", "Australia"].includes(city.country)
    ),
    "South America": filteredCities.filter(([, city]) =>
      ["Brazil"].includes(city.country)
    )
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Global Cities", url: "/cities" }
  ];

  const citiesFAQs = [
    {
      question: "Which cities does Ticket Bazaar serve worldwide?",
      answer: "Ticket Bazaar serves major cities across 6 continents including New York, London, Tokyo, Sydney, Berlin, Toronto, Paris, Madrid, Rome, São Paulo, and many more. We connect verified ticket buyers and sellers in over 50 cities worldwide."
    },
    {
      question: "How do I find events in a specific city?",
      answer: "Browse our city directory below or use the search function. Each city page shows local events, verified sellers, and currency information. You can also filter by event category and date."
    },
    {
      question: "Do ticket prices vary by city and currency?",
      answer: "Yes, ticket prices are set by local sellers in their local currency. Our platform supports multiple currencies including USD, EUR, GBP, JPY, CAD, AUD, and more. Currency conversion is available for international buyers."
    },
    {
      question: "Are sellers verified in all cities?",
      answer: "Yes, we verify sellers in every city we serve. Our verification process includes identity confirmation, contact verification, and trust score ratings to ensure safe connections worldwide."
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const navigateToCity = (citySlug: string) => {
    setLocation(`/city/${citySlug}`);
  };

  return (
    <>
      <SEOManager
        title="Global Cities - Event Tickets Worldwide | Ticket Bazaar"
        description="Discover event tickets in major cities worldwide. Connect with verified sellers in New York, London, Tokyo, Sydney, Berlin, Toronto, Paris, and 50+ cities globally."
        keywords="global cities, worldwide events, international tickets, city events, global marketplace, multi-city tickets, international entertainment, worldwide venues"
        canonicalUrl="https://ticketbazaar.global/cities"
      />

      <UnifiedSchema
        faqs={citiesFAQs}
        includeOrganization={true}
      />

      <script type="application/ld+json">
        {JSON.stringify(generateBreadcrumbStructuredData(breadcrumbs))}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(generateFAQStructuredData(citiesFAQs))}
      </script>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-purple-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="h-8 w-8" />
              <span className="text-xl font-medium">Global Coverage</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Event Tickets in Cities Worldwide
            </h1>

            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover and connect with verified ticket sellers in major cities across 6 continents.
              From Broadway shows in New York to concerts in Tokyo.
            </p>

            <SearchBar
              className="max-w-2xl mx-auto"
              initialQuery={searchQuery}
              onSearch={handleSearch}
              placeholder="Search cities, countries, or events..."
            />

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <MapPin className="h-4 w-4 mr-2" />
                50+ Cities
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Globe className="h-4 w-4 mr-2" />
                6 Continents
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Users className="h-4 w-4 mr-2" />
                Verified Sellers
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">{Object.keys(GLOBAL_CITIES).length}</div>
              <div className="text-gray-600">Global Cities</div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">10</div>
              <div className="text-gray-600">Countries</div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">6</div>
              <div className="text-gray-600">Event Categories</div>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-600">Global Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities by Region */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Explore Cities by Region
              </h2>
              <p className="text-lg text-gray-600">
                Connect with local ticket sellers in major cities worldwide
              </p>
            </div>

            {Object.entries(citiesByRegion).map(([region, cities]) => (
              cities.length > 0 && (
                <div key={region} className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    {region}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map(([slug, city]) => (
                      <Card
                        key={slug}
                        className="hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => navigateToCity(slug)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="group-hover:text-primary transition-colors">
                              {city.name}
                            </span>
                            <Badge variant="outline">{city.currency}</Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {city.country}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {city.keywords.slice(0, 3).map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            Explore {city.name} Events
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}

            {filteredCities.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No cities found
                </h3>
                <p className="text-gray-600 mb-4">
                  No cities match your search "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Popular Destinations
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.entries(GLOBAL_CITIES).slice(0, 10).map(([slug, city]) => (
                <Button
                  key={slug}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => navigateToCity(slug)}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs opacity-70">{city.country}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {citiesFAQs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}