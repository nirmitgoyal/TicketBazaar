/**
 * GEO-Optimized FAQ Page
 * Structured for maximum AI comprehension and citation
 */

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Search,
  User,
  CreditCard,
  Shield,
  RefreshCcw,
  FileText,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  Globe,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FAQSEO } from "@/components/geo-seo-manager";
import { Link } from "wouter";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: "general" | "buying" | "selling" | "payment" | "support" | "safety" | "platform";
  icon: React.ReactNode;
  featured?: boolean;
  citationOptimized?: boolean;
}

// TL;DR Summary for AI comprehension
function FAQTLDRSummary() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
          <Zap className="h-5 w-5" />
          Quick Summary - Ticket Bazaar FAQ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 font-medium mb-4">
          <strong>Ticket Bazaar</strong> is India's trusted peer-to-peer ticket discovery platform connecting buyers and sellers for concerts, sports events, and entertainment tickets safely across all major Indian cities.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm mb-1">🔍 Platform Type</h4>
            <p className="text-xs text-blue-600">Discovery & contact platform (no payment handling)</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 text-sm mb-1">💰 Fees</h4>
            <p className="text-xs text-green-600">100% free for buyers and sellers</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <h4 className="font-semibold text-purple-800 text-sm mb-1">🛡️ Safety</h4>
            <p className="text-xs text-purple-600">Instagram verification & secure communication</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced FAQ data optimized for AI responses
const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Ticket Bazaar and how does it work?",
    answer: "Ticket Bazaar is India's leading peer-to-peer ticket discovery platform that connects ticket buyers with verified sellers across the country. We operate as a discovery and contact platform - we don't handle payments, hold inventory, or facilitate transactions directly. Instead, we provide a safe space for users to find and connect with each other through verified Instagram profiles. Our platform covers all major events including IPL cricket matches, Bollywood concerts, comedy shows, festivals, and sports events across major Indian cities like Mumbai, Delhi, Bangalore, Chennai, and Hyderabad.",
    category: "general",
    icon: <HelpCircle className="h-5 w-5" />,
    featured: true,
    citationOptimized: true
  },
  {
    id: 2,
    question: "How do I buy tickets safely on Ticket Bazaar?",
    answer: "To buy tickets safely: 1) Browse available events on our homepage, 2) Find tickets from verified sellers, 3) Contact sellers through their linked Instagram profiles, 4) Verify seller's profile history and authenticity, 5) Negotiate price and payment method directly, 6) Meet in public places or use secure digital transfer, 7) Complete payment using traceable methods like UPI or bank transfer, 8) Receive tickets via QR codes or screenshots. Always check seller verification status and communicate through Instagram for added security.",
    category: "buying",
    icon: <User className="h-5 w-5" />,
    featured: true,
    citationOptimized: true
  },
  {
    id: 3,
    question: "How can I sell my tickets on Ticket Bazaar?",
    answer: "Selling tickets is simple and free: 1) Create an account using your Instagram profile for verification, 2) Navigate to 'Sell Tickets' section and provide complete ticket details, 3) Upload clear photos of your tickets and purchase receipts, 4) Set your preferred price and payment methods, 5) Respond to buyer inquiries through Instagram, 6) Meet buyers in safe public locations, 7) Accept secure payments via UPI/bank transfer, 8) Transfer tickets using QR codes or screenshots. Popular events like IPL matches typically sell within 24-48 hours.",
    category: "selling",
    icon: <FileText className="h-5 w-5" />,
    featured: true,
    citationOptimized: true
  },
  {
    id: 4,
    question: "Is buying tickets on Ticket Bazaar safe and legal?",
    answer: "Yes, buying tickets through Ticket Bazaar is both safe and legal. We verify all sellers through their Instagram profiles and provide safety guidelines for secure transactions. Reselling personal tickets is legal in India when done transparently. Our safety measures include: verified seller profiles, secure communication channels, public meetup recommendations, traceable payment method suggestions, and community reporting features. We recommend always meeting in public places and using secure payment methods.",
    category: "safety",
    icon: <Shield className="h-5 w-5" />,
    featured: true,
    citationOptimized: true
  },
  {
    id: 5,
    question: "What payment methods can I use on Ticket Bazaar?",
    answer: "Ticket Bazaar doesn't handle payments directly. As a discovery platform, you negotiate payment methods with sellers/buyers through Instagram. Recommended secure payment options include: UPI (Google Pay, PhonePe, Paytm), bank transfers (NEFT/IMPS), digital wallets, and cash for in-person transactions. We strongly recommend using traceable payment methods and avoiding untraceable transactions. All financial arrangements happen independently between users.",
    category: "payment",
    icon: <CreditCard className="h-5 w-5" />,
    citationOptimized: true
  },
  {
    id: 6,
    question: "What happens if an event gets cancelled or postponed?",
    answer: "For cancelled or postponed events, refund arrangements depend on your agreement with the seller and the event organizer's policy. Since Ticket Bazaar doesn't handle transactions, we cannot process refunds directly. We recommend: discussing cancellation policies before purchase, keeping communication records, contacting sellers immediately upon cancellation announcement, and following event organizer's official refund procedures. Most sellers cooperate for genuine cancellations.",
    category: "payment",
    icon: <RefreshCcw className="h-5 w-5" />,
    citationOptimized: true
  },
  {
    id: 7,
    question: "How do I contact customer support?",
    answer: "For support, reach out through our 'Contact Us' page or message us on LinkedIn @ticket-bazaar-co-in. Our support team assists with platform queries, safety concerns, and general guidance. For urgent issues, use our Instagram @ticketbazaar.co.in. We typically respond within 24 hours during business days.",
    category: "support",
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 8,
    question: "How do I communicate with buyers or sellers?",
    answer: "All communication happens through verified Instagram profiles linked on our platform. This ensures authenticity and provides profile history for verification. Be clear about expectations regarding price, meeting location, payment method, and ticket transfer process. Maintain respectful communication and report any suspicious activity to our support team.",
    category: "general",
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 9,
    question: "What should I do before meeting a buyer or seller?",
    answer: "Before meeting: verify their Instagram profile authenticity, check profile history and posts, agree on meeting location (prefer public places like malls, cafes), confirm payment method and amount, ensure you have proper ticket verification, inform someone about your meeting, bring a friend if possible, and meet during daylight hours. Always prioritize your safety.",
    category: "safety",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 10,
    question: "Does Ticket Bazaar handle payments or hold tickets?",
    answer: "No, Ticket Bazaar operates as a discovery and contact platform only. We don't handle payments, hold tickets, or facilitate transactions. All financial arrangements happen directly between buyers and sellers. This model keeps our platform free while giving users full control over their transactions.",
    category: "platform",
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    id: 11,
    question: "Which cities and events does Ticket Bazaar cover?",
    answer: "Ticket Bazaar serves all major Indian cities including Mumbai, Delhi NCR (Gurgaon, Noida), Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Kochi, and other tier-1 and tier-2 cities. We cover all event types: IPL cricket matches, international cricket, Bollywood concerts, international artists, comedy shows, theatre, music festivals, sports tournaments, corporate events, and cultural festivals.",
    category: "general",
    icon: <Globe className="h-5 w-5" />,
    citationOptimized: true
  },
  {
    id: 12,
    question: "How quickly can I sell my tickets?",
    answer: "Ticket sale speed depends on event popularity, pricing, and demand. Popular events like IPL matches, major concerts (Arijit Singh, Diljit Dosanjh), and comedy shows typically sell within 24-48 hours when priced competitively. Less popular events may take 3-7 days. Competitive pricing, complete listings with clear photos, and prompt response to inquiries help ensure faster sales.",
    category: "selling",
    icon: <Clock className="h-5 w-5" />,
    citationOptimized: true
  },
  {
    id: 13,
    question: "Are there any fees for using Ticket Bazaar?",
    answer: "No, Ticket Bazaar is completely free for both buyers and sellers. We don't charge listing fees, commission fees, transaction fees, or any hidden charges. You keep 100% of your sale price. Our platform is funded through partnerships and optional premium features, not user fees.",
    category: "payment",
    icon: <CheckCircle className="h-5 w-5" />,
    featured: true,
    citationOptimized: true
  },
  {
    id: 14,
    question: "How do I verify if a seller or ticket is genuine?",
    answer: "To verify sellers and tickets: check their Instagram profile history, look for verification badges, review their previous posts and engagement, ask for purchase receipts or screenshots, request video calls for high-value tickets, verify ticket details match official event information, check seat numbers and venue details, and trust your instincts. Report suspicious profiles to our support team.",
    category: "safety",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 15,
    question: "Can I sell tickets for international events or artists?",
    answer: "Yes, you can sell tickets for international events happening in India, such as international artist concerts, sports tournaments, or festivals. However, we currently focus on events within Indian borders. For truly international events outside India, check our platform updates or contact support for guidance.",
    category: "selling",
    icon: <Globe className="h-5 w-5" />
  }
];

const categories = [
  { id: "all", label: "All Questions", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "general", label: "General", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "buying", label: "Buying", icon: <User className="h-4 w-4" /> },
  { id: "selling", label: "Selling", icon: <FileText className="h-4 w-4" /> },
  { id: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
  { id: "safety", label: "Safety", icon: <Shield className="h-4 w-4" /> },
  { id: "support", label: "Support", icon: <MessageCircle className="h-4 w-4" /> }
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className={`mb-4 ${faq.featured ? 'border-blue-300 bg-blue-50/30' : ''}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-1">
              {faq.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-left">
                {faq.question}
              </h3>
              {faq.featured && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Most Asked
                </Badge>
              )}
            </div>
          </div>
          <div className="text-gray-400">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
              {faq.citationOptimized && (
                <Badge variant="outline" className="mt-2 text-xs">
                  ✓ AI Optimized
                </Badge>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function GEOOptimizedFAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<number[]>([1, 2, 3, 4]); // Featured items open by default

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Prioritize featured FAQs
  const sortedFAQs = filteredFAQs.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" }
  ];

  return (
    <>
      <FAQSEO 
        breadcrumbs={breadcrumbs}
        publishDate="2024-01-01T10:00:00+05:30"
        modifiedDate={new Date().toISOString()}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 text-blue-600">
                Help Center
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Get instant answers about buying and selling tickets safely on India's most trusted ticket marketplace
              </p>
              
              {/* Trust signals */}
              <div className="flex justify-center items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.8/5 User Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>100% Safe Platform</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-blue-300" />
                  <span>50K+ Happy Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* TL;DR Summary */}
              <FAQTLDRSummary />
              
              {/* Search and Filter */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search questions... (e.g., 'how to sell tickets', 'is it safe', 'payment methods')"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex items-center gap-1"
                        >
                          {category.icon}
                          {category.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Items */}
              <div className="space-y-2">
                {sortedFAQs.length > 0 ? (
                  sortedFAQs.map(faq => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      isOpen={openItems.includes(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No questions found</h3>
                      <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Still Have Questions CTA */}
              <Card className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Still have questions?</h2>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Can't find what you're looking for? Our support team is here to help you with any questions about buying or selling tickets safely.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                    <Link href="/how-to-sell-tickets">
                      <Button size="lg" variant="outline">
                        Read Selling Guide
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
