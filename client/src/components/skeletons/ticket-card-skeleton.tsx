import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketCardSkeletonProps {
  index?: number;
}

export function TicketCardSkeleton({ index = 0 }: TicketCardSkeletonProps) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className="p-4 sm:p-6">
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Ticket details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-18" />
            </div>
          </div>
        </div>

        {/* Price and actions */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>

        {/* Popularity metrics */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}