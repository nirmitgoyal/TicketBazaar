/**
 * Enhanced How to Sell Tickets Page - AI Optimized
 * Designed for maximum SEO and GEO visibility
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Smartphone,
  Clock,
  Award,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

export default function EnhancedHowToSellTickets(): JSX.Element {
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Sell Tickets Online Safely in India",
    "description": "Complete step-by-step guide to selling concert tickets, sports tickets, and event tickets safely on Ticket Bazaar in India",
    "image": "https://ticketbazaar.co.in/images/how-to-sell-tickets-guide.webp",
    "totalTime": "PT15M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "0"
    },
    "supply": [
      { "@type": "HowToSupply", "name": "Valid tickets" },
      { "@type": "HowToSupply", "name": "Government ID" },
      { "@type": "HowToSupply", "name": "Bank account or UPI" }
    ],
    "tool": [
      { "@type": "HowToTool", "name": "Smartphone or computer" },
      { "@type": "HowToTool", "name": "Camera for photos" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Create Verified Account",
        "text": "Sign up on Ticket Bazaar with phone number, email, and government ID verification",
        "image": "https://ticketbazaar.co.in/images/step-1-signup.webp",
        "url": "https://ticketbazaar.co.in/register"
      },
      {
        "@type": "HowToStep", 
        "name": "List Your Tickets",
        "text": "Upload clear photos, add event details, set fair pricing, and include accurate seat information",
        "image": "https://ticketbazaar.co.in/images/step-2-list-tickets.webp",
        "url": "https://ticketbazaar.co.in/list-ticket"
      },
      {
        "@type": "HowToStep",
        "name": "Connect with Buyers",
        "text": "Communicate through our secure platform, verify buyer identity, and arrange safe meetup",
        "image": "https://ticketbazaar.co.in/images/step-3-connect-buyers.webp"
      },
      {
        "@type": "HowToStep",
        "name": "Complete Safe Transfer",
        "text": "Meet in public place, verify payment, transfer tickets digitally or physically",
        "image": "https://ticketbazaar.co.in/images/step-4-safe-transfer.webp"
      }
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I sell tickets safely on Ticket Bazaar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To sell tickets safely: 1) Create verified account, 2) List tickets with clear photos and details, 3) Set fair pricing, 4) Communicate through platform, 5) Meet in public places, 6) Verify buyer identity, 7) Use secure payment methods like UPI."
        }
      },
      {
        "@type": "Question",
        "name": "What types of tickets can I sell?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can sell concert tickets, sports tickets (IPL, football), festival passes, comedy show tickets, theater tickets, and any legitimate event tickets you own."
        }
      },
      {
        "@type": "Question",
        "name": "How should I price my tickets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Price fairly based on original cost, market demand, event popularity, and date proximity. Avoid excessive markup over 50% of original price."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>How to Sell Tickets Online Safely in India | Complete Guide 2024 | Ticket Bazaar</title>
        <meta 
          name="description" 
          content="Learn how to sell concert tickets, sports tickets & event tickets safely in India. Complete step-by-step guide with pricing tips, safety guidelines & legal compliance on Ticket Bazaar." 
        />
        <meta 
          name="keywords" 
          content="how to sell tickets online, sell concert tickets safely, resell tickets India, where to sell tickets, ticket selling guide, IPL tickets resale, concert ticket resale, sports tickets selling" 
        />
        <link rel="canonical" href="https://ticketbazaar.co.in/how-to-sell-tickets" />
        
        {/* Enhanced SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1" />
        <meta name="AI-content-optimized" content="true" />
        <meta name="citation-ready" content="true" />
        <meta name="voice-search-optimized" content="true" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How to Sell Tickets Online Safely in India | Complete Guide" />
        <meta property="og:description" content="Step-by-step guide to selling tickets safely with pricing tips and legal guidelines" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://ticketbazaar.co.in/how-to-sell-tickets" />
        <meta property="og:image" content="https://ticketbazaar.co.in/images/how-to-sell-tickets-guide.webp" />
        
        {/* Article Meta */}
        <meta property="article:section" content="Guide" />
        <meta property="article:tag" content="ticket selling,safety,guide,india" />
        <meta property="article:published_time" content="2024-01-01T00:00:00Z" />
        <meta property="article:modified_time" content={new Date().toISOString()} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How to Sell Tickets Online Safely in India
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete step-by-step guide to selling concert tickets, sports tickets, and event tickets safely with maximum profit and legal compliance
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">100% Safe</h3>
                <p className="text-gray-600">Verified sellers and secure transactions</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Fair Pricing</h3>
                <p className="text-gray-600">Get the best value for your tickets</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Quick Sales</h3>
                <p className="text-gray-600">Sell tickets fast with our active buyer base</p>
              </div>
            </div>

            <a 
              href="/list-ticket" 
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Selling Now <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </section>

        {/* TL;DR Summary for AI */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                Quick Answer: How to Sell Tickets Safely
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>TL;DR:</strong> To sell tickets safely in India: Create verified account on Ticket Bazaar → List tickets with clear photos and fair pricing → Communicate through secure platform → Meet buyers in public places → Verify identity → Use UPI/bank transfer → Transfer tickets after payment confirmation. Always price fairly (max 20-50% above original cost) and follow platform guidelines for legal compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Complete Step-by-Step Guide
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-600">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Verified Seller Account</h3>
                    <p className="text-gray-700 mb-4">
                      Start by creating a trusted seller profile that buyers can confidently interact with.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Sign up with valid phone number and email</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Verify your identity with government ID (Aadhaar/PAN)</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Complete your profile with photo and details</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Enable two-factor authentication for security</li>
                    </ul>
                    <div className="mt-4">
                      <a href="/register" className="text-blue-600 font-semibold hover:underline">
                        Create Account Now →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-600">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">List Your Tickets Effectively</h3>
                    <p className="text-gray-700 mb-4">
                      Create compelling listings that attract genuine buyers and build trust.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Upload clear, well-lit photos of tickets</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Include complete event details (date, time, venue, seat)</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Set competitive, fair pricing</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Write honest descriptions with ticket condition</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Specify transfer method (digital/physical)</li>
                    </ul>
                    <div className="mt-4">
                      <a href="/list-ticket" className="text-green-600 font-semibold hover:underline">
                        List Your Tickets →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-600">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Safely with Buyers</h3>
                    <p className="text-gray-700 mb-4">
                      Build trust and ensure secure communication throughout the process.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Use only Ticket Bazaar messaging system</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Verify buyer's identity and ratings</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Negotiate price professionally</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Arrange meetup in public places</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Share contact details only after agreement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-orange-600">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete the Safe Transaction</h3>
                    <p className="text-gray-700 mb-4">
                      Follow proven safety protocols for secure ticket transfer and payment.
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Meet in busy public places (malls, coffee shops)</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Verify buyer's identity with government ID</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Use secure payment methods (UPI, bank transfer)</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Confirm payment before transferring tickets</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Transfer tickets via QR code or digital method</li>
                      <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" /> Get confirmation of successful ticket transfer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Guide */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How to Price Your Tickets for Quick Sale
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-green-600 mb-4">✅ Fair Pricing Strategy</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Price 10-20% above original cost for popular events</li>
                  <li>• Consider event date proximity and demand</li>
                  <li>• Check market rates on similar listings</li>
                  <li>• Factor in convenience and seat quality</li>
                  <li>• Be flexible for quick sales</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-red-600 mb-4">❌ Avoid These Mistakes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Don't mark up more than 50% above original</li>
                  <li>• Avoid last-minute panic pricing</li>
                  <li>• Don't ignore market demand signals</li>
                  <li>• Never sell at suspiciously low prices</li>
                  <li>• Don't hide additional fees</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Guidelines */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Essential Safety Guidelines
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Identity Verification</h3>
                <p className="text-gray-600">Always verify buyer identity with government ID before any transaction</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Public Meetings</h3>
                <p className="text-gray-600">Meet only in busy public places like malls, coffee shops, or metro stations</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <Smartphone className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
                <p className="text-gray-600">Use traceable payment methods like UPI, bank transfer, or platform escrow</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">What types of tickets can I sell on Ticket Bazaar?</h3>
                <p className="text-gray-700">You can sell any legitimate event tickets including concert tickets, sports tickets (IPL, football, tennis), festival passes, comedy shows, theater tickets, and exhibition passes.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Is ticket reselling legal in India?</h3>
                <p className="text-gray-700">Yes, individual ticket reselling is legal in India when done transparently without black marketing. Ticket Bazaar ensures all transactions comply with Indian regulations.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How quickly can I sell my tickets?</h3>
                <p className="text-gray-700">With fair pricing and good photos, most tickets sell within 24-48 hours. Popular events like IPL matches or major concerts can sell within hours.</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a href="/faq" className="text-blue-600 font-semibold hover:underline text-lg">
                View All FAQs →
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of verified sellers on India's most trusted ticket marketplace
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Create Free Account
              </a>
              <a 
                href="/list-ticket" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                List Your Tickets
              </a>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>Verified Platform</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span>High Success Rate</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>100% Safe</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}