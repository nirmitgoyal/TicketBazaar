/**
 * GEO-Optimized How to Sell Tickets Page
 * Optimized for generative engines and AI search systems
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Clock, Users, ArrowRight, Star, TrendingUp, Zap, Award } from "lucide-react";
import { Link } from "wouter";
import { HowToSellSEO } from "@/components/geo-seo-manager";

// TL;DR Summary Component - Critical for AI responses
function TLDRSummary() {
  return (
    <Card className="bg-blue-50 border-blue-200 mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
          <Zap className="h-5 w-5" />
          TL;DR - Quick Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 font-medium mb-3">
          <strong>Ticket Bazaar</strong> is India's trusted peer-to-peer ticket marketplace where you can safely sell concert tickets, sports tickets, and event tickets online without fees.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">✅ What You Can Sell:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• IPL cricket match tickets</li>
              <li>• Bollywood concert tickets</li>
              <li>• Comedy show tickets</li>
              <li>• Festival passes</li>
              <li>• Sports event tickets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🚀 Key Benefits:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 100% free platform (no fees)</li>
              <li>• Verified buyer profiles</li>
              <li>• Safe Instagram-based communication</li>
              <li>• Quick QR code ticket transfer</li>
              <li>• Coverage across all Indian cities</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Question-based content sections optimized for voice search and AI
function QuestionBasedContent() {
  const questions = [
    {
      id: "how-to-resell-safely",
      question: "How can I resell tickets safely on Ticket Bazaar?",
      answer: (
        <div className="space-y-4">
          <p>Selling tickets safely on Ticket Bazaar involves following our verified process:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">✓ Safety Steps:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Create verified account with Instagram profile</li>
                <li>• List detailed ticket information with clear photos</li>
                <li>• Communicate only through verified Instagram profiles</li>
                <li>• Meet buyers in public places (malls, cafes)</li>
                <li>• Use traceable payment methods (UPI, bank transfer)</li>
                <li>• Transfer tickets via QR codes after payment</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚡ Pro Tip:</h4>
              <p className="text-yellow-700 text-sm">
                Always verify buyer's Instagram profile history and only accept payments through secure, traceable methods like UPI or bank transfers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ticket-types-to-sell",
      question: "What types of tickets can I sell on Ticket Bazaar?",
      answer: (
        <div className="space-y-4">
          <p>Ticket Bazaar supports all major event categories across India:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-700">🎵 Entertainment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• Bollywood concerts</li>
                  <li>• International artists</li>
                  <li>• Comedy shows</li>
                  <li>• Theatre performances</li>
                  <li>• Music festivals</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700">🏏 Sports</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• IPL cricket matches</li>
                  <li>• International cricket</li>
                  <li>• Football matches</li>
                  <li>• Tennis tournaments</li>
                  <li>• Marathon events</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-700">🎉 Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li>• Cultural festivals</li>
                  <li>• Corporate events</li>
                  <li>• Art exhibitions</li>
                  <li>• Food festivals</li>
                  <li>• Tech conferences</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "ticket-pricing-strategy", 
      question: "How do I price my tickets for quick sale?",
      answer: (
        <div className="space-y-4">
          <p>Smart pricing strategy ensures faster sales while maximizing returns:</p>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">📊 Pricing Factors:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Original ticket price</li>
                  <li>• Event popularity & demand</li>
                  <li>• Time remaining until event</li>
                  <li>• Seat location & category</li>
                  <li>• Current market rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-3">💡 Quick Sale Tips:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Price 5-10% below face value</li>
                  <li>• Bundle multiple tickets</li>
                  <li>• Highlight premium features</li>
                  <li>• Offer flexible payment options</li>
                  <li>• Update pricing based on demand</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ticket-listing-requirements",
      question: "What should I include in my ticket listing?",
      answer: (
        <div className="space-y-4">
          <p>Complete listings attract more serious buyers and sell faster:</p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700 text-lg">📝 Essential Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-green-600">
                    <li>• Event name and date</li>
                    <li>• Venue name and location</li>
                    <li>• Seat section, row, number</li>
                    <li>• Ticket category (VIP, Premium, etc.)</li>
                    <li>• Clear ticket photos (front & back)</li>
                    <li>• Purchase receipt/proof</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 text-lg">🔧 Additional Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-blue-600">
                    <li>• Preferred payment methods</li>
                    <li>• Transfer method (digital/physical)</li>
                    <li>• Meetup location preferences</li>
                    <li>• Instagram handle for contact</li>
                    <li>• Any special instructions</li>
                    <li>• Reason for selling (optional)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {questions.map((item) => (
        <Card key={item.id} id={item.id} className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              {item.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.answer}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Performance metrics and trust signals
function TrustSignals() {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      <div className="text-center bg-white p-6 rounded-lg shadow-sm border">
        <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">100% Safe</h3>
        <p className="text-sm text-gray-600">Verified sellers & secure transactions</p>
        <Badge variant="secondary" className="mt-2">Trusted Platform</Badge>
      </div>
      <div className="text-center bg-white p-6 rounded-lg shadow-sm border">
        <Users className="h-12 w-12 text-blue-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">50K+ Users</h3>
        <p className="text-sm text-gray-600">Active buyers across India</p>
        <Badge variant="secondary" className="mt-2">Growing Community</Badge>
      </div>
      <div className="text-center bg-white p-6 rounded-lg shadow-sm border">
        <Clock className="h-12 w-12 text-orange-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">24-48hr</h3>
        <p className="text-sm text-gray-600">Average ticket sale time</p>
        <Badge variant="secondary" className="mt-2">Quick Sales</Badge>
      </div>
      <div className="text-center bg-white p-6 rounded-lg shadow-sm border">
        <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Zero Fees</h3>
        <p className="text-sm text-gray-600">Free to list and sell tickets</p>
        <Badge variant="secondary" className="mt-2">No Hidden Charges</Badge>
      </div>
    </div>
  );
}

// Enhanced FAQ section optimized for AI responses
function EnhancedFAQSection() {
  const faqs = [
    {
      question: "Is it legal to resell tickets in India?",
      answer: "Yes, reselling personal tickets is legal in India when done transparently without black marketing or excessive price inflation. Ticket Bazaar ensures compliance by connecting genuine sellers with buyers."
    },
    {
      question: "How quickly can I sell my tickets on Ticket Bazaar?",
      answer: "Most tickets sell within 24-48 hours when priced competitively. Popular events like IPL matches or major concerts often sell within hours of listing."
    },
    {
      question: "Do I need to pay any fees to sell tickets?",
      answer: "No, Ticket Bazaar is completely free for sellers. We don't charge listing fees, commission, or transaction fees. You keep 100% of your sale price."
    },
    {
      question: "How do I transfer tickets to buyers?",
      answer: "After receiving payment, share QR codes or ticket screenshots directly with buyers through secure messaging. For physical tickets, arrange safe meetup locations."
    },
    {
      question: "What cities does Ticket Bazaar cover?",
      answer: "Ticket Bazaar serves all major Indian cities including Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, and other tier-1 and tier-2 cities."
    },
    {
      question: "Can I sell tickets for international events?",
      answer: "Currently, Ticket Bazaar focuses on events within India. For international events, check our platform updates or contact support for specific cases."
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        <CardDescription>
          Quick answers to common questions about selling tickets on Ticket Bazaar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b pb-4 last:border-b-0">
            <h3 className="font-semibold mb-2 text-gray-800">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function GEOOptimizedHowToSellTickets() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "How to Sell Tickets", url: "/how-to-sell-tickets" }
  ];

  return (
    <>
      <HowToSellSEO 
        breadcrumbs={breadcrumbs}
        publishDate="2024-01-15T10:00:00+05:30"
        modifiedDate={new Date().toISOString()}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Question-based Heading */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 text-blue-600">
                Complete Guide 2024
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How to Sell Tickets Online Safely in India?
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Complete step-by-step guide to resell concert tickets, sports tickets, and event tickets safely on India's most trusted marketplace
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/list-ticket">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    Start Selling Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-semibold border-white text-white hover:bg-white hover:text-blue-600">
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex justify-center items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-green-400" />
                  <span>50K+ Happy Sellers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-300" />
                  <span>100% Safe</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              {/* TL;DR Summary - Critical for AI */}
              <TLDRSummary />
              
              {/* Trust Signals */}
              <TrustSignals />
              
              {/* Question-based Content Sections */}
              <QuestionBasedContent />
              
              {/* Enhanced FAQ Section */}
              <EnhancedFAQSection />

              {/* CTA Section */}
              <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mt-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Sell Your Tickets?</h2>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Join 50,000+ sellers who trust Ticket Bazaar to sell their tickets safely, quickly, and without any fees
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/list-ticket">
                    <Button size="lg" className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      List Your Tickets Now - Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
                
                {/* Final trust signals */}
                <div className="flex justify-center items-center gap-4 mt-6 text-sm text-gray-500">
                  <span>✓ No fees ever</span>
                  <span>✓ Sell in 24-48 hours</span>
                  <span>✓ 100% safe platform</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
