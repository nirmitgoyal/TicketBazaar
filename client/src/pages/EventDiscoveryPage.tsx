import { useState } from "react";
import { useLocation } from "wouter";
import { EventDiscoveryModal } from "@/components/event-discovery-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Search, MapPin, Calendar, Users, Zap } from "lucide-react";

interface DiscoveredEvent {
  title: string;
  description: string;
  venue: string;
  venueAddress: string;
  date: Date;
  category: string;
  ticketPlatforms: string[];
  estimatedDemand: 'low' | 'medium' | 'high';
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  sourceUrls: string[];
  trending: boolean;
  ageRestriction?: string;
}

export default function EventDiscoveryPage() {
  const [, navigate] = useLocation();
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  const handleEventSelect = (event: DiscoveredEvent) => {
    // Pre-fill the ticket listing form with discovered event data
    const eventData = {
      eventTitle: event.title,
      eventDescription: event.description,
      venue: event.venue,
      venueAddress: event.venueAddress,
      eventDate: event.date.toISOString(),
      category: event.category,
      ageRestriction: event.ageRestriction
    };
    
    // Navigate to ticket listing with pre-filled data
    navigate(`/list-ticket?prefill=${encodeURIComponent(JSON.stringify(eventData))}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Trending Events
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Find hot events in any city using AI-powered research. Discover listing opportunities before they become obvious to everyone else.
        </p>
        <Button
          size="lg"
          onClick={() => setShowDiscoveryModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          <Search className="h-5 w-5 mr-2" />
          Start Discovering Events
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-2 bg-green-100 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>AI-Powered Research</CardTitle>
            <CardDescription>
              Real-time event discovery using advanced web intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our AI scans venues, social media, and official sources to find events before they hit mainstream attention.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-2 bg-purple-100 rounded-full w-fit mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Global Coverage</CardTitle>
            <CardDescription>
              Discover events in any city worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              From major metropolitan areas to emerging markets, find opportunities in cities you know and places you've never considered.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-2 bg-orange-100 rounded-full w-fit mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Demand Intelligence</CardTitle>
            <CardDescription>
              Smart predictions for resale potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Get AI-powered insights on event demand, typical price ranges, and resale market potential.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How Event Discovery Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Enter Location</h3>
            <p className="text-sm text-gray-600">Type any city, state, or country to search</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">AI Research</h3>
            <p className="text-sm text-gray-600">Advanced algorithms scan for trending events</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Review Results</h3>
            <p className="text-sm text-gray-600">See demand levels, prices, and event details</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-blue-600">4</span>
            </div>
            <h3 className="font-semibold mb-2">Create Listing</h3>
            <p className="text-sm text-gray-600">One-click to start selling tickets</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-6">Discover Events Across All Categories</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Concerts', 'Sports', 'Theater', 'Comedy', 'Festivals', 
            'Conferences', 'Exhibitions', 'Nightlife', 'Family Events'
          ].map((category) => (
            <span key={category} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-blue-600 text-white rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Join smart sellers who use AI-powered event discovery to stay ahead of the market and find profitable listing opportunities.
        </p>
        <Button
          size="lg"
          onClick={() => setShowDiscoveryModal(true)}
          className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Discover Events Now
        </Button>
      </div>

      {/* Event Discovery Modal */}
      <EventDiscoveryModal
        open={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        onEventSelect={handleEventSelect}
      />
    </div>
  );
}