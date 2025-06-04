import React from "react";
import { Event } from "@shared/schema";
import { Link } from "wouter";

interface EventListFallbackProps {
  events: Event[];
  title?: string;
  description?: string;
}

const EventListFallback: React.FC<EventListFallbackProps> = ({
  events,
  title = "Events",
  description = "View all available events",
}) => {
  return (
    <div className="rounded-lg border overflow-hidden h-[600px]">
      <div className="bg-primary/10 p-4 mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-4 overflow-auto h-[calc(100%-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {event.imageUrl && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold text-lg text-primary line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-700">{event.venue}</p>
                {event.city && (
                  <p className="text-xs text-gray-500 mb-1">{event.city}</p>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 inline-block mb-2">
                  {event.category}
                </div>
                <div className="mt-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventListFallback;
