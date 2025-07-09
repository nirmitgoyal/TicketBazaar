import { UnifiedSEO } from "@/components/unified-seo-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Clock, 
  Ticket, 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  Star, 
  Search, 
  Filter,
  ArrowRight,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { generateLandingPageSEO } from "@/utils/unified-seo-utils";

/**
 * TicketResale landing page - targeting "ticket resale", "resale tickets", "resell tickets"
 */
export default function TicketResale() {
  const seoData = generateLandingPageSEO("ticket-resale");

  const benefits = [
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Secure Ticket Resale",
      description: "Safe and secure ticket resale platform with buyer protection and verified sellers."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      title: "Fair Market Prices",
      description: "Get the best market value for your tickets with transparent pricing and no hidden fees."
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Quick Transactions",
      description: "Fast ticket resale process with instant payments and immediate ticket transfers."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Trusted Community",
      description: "Join thousands of verified buyers and sellers in India's most trusted resale community."
    }
  ];

  const popularEvents = [
    { category: "Concert Tickets", demand: "Very High", avgPrice: "₹2,500" },
    { category: "IPL Matches", demand: "Extremely High", avgPrice: "₹4,000" },
    { category: "Comedy Shows", demand: "High", avgPrice: "₹1,200" },
    { category: "Music Festivals", demand: "High", avgPrice: "₹3,500" },
    { category: "Theatre Shows", demand: "Medium", avgPrice: "₹800" },
    { category: "Sports Events", demand: "High", avgPrice: "₹2,000" }
  ];

  const steps = [
    {
      step: "1",
      title: "List Your Tickets",
      description: "Create a listing for your tickets with all event details and your selling price."
    },
    {
      step: "2",
      title: "Connect with Buyers",
      description: "Verified buyers will contact you directly through our secure messaging system."
    },
    {
      step: "3",
      title: "Complete the Sale",
      description: "Use our secure payment system to complete the transaction safely and transfer tickets."
    }
  ];

  return (
    <>
      <UnifiedSEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="https://ticketbazaar.co.in/ticket-resale"
        ogImage="https://ticketbazaar.co.in/images/ticket-resale-og.jpg"
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Ticket Resale - Buy & Sell Tickets Online Safely",
          "description": seoData.description,
          "url": "https://ticketbazaar.co.in/ticket-resale",
          "mainEntity": {
            "@type": "Service",
            "name": "Ticket Resale Service",
            "description": "Secure platform for buying and selling tickets online",
            "provider": {
              "@type": "Organization",
              "name": "TicketBazaar",
              "url": "https://ticketbazaar.co.in"
            },
            "serviceType": "Ticket Resale Platform",
            "areaServed": "India"
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
                "name": "Ticket Resale",
                "item": "https://ticketbazaar.co.in/ticket-resale"
              }
            ]
          }
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🎟️ India's Most Trusted Ticket Resale Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Ticket Resale
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Buy and sell tickets online safely with India's most trusted ticket resale platform. 
              Whether you need to resell tickets or find sold-out events, we've got you covered with 
              secure transactions and verified users.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/list-ticket">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Ticket className="mr-2 h-5 w-5" />
                  Sell Your Tickets
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Tickets
                </Button>
              </Link>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">75,000+</div>
                <div className="text-gray-600">Tickets Resold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98.5%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">35,000+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Why Choose Our Ticket Resale Platform?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Experience the safest and most reliable way to buy and sell tickets online
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Resale Categories */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Most Popular Ticket Resale Categories
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              See what's trending in the ticket resale market
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularEvents.map((event, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">{event.category}</CardTitle>
                    <Badge 
                      variant={event.demand === "Extremely High" ? "destructive" : 
                              event.demand === "Very High" ? "default" : "secondary"}
                    >
                      {event.demand}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Avg. Price</span>
                      <span className="text-lg font-bold text-green-600">{event.avgPrice}</span>
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
              How Ticket Resale Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-blue-600">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Ticket Resale Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">For Sellers</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <span>List tickets quickly with auto-populated event details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <span>Set your own price and negotiate with buyers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <span>Secure payment processing with buyer protection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <span>Direct communication with verified buyers</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6">For Buyers</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <span>Browse thousands of verified resale tickets</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <span>Advanced filters to find exactly what you need</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <span>Secure payment with money-back guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <span>Instant ticket delivery after payment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Coverage */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ticket Resale Across India
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Our ticket resale platform covers major cities and events across India
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
                "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Goa", "Indore", "Nagpur"
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
        <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Ticket Resale Journey Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied users who trust our platform for safe and secure ticket resale
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/list-ticket">
                <Button size="lg" variant="secondary">
                  <Ticket className="mr-2 h-5 w-5" />
                  List Your Tickets
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  <Search className="mr-2 h-5 w-5" />
                  Find Tickets to Buy
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
