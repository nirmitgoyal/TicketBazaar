import { motion } from "framer-motion";

interface FloatingElementProps {
  emoji: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({ 
  emoji, 
  delay = 0, 
  duration = 3,
  className = ""
}: FloatingElementProps) {
  return (
    <motion.div
      className={`absolute text-2xl pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: [0, -100],
        x: [0, Math.random() * 40 - 20],
        rotate: [0, Math.random() * 360],
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}

export function FloatingBackground({ children }: { children: React.ReactNode }) {
  const floatingElements = [
    { emoji: "🎭", delay: 0.5, duration: 4 },
    { emoji: "🎪", delay: 1.2, duration: 3.5 },
    { emoji: "🎨", delay: 2.1, duration: 4.2 },
    { emoji: "🎯", delay: 3.3, duration: 3.8 },
    { emoji: "⭐", delay: 1.8, duration: 4.5 },
    { emoji: "🌟", delay: 2.7, duration: 3.2 },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element, index) => (
          <FloatingElement
            key={index}
            emoji={element.emoji}
            delay={element.delay}
            duration={element.duration}
            className={`
              ${index % 3 === 0 ? 'left-1/4' : index % 3 === 1 ? 'left-1/2' : 'left-3/4'}
              ${index % 2 === 0 ? 'top-1/4' : 'top-3/4'}
            `}
          />
        ))}
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}