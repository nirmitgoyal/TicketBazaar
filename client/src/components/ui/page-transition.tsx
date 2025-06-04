import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that adds page transition animations
 * Wrap your page content with this component to add entrance/exit animations
 */
export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            when: "beforeChildren",
            staggerChildren: 0.1,
          },
        },
        exit: {
          opacity: 0,
          y: -20,
          transition: {
            duration: 0.25, // Slightly faster exit for better transition flow
            ease: [0.4, 0, 1, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
