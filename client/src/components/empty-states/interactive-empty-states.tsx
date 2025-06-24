import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Ticket, MapPin, Calendar, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedEmptyState } from "./animated-empty-state";
import { FloatingBackground } from "./floating-elements";

// Interactive empty state for no search results with suggestions
export function InteractiveNoResults({ 
  searchTerm, 
  onSearchSuggestion,
  onClearSearch 
}: { 
  searchTerm: string;
  onSearchSuggestion: (suggestion: string) => void;
  onClearSearch: () => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    "concerts",
    "sports",
    "comedy shows",
    "theatre",
    "festivals"
  ];

  return (
    <FloatingBackground>
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated search icon with cross */}
        <motion.div
          className="mx-auto w-24 h-24 mb-6 relative cursor-pointer"
          onClick={() => setShowSuggestions(!showSuggestions)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
            <motion.div
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-white text-xs">✕</span>
            </motion.div>
          </div>
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No results for "{searchTerm}"
        </h3>
        
        <p className="text-gray-600 mb-6">
          Try searching for something else or explore popular categories
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
          <Button 
            variant="default"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            {showSuggestions ? "Hide" : "Show"} Suggestions
          </Button>
        </div>

        {/* Animated suggestions */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showSuggestions ? "auto" : 0,
            opacity: showSuggestions ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-2xl mx-auto">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                onClick={() => onSearchSuggestion(suggestion)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </FloatingBackground>
  );
}

// Playful empty state for when there are no events in a city
export function PlayfulCityEmpty({ 
  cityName, 
  onExploreOtherCities 
}: { 
  cityName: string;
  onExploreOtherCities: () => void;
}) {
  const [clickCount, setClickCount] = useState(0);

  const messages = [
    `${cityName} is taking a break from events!`,
    `Even ${cityName} needs some quiet time...`,
    `The venues in ${cityName} are probably just sleeping!`,
    `Maybe everyone in ${cityName} is planning surprise events?`,
    `${cityName} is saving up all the fun for later!`
  ];

  const currentMessage = messages[Math.min(clickCount, messages.length - 1)];

  return (
    <FloatingBackground>
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="mx-auto w-24 h-24 mb-6 cursor-pointer"
          onClick={() => setClickCount(prev => prev + 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center relative"
            animate={{ 
              rotate: clickCount > 0 ? [0, 5, -5, 0] : 0,
              scale: clickCount > 2 ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <MapPin className="h-12 w-12 text-purple-500" />
            
            {/* Fun particles on multiple clicks */}
            {clickCount > 3 && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-pink-400 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 100],
                      y: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.h3
          className="text-xl font-semibold text-gray-900 mb-2"
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          No Events in {cityName}
        </motion.h3>
        
        <motion.p
          className="text-gray-600 mb-6"
          key={currentMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {currentMessage}
        </motion.p>

        <Button 
          onClick={onExploreOtherCities}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          Explore Other Cities
        </Button>

        {clickCount > 5 && (
          <motion.p
            className="text-xs text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            You've clicked {clickCount} times! That's dedication! 🎯
          </motion.p>
        )}
      </motion.div>
    </FloatingBackground>
  );
}

// Interactive loading state with progress hints
export function InteractiveLoadingState({ 
  message = "Loading...",
  hints = ["Searching through thousands of events...", "Checking for the best deals...", "Almost there..."]
}: {
  message?: string;
  hints?: string[];
}) {
  const [currentHint, setCurrentHint] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setCurrentHint(prev => (prev + 1) % hints.length);
    }, 2000);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Animated loader */}
      <motion.div
        className="mx-auto w-16 h-16 mb-6 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        
        {/* Inner spinning element */}
        <motion.div
          className="absolute inset-2 border-2 border-purple-200 border-b-purple-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
      
      <motion.p
        className="text-gray-600 text-sm"
        key={currentHint}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {hints[currentHint]}
      </motion.p>
    </motion.div>
  );
}