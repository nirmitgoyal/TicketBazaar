import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Flame,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface RecommendationCarouselProps {
  className?: string;
  maxItems?: number;
}

export function EventRecommendations({
  className = "",
  maxItems = 8,
}: RecommendationCarouselProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Fetch personalized recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/recommendations", user?.id],
    enabled: !!user,
  });

  // Fetch popular events as fallback for non-authenticated users
  const { data: popularEvents } = useQuery({
    queryKey: ["/api/events/popular"],
    enabled: !user,
  });

  const events = recommendations || popularEvents || [];
  const displayEvents = Array.isArray(events) ? events.slice(0, maxItems) : [];

  const canGoNext = currentIndex + itemsPerPage < displayEvents.length;
  const canGoPrev = currentIndex > 0;

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex(Math.max(0, currentIndex - itemsPerPage));
    }
  };

  const formatEventDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "MMM d, yyyy");
    } catch {
      return "Date TBA";
    }
  };

  const formatEventTime = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "h:mm a");
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? "Recommended for You" : "Popular Events"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayEvents.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? "Recommended for You" : "Popular Events"}
          </h2>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              Based on your preferences and browsing history
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={!canGoPrev}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)`,
            width: `${Math.ceil(displayEvents.length / itemsPerPage) * 100}%`,
          }}
        >
          {displayEvents.map((event: Event) => (
            <div
              key={event.id}
              className={`flex-shrink-0 px-2`}
              style={{
                width: `${100 / Math.ceil(displayEvents.length / itemsPerPage)}%`,
              }}
            >
              <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white rounded-xl overflow-hidden">
                <div className="relative">
                  <div
                    className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden"
                    style={
                      event.eventImageUrl
                        ? {
                            backgroundImage: `url(${event.eventImageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                    {/* Trending/Selling Fast Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {event.trending && (
                        <Badge className="bg-orange-500 text-white border-0 shadow-sm">
                          <Flame className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {event.sellingFast && (
                        <Badge className="bg-yellow-500 text-white border-0 shadow-sm">
                          <Zap className="h-3 w-3 mr-1" />
                          Selling Fast
                        </Badge>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-gray-800 border-0"
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Event Title */}
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-medium">
                        {formatEventDate(event.eventDate)}
                      </span>
                      <span className="ml-2 text-gray-500">
                        {formatEventTime(event.eventDate)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/event/${event.id}`}>
                    <Button className="w-full mt-3 group-hover:shadow-md transition-all">
                      <Users className="h-4 w-4 mr-2" />
                      View Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {Math.ceil(displayEvents.length / itemsPerPage) > 1 && (
        <div className="flex justify-center space-x-2 pt-2">
          {Array.from({
            length: Math.ceil(displayEvents.length / itemsPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsPerPage) === index
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
