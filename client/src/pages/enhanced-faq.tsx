/**
 * AI-Optimized FAQ Page Component
 * Designed for maximum visibility in AI search results and voice queries
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown, ChevronUp, Search, Filter, Star } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  featured: boolean;
  aiOptimized: boolean;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'how-to-sell-tickets-safely',
    question: 'How do I sell tickets safely on Ticket Bazaar?',
    answer: 'To sell tickets safely on Ticket Bazaar: 1) Create a verified account with your phone number and email, 2) List your tickets with clear photos and accurate details, 3) Set fair pricing based on original cost, 4) Communicate only through our platform, 5) Meet buyers in public places for ticket transfer, 6) Verify buyer identity before transfer, 7) Use secure payment methods like UPI or bank transfer, 8) Transfer tickets via QR code or screenshot after receiving payment.',
    category: 'selling',
    keywords: ['sell tickets safely', 'secure selling', 'ticket safety', 'safe transfer'],
    featured: true,
    aiOptimized: true
  },
  {
    id: 'ticket-reselling-legal-india',
    question: 'Is ticket reselling legal in India?',
    answer: 'Yes, individual ticket reselling is completely legal in India when done transparently. You can legally sell your own tickets at fair prices without excessive markup. Ticket Bazaar operates as a discovery platform connecting buyers and sellers, ensuring all transactions comply with Indian regulations. We prohibit black marketing and price gouging to maintain legal compliance.',
    category: 'legal',
    keywords: ['ticket reselling legal', 'legal resale India', 'ticket laws'],
    featured: true,
    aiOptimized: true
  },
  {
    id: 'buy-second-hand-tickets',
    question: 'How to buy second hand tickets safely?',
    answer: 'To buy second hand tickets safely: 1) Only deal with verified sellers on Ticket Bazaar, 2) Check seller ratings and reviews, 3) Verify ticket authenticity using our verification tools, 4) Communicate through our secure platform, 5) Meet in public places, 6) Check ticket details match the event, 7) Use secure payment methods, 8) Get digital tickets transferred properly before payment.',
    category: 'buying',
    keywords: ['buy second hand tickets', 'safe buying', 'ticket verification', 'authentic tickets'],
    featured: true,
    aiOptimized: true
  },
  {
    id: 'ticket-verification-process',
    question: 'How does ticket verification work?',
    answer: 'Ticket Bazaar uses advanced verification: 1) QR code scanning to check authenticity, 2) Digital ticket validation with original platforms, 3) Seller identity verification through government ID, 4) Event details cross-checking, 5) Price validation against market rates, 6) AI-powered fraud detection, 7) User rating system for trust scoring.',
    category: 'verification',
    keywords: ['ticket verification', 'authentic tickets', 'QR code verification'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'pricing-tickets-resale',
    question: 'How should I price my tickets for resale?',
    answer: 'Price your tickets fairly: 1) Check original ticket price, 2) Consider current market demand, 3) Factor in event popularity and date proximity, 4) Price 10-20% above original cost for popular events, 5) Price at or below original cost for less demand, 6) Check similar listings on Ticket Bazaar, 7) Avoid excessive markup (over 50% is not recommended).',
    category: 'selling',
    keywords: ['ticket pricing', 'resale pricing', 'fair pricing'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'payment-methods-accepted',
    question: 'What payment methods are accepted?',
    answer: 'Ticket Bazaar supports secure payment methods: 1) UPI (PhonePe, Paytm, Google Pay), 2) Bank transfers (NEFT/IMPS), 3) Cash for in-person meetings, 4) Digital wallets. We recommend UPI for fastest and safest transactions. Never use payment methods that cannot be tracked or reversed.',
    category: 'payment',
    keywords: ['payment methods', 'UPI payment', 'secure payment'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'concert-tickets-resale',
    question: 'Can I resell concert tickets on Ticket Bazaar?',
    answer: 'Yes, you can resell concert tickets for Bollywood artists, international performers, indie musicians, and music festivals. Simply list your tickets with event details, seat information, and fair pricing. Concert tickets are our most popular category with high demand in Mumbai, Delhi, Bangalore, and other major cities.',
    category: 'events',
    keywords: ['concert tickets', 'resell concert tickets', 'music events'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'sports-tickets-ipl-resale',
    question: 'How to sell IPL and sports tickets?',
    answer: 'Selling IPL and sports tickets: 1) List tickets immediately after purchase for better demand, 2) Include match details, seat section, and view quality, 3) Price competitively based on team popularity and match importance, 4) Provide clear photos of physical tickets, 5) Meet buyers near the stadium for convenience, 6) Transfer tickets digitally when possible.',
    category: 'events',
    keywords: ['IPL tickets', 'sports tickets', 'cricket tickets'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'account-verification-required',
    question: 'Why is account verification required?',
    answer: 'Account verification ensures safety: 1) Prevents fake accounts and fraud, 2) Builds trust between buyers and sellers, 3) Enables secure communication, 4) Allows us to track transaction history, 5) Helps resolve disputes quickly, 6) Complies with platform security standards. Verification requires phone number, email, and government ID.',
    category: 'verification',
    keywords: ['account verification', 'identity verification', 'platform safety'],
    featured: false,
    aiOptimized: true
  },
  {
    id: 'ticket-transfer-process',
    question: 'What is the ticket transfer process?',
    answer: 'Ticket transfer process: 1) Seller lists tickets with details, 2) Buyer expresses interest and communicates, 3) Both parties agree on price and meeting, 4) Meet in public place with ID verification, 5) Buyer inspects tickets and verifies authenticity, 6) Payment is made using secure method, 7) Seller transfers tickets digitally or physically, 8) Both parties confirm successful transaction.',
    category: 'process',
    keywords: ['ticket transfer', 'transaction process', 'ticket exchange'],
    featured: false,
    aiOptimized: true
  }
];

const CATEGORIES: FAQCategory[] = [
  { id: 'all', name: 'All Questions', icon: '❓', count: FAQ_DATA.length },
  { id: 'selling', name: 'Selling Tickets', icon: '💰', count: FAQ_DATA.filter(f => f.category === 'selling').length },
  { id: 'buying', name: 'Buying Tickets', icon: '🎫', count: FAQ_DATA.filter(f => f.category === 'buying').length },
  { id: 'legal', name: 'Legal & Compliance', icon: '⚖️', count: FAQ_DATA.filter(f => f.category === 'legal').length },
  { id: 'verification', name: 'Verification', icon: '✅', count: FAQ_DATA.filter(f => f.category === 'verification').length },
  { id: 'events', name: 'Event Types', icon: '🎪', count: FAQ_DATA.filter(f => f.category === 'events').length },
  { id: 'payment', name: 'Payments', icon: '💳', count: FAQ_DATA.filter(f => f.category === 'payment').length },
  { id: 'process', name: 'Process', icon: '🔄', count: FAQ_DATA.filter(f => f.category === 'process').length }
];

export function EnhancedFAQPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(FAQ_DATA);

  // Filter FAQs based on search and category
  useEffect(() => {
    let filtered = FAQ_DATA;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Sort by featured first, then AI optimized
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.aiOptimized && !b.aiOptimized) return -1;
      if (!a.aiOptimized && b.aiOptimized) return 1;
      return 0;
    });

    setFilteredFAQs(filtered);
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | How to Sell Tickets Safely | Ticket Bazaar</title>
        <meta 
          name="description" 
          content="Get answers about selling tickets safely, buying second hand tickets, ticket verification, and legal compliance. Complete FAQ guide for Ticket Bazaar users in India." 
        />
        <meta 
          name="keywords" 
          content="ticket selling FAQ, how to sell tickets safely, buy second hand tickets, ticket resale legal India, ticket verification, concert tickets resale, IPL tickets, sports tickets" 
        />
        <link rel="canonical" href="https://ticketbazaar.co.in/faq" />
        
        {/* AI Optimization Tags */}
        <meta name="robots" content="index, follow, max-snippet:160, max-image-preview:large" />
        <meta name="AI-content-optimized" content="true" />
        <meta name="citation-ready" content="true" />
        <meta name="question-answering" content="optimized" />
        
        {/* Open Graph */}
        <meta property="og:title" content="FAQ - How to Sell Tickets Safely | Ticket Bazaar" />
        <meta property="og:description" content="Complete FAQ guide for safe ticket buying and selling in India" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://ticketbazaar.co.in/faq" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Everything you need to know about buying and selling tickets safely
            </p>
            <p className="text-lg text-gray-500">
              Get instant answers to common questions about Ticket Bazaar
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions... (e.g., 'how to sell tickets safely')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Filter className="w-5 h-5 text-gray-400 mt-2 mr-2" />
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.icon} {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Featured Questions */}
          {selectedCategory === 'all' && !searchQuery && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                Most Important Questions
              </h2>
              <div className="grid gap-4">
                {FAQ_DATA.filter(faq => faq.featured).map(faq => (
                  <div key={faq.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-yellow-100 transition-colors rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                            Featured
                          </span>
                          {faq.aiOptimized && (
                            <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                              AI Optimized
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedItems.has(faq.id) ? 
                        <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {expandedItems.has(faq.id) && (
                      <div className="px-6 pb-4">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {faq.keywords.map(keyword => (
                            <span key={keyword} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Questions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory === 'all' ? 'All Questions' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
              <span className="text-gray-500 text-lg ml-2">({filteredFAQs.length})</span>
            </h2>

            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No questions found matching your search. Try different keywords or browse all categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map(faq => (
                  <div key={faq.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {CATEGORIES.find(c => c.id === faq.category)?.name}
                          </span>
                          {faq.aiOptimized && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              AI Optimized
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedItems.has(faq.id) ? 
                        <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {expandedItems.has(faq.id) && (
                      <div className="px-6 pb-4 border-t border-gray-100">
                        <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {faq.keywords.map(keyword => (
                            <span key={keyword} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-blue-100 mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/how-to-sell-tickets"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Selling Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}