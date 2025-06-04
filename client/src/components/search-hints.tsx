import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, TrendingUp, Clock, MapPin } from "lucide-react";
import { type SearchContext } from "@/hooks/use-search-hints";
import { cn } from "@/lib/utils";

interface SearchHintsProps {
  searchContext: SearchContext;
  onHintClick: (hint: string) => void;
  className?: string;
  showTitle?: boolean;
}

export function SearchHints({
  searchContext,
  onHintClick,
  className,
  showTitle = true,
}: SearchHintsProps) {
  const [popularTerms] = useState([
    { term: "IPL matches", category: "Sports" },
    { term: "Bollywood concerts", category: "Concert" },
    { term: "Comedy shows Mumbai", category: "Comedy" },
    { term: "Music festivals", category: "Festival" },
    { term: "Cricket World Cup", category: "Sports" },
    { term: "Stand up comedy Delhi", category: "Comedy" },
    { term: "Rock concerts Bangalore", category: "Concert" },
    { term: "Theater shows", category: "Theater" },
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "concert":
      case "music":
        return "🎵";
      case "sports":
        return "⚽";
      case "comedy":
        return "😂";
      case "festival":
        return "🎪";
      case "theater":
        return "🎭";
      default:
        return "🎫";
    }
  };

  // Don't show anything if query is short or empty
  if (!searchContext.query || searchContext.query.length < 3) {
    return null;
  }

  return null;
}
