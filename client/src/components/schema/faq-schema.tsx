
import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// Common FAQs for the platform
export const ticketBazaarFAQs: FAQItem[] = [
  {
    question: "Is it safe to buy second hand tickets on Ticket Bazaar?",
    answer: "Yes, Ticket Bazaar is a discovery and contact platform that connects verified buyers and sellers. We are not a reseller or broker - we don't handle payments, hold inventory, or facilitate transactions. We ensure trust through verified profiles and secure communication channels."
  },
  {
    question: "How do I verify if my tickets are authentic?",
    answer: "Our platform includes ticket verification features including QR code scanning and seller verification to ensure ticket authenticity."
  },
  {
    question: "What cities does Ticket Bazaar serve?",
    answer: "Ticket Bazaar serves major cities across India including Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, and many more."
  },
  {
    question: "How quickly can I sell my tickets?",
    answer: "Tickets can be listed immediately and are visible to buyers right away. Many tickets sell within 24-48 hours depending on demand."
  },
  {
    question: "What types of events can I find tickets for?",
    answer: "You can find tickets for concerts, sports events, festivals, comedy shows, theatre performances, workshops, and other live events across India."
  }
];
