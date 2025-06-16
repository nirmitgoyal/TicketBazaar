import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  showHeader?: boolean;
  showFilters?: boolean;
  showGrid?: boolean;
  gridCount?: number;
  gridType?: "events" | "tickets";
  className?: string;
}

export function PageSkeleton({ 
  showHeader = true, 
  showFilters = true, 
  showGrid = true, 
  gridCount = 6,
  gridType = "events",
  className = ""
}: PageSkeletonProps) {
  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Skeleton */}
      {showHeader && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {/* Filter Bar Skeleton */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}

      {/* Grid Skeleton */}
      {showGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: gridCount }, (_, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg border p-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              {gridType === "events" ? (
                <>
                  {/* Event Date */}
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <Skeleton className="h-3 w-16 mx-auto mb-1" />
                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                  
                  {/* Event Title */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  
                  {/* Event Details */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  
                  {/* Ticket Details */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  
                  {/* Price and Actions */}
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}