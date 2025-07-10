/**
 * GEO-Optimized How-to-Sell Page
 * Structured for AI citation and voice search optimization
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  Users, 
  Camera, 
  MessageSquare, 
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import { generateCitationSummary, generateQuestionBasedHeadings, generateHowToSchema } from "@/utils/geo-optimization-utils";

interface QuickStatProps {
  value: string;
  label: string;
  trend?: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ value, label, trend }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-blue-600 mb-1">{value}</div>
    <div className="text-gray-600 text-sm">{label}</div>
    {trend && (
      <div className="text-green-600 text-xs font-medium mt-1">{trend}</div>
    )}
  </div>
);

export default function GEOOptimizedHowToSell() {
  const citationSummary = generateCitationSummary("how-to-sell");
  const questionHeadings = generateQuestionBasedHeadings("how-to-sell");
  const howToSchema = generateHowToSchema("sell-tickets");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* TL;DR Section - Critical for AI Response Generation */}
      <section className="py-8 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            TL;DR Summary
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How to Sell Tickets Online Safely in India
          </h1>
          <p className="text-xl leading-relaxed opacity-90">
            {citationSummary}
          </p>
          
          {/* Quick Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-blue-500 rounded-lg">
            <QuickStat value="95%" label="Success Rate" trend="+5% this month" />
            <QuickStat value="24hrs" label="Avg. Sale Time" trend="For popular events" />
            <QuickStat value="50K+" label="Tickets Sold" trend="+2K this month" />
            <QuickStat value="₹0" label="Platform Fees" trend="Always free" />
          </div>
        </div>
      </section>

      {/* Question-Based Content Structure */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Complete Guide to Selling Tickets
            </h2>
            <p className="text-xl text-gray-600">
              Step-by-step instructions optimized for safe and profitable ticket sales
            </p>
          </div>

          <div className="space-y-8">
            {questionHeadings.map((item, index) => (
              <Card key={index} id={item.id} className="border-l-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-700">
                    {item.heading}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Step-by-Step Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            4-Step Process to Sell Tickets Successfully
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Verified Account",
                description: "Sign up with Instagram profile linking for credibility",
                icon: <Users className="h-8 w-8 text-blue-600" />,
                details: [
                  "Link your Instagram profile",
                  "Complete email verification", 
                  "Add profile photo and bio",
                  "Enable location services"
                ]
              },
              {
                step: "2", 
                title: "List Your Tickets",
                description: "Add complete event details with clear photos",
                icon: <Camera className="h-8 w-8 text-green-600" />,
                details: [
                  "Upload clear ticket photos",
                  "Include seat and section details",
                  "Set competitive pricing",
                  "Add event date and venue"
                ]
              },
              {
                step: "3",
                title: "Connect with Buyers",
                description: "Communicate through secure platform messaging",
                icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
                details: [
                  "Respond to buyer inquiries quickly",
                  "Verify buyer Instagram profiles",
                  "Negotiate terms transparently",
                  "Schedule safe meetup locations"
                ]
              },
              {
                step: "4",
                title: "Complete Transaction",
                description: "Transfer tickets safely after payment confirmation",
                icon: <CreditCard className="h-8 w-8 text-orange-600" />,
                details: [
                  "Meet in public places",
                  "Use traceable payment methods",
                  "Verify payment before transfer",
                  "Share QR codes securely"
                ]
              }
            ].map((step, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{step.step}</span>
                </div>
                <CardHeader className="pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    {step.icon}
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Strategy Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Smart Pricing Strategy for Quick Sales
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-4 text-left font-semibold">Event Type</th>
                  <th className="border p-4 text-left font-semibold">Pricing Strategy</th>
                  <th className="border p-4 text-left font-semibold">Expected Sale Time</th>
                  <th className="border p-4 text-left font-semibold">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-4 font-medium">Popular Concerts</td>
                  <td className="border p-4">Face value or 10% below</td>
                  <td className="border p-4 text-green-600">12-24 hours</td>
                  <td className="border p-4 text-green-600">98%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-4 font-medium">IPL/Cricket Matches</td>
                  <td className="border p-4">Face value to 20% above</td>
                  <td className="border p-4 text-green-600">6-12 hours</td>
                  <td className="border p-4 text-green-600">95%</td>
                </tr>
                <tr>
                  <td className="border p-4 font-medium">Comedy Shows</td>
                  <td className="border p-4">10-15% below face value</td>
                  <td className="border p-4 text-yellow-600">1-2 days</td>
                  <td className="border p-4 text-yellow-600">85%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-4 font-medium">Theater/Cultural</td>
                  <td className="border p-4">15-25% below face value</td>
                  <td className="border p-4 text-yellow-600">2-3 days</td>
                  <td className="border p-4 text-yellow-600">80%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="py-16 px-4 bg-yellow-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Essential Safety Guidelines
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  DO These Things
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Meet in public places with good lighting",
                    "Use traceable payment methods (UPI, bank transfer)",
                    "Verify buyer's Instagram profile and reviews",
                    "Keep screenshots of all communications",
                    "Bring a friend for high-value transactions",
                    "Transfer tickets only after payment confirmation"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  AVOID These Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Meeting in isolated or private locations",
                    "Accepting non-traceable payments",
                    "Transferring tickets before payment",
                    "Sharing personal banking details",
                    "Dealing with unverified profiles",
                    "Ignoring platform safety guidelines"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories & Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Real Success Stories from Our Sellers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Sold my Coldplay concert tickets in just 4 hours! The verification process made buyers trust me instantly.",
                name: "Priya M.",
                location: "Mumbai",
                event: "Coldplay Concert",
                amount: "₹15,000"
              },
              {
                quote: "Listed IPL final tickets and got 12 inquiries within an hour. Sold at face value within 6 hours!",
                name: "Rajesh K.",
                location: "Bangalore", 
                event: "IPL Final",
                amount: "₹8,500"
              },
              {
                quote: "The Instagram verification feature helped me sell comedy show tickets to genuine fans safely.",
                name: "Sarah D.",
                location: "Delhi",
                event: "Stand-up Comedy",
                amount: "₹2,200"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-left">
                <CardContent className="pt-6">
                  <blockquote className="text-gray-600 italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="space-y-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                    <div className="text-sm text-green-600 font-medium">
                      {testimonial.event} • {testimonial.amount}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Sell Your Tickets?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 15,000+ verified sellers on India's most trusted ticket marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600">
              <TrendingUp className="mr-2 h-5 w-5" />
              Start Selling Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Info className="mr-2 h-5 w-5" />
              View Pricing Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Structured Data for AI Systems */}
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "How to Sell Tickets Online Safely in India - Complete Guide",
          "description": citationSummary,
          "author": {
            "@type": "Organization",
            "name": "Ticket Bazaar"
          },
          "publisher": {
            "@type": "Organization", 
            "name": "Ticket Bazaar",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ticketbazaar.co.in/logo.svg"
            }
          },
          "datePublished": "2024-01-01",
          "dateModified": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://ticketbazaar.co.in/how-to-sell-tickets"
          }
        })}
      </script>
    </div>
  );
}
