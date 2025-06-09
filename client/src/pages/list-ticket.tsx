import { useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, MapPin, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import SEO from "@/components/seo";
import { OrganizationSchema } from "@/components/schema/organization-schema";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";

// Define schema for P2P ticket listing with event details
const ticketWithEventSchema = z.object({
  // Event details
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventVenue: z.string().min(1, "Venue is required"),
  eventVenueAddress: z.string().optional(),
  eventLatitude: z.number().optional(),
  eventLongitude: z.number().optional(),
  eventCategory: z.string().min(1, "Category is required"),
  
  // Basic listing details for P2P marketplace
  quantity: z.number().min(1, "Quantity must be at least 1"),
  additionalInfo: z.string().optional(),
});

type TicketWithEventForm = z.infer<typeof ticketWithEventSchema>;

export default function ListTicket() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [venueInputValue, setVenueInputValue] = useState("");

  const form = useForm<TicketWithEventForm>({
    resolver: zodResolver(ticketWithEventSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      eventTime: "",
      eventVenue: "",
      eventVenueAddress: "",
      eventLatitude: undefined,
      eventLongitude: undefined,
      eventCategory: "",
      quantity: 1,
      additionalInfo: "",
    },
  });

  const onPlaceChanged = useCallback(() => {
    if (selectedPlace) {
      const place = selectedPlace;
      const venue = place.name || "";
      const address = place.formatted_address || "";
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      form.setValue("eventVenue", venue);
      form.setValue("eventVenueAddress", address);
      if (lat && lng) {
        form.setValue("eventLatitude", lat);
        form.setValue("eventLongitude", lng);
      }
      setVenueInputValue(venue);
    }
  }, [selectedPlace, form]);

  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleVenueSearch = useCallback((query: string) => {
    setVenueInputValue(query);
    form.setValue("eventVenue", query);
    
    // Clear previous selection when user starts typing again
    if (selectedPlace && query !== selectedPlace.name) {
      setSelectedPlace(null);
      form.setValue("eventVenueAddress", "");
      form.setValue("eventLatitude", undefined);
      form.setValue("eventLongitude", undefined);
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Use Google Places API to search for venues
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: query + " venue",
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5)); // Show top 5 results
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      });
    }
  }, [form, selectedPlace]);

  const handleSelectVenue = useCallback((place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    const venue = place.name || "";
    const address = place.formatted_address || "";
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();

    form.setValue("eventVenue", venue);
    form.setValue("eventVenueAddress", address);
    if (lat && lng) {
      form.setValue("eventLatitude", lat);
      form.setValue("eventLongitude", lng);
    }
    
    setVenueInputValue(venue);
    setShowResults(false);
    setSearchResults([]);
  }, [form]);

  const handleClearVenue = useCallback(() => {
    setSelectedPlace(null);
    setVenueInputValue("");
    setSearchResults([]);
    setShowResults(false);
    form.setValue("eventVenue", "");
    form.setValue("eventVenueAddress", "");
    form.setValue("eventLatitude", undefined);
    form.setValue("eventLongitude", undefined);
  }, [form]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketWithEventForm) => {
      const response = await apiRequest("POST", "/api/tickets/with-event", {
        ...data,
        sellerId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your ticket has been listed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      navigate("/my-tickets");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to list ticket",
      });
    },
  });

  const onSubmit = (data: TicketWithEventForm) => {
    createTicketMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEO
          title="Login Required | List Tickets for Sale - Ticket Bazaar"
          description="Please log in to list your event tickets for sale on Ticket Bazaar."
          canonicalUrl="https://ticketbazaar.co.in/list-ticket"
        >
          <OrganizationSchema />
        </SEO>
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">
          List Your Ticket
        </h1>

        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to list tickets for sale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please sign in to list your tickets for sale on Ticket Bazaar.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-4">
                <Button onClick={() => navigate("/login")} className="w-full">
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-primary hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo";

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<div>Loading Maps...</div>}
    >
      <div className="container mx-auto px-4 py-8">
        <SEO
          title="Sell Your Event Tickets | List Tickets for Sale - Ticket Bazaar"
          description="Sell your unused event tickets safely and securely on Ticket Bazaar. List tickets for concerts, sports events, and festivals with our transparent pricing policy and secure payment system."
          canonicalUrl="https://ticketbazaar.co.in/list-ticket"
        >
          <OrganizationSchema />
        </SEO>
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">
          List Your Ticket
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>List Your Ticket</CardTitle>
              <CardDescription>
                Enter the event details and ticket information to list your
                ticket for sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  data-testid="ticket-listing-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Event Details Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium text-lg">Event Details</h3>

                    <FormField
                      control={form.control}
                      name="eventTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="ticket-title"
                              placeholder="e.g., Arijit Singh Live Concert"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eventTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="eventVenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Venue Location
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Search for venue (e.g., Phoenix Marketcity, Mumbai)"
                                value={venueInputValue}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setVenueInputValue(value);
                                  field.onChange(value);
                                  handleVenueSearch(value);
                                }}
                                onFocus={() => {
                                  if (searchResults.length > 0) {
                                    setShowResults(true);
                                  }
                                }}
                                onBlur={(e) => {
                                  // Delay hiding results to allow clicks on dropdown items
                                  setTimeout(() => {
                                    setShowResults(false);
                                  }, 200);
                                  field.onBlur();
                                }}
                                name={field.name}
                                ref={field.ref}
                              />
                              
                              {/* Clear button */}
                              {(venueInputValue || selectedPlace) && (
                                <button
                                  type="button"
                                  onClick={handleClearVenue}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  aria-label="Clear venue selection"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                              
                              {/* Search Results Dropdown */}
                              {showResults && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {searchResults.map((place, index) => (
                                    <button
                                      key={place.place_id || index}
                                      type="button"
                                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                      onClick={() => handleSelectVenue(place)}
                                    >
                                      <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm text-gray-900 line-clamp-1">
                                            {place.name}
                                          </p>
                                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                            {place.formatted_address}
                                          </p>
                                          {place.types && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {place.types.slice(0, 2).map((type) => (
                                                <span
                                                  key={type}
                                                  className="inline-block px-1.5 py-0.5 text-xs bg-blue-50 text-blue-600 rounded capitalize"
                                                >
                                                  {type.replace(/_/g, ' ')}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {selectedPlace && (
                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                                  <p className="font-medium text-green-800">{selectedPlace.name}</p>
                                  <p className="text-green-600">{selectedPlace.formatted_address}</p>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="music">Music & Concerts</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="theater">Theater & Arts</SelectItem>
                              <SelectItem value="comedy">Comedy</SelectItem>
                              <SelectItem value="festivals">Festivals</SelectItem>
                              <SelectItem value="conferences">Conferences & Events</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Listing Details Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium text-lg">Listing Details</h3>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tickets</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="8"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="ticket-description"
                              placeholder="Any additional details about the tickets, seating information, or other relevant details..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    data-testid="submit-button"
                    type="submit"
                    className="w-full"
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending
                      ? "Listing..."
                      : "List Ticket"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with guidelines */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Selling Guidelines</CardTitle>
              <CardDescription>
                Important information about selling tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Price Restrictions</AlertTitle>
                <AlertDescription>
                  According to our policy, you cannot list tickets for more than
                  their original face value.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Contact Information</h3>
                <p className="text-sm text-textSecondary">
                  Interested buyers will contact you directly through your
                  preferred contact method (phone or email). Make sure your
                  profile information is up to date.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Instagram Profile</h3>
                <p className="text-sm text-textSecondary">
                  Your Instagram profile will be displayed to buyers to help
                  build trust and verify your identity.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Instant Listing</h3>
                <p className="text-sm text-textSecondary">
                  Your tickets will be available for buyers immediately after
                  completing your listing.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">No Platform Fees</h3>
                <p className="text-sm text-textSecondary">
                  Ticket Bazaar does not charge any fees for listing or selling
                  tickets. We simply connect buyers and sellers - all
                  transactions happen directly between users.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </LoadScript>
  );
}
