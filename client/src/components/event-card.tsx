import { Link } from "wouter";
import { format } from "date-fns";
import { Ticket } from "@shared/schema";
import { motion } from "framer-motion";
import { cardHover, buttonTap, fadeInUp } from "@/lib/animations";

interface EventCardProps {
  event: Ticket;
  onClick?: () => void;
  index?: number; // For staggered animations
}

export function EventCard({
  event,
  onClick,
  index = 0,
}: EventCardProps) {
  const { id, eventTitle: title, venue, eventDate: date } = event;

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "MMM");
    } catch {
      return "---";
    }
  };

  const formatDay = (date: Date | string) => {
    try {
      return format(new Date(date), "dd");
    } catch {
      return "--";
    }
  };

  const formatDayOfWeek = (date: Date | string) => {
    try {
      return format(new Date(date), "EEE").toUpperCase();
    } catch {
      return "---";
    }
  };

  const formatTime = (date: Date | string) => {
    try {
      return format(new Date(date), "h:mm a");
    } catch {
      return "--:--";
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden border border-gray-200 cursor-pointer touch-manipulation shadow-sm hover:shadow-md mobile:hover:shadow-sm touch:hover:shadow-sm active:shadow-md transition-all duration-200 group"
      onClick={onClick}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        delay: index * 0.03, // Faster stagger for mobile
      }}
      whileHover={{
        y: -2,
        scale: 1.005,
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.06)",
        transition: {
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      whileTap={{
        scale: 0.99,
        transition: { duration: 0.08 },
      }}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <motion.div
            className="bg-background rounded-lg min-w-[64px] xs:min-w-[70px] md:min-w-[80px] text-center p-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + index * 0.03 }}
          >
            <p className="text-xs sm:text-sm text-textSecondary">
              {formatDate(date)}
            </p>
            <p className="text-lg sm:text-xl font-bold text-textPrimary">
              {formatDay(date)}
            </p>
            <p className="text-xs text-textSecondary">
              {formatDayOfWeek(date)}
            </p>
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.h3
              className="font-poppins font-semibold text-sm sm:text-base mb-1 line-clamp-2 leading-snug"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.03 }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-xs sm:text-sm text-textSecondary mb-1 line-clamp-1"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + index * 0.03 }}
            >
              {venue}
            </motion.p>
            <motion.p
              className="text-xs text-textSecondary"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.03 }}
            >
              {formatTime(date)}
            </motion.p>

          </div>
        </div>
      </div>
    </motion.div>
  );
}