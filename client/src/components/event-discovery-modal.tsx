import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Calendar, Users, TrendingUp, ExternalLink, Plus } from "lucide-react";

interface DiscoveredEvent {
  title: string;
  description: string;
  venue: string;
  venueAddress: string;
  date: Date;
  category: string;
  ticketPlatforms: string[];
  estimatedDemand: 'low' | 'medium' | 'high';
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  sourceUrls: string[];
  trending: boolean;
  ageRestriction?: string;
}

interface EventDiscoveryModalProps {
  open: boolean;
  onClose: () => void;
  onEventSelect?: (event: DiscoveredEvent) => void;
}

export function EventDiscoveryModal({ open, onClose, onEventSelect }: EventDiscoveryModalProps) {
  const [location, setLocation] = useState("");
  const [events, setEvents] = useState<DiscoveredEvent[]>([]);
  const { toast } = useToast();

  const discoverEventsMutation = useMutation({
    mutationFn: async (searchLocation: string) => {
      const response = await apiRequest("POST", "/api/event-discovery", {
        location: searchLocation,
        dateRange: {
          start: new Date(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to discover events");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setEvents(data.data || []);
      toast({
        title: "Events discovered",
        description: `Found ${data.data?.length || 0} trending events in ${location}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Discovery failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a city or location to search for events",
        variant: "destructive",
      });
      return;
    }
    discoverEventsMutation.mutate(location);
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (priceRange: DiscoveredEvent['priceRange']) => {
    const symbol = priceRange.currency === 'USD' ? '$' : 
                  priceRange.currency === 'EUR' ? '€' : 
                  priceRange.currency === 'GBP' ? '£' : 
                  priceRange.currency === 'INR' ? '₹' : priceRange.currency;
    
    return `${symbol}${priceRange.min}-${priceRange.max}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Discover Trending Events
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Enter city, state, or country..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={discoverEventsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {discoverEventsMutation.isPending ? "Searching..." : "Discover"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {events.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trending Events in {location}</h3>
                <Badge variant="secondary">{events.length} events found</Badge>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {events.map((event, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold line-clamp-2">
                            {event.title}
                            {event.trending && (
                              <Badge className="ml-2 bg-orange-100 text-orange-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.venue}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getDemandColor(event.estimatedDemand)}>
                            <Users className="h-3 w-3 mr-1" />
                            {event.estimatedDemand} demand
                          </Badge>
                          <div className="text-sm font-medium">
                            {formatPrice(event.priceRange)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {event.category}
                          </Badge>
                          {event.ageRestriction && (
                            <Badge variant="outline" className="text-xs">
                              {event.ageRestriction}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {event.sourceUrls.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(event.sourceUrls[0], '_blank')}
                              className="text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          )}
                          {onEventSelect && (
                            <Button
                              size="sm"
                              onClick={() => onEventSelect(event)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Create Listing
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {event.ticketPlatforms.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div className="text-xs text-gray-500">
                            Available on: {event.ticketPlatforms.join(', ')}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && !discoverEventsMutation.isPending && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Events</h3>
              <p className="text-gray-600 mb-4">
                Enter a location to find trending events and discover new listing opportunities
              </p>
            </div>
          )}

          {/* Loading State */}
          {discoverEventsMutation.isPending && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Discovering trending events...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}