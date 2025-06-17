import { useQuery } from "@tanstack/react-query";
import { ChevronsUp, ChevronsDown, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SeatSection = {
  id: string;
  name: string;
  popularity: number; // 0-100 scale
  availableTickets: number;
  totalTickets: number;
  averagePrice: number;
};

export type VenueMap = {
  eventId: number;
  sections: SeatSection[];
};

export function TicketHeatMap({ eventId }: { eventId: number }) {
  const [expanded, setExpanded] = useState(true); // Default to expanded
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch heat map data from the API
  const {
    data: heatMapData,
    isLoading,
    error,
  } = useQuery<VenueMap>({
    queryKey: [`/api/events/${eventId}/heatmap`],
    enabled: !!eventId,
  });

  // Auto-scroll to map when expanded
  useEffect(() => {
    if (expanded && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [expanded]);

  // Get color based on popularity (red = hot/popular, green = available, gradient in between)
  const getHeatColor = (popularity: number) => {
    // Red for high popularity (hot), green for low popularity (available)
    if (popularity >= 80) return "bg-red-500";
    if (popularity >= 60) return "bg-orange-500";
    if (popularity >= 40) return "bg-yellow-500";
    if (popularity >= 20) return "bg-lime-500";
    return "bg-green-500";
  };

  // Get text color based on popularity
  const getTextColor = (popularity: number) => {
    return popularity >= 60 ? "text-white" : "text-gray-900";
  };



  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Ticket Availability</h3>
        </div>
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !heatMapData) {
    return (
      <div className="p-6">
        <h3 className="text-xl font-bold">Ticket Availability</h3>
        <p className="text-sm text-muted-foreground">
          Unable to load seat availability data
        </p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold flex items-center justify-between">
          Ticket Availability Map
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronsUp className="h-5 w-5" />
            ) : (
              <ChevronsDown className="h-5 w-5" />
            )}
          </Button>
        </h3>
        <p className="text-textSecondary text-sm mt-1">
          See real-time seat availability and demand
        </p>
      </div>

      {!expanded ? (
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">
              Expand to view the interactive seating heat map
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {heatMapData.sections.slice(0, 4).map((section) => (
              <Badge key={section.id} variant="outline" className="px-2 py-1">
                {section.name}: {section.availableTickets} available
              </Badge>
            ))}
            {heatMapData.sections.length > 4 && (
              <Badge variant="outline" className="px-2 py-1">
                +{heatMapData.sections.length - 4} more sections
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div className="text-sm">Less demand</div>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div className="w-4 h-4 bg-lime-500 rounded"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
              </div>
              <div className="text-sm">High demand</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TooltipProvider>
              {heatMapData.sections.map((section) => (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`${getHeatColor(section.popularity)} ${getTextColor(section.popularity)} p-4 rounded-lg transition-all hover:scale-105 cursor-pointer`}
                    >
                      <div className="font-bold text-lg mb-1">
                        {section.name}
                      </div>
                      <div className="text-sm opacity-90">
                        {section.availableTickets} of {section.totalTickets}{" "}
                        tickets available
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-bold">{section.name} Section</p>
                      <p>Popularity: {section.popularity}%</p>
                      <p>
                        Tickets: {section.availableTickets}/
                        {section.totalTickets} available
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <p>
              The heat map shows the current ticket availability and demand.
              Sections in red have higher demand and fewer available tickets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
