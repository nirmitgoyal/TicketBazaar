import type { Variant, Variants } from "framer-motion";

/**
 * Standard animation durations in seconds
 */
export const durations = {
  fast: 0.15,
  medium: 0.3,
  slow: 0.5,
};

/**
 * Standard animation easings
 */
export const easings = {
  smooth: [0.4, 0, 0.2, 1], // Equivalent to CSS cubic-bezier(0.4, 0, 0.2, 1)
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  bounce: [0.175, 0.885, 0.32, 1.275],
  spring: [0.34, 1.56, 0.64, 1], // Natural spring effect
};

/**
 * Fade-in animation variant
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

/**
 * Fade-in animation with a slight upward movement
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

/**
 * Fade-in animation with a slight downward movement
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

/**
 * Scale-up animation with fade
 */
export const scaleUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.medium,
      ease: easings.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

/**
 * Slight bounce animation for buttons and interactive elements
 */
export const buttonTap: Variant = {
  scale: 0.96,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
};

/**
 * Hover animation for cards and larger elements
 */
export const cardHover: Variant = {
  y: -5,
  scale: 1.02,
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
  transition: {
    duration: durations.medium,
    ease: easings.smooth,
  },
};

/**
 * Staggered children animation
 * @param staggerChildren Duration between each child animation
 * @param delayChildren Delay before starting the sequence
 * @returns Framer Motion variant for parent
 */
export const staggerContainer = (
  staggerChildren = 0.05,
  delayChildren = 0,
): Variants => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

/**
 * Animation for list items
 */
export const listItem: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Micro-animation for success notification
 */
export const successAnimation: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.bounce,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Animation for page transitions
 */
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeIn,
    },
  },
};

/**
 * Subtle wave animation for notification indicators
 */
export const pulseAnimation: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

/**
 * Animation for tooltip/popup appearing
 */
export const tooltipAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.fast,
      ease: easings.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 5,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};
