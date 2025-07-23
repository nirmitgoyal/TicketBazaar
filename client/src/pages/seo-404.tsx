/**
 * SEO-Optimized 404 Error Page
 * Designed to retain users and provide SEO value
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { Home, Search, ArrowLeft, HelpCircle, Ticket, Map } from 'lucide-react';

export default function SEOOptimized404(): JSX.Element {
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Not Found - Ticket Bazaar",
    "description": "The page you're looking for doesn't exist. Find concert tickets, sports tickets, and event tickets on India's trusted marketplace.",
    "url": "https://ticketbazaar.co.in/404",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "description": "Browse all events and tickets",
          "url": "https://ticketbazaar.co.in/"
        },
        {
          "@type": "SiteNavigationElement", 
          "position": 2,
          "name": "Sell Tickets",
          "description": "List your tickets for sale",
          "url": "https://ticketbazaar.co.in/list-ticket"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "How to Sell",
          "description": "Guide to selling tickets safely",
          "url": "https://ticketbazaar.co.in/how-to-sell-tickets"
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found (404) | Ticket Bazaar - India's Ticket Marketplace</title>
        <meta 
          name="description" 
          content="The page you're looking for doesn't exist. Explore concert tickets, sports tickets, and event tickets on India's most trusted ticket marketplace." 
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://ticketbazaar.co.in/404" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Page Not Found | Ticket Bazaar" />
        <meta property="og:description" content="Find what you're looking for on India's trusted ticket marketplace" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ticketbazaar.co.in/404" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Error Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
              404
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The page you're looking for doesn't exist. But don't worry – India's best tickets are just a click away!
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <a 
              href="/"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <Home className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Browse Events</h3>
              <p className="text-gray-600 text-sm">Discover concerts, sports events, and festivals</p>
            </a>
            
            <a 
              href="/list-ticket"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <Ticket className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Sell Tickets</h3>
              <p className="text-gray-600 text-sm">List your tickets safely and quickly</p>
            </a>
            
            <a 
              href="/faq"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <HelpCircle className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Get Help</h3>
              <p className="text-gray-600 text-sm">Find answers to common questions</p>
            </a>
          </div>

          {/* Popular Links */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Pages</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <a href="/how-to-sell-tickets" className="text-blue-600 hover:underline font-medium">
                How to Sell Tickets
              </a>
              <a href="/second-hand-tickets" className="text-blue-600 hover:underline font-medium">
                Second Hand Tickets
              </a>
              <a href="/concert-tickets-online" className="text-blue-600 hover:underline font-medium">
                Concert Tickets
              </a>
              <a href="/ticket-verification" className="text-blue-600 hover:underline font-medium">
                Ticket Verification
              </a>
              <a href="/resale-bazaar" className="text-blue-600 hover:underline font-medium">
                Resale Bazaar
              </a>
              <a href="/where-to-sell-tickets" className="text-blue-600 hover:underline font-medium">
                Where to Sell
              </a>
              <a href="/city/mumbai" className="text-blue-600 hover:underline font-medium">
                Mumbai Events
              </a>
              <a href="/city/delhi" className="text-blue-600 hover:underline font-medium">
                Delhi Events
              </a>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
            <h2 className="text-2xl font-bold mb-4">Looking for Something Specific?</h2>
            <p className="text-blue-100 mb-6">Search our marketplace for events, tickets, or help articles</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Search Events
              </a>
              <a 
                href="/faq"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Search Help
              </a>
            </div>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back to Previous Page
          </button>
        </div>
      </div>
    </>
  );
}