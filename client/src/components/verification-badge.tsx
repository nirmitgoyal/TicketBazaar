import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified?: boolean;
  confidence?: number;
  fraudRisk?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function VerificationBadge({ 
  isVerified, 
  confidence, 
  fraudRisk,
  size = 'md',
  animated = true,
  className 
}: VerificationBadgeProps) {
  
  if (!isVerified && !confidence) {
    return (
      <Badge variant="outline" className={cn("text-gray-500", className)}>
        <Shield className="h-3 w-3 mr-1" />
        Unverified
      </Badge>
    );
  }

  const getVerificationLevel = () => {
    if (!confidence) return 'unknown';
    if (confidence >= 80) return 'excellent';
    if (confidence >= 60) return 'good';
    if (confidence >= 40) return 'fair';
    return 'poor';
  };

  const level = getVerificationLevel();
  
  const config = {
    excellent: {
      variant: 'default' as const,
      icon: ShieldCheck,
      text: 'Verified',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    good: {
      variant: 'secondary' as const,
      icon: Shield,
      text: 'Good',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    fair: {
      variant: 'outline' as const,
      icon: ShieldAlert,
      text: 'Caution',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300'
    },
    poor: {
      variant: 'destructive' as const,
      icon: AlertTriangle,
      text: 'High Risk',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    },
    unknown: {
      variant: 'outline' as const,
      icon: Shield,
      text: 'Unverified',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300'
    }
  };

  const { icon: Icon, text, color } = config[level];

  return (
    <motion.div
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={animated ? { 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.2 
      } : undefined}
      className={className}
    >
      <Badge 
        variant={config[level].variant}
        className={cn(
          "relative overflow-hidden",
          size === 'sm' && "text-xs px-2 py-0.5",
          size === 'lg' && "text-base px-4 py-2"
        )}
      >
        <Icon className={cn(
          "mr-1",
          size === 'sm' && "h-3 w-3",
          size === 'md' && "h-4 w-4", 
          size === 'lg' && "h-5 w-5"
        )} />
        {text}
        {confidence && (
          <span className="ml-1 font-mono text-xs">
            {Math.round(confidence)}%
          </span>
        )}
        
        {/* Sparkle effect for excellent verification */}
        {level === 'excellent' && animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          >
            <Sparkles className="absolute top-0 right-0 h-3 w-3 text-yellow-400" />
          </motion.div>
        )}
      </Badge>
      
      {/* Glow effect for high scores */}
      {level === 'excellent' && animated && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-sm -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}