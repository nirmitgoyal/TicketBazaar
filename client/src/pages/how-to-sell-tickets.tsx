import { SEOManager } from "@/components/helmet-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function HowToSellTickets() {
  return (
    <>
      <SEOManager
        title="How to Sell Ticket Online Safely | Complete Guide to Resell Tickets - Ticket Bazaar"
        description="Learn how to sell ticket online safely in India. Complete guide on where to resell tickets, sell concert tickets, sports tickets and buy second hand tickets securely."
        keywords="how to sell ticket online, resell tickets safely, sell concert tickets, sell sports tickets, where to sell tickets, ticket reselling guide India, second hand ticket selling"
        canonicalUrl="https://ticketbazaar.co.in/how-to-sell-tickets"
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Sell Ticket Online Safely",
          "description": "Complete guide on how to sell ticket online, resell tickets and buy second hand tickets safely in India",
          "image": "https://ticketbazaar.co.in/images/how-to-sell-tickets-guide.jpg",
          "supply": [
            {
              "@type": "HowToSupply",
              "name": "Event Tickets"
            },
            {
              "@type": "HowToSupply", 
              "name": "Ticket Bazaar Account"
            }
          ],
          "step": [
            {
              "@type": "HowToStep",
              "name": "Create Your Listing",
              "text": "Sign up on Ticket Bazaar and create a detailed listing for your tickets with event information, seat details, and pricing."
            },
            {
              "@type": "HowToStep",
              "name": "Connect with Buyers",
              "text": "Use our platform to connect with verified buyers who are looking for your specific event tickets."
            },
            {
              "@type": "HowToStep",
              "name": "Complete Safe Transaction",
              "text": "Meet in public places or use secure transfer methods to complete your ticket sale safely."
            }
          ]
        })}
      </script>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                How to Sell Ticket Online Safely in India
              </h1>
              <p className="text-xl mb-6">
                Complete guide to resell tickets, sell concert tickets, sports tickets and buy second hand tickets securely on India's trusted marketplace
              </p>
              <Link href="/list-ticket">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Start Selling Your Tickets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Quick Benefits */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Safe & Secure</h3>
                  <p className="text-sm text-gray-600">Verified buyers and secure transactions</p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Large Audience</h3>
                  <p className="text-sm text-gray-600">Connect with thousands of ticket buyers</p>
                </div>
                <div className="text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Quick Selling</h3>
                  <p className="text-sm text-gray-600">Sell your tickets fast with our platform</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Fees</h3>
                  <p className="text-sm text-gray-600">Free platform to list and sell tickets</p>
                </div>
              </div>

              {/* Step by Step Guide */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Step-by-Step Guide: How to Sell Ticket Online</CardTitle>
                  <CardDescription>
                    Follow these simple steps to resell tickets safely and effectively
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Create Your Account</h3>
                      <p className="text-gray-600">Sign up on Ticket Bazaar with your email and create a verified profile to start selling tickets online.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">List Your Tickets</h3>
                      <p className="text-gray-600">Create a detailed listing with event information, seat details, pricing, and upload ticket images to attract buyers.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Connect with Buyers</h3>
                      <p className="text-gray-600">Respond to inquiries from interested buyers and provide additional information about your tickets.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Complete Safe Transaction & Transfer</h3>
                      <p className="text-gray-600">Meet in public places or use secure digital transfer methods to complete your ticket sale safely. After receiving payment, sellers can share QR codes (or screenshots in the case of tickets like bus tickets) with buyers directly for easy ticket transfer.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Types of Tickets */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">What Types of Tickets Can You Sell?</CardTitle>
                  <CardDescription>
                    Resell tickets for various events across India
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Entertainment Events</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Concert tickets - Bollywood, International artists</li>
                        <li>• Comedy show tickets</li>
                        <li>• Theatre and drama tickets</li>
                        <li>• Music festival tickets</li>
                        <li>• Stand-up comedy events</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Sports Events</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Cricket match tickets - IPL, International</li>
                        <li>• Football match tickets</li>
                        <li>• Tennis tournament tickets</li>
                        <li>• Marathon and sports events</li>
                        <li>• Olympic and championship tickets</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Safety Tips for Selling Tickets</CardTitle>
                  <CardDescription>
                    Follow these guidelines to sell tickets safely and avoid fraud
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-green-600">✓ Do This</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Meet buyers in public places</li>
                        <li>• Verify buyer's identity before meeting</li>
                        <li>• Keep original purchase receipts</li>
                        <li>• Use secure payment methods</li>
                        <li>• Communicate through the platform</li>
                        <li>• Check ticket transfer policies</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-red-600">✗ Avoid This</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Don't share personal bank details early</li>
                        <li>• Avoid meeting in isolated locations</li>
                        <li>• Don't accept suspicious payment methods</li>
                        <li>• Avoid selling counterfeit tickets</li>
                        <li>• Don't ignore platform guidelines</li>
                        <li>• Avoid last-minute price changes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Is it legal to resell tickets in India?</h3>
                    <p className="text-gray-600">Yes, reselling tickets is legal in India as long as you follow platform guidelines and don't engage in black marketing or price inflation.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">How do I price my tickets for resale?</h3>
                    <p className="text-gray-600">Price your tickets fairly based on original cost, demand, and market's original rates. Avoid markups to ensure quick sales.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">What if my event gets cancelled?</h3>
                    <p className="text-gray-600">If an event is cancelled, work with buyers to either refund their money or wait for rescheduled dates as per the event organizer's policy.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">How do I transfer tickets to buyers?</h3>
                    <p className="text-gray-600">After receiving payment, sellers can share QR codes (or screenshots in the case of tickets like bus tickets) with buyers directly for easy ticket transfer. This ensures a smooth and instant transfer process for both parties.</p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="text-center bg-primary/5 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Sell Your Tickets?</h2>
                <p className="text-gray-600 mb-6">
                  Join thousands of sellers who trust Ticket Bazaar to sell their tickets safely and quickly
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/list-ticket">
                    <Button size="lg" className="font-semibold">
                      List Your Tickets Now
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Login with Instagram
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}