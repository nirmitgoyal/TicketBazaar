import { Link } from "wouter";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket as TicketIcon, MapPin, Calendar, Shield, Globe } from "lucide-react";
import { Ticket as TicketType } from "@shared/schema";
import { motion } from "framer-motion";
import {
  cardHover,
  buttonTap,
  scaleUp,
  fadeInUp,
  pulseAnimation,
} from "@/lib/animations";
import { useAtmosphereContext } from "@/contexts/AtmosphereContext";
import { useSoundEffects } from "@/lib/sound-effects";
import { VerificationBadge } from "./verification-badge";
import { VerificationModal } from "./verification-modal";
import { TrustScoreMeter } from "./trust-score-meter";
import { PopularityBadge } from "./popularity-metrics";
import { PopularityMetricsInline } from "./popularity-metrics-inline";
import { formatCurrency } from "@/lib/currency-utils";
import { getCountryInfo } from "@/lib/country-utils";
import { usePopularityMetrics, useAutoTrackView } from "@/hooks/use-popularity-tracking";

interface TicketCardProps {
  ticket: TicketType;
  onClick?: () => void;
  index?: number; // For staggered animations
}

// Generate realistic trust score based on ticket data
const generateTrustScore = (ticket: TicketType): { score: number; fraudRisk: 'low' | 'medium' | 'high' } => {
  let baseScore = 50;
  
  // Event credibility factors
  if (ticket.eventTitle.toLowerCase().includes('ipl') || 
      ticket.eventTitle.toLowerCase().includes('concert') ||
      ticket.venue.toLowerCase().includes('stadium')) {
    baseScore += 20;
  }
  
  // Remove price-based scoring for P2P marketplace
  
  // Venue credibility
  if (ticket.venue.toLowerCase().includes('stadium') || 
      ticket.venue.toLowerCase().includes('center') ||
      ticket.venue.toLowerCase().includes('arena')) {
    baseScore += 15;
  }
  
  // Add some randomness for demo purposes
  const variation = Math.floor(Math.random() * 20) - 10;
  const finalScore = Math.max(15, Math.min(95, baseScore + variation));
  
  const fraudRisk: 'low' | 'medium' | 'high' = 
    finalScore >= 70 ? 'low' : 
    finalScore >= 45 ? 'medium' : 'high';
    
  return { score: finalScore, fraudRisk };
};

export function TicketCard({
  ticket,
  onClick,
  index = 0,
}: TicketCardProps) {
  const { id, eventTitle: title, venue, eventDate: date, eventImageUrl: imageUrl, trending, sellingFast } = ticket;
  const { setActiveEvent } = useAtmosphereContext();
  const { playTicketHover, playButtonHover, playClick } = useSoundEffects();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showTrustScore, setShowTrustScore] = useState(false);
  
  // Generate trust score for this ticket
  const trustData = generateTrustScore(ticket);

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "EEE, dd MMM yyyy • h:mm a");
    } catch {
      return "Date unavailable";
    }
  };

  const handleMouseEnter = () => {
    setActiveEvent(ticket);
    playTicketHover(ticket.category, ticket.eventTitle);
  };

  const handleMouseLeave = () => {
    setActiveEvent(null);
  };

  const handleButtonHover = () => {
    playButtonHover();
  };

  const handleButtonClick = () => {
    playClick();
    if (onClick) onClick();
  };

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-md touch-manipulation cursor-pointer mobile-card w-full max-w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        delay: index * 0.03, // Faster stagger for mobile
        duration: 0.25,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{
        y: -3,
        scale: 1.01,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleButtonClick}
    >
      <motion.div
        className="relative h-36 sm:h-44 md:h-48 w-full"
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.div
            className="w-full h-full bg-primary/10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              <TicketIcon className="h-16 w-16 text-primary/30" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
      <div className="p-3 sm:p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <motion.h3
              className="font-poppins font-semibold text-base sm:text-lg mb-1 mobile-text-safe"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-sm text-textSecondary flex items-center mb-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" /> {formatDate(date)}
            </motion.p>
            
            {/* Location and Currency Info */}
            <motion.div
              className="flex items-center gap-2 text-xs text-textSecondary mb-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="mobile-text-safe">{ticket.city}, {getCountryInfo(ticket.country)?.name || ticket.country}</span>
            </motion.div>

            {/* Inline Popularity Metrics */}
            <PopularityMetricsInline ticketId={ticket.id} />
            
            {/* Price Display */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-primary">
                  Available for Transfer
                </span>
                <span className="text-sm text-textSecondary">
                  Contact seller for details
                </span>
              </div>
              {ticket.quantity > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {ticket.quantity} available
                </Badge>
              )}
            </motion.div>
          </div>

          {trending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <Badge
                variant="outline"
                className="bg-green-600/10 text-green-600 border-transparent"
              >
                <motion.span
                  variants={pulseAnimation}
                  initial="hidden"
                  animate="visible"
                >
                  Trending
                </motion.span>
              </Badge>
            </motion.div>
          )}

          {sellingFast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <Badge
                variant="outline"
                className="bg-alert/10 text-alert border-transparent"
              >
                <motion.span
                  variants={pulseAnimation}
                  initial="hidden"
                  animate="visible"
                >
                  Selling Fast
                </motion.span>
              </Badge>
            </motion.div>
          )}
        </div>
        
        {/* Trust Score Section */}
        <motion.div
          className="mt-4 pt-3 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.05 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrustScoreMeter
                score={trustData.score}
                size="sm"
                showDetails={false}
                fraudRisk={trustData.fraudRisk}
                animate={showTrustScore}
              />
              <VerificationBadge 
                confidence={trustData.score}
                fraudRisk={trustData.fraudRisk}
                isVerified={trustData.score >= 60}
                size="sm"
                animated={showTrustScore}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowTrustScore(!showTrustScore);
                playClick();
              }}
              onMouseEnter={handleButtonHover}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Shield className="h-4 w-4 mr-1" />
              {showTrustScore ? 'Hide' : 'Verify'}
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        ticket={ticket}
      />
    </motion.div>
  );
}