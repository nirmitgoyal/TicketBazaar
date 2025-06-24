import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PlayfulIconProps {
  IconComponent: LucideIcon;
  animation?: "bounce" | "wiggle" | "spin" | "pulse" | "float";
  color?: string;
  size?: number;
  className?: string;
}

export function PlayfulIcon({ 
  IconComponent, 
  animation = "bounce",
  color = "text-gray-400",
  size = 12,
  className = ""
}: PlayfulIconProps) {
  const animations = {
    bounce: {
      y: [0, -20, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    wiggle: {
      rotate: [0, -10, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    spin: {
      rotate: 360,
      transition: { duration: 4, repeat: Infinity, ease: "linear" }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    float: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <motion.div
      className={className}
      animate={animations[animation]}
      whileHover={{ scale: 1.1 }}
    >
      <IconComponent className={`h-${size} w-${size} ${color}`} />
    </motion.div>
  );
}

// Collection of animated emoji components for different states
export function BouncingTicket() {
  return (
    <motion.div
      className="text-6xl"
      animate={{ 
        rotate: [0, 5, -5, 0],
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🎫
    </motion.div>
  );
}

export function SearchingMagnifier() {
  return (
    <motion.div
      className="text-6xl relative"
      animate={{ rotate: [0, 15, -15, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🔍
      <motion.div
        className="absolute -top-2 -right-2 text-2xl"
        animate={{ 
          scale: [0, 1, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          delay: 0.5
        }}
      >
        ✨
      </motion.div>
    </motion.div>
  );
}

export function LoadingCity() {
  return (
    <motion.div
      className="text-6xl"
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🏙️
      <motion.div
        className="inline-block ml-2 text-2xl"
        animate={{ 
          opacity: [0, 1, 0],
          x: [0, 10, 0]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity,
          delay: 0.3
        }}
      >
        💫
      </motion.div>
    </motion.div>
  );
}

export function SleepingVenue() {
  return (
    <motion.div
      className="text-6xl relative"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      🏟️
      <motion.div
        className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xl"
        animate={{ 
          opacity: [0, 1, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          staggerChildren: 0.3
        }}
      >
        💤
      </motion.div>
    </motion.div>
  );
}