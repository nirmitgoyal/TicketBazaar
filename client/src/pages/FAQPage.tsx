import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Ticket Bazaar?",
    answer: "Ticket Bazaar is India's premier secure ticket resale platform, enabling users to buy and sell event tickets safely and efficiently."
  },
  {
    id: 2,
    question: "How do I buy tickets on Ticket Bazaar?",
    answer: "Browse Events: Explore the list of available events on our homepage.\n\nSelect Tickets: Choose the event and select the tickets you wish to purchase.\n\nSecure Payment: Proceed to checkout and complete your purchase using our secure payment gateway.\n\nReceive Tickets: Once the transaction is successful, you'll receive your tickets via email or can download them from your account dashboard."
  },
  {
    id: 3,
    question: "How can I sell my tickets?",
    answer: "Create an Account: Sign up or log in to your Ticket Bazaar account.\n\nList Your Ticket: Navigate to the 'Sell Tickets' section and provide the necessary details about your ticket.\n\nSet Price: Determine a fair price for your ticket.\n\nManage Listings: Monitor your listings and communicate with potential buyers through our platform."
  },
  {
    id: 4,
    question: "Is it safe to buy tickets on Ticket Bazaar?",
    answer: "Absolutely. We prioritize user safety by verifying sellers and ensuring secure transactions. Our platform is designed to protect both buyers and sellers throughout the ticket exchange process."
  },
  {
    id: 5,
    question: "What payment methods are accepted?",
    answer: "We accept various payment methods, including major credit/debit cards, UPI, and net banking, to provide flexibility and convenience to our users."
  },
  {
    id: 6,
    question: "Can I get a refund if an event is canceled?",
    answer: "In the event of a cancellation, we facilitate refunds in accordance with our refund policy. Please refer to our Refund Policy page for detailed information."
  },
  {
    id: 7,
    question: "How do I contact customer support?",
    answer: "For any queries or assistance, reach out to our support team via the 'Contact Us' page or email us at support@ticketbazaar.in. We're here to help!"
  }
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset transition-colors duration-200"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 pr-4">
            {faq.question}
          </h3>
          <div className="flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 bg-gray-50">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setOpenItems(new Set(faqData.map(item => item.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto mobile-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to Ticket Bazaar's FAQ section. Here, we address common questions to help you navigate our platform with ease.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Collapse All
          </button>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openItems.has(faq.id)}
              onToggle={() => toggleItem(faq.id)}
            />
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Please reach out to our customer support team.
          </p>
          <a
            href="https://www.linkedin.com/in/nirmitgoyal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}