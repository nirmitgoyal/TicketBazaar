import React, { useEffect } from "react";
import { UnifiedSEO } from "@/components/unified-seo-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Users, 
  Shield, 
  Clock, 
  MapPin, 
  Star,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { generateLandingPageSEO } from "@/utils/seo-utils";

/**
 * ResaleBazaar landing page - targeting "resale bazaar", "ticket resale marketplace", "resale tickets india"
 */
export default function ResaleBazaar() {
  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "GA_MEASUREMENT_ID", {
        page_title: "Resale Bazaar - India's Premier Ticket Resale Marketplace",
        page_location: window.location.href,
      });
    }
  }, []);

  const seoData = generateLandingPageSEO("resale-bazaar");

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Verified Resale Marketplace",
      description: "All tickets in our resale bazaar are verified for authenticity and legitimacy."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Trusted Community",
      description: "Join thousands of buyers and sellers in India's most trusted ticket resale community."
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Instant Transfers",
      description: "Quick and secure ticket transfers within minutes of purchase in our resale bazaar."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Fair Market Prices",
      description: "Competitive pricing with real-time market data for the best resale ticket deals."
    }
  ];

  const popularCategories = [
    { name: "Concert Tickets", count: "500+", trend: "+15%" },
    { name: "IPL Matches", count: "300+", trend: "+25%" },
    { name: "Comedy Shows", count: "200+", trend: "+10%" },
    { name: "Music Festivals", count: "150+", trend: "+20%" },
    { name: "Theatre Shows", count: "100+", trend: "+8%" },
    { name: "Sports Events", count: "250+", trend: "+12%" }
  ];

  return (
    <>
      <UnifiedSEO 
        type="general"
        data={{ keyword: "resale-bazaar" }}
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="https://ticketbazaar.co.in/resale-bazaar"
        ogImage="https://ticketbazaar.co.in/images/resale-bazaar-og.jpg"
        structuredData={[seoData.structuredData]}
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Resale Bazaar - India's Premier Ticket Resale Marketplace",
          "description": seoData.description,
          "url": "https://ticketbazaar.co.in/resale-bazaar",
          "mainEntity": {
            "@type": "Organization",
            "name": "TicketBazaar",
            "url": "https://ticketbazaar.co.in",
            "description": "India's most trusted ticket resale bazaar platform",
            "serviceType": "Ticket Resale Marketplace"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://ticketbazaar.co.in"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Resale Bazaar",
                "item": "https://ticketbazaar.co.in/resale-bazaar"
              }
            ]
          }
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🎫 India's #1 Resale Bazaar
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Resale Bazaar
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              India's premier ticket resale marketplace. Buy and sell tickets safely with verified sellers, 
              secure payments, and instant transfers. Join the largest resale bazaar for events across India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-5 w-5" />
                Browse Resale Tickets
              </Button>
              <Button size="lg" variant="outline">
                <Ticket className="mr-2 h-5 w-5" />
                List Your Tickets
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50,000+</div>
                <div className="text-gray-600">Tickets Resold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">25,000+</div>
                <div className="text-gray-600">Happy Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">15,000+</div>
                <div className="text-gray-600">Verified Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">99.8%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Why Choose Our Resale Bazaar?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Experience the safest and most reliable ticket resale marketplace in India
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Popular Resale Categories
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Discover the most in-demand tickets in our resale bazaar
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="secondary" className="text-green-600">
                      {category.trend}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{category.count}</span>
                      <span className="text-gray-500">available</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              How Our Resale Bazaar Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Browse & Search</h3>
                <p className="text-gray-600">
                  Search through thousands of verified resale tickets across India. 
                  Use filters to find exactly what you need.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Secure Purchase</h3>
                <p className="text-gray-600">
                  Buy with confidence using our secure payment system. 
                  All transactions are protected and verified.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Get Your Tickets</h3>
                <p className="text-gray-600">
                  Receive your tickets instantly via secure transfer. 
                  Enjoy your event with peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Covered */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Resale Bazaar Across India
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Our ticket resale marketplace is available in major cities across India
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
                "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Goa"
              ].map((city, index) => (
                <Badge key={index} variant="outline" className="text-lg py-2 px-4">
                  <MapPin className="mr-2 h-4 w-4" />
                  {city}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join India's Largest Resale Bazaar Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you're buying or selling, experience the safest and most reliable 
              ticket resale marketplace in India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Ticket className="mr-2 h-5 w-5" />
                Start Selling Tickets
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Search className="mr-2 h-5 w-5" />
                Browse Resale Tickets
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
