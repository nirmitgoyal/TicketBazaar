import { UnifiedSEO } from "@/components/unified-seo-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, Users, ArrowRight, DollarSign, Zap, Globe, Star } from "lucide-react";
import { Link } from "wouter";
import { generateLandingPageSEO, generateSellingFAQStructuredData } from "@/utils/unified-seo-utils";

export default function SellPage() {
  const seoData = generateLandingPageSEO("sell-concert-tickets");
  const faqStructuredData = generateSellingFAQStructuredData();

  return (
    <>
      <UnifiedSEO
        type="selling"
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical="https://ticketbazaar.co.in/sell"
        structuredData={[seoData.structuredData, faqStructuredData]}
        faqs={[
          {
            question: "How do I sell tickets on TicketBazaar?",
            answer: "Simply create a free account, list your tickets with photos and details, connect with verified buyers, and complete secure transactions with escrow protection."
          },
          {
            question: "Is it safe to sell tickets online?",
            answer: "Yes, TicketBazaar provides secure escrow protection, identity verification for all users, and secure payment processing to ensure safe transactions."
          }
        ]}
      />
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sell Tickets Online - Concert, Sports & Event Tickets
              </h1>
              <p className="text-xl mb-8">
                Sell concert tickets, sports tickets, and event tickets safely on TicketBazaar - India's most trusted ticket resale marketplace. Easy listing, secure payments, verified buyers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-ticket">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    Start Selling Your Tickets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/how-to-sell-tickets">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    How to Sell Tickets Guide
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Sell Tickets Online with TicketBazaar?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <div className="text-center">
                  <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
                  <p className="text-gray-600">Verified buyers and secure transactions. Sell tickets online with confidence knowing your safety is our priority.</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
                  <p className="text-gray-600">Set your own prices and get maximum value for your tickets. No hidden fees or commission charges.</p>
                </div>
                <div className="text-center">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Verified Buyers</h3>
                  <p className="text-gray-600">Connect with genuine, verified buyers who are actively looking for your specific event tickets.</p>
                </div>
                <div className="text-center">
                  <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Quick Listing</h3>
                  <p className="text-gray-600">List your tickets in minutes with our easy-to-use interface. Start selling immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticket Types Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                What Tickets Can You Sell?
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎵 Concert Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Sell concert tickets online for any artist or band. From Bollywood concerts to international artists performing in India.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Bollywood concerts</li>
                      <li>• International artists</li>
                      <li>• Music festivals</li>
                      <li>• Classical concerts</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⚽ Sports Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Sell football tickets, cricket tickets, and other sports event tickets. Perfect for when your plans change.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cricket matches</li>
                      <li>• Football games</li>
                      <li>• Basketball tournaments</li>
                      <li>• Other sports events</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎭 Entertainment Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Sell comedy show tickets, theatre tickets, and other entertainment event tickets easily.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Comedy shows</li>
                      <li>• Theatre performances</li>
                      <li>• Stand-up comedy</li>
                      <li>• Cultural events</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                How to Sell Tickets Online - Simple 3-Step Process
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create Your Listing</h3>
                    <p className="text-gray-600">
                      Sign up and create a detailed listing for your tickets. Include event information, seat details, pricing, and photos. Our platform makes it easy to sell tickets online with all the information buyers need.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Connect with Verified Buyers</h3>
                    <p className="text-gray-600">
                      Receive inquiries from verified buyers through our secure messaging system. All buyers are verified to ensure safe transactions when you sell concert tickets or other event tickets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Complete Safe Transaction</h3>
                    <p className="text-gray-600">
                      Complete your ticket sale securely with our recommended safe transfer methods. Get paid quickly and safely when you sell tickets online through TicketBazaar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Link href="/list-ticket">
                  <Button size="lg" className="font-semibold">
                    Start Selling Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials/Trust Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Sellers Choose TicketBazaar
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      "Best platform to sell concert tickets online. Sold my tickets within 2 hours with verified buyers. Highly recommend!"
                    </p>
                    <p className="font-semibold text-sm">- Mumbai Concert Seller</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      "Safe and secure way to sell tickets online. Great platform for reselling tickets when plans change. Easy to use!"
                    </p>
                    <p className="font-semibold text-sm">- Delhi Sports Fan</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      "Perfect solution for selling event tickets. Verified buyers and secure process made selling my tickets stress-free."
                    </p>
                    <p className="font-semibold text-sm">- Bangalore Event Enthusiast</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Sell Your Tickets Online?
              </h2>
              <p className="text-xl mb-8">
                Join thousands of sellers who trust TicketBazaar to sell concert tickets, sports tickets, and event tickets safely. Start selling today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-ticket">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    List Your Tickets Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/how-to-sell-tickets">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Learn How to Sell Tickets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
