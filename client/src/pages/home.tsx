import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { Loader2 } from "lucide-react";
import { Ticket } from "@shared/schema";

const categories = [
  { id: "all", label: "All Events" },
  { id: "concert", label: "Concerts" },
  { id: "sports", label: "Sports" },
  { id: "theater", label: "Theater" },
  { id: "comedy", label: "Comedy" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: events, isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredEvents = events?.filter(event => 
    selectedCategory === "all" || event.category.toLowerCase() === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find Tickets</h1>
        <p className="text-muted-foreground">Discover events and buy tickets from verified sellers</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found for the selected category.</p>
        </div>
      )}
    </div>
  );
}