import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: "general" | "buying" | "selling" | "payment" | "support";
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Ticket Bazaar?",
    answer:
      "Ticket Bazaar is a global discovery and contact platform that connects ticket buyers with sellers worldwide. We are not a reseller or broker - we do not handle ticket payments, hold inventory, or facilitate transactions. We ensure full legal compliance while improving trust in peer-to-peer ticket transfers through verified user profiles and secure communication channels.",
    category: "general",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    id: 2,
    question: "How do I buy tickets on Ticket Bazaar?",
    answer:
      "Browse Events: Explore the list of available events on our homepage.\n\nFind Tickets: Choose the event and browse available tickets from various sellers.\n\nContact Seller: Connect with the seller through their Instagram profile linked on our platform.\n\nNegotiate & Arrange: Discuss price, payment method, and ticket transfer details directly via Instagram.\n\nComplete Transaction: Finalize the purchase using your agreed payment method.",
    category: "buying",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 3,
    question: "How can I sell my tickets?",
    answer:
      "Create an Account: Sign up with your Instagram profile to verify your identity.\n\nList Your Ticket: Navigate to the 'Sell Tickets' section and provide the necessary details about your ticket.\n\nSet Your Terms: Add your preferred price range and payment methods you accept.\n\nManage Inquiries: Buyers will contact you directly through Instagram to negotiate and arrange the transaction.\n\nTicket Transfer: After finalizing the deal, sellers can share QR codes (or screenshots in the case of tickets like bus tickets) with buyers directly for easy ticket transfer.",
    category: "selling",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 4,
    question: "Is it safe to buy tickets on Ticket Bazaar?",
    answer:
      "Yes. We verify sellers through their social media profiles and identity verification to ensure authenticity. Since communication happens through social platforms, you can check the seller's profile history and credibility. Always meet in safe public places and use secure payment methods.",
    category: "general",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 5,
    question: "What payment methods can I use?",
    answer:
      "Ticket Bazaar does not handle payments or transactions. As a discovery and contact platform, you negotiate payment methods directly with the seller or buyer through social media. Common options include bank transfers, digital wallets, credit cards, or cash transactions. We recommend using secure, traceable payment methods for your protection. All financial transactions occur independently between users.",
    category: "payment",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 6,
    question: "What happens if an event is canceled?",
    answer:
      "Since Ticket Bazaar is a discovery platform that doesn't handle payments or transactions, refund arrangements depend entirely on your agreement with the seller. We recommend discussing cancellation policies before completing any transaction. For official event cancellations, contact the seller immediately to arrange a refund. As we don't facilitate transactions, we cannot process refunds directly.",
    category: "payment",
    icon: <RefreshCcw className="h-5 w-5" />,
  },
  {
    id: 7,
    question: "How do I contact customer support?",
    answer:
      "For any queries or assistance, reach out to our support team via the 'Contact Us' page or email us at support@ticketbazaar.in. We're here to help!",
    category: "support",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    id: 8,
    question: "How do I communicate with buyers/sellers?",
    answer:
      "All communication happens through Instagram. Contact the seller via their Instagram profile linked on our platform. Be clear about your expectations regarding price, meeting location, payment method, and ticket transfer process. Always maintain respectful communication.",
    category: "general",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    id: 9,
    question: "What should I do before meeting a buyer/seller?",
    answer:
      "Check their Instagram profile for authenticity, agree on meeting location (preferably public places), confirm payment method, and ensure you have proper ticket verification. Always prioritize your safety and inform someone about your meeting.",
    category: "general",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 10,
    question: "Does Ticket Bazaar handle payments or hold tickets?",
    answer:
      "No. Ticket Bazaar is not a reseller or broker. We do not handle ticket payments, hold inventory, or facilitate transactions. We are a discovery and contact platform that ensures full legal compliance while improving trust in peer-to-peer ticket transfers. All transactions occur directly between users through their agreed payment methods.",
    category: "general",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    id: 11,
    question: "How do I transfer tickets to buyers?",
    answer:
      "Ticket transfer is simple and direct between you and the buyer. For most events, sellers can share QR codes with buyers for instant digital transfer. For transportation tickets like bus or train tickets, sellers can share screenshots of their tickets. Always ensure you transfer tickets only after receiving payment, and verify the buyer's identity through their social media profile before sharing any ticket information.",
    category: "selling",
    icon: <FileText className="h-5 w-5" />,
  },
];

const categories = [
  { id: "all", label: "All Questions", count: faqData.length },
  {
    id: "general",
    label: "General",
    count: faqData.filter((item) => item.category === "general").length,
  },
  {
    id: "buying",
    label: "Buying Tickets",
    count: faqData.filter((item) => item.category === "buying").length,
  },
  {
    id: "selling",
    label: "Selling Tickets",
    count: faqData.filter((item) => item.category === "selling").length,
  },
  {
    id: "payment",
    label: "Payment & Refunds",
    count: faqData.filter((item) => item.category === "payment").length,
  },
  {
    id: "support",
    label: "Support",
    count: faqData.filter((item) => item.category === "support").length,
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
  searchTerm,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  searchTerm: string;
}) {
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-primary bg-primary/10 p-2 rounded-lg flex-shrink-0">
              {faq.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 pr-4">
              {highlightText(faq.question, searchTerm)}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
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
            <div className="px-6 pb-6 pt-2 bg-gray-50/50">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line border-l-4 border-primary pl-4">
                {highlightText(faq.answer, searchTerm)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
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
    const filteredItems = getFilteredFAQs();
    setOpenItems(new Set(filteredItems.map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  const getFilteredFAQs = () => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const filteredFAQs = getFilteredFAQs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto mobile-container">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Welcome to Ticket Bazaar's FAQ section. Here, we address common
            questions to help you navigate our platform with ease.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 shadow-sm"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-primary"
              }`}
            >
              {category.label}
              <span className="ml-2 text-xs opacity-75">
                ({category.id === "all" ? faqData.length : category.count})
              </span>
            </button>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={expandAll}
            className="px-6 py-3 text-sm font-medium text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
          >
            Expand All ({filteredFAQs.length})
          </button>
          <button
            onClick={collapseAll}
            className="px-6 py-3 text-sm font-medium text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            Collapse All
          </button>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-5xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <FAQItem
                    faq={faq}
                    isOpen={openItems.has(faq.id)}
                    onToggle={() => toggleItem(faq.id)}
                    searchTerm={searchTerm}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories.
              </p>
            </motion.div>
          )}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our customer support team
            is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.linkedin.com/company/ticket-bazaar-co-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
              <br/>
              [DM on LinkedIn]
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
