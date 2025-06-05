import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: 'verified' | 'unverified' | 'warning' | 'error' | 'loading';
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerificationBadge({ 
  status, 
  confidence, 
  size = 'md', 
  className 
}: VerificationBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: ShieldCheck,
          text: confidence ? `Verified (${confidence}%)` : 'Verified',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'warning':
        return {
          icon: ShieldAlert,
          text: confidence ? `Medium Risk (${confidence}%)` : 'Medium Risk',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          text: confidence ? `High Risk (${confidence}%)` : 'High Risk',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'loading':
        return {
          icon: Shield,
          text: 'Verifying...',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          icon: Shield,
          text: 'Not Verified',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeConfig = {
    sm: { badge: 'text-xs px-2 py-1', icon: 'h-3 w-3' },
    md: { badge: 'text-sm px-3 py-1', icon: 'h-4 w-4' },
    lg: { badge: 'text-base px-4 py-2', icon: 'h-5 w-5' }
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        config.className,
        sizeConfig[size].badge,
        'flex items-center gap-1.5 font-medium',
        className
      )}
    >
      <Icon className={cn(sizeConfig[size].icon, status === 'loading' && 'animate-pulse')} />
      {config.text}
    </Badge>
  );
}