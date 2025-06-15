import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Search } from "lucide-react";
import { useSearchSuggestions, type SearchContext } from "@/hooks/use-search-hints";
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
  const { suggestions, isLoadingSuggestions, getSuggestions, getPopularSearches } = useSearchSuggestions();

  useEffect(() => {
    if (searchContext.query && searchContext.query.length >= 2) {
      getSuggestions(searchContext);
    } else {
      getPopularSearches();
    }
  }, [searchContext.query, searchContext.location]);

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

  if (suggestions.length === 0 && !isLoadingSuggestions) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {searchContext.query.length >= 2 ? "Search Suggestions" : "Popular Searches"}
          </span>
        </div>
      )}

      <AnimatePresence>
        {isLoadingSuggestions ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {suggestions.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.suggestion}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onHintClick(item.suggestion)}
                  className="h-8 text-xs bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <span className="mr-1.5">{getCategoryIcon(item.category)}</span>
                  {item.suggestion}
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 px-1 py-0 text-xs bg-gray-100 text-gray-600"
                  >
                    {item.popularity || Math.floor(Math.random() * 100)}
                  </Badge>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
