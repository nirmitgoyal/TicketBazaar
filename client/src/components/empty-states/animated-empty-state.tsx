import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  animation?: "bounce" | "float" | "pulse" | "wiggle" | "spin";
  playful?: boolean;
}

export function AnimatedEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
  animation = "float",
  playful = true,
}: AnimatedEmptyStateProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Animation variants for different types
  const iconVariants = {
    bounce: {
      y: [0, -20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    wiggle: {
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    spin: {
      rotate: 360,
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleIconClick = () => {
    if (playful) {
      setClickCount((prev) => prev + 1);
    }
  };

  // Fun messages for multiple clicks
  const playfulMessages = [
    "Still nothing here! 🎭",
    "Nope, still empty! 🎪",
    "Keep clicking if you want... 🎨",
    "You're persistent! 🎯",
    "I admire your dedication! 🎪",
  ];

  const currentMessage =
    clickCount > 0 && playful
      ? playfulMessages[Math.min(clickCount - 1, playfulMessages.length - 1)]
      : description;

  return (
    <motion.div
      className={`text-center py-12 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mx-auto w-24 h-24 mb-6 cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleIconClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center relative overflow-hidden"
          animate={iconVariants[animation]}
          whileHover={
            playful
              ? {
                  background: [
                    "linear-gradient(45deg, #dbeafe, #e9d5ff)",
                    "linear-gradient(45deg, #fef3c7, #fed7d7)",
                    "linear-gradient(45deg, #d1fae5, #dbeafe)",
                  ],
                  transition: { duration: 0.3 },
                }
              : {}
          }
        >
          <Icon
            className={`h-12 w-12 transition-colors duration-300 ${
              isHovered ? "text-blue-600" : "text-gray-400"
            }`}
          />
          
          {/* Sparkle effects on hover */}
          <AnimatePresence>
            {isHovered && playful && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: Math.random() * 60 - 30,
                      y: Math.random() * 60 - 30,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.h3
        className="text-xl font-semibold text-gray-900 mb-2"
        variants={childVariants}
      >
        {title}
      </motion.h3>
      
      <motion.p
        className="text-gray-600 mb-6 max-w-md mx-auto"
        variants={childVariants}
        key={currentMessage} // Re-animate when message changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentMessage}
      </motion.p>

      {actionText && onAction && (
        <motion.div variants={childVariants}>
          <Button
            onClick={onAction}
            variant="outline"
            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            {actionText}
          </Button>
        </motion.div>
      )}

      {/* Playful click counter */}
      {clickCount > 2 && playful && (
        <motion.div
          className="mt-4 text-xs text-gray-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Clicks: {clickCount} 🎯
        </motion.div>
      )}
    </motion.div>
  );
}

// Specialized empty state components for common use cases
export function NoSearchResults({
  searchTerm,
  onClearSearch,
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) {
  const SearchIcon = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <div className="text-4xl">🔍</div>
      <motion.div
        className="absolute -top-1 -right-1 text-lg"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ❌
      </motion.div>
    </div>
  );

  return (
    <AnimatedEmptyState
      icon={SearchIcon}
      title="No Results Found"
      description={`No results match "${searchTerm}". Try different keywords or clear your search.`}
      actionText="Clear Search"
      onAction={onClearSearch}
      animation="wiggle"
    />
  );
}

export function NoTicketsAvailable() {
  const TicketIcon = ({ className }: { className?: string }) => (
    <div className={`text-4xl ${className}`}>🎫</div>
  );

  return (
    <AnimatedEmptyState
      icon={TicketIcon}
      title="No Tickets Available"
      description="No tickets are currently listed for this event. Check back later!"
      animation="bounce"
    />
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mx-auto w-16 h-16 mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </motion.div>
      <motion.p
        className="text-gray-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}