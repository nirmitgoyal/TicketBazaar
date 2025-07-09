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
  DollarSign,
  Recycle,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { generateLandingPageSEO } from "@/utils/unified-seo-utils";

/**
 * SecondHandTickets landing page - targeting "second hand tickets", "second-hand tickets", "used tickets"
 */
export default function SecondHandTickets() {
  const seoData = generateLandingPageSEO("second-hand-tickets");

  const advantages = [
    {
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      title: "Affordable Prices",
      description: "Buy second hand tickets at significantly lower prices than original retail cost."
    },
    {
      icon: <Recycle className="h-8 w-8 text-blue-600" />,
      title: "Sustainable Choice",
      description: "Give tickets a second life instead of letting them go to waste. Eco-friendly ticketing."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Verified Authenticity",
      description: "All second hand tickets are verified for authenticity before listing on our platform."
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Last Chance Access",
      description: "Get access to sold-out events through our second hand ticket marketplace."
    }
  ];

  const categories = [
    { 
      name: "Concert Tickets", 
      savings: "Up to 40%", 
      availability: "High",
      popular: true 
    },
    { 
      name: "Sports Tickets", 
      savings: "Up to 35%", 
      availability: "Medium",
      popular: true 
    },
    { 
      name: "Theatre Shows", 
      savings: "Up to 50%", 
      availability: "Medium",
      popular: false 
    },
    { 
      name: "Comedy Shows", 
      savings: "Up to 30%", 
      availability: "High",
      popular: true 
    },
    { 
      name: "Music Festivals", 
      savings: "Up to 45%", 
      availability: "Low",
      popular: true 
    },
    { 
      name: "Workshop Tickets", 
      savings: "Up to 60%", 
      availability: "Medium",
      popular: false 
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      city: "Mumbai",
      quote: "Found amazing second hand concert tickets at half the original price. Authentic and delivered instantly!",
      event: "Coldplay Concert"
    },
    {
      name: "Arjun Patel",
      city: "Bangalore",
      quote: "Sold my extra IPL tickets easily. Great platform for second hand ticket trading.",
      event: "IPL Match"
    },
    {
      name: "Sneha Gupta",
      city: "Delhi",
      quote: "Last-minute second hand tickets saved my weekend plans. Highly recommend!",
      event: "Comedy Show"
    }
  ];

  return (
    <>
      <UnifiedSEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="https://ticketbazaar.co.in/second-hand-tickets"
        ogImage="https://ticketbazaar.co.in/images/second-hand-tickets-og.jpg"
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Second Hand Tickets - Buy & Sell Used Tickets Online",
          "description": seoData.description,
          "url": "https://ticketbazaar.co.in/second-hand-tickets",
          "mainEntity": {
            "@type": "Service",
            "name": "Second Hand Ticket Marketplace",
            "description": "Platform for buying and selling second hand tickets safely",
            "provider": {
              "@type": "Organization",
              "name": "TicketBazaar",
              "url": "https://ticketbazaar.co.in"
            },
            "serviceType": "Second Hand Ticket Trading",
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
                "name": "Second Hand Tickets",
                "item": "https://ticketbazaar.co.in/second-hand-tickets"
              }
            ]
          }
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              ♻️ Sustainable Ticket Marketplace
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Second Hand Tickets
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Discover amazing deals on second hand tickets for concerts, sports, theatre, and events. 
              Buy verified used tickets at discounted prices or sell your extra tickets to fellow enthusiasts. 
              Sustainable, affordable, and authentic.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Second Hand Tickets
                </Button>
              </Link>
              <Link href="/list-ticket">
                <Button size="lg" variant="outline">
                  <Ticket className="mr-2 h-5 w-5" />
                  Sell Your Extra Tickets
                </Button>
              </Link>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">60%</div>
                <div className="text-gray-600">Average Savings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">100%</div>
                <div className="text-gray-600">Verified Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">10,000+</div>
                <div className="text-gray-600">Happy Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24h</div>
                <div className="text-gray-600">Quick Delivery</div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Why Choose Second Hand Tickets?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Smart, sustainable, and affordable way to enjoy your favorite events
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {advantage.icon}
                    </div>
                    <CardTitle className="text-xl">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{advantage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Popular Second Hand Ticket Categories
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Explore the best deals across different event types
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer relative">
                  {category.popular && (
                    <Badge className="absolute -top-2 -right-2 z-10">
                      Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-green-600 font-semibold">
                      Save {category.savings}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Availability</span>
                      <Badge 
                        variant={category.availability === "High" ? "default" : 
                                category.availability === "Medium" ? "secondary" : "outline"}
                      >
                        {category.availability}
                      </Badge>
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
              How Second Hand Ticket Trading Works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-600">🛒 For Buyers</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-orange-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Browse Available Tickets</h4>
                      <p className="text-gray-600">Search through thousands of verified second hand tickets across India</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-orange-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Purchase Securely</h4>
                      <p className="text-gray-600">Buy with confidence using our secure payment system and buyer protection</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-orange-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Receive Tickets</h4>
                      <p className="text-gray-600">Get your second hand tickets instantly via secure digital transfer</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6 text-red-600">💰 For Sellers</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-red-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">List Your Tickets</h4>
                      <p className="text-gray-600">Create a listing for your extra or unused tickets in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-red-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Connect with Buyers</h4>
                      <p className="text-gray-600">Verified buyers will contact you through our secure messaging system</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-red-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Get Paid</h4>
                      <p className="text-gray-600">Receive payment securely and transfer tickets to the new owner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              What Our Users Say
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <CardDescription className="text-lg italic">
                      "{testimonial.quote}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.city}</div>
                    <Badge variant="outline" className="mt-2">
                      {testimonial.event}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Trading Second Hand Tickets Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join the sustainable ticket marketplace and save money while helping others
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="secondary">
                  <Search className="mr-2 h-5 w-5" />
                  Find Second Hand Tickets
                </Button>
              </Link>
              <Link href="/list-ticket">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  <Ticket className="mr-2 h-5 w-5" />
                  Sell Your Tickets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
