import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustScoreMeterProps {
  score: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  fraudRisk?: 'low' | 'medium' | 'high';
  className?: string;
  animate?: boolean;
}

export function TrustScoreMeter({ 
  score, 
  label = "Trust Score",
  size = 'md',
  showDetails = true,
  fraudRisk,
  className,
  animate = true
}: TrustScoreMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setAnimatedScore(score);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, animate]);

  const getScoreColor = (currentScore: number) => {
    if (currentScore >= 80) return 'text-green-600';
    if (currentScore >= 60) return 'text-yellow-600';
    if (currentScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackgroundColor = (currentScore: number) => {
    if (currentScore >= 80) return 'from-green-500 to-green-600';
    if (currentScore >= 60) return 'from-yellow-500 to-yellow-600';
    if (currentScore >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (currentScore: number) => {
    if (currentScore >= 80) return 'Excellent';
    if (currentScore >= 60) return 'Good';
    if (currentScore >= 40) return 'Fair';
    return 'Poor';
  };

  const getScoreIcon = (currentScore: number) => {
    if (currentScore >= 80) return CheckCircle;
    if (currentScore >= 60) return TrendingUp;
    if (currentScore >= 40) return Shield;
    return AlertTriangle;
  };

  const sizeConfig = {
    sm: {
      container: 'w-20 h-20',
      stroke: '6',
      text: 'text-xs',
      icon: 'h-3 w-3',
      radius: 32
    },
    md: {
      container: 'w-32 h-32',
      stroke: '8',
      text: 'text-sm',
      icon: 'h-4 w-4',
      radius: 52
    },
    lg: {
      container: 'w-40 h-40',
      stroke: '10',
      text: 'text-base',
      icon: 'h-5 w-5',
      radius: 64
    }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const Icon = getScoreIcon(animatedScore);

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div className="relative">
        <div className={cn("relative", config.container)}>
          {/* Background Circle */}
          <svg
            className="transform -rotate-90 w-full h-full"
            viewBox="0 0 144 144"
          >
            {/* Background track */}
            <circle
              cx="72"
              cy="72"
              r={config.radius}
              stroke="currentColor"
              strokeWidth={config.stroke}
              fill="none"
              className="text-gray-200"
            />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="72"
              cy="72"
              r={config.radius}
              stroke="url(#gradient)"
              strokeWidth={config.stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: strokeDashoffset,
                rotate: isAnimating ? [0, 360] : 0
              }}
              transition={{
                strokeDashoffset: { duration: 2, ease: "easeInOut" },
                rotate: { duration: 1, ease: "linear" }
              }}
              className="drop-shadow-sm"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`${getScoreBackgroundColor(animatedScore).split(' ')[0].replace('from-', 'text-')}`} />
                <stop offset="100%" className={`${getScoreBackgroundColor(animatedScore).split(' ')[2].replace('to-', 'text-')}`} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Icon className={cn(config.icon, getScoreColor(animatedScore), "mb-1")} />
              <motion.span
                className={cn("font-bold", config.text, getScoreColor(animatedScore))}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {Math.round(animatedScore)}
              </motion.span>
            </motion.div>
          </div>

          {/* Glow effect for high scores */}
          {animatedScore >= 80 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-lg"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Floating particles for excellent scores */}
        {animatedScore >= 90 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + (i * 10)}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  x: [0, Math.sin(i) * 10, 0],
                  opacity: [0.6, 0.3, 0.6],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showDetails && (
        <motion.div
          className="text-center space-y-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className={cn("font-medium", config.text)}>{label}</div>
          <div className={cn("font-semibold", getScoreColor(animatedScore))}>
            {getScoreLabel(animatedScore)}
          </div>
          
          {fraudRisk && (
            <motion.div
              className={cn(
                "text-xs px-2 py-1 rounded-full inline-flex items-center gap-1",
                fraudRisk === 'low' && "bg-green-100 text-green-800",
                fraudRisk === 'medium' && "bg-yellow-100 text-yellow-800",
                fraudRisk === 'high' && "bg-red-100 text-red-800"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5, duration: 0.3 }}
            >
              <Shield className="h-3 w-3" />
              {fraudRisk.charAt(0).toUpperCase() + fraudRisk.slice(1)} Risk
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}