import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket } from "@shared/schema";

interface EventAtmosphereProps {
  event: Ticket | null;
  isActive: boolean;
}

interface AtmosphereConfig {
  gradient: string;
  animation: string;
  opacity: number;
  duration: number;
}

const getAtmosphereConfig = (event: Event | null): AtmosphereConfig => {
  if (!event) {
    return {
      gradient:
        "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%)",
      animation: "none",
      opacity: 0,
      duration: 0.3,
    };
  }

  const eventType = event.category.toLowerCase();
  const eventTitle = event.eventTitle.toLowerCase();

  // Coldplay concert atmosphere
  if (eventTitle.includes("coldplay")) {
    return {
      gradient:
        "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.4) 50%, rgba(59,130,246,0.4) 100%)",
      animation: "sparkle",
      opacity: 0.8,
      duration: 1.5,
    };
  }

  // Cricket/IPL match atmosphere
  if (
    eventTitle.includes("cricket") ||
    eventTitle.includes("ipl") ||
    eventTitle.includes("csk") ||
    eventTitle.includes("mi")
  ) {
    return {
      gradient:
        "linear-gradient(135deg, rgba(34,197,94,0.5) 0%, rgba(59,130,246,0.3) 50%, rgba(168,85,247,0.4) 100%)",
      animation: "wave",
      opacity: 0.7,
      duration: 1.2,
    };
  }

  // Event category-based atmospheres
  switch (eventType) {
    case "concerts":
    case "music":
      return {
        gradient:
          "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.4) 50%, rgba(59,130,246,0.4) 100%)",
        animation: "sparkle",
        opacity: 0.8,
        duration: 1.5,
      };

    case "sports":
      return {
        gradient:
          "linear-gradient(135deg, rgba(239,68,68,0.4) 0%, rgba(245,101,101,0.4) 50%, rgba(251,146,60,0.4) 100%)",
        animation: "pulse",
        opacity: 0.7,
        duration: 1.0,
      };

    case "movies":
    case "cinema":
      return {
        gradient:
          "linear-gradient(135deg, rgba(30,41,59,0.6) 0%, rgba(51,65,85,0.5) 50%, rgba(71,85,105,0.4) 100%)",
        animation: "fade",
        opacity: 0.9,
        duration: 2.0,
      };

    case "classical":
    case "theater":
      return {
        gradient:
          "linear-gradient(135deg, rgba(17,24,39,0.7) 0%, rgba(31,41,55,0.6) 50%, rgba(55,65,81,0.5) 100%)",
        animation: "elegant",
        opacity: 0.8,
        duration: 2.5,
      };

    default:
      return {
        gradient:
          "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.3) 50%, rgba(236,72,153,0.3) 100%)",
        animation: "gentle",
        opacity: 0.6,
        duration: 1.5,
      };
  }
};

const AnimatedBackground: React.FC<{ config: AtmosphereConfig }> = ({
  config,
}) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{
        opacity: config.opacity,
        background: config.gradient,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: config.duration, ease: "easeInOut" }}
      style={{
        background: config.gradient,
      }}
    />
  );
};

const ParticleEffect: React.FC<{ animation: string; isActive: boolean }> = ({
  animation,
  isActive,
}) => {
  if (!isActive || animation === "none") return null;

  const getParticleClass = () => {
    switch (animation) {
      case "sparkle":
        return "animate-ping";
      case "wave":
        return "animate-bounce";
      case "pulse":
        return "animate-pulse";
      default:
        return "animate-pulse";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated particles */}
      <div
        className={`absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full ${getParticleClass()}`}
        style={{ animationDelay: "0s", animationDuration: "2s" }}
      />
      <div
        className={`absolute top-3/4 right-1/3 w-1 h-1 bg-white/40 rounded-full ${getParticleClass()}`}
        style={{ animationDelay: "0.5s", animationDuration: "3s" }}
      />
      <div
        className={`absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-white/20 rounded-full ${getParticleClass()}`}
        style={{ animationDelay: "1s", animationDuration: "2.5s" }}
      />
      <div
        className={`absolute top-1/2 right-1/4 w-1 h-1 bg-white/35 rounded-full ${getParticleClass()}`}
        style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}
      />
    </div>
  );
};

export const EventAtmosphere: React.FC<EventAtmosphereProps> = ({
  event,
  isActive,
}) => {
  const config = getAtmosphereConfig(isActive ? event : null);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <AnimatePresence mode="wait">
        {isActive && event && (
          <motion.div
            key={event.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedBackground config={config} />
            <ParticleEffect animation={config.animation} isActive={isActive} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
