import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface EventCardSkeletonProps {
  index?: number;
}

export function EventCardSkeleton({ index = 0 }: EventCardSkeletonProps) {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col space-y-3">
          {/* Date skeleton */}
          <div className="bg-background rounded-lg text-center p-2">
            <Skeleton className="h-3 w-16 mx-auto mb-1" />
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>

          {/* Event title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Location and details */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          {/* Popularity metrics skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex items-center space-x-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}