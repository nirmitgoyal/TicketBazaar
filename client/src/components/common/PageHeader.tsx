import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 pb-6", className)}>
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  description, 
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white p-4 rounded-lg border shadow-sm", 
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}