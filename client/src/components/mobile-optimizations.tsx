import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Filter, MapPin, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTicketCardProps {
  ticket: any;
  onSelect: (ticket: any) => void;
  className?: string;
}

export function MobileTicketCard({ ticket, onSelect, className }: MobileTicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn("w-full touch-manipulation", className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Event Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
            {ticket.eventImageUrl ? (
              <img
                src={ticket.eventImageUrl}
                alt={ticket.eventTitle}
                className={cn(
                  "w-full h-full object-cover transition-opacity",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary/60" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {ticket.eventTitle}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {ticket.venue}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-sm text-primary">
                  {formatPrice(ticket.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ticket.quantity} left
                </div>
              </div>
            </div>

            {/* Location and Date */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{ticket.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(ticket.eventDate)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {ticket.category}
              </Badge>
              {ticket.trending && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  Trending
                </Badge>
              )}
              {ticket.sellingFast && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  Selling Fast
                </Badge>
              )}
            </div>

            {/* Expandable Details */}
            {isExpanded && (
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-medium">Section:</span> {ticket.section || 'General'}
                </div>
                {ticket.row && (
                  <div>
                    <span className="font-medium">Row:</span> {ticket.row}
                  </div>
                )}
                {ticket.additionalInfo && (
                  <div>
                    <span className="font-medium">Notes:</span> {ticket.additionalInfo}
                  </div>
                )}
                <div>
                  <span className="font-medium">Transfer:</span> {ticket.transferMethod}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 px-2 text-xs"
              >
                {isExpanded ? (
                  <>
                    Less <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => onSelect(ticket)}
                className="h-8 px-4 text-xs"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileFilterBarProps {
  activeFilters: any;
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

export function MobileFilterBar({ activeFilters, onFilterChange, totalResults }: MobileFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <>
      {/* Filter Toggle */}
      <div className="sticky top-0 bg-background border-b p-3 z-40">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalResults} results
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-8 gap-2",
              hasActiveFilters && "border-primary text-primary"
            )}
          >
            <Filter className="h-3 w-3" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">
                {Object.keys(activeFilters).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-background border-b p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFilterChange({});
                setIsOpen(false);
              }}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>

          {/* Quick Filter Chips */}
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">Category</div>
              <div className="flex flex-wrap gap-2">
                {['concerts', 'sports', 'theater', 'comedy', 'festivals'].map(category => (
                  <Button
                    key={category}
                    variant={activeFilters.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange({
                      ...activeFilters,
                      category: activeFilters.category === category ? undefined : category
                    })}
                    className="h-8 text-xs capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">City</div>
              <div className="flex flex-wrap gap-2">
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'].map(city => (
                  <Button
                    key={city}
                    variant={activeFilters.city === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange({
                      ...activeFilters,
                      city: activeFilters.city === city ? undefined : city
                    })}
                    className="h-8 text-xs"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1 h-9"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY.current - startY.current);
    
    if (pullDistance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(pullDistance, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 bg-primary/10 flex items-center justify-center transition-all duration-200"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="text-sm text-primary font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      
      <div style={{ transform: `translateY(${isPulling ? pullDistance : 0}px)` }}>
        {children}
      </div>
    </div>
  );
}