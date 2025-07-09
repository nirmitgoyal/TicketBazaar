import { UnifiedSEO } from "@/components/unified-seo-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Users, 
  Clock, 
  Ticket, 
  Star, 
  MapPin, 
  CheckCircle, 
  Search, 
  Mic,
  Volume2,
  Calendar,
  Shield,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import { generateLandingPageSEO } from "@/utils/unified-seo-utils";

/**
 * ConcertTicketsOnline landing page - targeting "concert tickets online", "buy concert tickets", "concert tickets India"
 */
export default function ConcertTicketsOnline() {
  const seoData = generateLandingPageSEO("concert-tickets-online");

  const features = [
    {
      icon: <Music className="h-8 w-8 text-purple-600" />,
      title: "All Genres Covered",
      description: "From Bollywood to Rock, Classical to EDM - find concert tickets for every music taste."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Verified Sellers",
      description: "Buy from verified sellers with 100% authentic concert tickets and secure transactions."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Instant Delivery",
      description: "Get your concert tickets delivered instantly via secure digital transfer."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Community Trusted",
      description: "Join thousands of music lovers who trust our platform for concert tickets online."
    }
  ];

  const upcomingGenres = [
    { 
      genre: "Bollywood Concerts", 
      artists: "Arijit Singh, Shreya Ghoshal, Armaan Malik",
      popularity: "Very High",
      avgPrice: "₹1,500 - ₹8,000"
    },
    { 
      genre: "International Pop", 
      artists: "Coldplay, Ed Sheeran, Maroon 5",
      popularity: "Extremely High",
      avgPrice: "₹3,000 - ₹15,000"
    },
    { 
      genre: "Indian Classical", 
      artists: "Ustad Zakir Hussain, Pandit Ravi Shankar",
      popularity: "High",
      avgPrice: "₹800 - ₹5,000"
    },
    { 
      genre: "Rock & Metal", 
      artists: "Iron Maiden, Metallica, Local Bands",
      popularity: "High",
      avgPrice: "₹1,200 - ₹6,000"
    },
    { 
      genre: "EDM & Electronic", 
      artists: "Nucleya, Divine, KSHMR",
      popularity: "Very High",
      avgPrice: "₹1,000 - ₹4,000"
    },
    { 
      genre: "Indie & Alternative", 
      artists: "Prateek Kuhad, When Chai Met Toast",
      popularity: "Medium",
      avgPrice: "₹600 - ₹2,500"
    }
  ];

  const cities = [
    { name: "Mumbai", venues: "15+ Venues", upcoming: "25 Concerts" },
    { name: "Delhi", venues: "12+ Venues", upcoming: "20 Concerts" },
    { name: "Bangalore", venues: "10+ Venues", upcoming: "18 Concerts" },
    { name: "Chennai", venues: "8+ Venues", upcoming: "12 Concerts" },
    { name: "Pune", venues: "6+ Venues", upcoming: "10 Concerts" },
    { name: "Hyderabad", venues: "7+ Venues", upcoming: "8 Concerts" }
  ];

  const benefits = [
    "Compare prices from multiple sellers",
    "Last-minute ticket availability",
    "Secure payment protection",
    "Mobile-friendly ticket delivery",
    "24/7 customer support",
    "No hidden booking fees"
  ];

  return (
    <>
      <UnifiedSEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="https://ticketbazaar.co.in/concert-tickets-online"
        ogImage="https://ticketbazaar.co.in/images/concert-tickets-online-og.jpg"
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Concert Tickets Online - Buy & Sell Concert Tickets India",
          "description": seoData.description,
          "url": "https://ticketbazaar.co.in/concert-tickets-online",
          "mainEntity": {
            "@type": "Service",
            "name": "Concert Tickets Online Service",
            "description": "Platform for buying and selling concert tickets online in India",
            "provider": {
              "@type": "Organization",
              "name": "TicketBazaar",
              "url": "https://ticketbazaar.co.in"
            },
            "serviceType": "Concert Ticket Marketplace",
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
                "name": "Concert Tickets Online",
                "item": "https://ticketbazaar.co.in/concert-tickets-online"
              }
            ]
          }
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🎵 India's Premier Concert Ticket Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Concert Tickets Online
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Find and buy concert tickets online for the biggest artists and hottest shows across India. 
              From Bollywood superstars to international icons, discover authentic concert tickets from 
              verified sellers at the best prices.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Search className="mr-2 h-5 w-5" />
                  Find Concert Tickets
                </Button>
              </Link>
              <Link href="/list-ticket">
                <Button size="lg" variant="outline">
                  <Ticket className="mr-2 h-5 w-5" />
                  Sell Concert Tickets
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600">Concert Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">50+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">1M+</div>
                <div className="text-gray-600">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">99%</div>
                <div className="text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Why Buy Concert Tickets Online With Us?
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              The safest and most convenient way to get concert tickets in India
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

        {/* Genres Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Popular Concert Genres & Artists
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Concert tickets online for every music lover
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingGenres.map((genre, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{genre.genre}</CardTitle>
                      <Badge 
                        variant={genre.popularity === "Extremely High" ? "destructive" : 
                                genre.popularity === "Very High" ? "default" : "secondary"}
                      >
                        {genre.popularity}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {genre.artists}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price Range</span>
                      <span className="text-sm font-semibold text-green-600">{genre.avgPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cities Section */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Concert Tickets Online Across India
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Find concerts in your city
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">{city.name}</CardTitle>
                    <CardDescription>{city.venues}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-green-600">
                      {city.upcoming}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Concert Tickets Online Made Easy
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Experience hassle-free concert ticket booking with our user-friendly platform 
                  designed for music lovers across India.
                </p>
                
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Link href="/">
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                      <Music className="mr-2 h-5 w-5" />
                      Browse Concert Tickets
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Volume2 className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl">This Weekend</CardTitle>
                    <CardDescription className="text-purple-100">
                      Hot Concert Tickets Available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold">Arijit Singh Live</div>
                        <div className="text-sm text-purple-100">Mumbai • Saturday</div>
                      </div>
                      <div>
                        <div className="font-semibold">Nucleya EDM Night</div>
                        <div className="text-sm text-purple-100">Bangalore • Sunday</div>
                      </div>
                      <div>
                        <div className="font-semibold">Prateek Kuhad Acoustic</div>
                        <div className="text-sm text-purple-100">Delhi • Saturday</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-4">
                      Limited Tickets Available
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How to Buy */}
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              How to Buy Concert Tickets Online
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Search Concerts</h3>
                <p className="text-gray-600">
                  Browse through hundreds of concert listings. Filter by city, genre, 
                  artist, or date to find your perfect show.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Secure Purchase</h3>
                <p className="text-gray-600">
                  Buy concert tickets online with confidence. Our secure payment system 
                  protects your transaction and personal information.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Get Tickets</h3>
                <p className="text-gray-600">
                  Receive your concert tickets instantly via email or mobile app. 
                  Show up to the venue and enjoy the show!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Get Your Concert Tickets Online Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Don't miss out on the hottest concerts in India. Buy authentic tickets from verified sellers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" variant="secondary">
                  <Music className="mr-2 h-5 w-5" />
                  Find Concert Tickets
                </Button>
              </Link>
              <Link href="/list-ticket">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  <Mic className="mr-2 h-5 w-5" />
                  Sell Your Concert Tickets
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
