import { EventCardSkeleton } from "./event-card-skeleton";
import { TicketCardSkeleton } from "./ticket-card-skeleton";

interface SkeletonGridProps {
  type: "events" | "tickets";
  count?: number;
  className?: string;
}

export function SkeletonGrid({ type, count = 6, className = "" }: SkeletonGridProps) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {type === "events" ? (
            <EventCardSkeleton index={index} />
          ) : (
            <TicketCardSkeleton index={index} />
          )}
        </div>
      ))}
    </div>
  );
}