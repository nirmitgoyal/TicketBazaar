import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  variant?: "default" | "dots" | "pulse";
}

/**
 * Optimized loading spinner component with multiple variants
 */
export function LoadingSpinner({ 
  size = "md", 
  text, 
  className,
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex space-x-1">
          <div className={cn("rounded-full bg-current animate-bounce", 
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )} style={{ animationDelay: "0ms" }} />
          <div className={cn("rounded-full bg-current animate-bounce",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )} style={{ animationDelay: "150ms" }} />
          <div className={cn("rounded-full bg-current animate-bounce",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )} style={{ animationDelay: "300ms" }} />
        </div>
        {text && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "rounded-full bg-current animate-pulse",
          sizeClasses[size]
        )} />
        {text && (
          <span className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * Full page loading component
 */
export function PageSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Inline loading component
 */
export function InlineSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}