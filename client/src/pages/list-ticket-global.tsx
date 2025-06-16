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
import { AlertCircle, Info, MapPin, Globe, Clock, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import { getAllCountries, getCountryInfo, detectUserCountry } from "@/lib/country-utils";

import { ticketListingSchema } from "@shared/schema";

// Extended schema for the form with additional UI fields
const globalTicketFormSchema = ticketListingSchema.extend({
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  venueAddress: z.string().optional(),
});

type GlobalTicketForm = z.infer<typeof globalTicketFormSchema>;

export default function ListTicketGlobal() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<GlobalTicketForm>({
    resolver: zodResolver(globalTicketFormSchema),
    defaultValues: {
      title: "",
      eventTitle: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      venueAddress: "",
      latitude: undefined,
      longitude: undefined,
      category: "concerts",

      transferMethod: "electronic",
      quantity: 1,
      status: "available",
      city: "",
      country: "US",
      state: "",
      postalCode: "",
      eventTimezone: "UTC",
      ageRestriction: "",
      additionalInfo: "",
      isTransferrable: true,
      showContactInfo: false,
    },
  });

  // Auto-detect user's location and set defaults
  useEffect(() => {
    const detectedCountry = detectUserCountry();
    const countryInfo = getCountryInfo(detectedCountry);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (countryInfo) {
      form.setValue("country", detectedCountry);

      form.setValue("eventTimezone", userTimezone);
    }
  }, [form]);

  // Handle form submission
  const createTicketMutation = useMutation({
    mutationFn: async (data: GlobalTicketForm) => {
      // Convert form data to ticket format
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}`);
      
      const ticketData = {
        ...data,
        eventDate: eventDateTime,
        sellerId: user?.id,
        trending: false,
        sellingFast: false,
        eventImageUrl: null,
        createdAt: new Date(),
      };

      const response = await apiRequest("POST", "/api/tickets", ticketData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your ticket listing has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GlobalTicketForm) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list a ticket.",
        variant: "destructive",
      });
      return;
    }
    createTicketMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to list tickets on our global marketplace.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const countries = getAllCountries();


  return (
    <>
      <SEOManager
        title="List Your Tickets - TicketGlobal"
        description="List your event tickets on the global marketplace. Support for multiple currencies and international markets."
        keywords="list tickets, sell tickets, global marketplace, international events"
      />
      
      <UnifiedSchema
        type="WebPage"
        name="List Ticket - TicketGlobal"
        description="Create a new ticket listing on our global marketplace"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            List Your Tickets
          </h1>
          <p className="text-gray-600">
            Sell your event tickets on our global marketplace with support for multiple currencies and international markets.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Event Information
                </CardTitle>
                <CardDescription>
                  Tell us about the event you're selling tickets for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Taylor Swift Concert" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="concerts">Concerts</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="opera">Opera</SelectItem>
                            <SelectItem value="movies">Movies</SelectItem>
                            <SelectItem value="festivals">Festivals</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Madison Square Garden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Location & Market
                </CardTitle>
                <CardDescription>
                  Specify the location and target market for your listing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventTimezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="Auto-detected" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transfer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Transfer & Availability Details
                </CardTitle>
                <CardDescription>
                  Specify ticket quantity and transfer preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Available</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="1" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="transferMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transfer method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronic">Electronic Transfer</SelectItem>
                          <SelectItem value="physical">Physical Handover</SelectItem>
                          <SelectItem value="mobile">Mobile Transfer</SelectItem>
                          <SelectItem value="email">Email Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional details about the tickets..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTicketMutation.isPending}
                className="min-w-[120px]"
              >
                {createTicketMutation.isPending ? "Creating..." : "List Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}