import { useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { debugAuthFlow } from "@/utils/auth-debug";
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
import { AlertCircle, Info, MapPin, X, Globe, Shield, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/google-maps-config";
import { getAllCountries, getCountryInfo, detectUserCountry } from "@/lib/country-utils";

import { ticketListingSchema } from "@shared/schema";
import { InstagramHandleModal } from "@/components/InstagramHandleModal";

// Custom form schema for ticket listing with comprehensive validation
const ticketFormSchema = z.object({
  title: z
    .string()
    .min(1, "Event title is required")
    .max(100, "Event title must be 100 characters or less")
    .refine((val) => val.trim().length > 0, "Event title cannot be only whitespace")
    .refine((val) => val.trim().length >= 3, "Event title must be at least 3 characters"),
  
  eventDescription: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 1000, "Event description must be 1000 characters or less"),
  
  venue: z
    .string()
    .min(1, "Venue location is required")
    .max(200, "Venue location must be 200 characters or less")
    .refine((val) => val.trim().length > 0, "Venue location cannot be only whitespace")
    .refine((val) => val.trim().length >= 3, "Venue location must be at least 3 characters"),
  
  venueAddress: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 300, "Venue address must be 300 characters or less"),
  
  eventDate: z
    .string()
    .min(1, "Event date is required")
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(val);
    }, "Event date must be in valid format (YYYY-MM-DD)")
    .refine((val) => {
      const eventDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be today or in the future"),
  
  eventTime: z
    .string()
    .min(1, "Event time is required")
    .refine((val) => {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(val);
    }, "Event time must be in valid format (HH:MM)"),
  
  category: z
    .string()
    .min(1, "Event category is required")
    .refine((val) => {
      const validCategories = ['concerts', 'sports', 'theater', 'comedy', 'festival', 'conference', 'other'];
      return validCategories.includes(val.toLowerCase());
    }, "Please select a valid event category"),
  
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().optional(),
  
  country: z
    .string()
    .min(1, "Country is required")
    .max(2, "Country code must be 2 characters")
    .refine((val) => /^[A-Z]{2}$/.test(val), "Country must be a valid 2-letter code"),
  
  state: z.string().optional(),
  postalCode: z.string().optional(),
  eventTimezone: z.string().default("UTC"),
  ageRestriction: z.string().optional(),
  section: z.string().optional(),
  row: z.string().optional(),
  seat: z.string().optional(),

  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20 tickets")
    .int("Quantity must be a whole number"),
  
  transferMethod: z
    .string()
    .min(1, "Transfer method is required")
    .refine((val) => {
      const validMethods = ['electronic', 'physical', 'pickup'];
      return validMethods.includes(val.toLowerCase());
    }, "Please select a valid transfer method"),
  
  additionalInfo: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 1000, "Additional information must be 1000 characters or less")
    .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 10, "Additional information must be at least 10 characters if provided"),
  
  isTransferrable: z.boolean().default(true),
  showContactInfo: z.boolean().default(false),
  status: z.string().default("available"),
});

type TicketWithEventForm = z.infer<typeof ticketFormSchema>;

interface VerificationResult {
  legitimacy: 'legit' | 'suspicious' | 'fake';
  legitimacyEmoji: '✅' | '⚠️' | '❌';
  explanation: string;
  confidence: number;
  checkDetails: {
    eventExists: boolean;
    venueValid: boolean;
    dateValid: boolean;
    possibleDuplicate: boolean;
  };
}

export default function ListTicket() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [venueInputValue, setVenueInputValue] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [pendingTicketData, setPendingTicketData] = useState<TicketWithEventForm | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Google Maps API state
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const [mapsApiError, setMapsApiError] = useState<string | null>(null);

  // Google Maps API configuration
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo";
  const hasValidApiKey = googleMapsApiKey && googleMapsApiKey !== "demo" && googleMapsApiKey.length > 10;

  const form = useForm<TicketWithEventForm>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      eventDescription: "",
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
      section: "",
      row: "",
      seat: "",
      additionalInfo: "",
      isTransferrable: true,
      showContactInfo: false,
    },
  });

  // Debug component mount
  useEffect(() => {
    debugAuthFlow("ListTicket page mounted", {
      user: user?.email,
      isAuthenticated: !!user,
      hasInstagram: !!user?.instagram
    });
  }, [user]);

  // Reset verification when key fields change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && ['title', 'eventDate', 'eventTime', 'venue', 'category'].includes(name)) {
        setVerificationResult(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  const onPlaceChanged = useCallback(() => {
    if (selectedPlace) {
      const place = selectedPlace;
      const venue = place.name || "";
      const address = place.formatted_address || "";
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      form.setValue("venue", venue);
      form.setValue("venueAddress", address);
      if (lat && lng) {
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
      }
      setVenueInputValue(venue);
    }
  }, [selectedPlace, form]);

  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleVenueSearch = useCallback((query: string) => {
    setVenueInputValue(query);
    form.setValue("venue", query);

    // Clear previous selection when user starts typing again
    if (selectedPlace && query !== selectedPlace.name) {
      setSelectedPlace(null);
      form.setValue("venueAddress", "");
      form.setValue("latitude", undefined);
      form.setValue("longitude", undefined);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Use Google Places API to search for venues
    // Check if Google Maps API is loaded and valid
    if (!mapsApiLoaded || !hasValidApiKey || !window.google || !window.google.maps || !window.google.maps.places) {
      // API not available - just return without showing any results
      if (process.env.NODE_ENV === 'development') {
        console.warn('Google Maps Places API not available for venue suggestions:', {
          mapsApiLoaded,
          hasValidApiKey,
          googleMapsLoaded: !!window.google?.maps,
          placesLoaded: !!window.google?.maps?.places
        });
      }
      return;
    }

    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        // Use the new Place class instead of deprecated PlacesService
        const { Place } = window.google.maps.places;
        const request = {
          textQuery: query + " venue",
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'types'],
          maxResultCount: 5,
        };

        // Use the new searchByText method
        Place.searchByText(request).then((response) => {
          if (response.places && response.places.length > 0) {
            // Convert new Place format to old PlaceResult format for compatibility
            const convertedResults = response.places.map(place => ({
              place_id: place.id,
              name: place.displayName,
              formatted_address: place.formattedAddress,
              geometry: {
                location: place.location ? {
                  lat: () => place.location!.lat(),
                  lng: () => place.location!.lng(),
                  equals: () => false,
                  toJSON: () => ({ lat: place.location!.lat(), lng: place.location!.lng() }),
                  toUrlValue: () => `${place.location!.lat()},${place.location!.lng()}`
                } : undefined
              },
              types: place.types || []
            })) as google.maps.places.PlaceResult[];
            setSearchResults(convertedResults);
            setShowResults(true);
          } else {
            setSearchResults([]);
            setShowResults(false);
          }
        }).catch(() => {
          // Fallback to deprecated API if new one fails
          const service = new window.google.maps.places.PlacesService(document.createElement('div'));
          const fallbackRequest = {
            query: query + " venue",
            fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
          };

          service.textSearch(fallbackRequest, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              setSearchResults(results.slice(0, 5));
              setShowResults(true);
            } else {
              setSearchResults([]);
              setShowResults(false);
            }
          });
        });
      } catch (error) {
        // Fallback to deprecated API if new API is not available
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const fallbackRequest = {
          query: query + " venue",
          fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
        };

        service.textSearch(fallbackRequest, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setSearchResults(results.slice(0, 5));
            setShowResults(true);
          } else {
            setSearchResults([]);
            setShowResults(false);
          }
        });
      }
    }
  }, [form, selectedPlace, mapsApiLoaded, hasValidApiKey]);

  const handleSelectVenue = useCallback((place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    const venue = place.name || "";
    const address = place.formatted_address || "";
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();

    // Extract city from address
    let city = "";
    if (address) {
      // Try to extract city from formatted address
      const addressParts = address.split(', ');
      if (addressParts.length >= 2) {
        // Usually city is the second-to-last part before country
        city = addressParts[addressParts.length - 3] || addressParts[0];
      }
    }

    form.setValue("venue", venue);
    form.setValue("venueAddress", address);
    form.setValue("city", city);
    if (lat && lng) {
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
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
    form.setValue("venue", "");
    form.setValue("venueAddress", "");
    form.setValue("latitude", undefined);
    form.setValue("longitude", undefined);
  }, [form]);

  // Verify ticket listing using Perplexity AI
  const verifyTicket = async () => {
    const values = form.getValues();

    if (!values.title || !values.eventDate || !values.venue || !values.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before verifying",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiRequest("POST", "/api/ticket-verification/check", {
        listingTitle: values.title,
        eventDate: values.eventDate,
        eventTime: values.eventTime,
        venueLocation: values.venue + (values.venueAddress ? `, ${values.venueAddress}` : ''),
        eventCategory: values.category,
        ticketQuantity: values.quantity,
        additionalInfo: values.additionalInfo
      });

      const result = await response.json();

      if (result.success) {
        setVerificationResult(result.data);

        // Show toast based on legitimacy
        const toastConfig = {
          legit: {
            title: "✅ Ticket Verified",
            description: "Your ticket listing appears legitimate",
          },
          suspicious: {
            title: "⚠️ Verification Warning",
            description: "Some concerns were found with your listing",
            variant: "destructive" as const,
          },
          fake: {
            title: "❌ Verification Failed",
            description: "This listing appears to have significant issues",
            variant: "destructive" as const,
          }
        };

  const legitimacy = result.data.legitimacy as keyof typeof toastConfig;
  const config = toastConfig[legitimacy];
        toast(config);
      } else {
        toast({
          title: "Verification Error",
          description: result.error || "Failed to verify ticket listing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Unable to verify ticket listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketWithEventForm) => {
      // Convert form data to match the ticket schema
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}`);

      const ticketData = {
        title: data.title,
        eventTitle: data.title, // Use title as eventTitle since we removed the separate field
        eventDescription: data.eventDescription || `${data.title} at ${data.venue}`,
        venue: data.venue,
        venueAddress: data.venueAddress || '',
        eventDate: eventDateTime,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country,
        state: data.state || '',
        postalCode: data.postalCode || '',
        eventTimezone: data.eventTimezone,
        ageRestriction: data.ageRestriction || '',
        section: data.section || '',
        row: data.row || '',
        seat: data.seat || '',
        quantity: data.quantity,
        transferMethod: data.transferMethod,
        additionalInfo: data.additionalInfo || '',
        trending: false,
        sellingFast: false,
        eventImageUrl: '',
        isTransferrable: data.isTransferrable,
        showContactInfo: data.showContactInfo,
        status: data.status
      };

      const response = await apiRequest("POST", "/api/tickets", ticketData);

      // Check for Instagram handle required error
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.error === "INSTAGRAM_HANDLE_REQUIRED") {
          throw new Error("INSTAGRAM_HANDLE_REQUIRED");
        }
        throw new Error(errorData.message || "Failed to create ticket");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create ticket");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      setFormErrors([]);

      toast({
        title: "Ticket Listed Successfully!",
        description: "Your ticket is now available for buyers to view and contact you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/seller/${user?.id}`] });

      // Clear the form
      form.reset();
      setSelectedPlace(null);
      setVenueInputValue("");

      navigate("/my-tickets");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Ticket creation error:", error);

      // Check if Instagram handle is required
      if (error.message === "INSTAGRAM_HANDLE_REQUIRED") {
        if (import.meta.env.MODE === 'production') {
          setShowInstagramModal(true);
          // Store the ticket data to retry after Instagram handle is added
          const formData = form.getValues();
          setPendingTicketData(formData);
          return;
        } else {
          // In development, bypass blocking on Instagram requirement
          console.warn('Bypassing Instagram handle requirement in development');
        }
      }

      let errorMessage = "Failed to list ticket";
      const errors: string[] = [];

      // Parse detailed error message if available
      if (error.message && error.message.includes("Validation error")) {
        errorMessage = "Please check all required fields and try again";
        errors.push("Form validation failed. Please check all fields and correct any errors.");
      } else if (error.message) {
        errorMessage = error.message.replace(/^\d+:\s*/, ''); // Remove status code prefix
        errors.push(errorMessage);
      } else {
        errors.push("An unexpected error occurred. Please try again.");
      }

      setFormErrors(errors);

      toast({
        variant: "destructive",
        title: "Unable to List Ticket",
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: TicketWithEventForm) => {
    // Clear previous errors
    setFormErrors([]);
    setIsSubmitting(true);

    if (!isAuthenticated) {
      const errorMsg = "Please log in to list a ticket.";
      setFormErrors([errorMsg]);
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Client-side validation for additional edge cases
    const errors: string[] = [];
    
    // Check for Instagram handle in production
    if (import.meta.env.MODE === 'production' && !user?.instagram) {
      errors.push("Instagram handle is required to list tickets.");
    }

    // Additional validation for edge cases
    if (data.title && data.title.trim().length === 0) {
      errors.push("Event title cannot be only whitespace.");
    }
    
    if (data.venue && data.venue.trim().length === 0) {
      errors.push("Venue location cannot be only whitespace.");
    }

    if (data.additionalInfo && data.additionalInfo.trim().length > 0 && data.additionalInfo.trim().length < 10) {
      errors.push("Additional information must be at least 10 characters if provided.");
    }

    // Check for special characters in title that might cause issues
    if (data.title && /[<>\"'&]/.test(data.title)) {
      errors.push("Event title contains invalid characters. Please remove < > \" ' & symbols.");
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      // Focus on first error field for accessibility
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
      setIsSubmitting(false);
      return;
    }

    // Clear any previous error states
    createTicketMutation.reset();
    createTicketMutation.mutate(data);
  };

  const handleInstagramModalSuccess = () => {
    setShowInstagramModal(false);

    // If there's pending ticket data, retry the submission
    if (pendingTicketData) {
      setIsSubmitting(true);
      createTicketMutation.mutate(pendingTicketData);
      setPendingTicketData(null);
    }
  };

  const handleInstagramModalClose = () => {
    setShowInstagramModal(false);
    setPendingTicketData(null);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    // Return empty while redirecting
    return null;
  }

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<div>Loading Maps...</div>}
      onLoad={() => {
        setMapsApiLoaded(true);
        setMapsApiError(null);
        if (process.env.NODE_ENV === 'development') {
          console.log('Google Maps API loaded successfully');
        }
      }}
      onError={(error) => {
        setMapsApiLoaded(false);
        setMapsApiError('Failed to load Google Maps API');
        if (process.env.NODE_ENV === 'development') {
          console.error('Google Maps API loading error:', error);
          console.error('API Key configured:', hasValidApiKey ? 'Yes (valid)' : 'No (demo/invalid)');
        }
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <SEOManager
          title="Sell Your Event Tickets | List Tickets for Sale - Ticket Bazaar"
          description="Sell your unused event tickets safely and securely on Ticket Bazaar. List tickets for concerts, sports events, and festivals with our transparent pricing policy and secure payment system."
          canonicalUrl="https://ticketbazaar.co.in/list-ticket"
        >
          <UnifiedSchema />
        </SEOManager>
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">
          List Your Ticket
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <Card>
              <CardContent>
                <Form {...form}>
                  {/* ARIA live region for error announcements */}
                  <div 
                    aria-live="polite" 
                    aria-atomic="true" 
                    className="sr-only"
                    id="form-errors-live-region"
                  >
                    {formErrors.length > 0 && (
                      `Form validation errors: ${formErrors.join('. ')}`
                    )}
                  </div>

                  {/* Error summary for accessibility */}
                  {formErrors.length > 0 && (
                    <div 
                      role="alert"
                      aria-labelledby="error-summary-title"
                      className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md"
                    >
                      <h3 id="error-summary-title" className="text-red-800 font-medium mb-2">
                        Please correct the following errors:
                      </h3>
                      <ul className="text-red-700 space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index} className="text-sm">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <form
                    data-testid="ticket-listing-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Event Details Section */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium text-lg">Event Details</h3>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 2 VIP tickets for Arijit Singh concert"
                                maxLength={100}
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
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Venue Location
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder={
                                    hasValidApiKey && mapsApiLoaded 
                                      ? "Search for venue (e.g., Phoenix Marketcity, Mumbai)"
                                      : "Enter venue name and address (e.g., Phoenix Marketcity, Mumbai)"
                                  }
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

                                {/* Show helpful message when Maps API is not available */}
                                {(!hasValidApiKey || mapsApiError) && (
                                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                    <div className="flex items-start gap-2">
                                      <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-medium text-yellow-800 mb-1">Venue suggestions unavailable</p>
                                        <p className="text-yellow-700">
                                          {!hasValidApiKey 
                                            ? "Please type the complete venue name and address manually."
                                            : "Unable to load location services. Enter venue details manually."
                                          }
                                        </p>
                                      </div>
                                    </div>
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="concerts">Music & Concerts</SelectItem>
                                <SelectItem value="fitness">Cult.fit</SelectItem>
                                <SelectItem value="accommodation">Zostel/Any Other Hotel</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="comedy">Comedy</SelectItem>
                                <SelectItem value="festivals">Festivals</SelectItem>
                                <SelectItem value="conferences">Conferences & Events</SelectItem>
                                <SelectItem value="exhibitions">Exhibitions</SelectItem>
                                <SelectItem value="movies">Movies</SelectItem>
                                <SelectItem value="dance">Dance</SelectItem>
                                <SelectItem value="nightlife">Nightlife</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="networking">Networking</SelectItem>
                                <SelectItem value="others">Others</SelectItem>
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
                                maxLength={1000}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Verification Section */}
                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isVerifying}
                        onClick={verifyTicket}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        {isVerifying ? "Verifying..." : "Verify Listing"}
                      </Button>

                      {verificationResult && (
                        <Alert className={
                          verificationResult.legitimacy === 'legit'
                            ? "border-green-200 bg-green-50"
                            : verificationResult.legitimacy === 'suspicious'
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-red-200 bg-red-50"
                        }>
                          <div className="flex items-start gap-3">
                            <span className="text-2xl mt-[-4px]">
                              {verificationResult.legitimacyEmoji}
                            </span>
                            <div className="flex-1">
                              <AlertTitle className="text-base">
                                {verificationResult.legitimacy === 'legit'
                                  ? "Ticket Verified"
                                  : verificationResult.legitimacy === 'suspicious'
                                    ? "Verification Warning"
                                    : "Verification Failed"}
                              </AlertTitle>
                              <AlertDescription className="mt-1">
                                {verificationResult.explanation}
                              </AlertDescription>
                              <div className="mt-3 space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  {verificationResult.checkDetails.eventExists ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <span>Event exists</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {verificationResult.checkDetails.venueValid ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <span>Venue is valid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {verificationResult.checkDetails.dateValid ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <span>Date is valid</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Alert>
                      )}
                    </div>

                    <Button
                      data-testid="submit-button"
                      type="submit"
                      className="w-full"
                      disabled={
                        isSubmitting || 
                        createTicketMutation.isPending || 
                        (!verificationResult || verificationResult.legitimacy !== 'legit') ||
                        formErrors.length > 0
                      }
                      aria-describedby={formErrors.length > 0 ? "form-errors-live-region" : undefined}
                    >
                      {isSubmitting || createTicketMutation.isPending
                        ? "Creating your listing..."
                        : verificationResult && verificationResult.legitimacy !== 'legit'
                          ? "Verification Required"
                          : formErrors.length > 0
                            ? "Please Fix Errors"
                            : "List Ticket"}
                    </Button>

                    {createTicketMutation.isSuccess && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                        ✓ Ticket listed successfully! Redirecting to your tickets...
                      </div>
                    )}

                    {createTicketMutation.isError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                        Failed to create listing. Please check your information and try again.
                      </div>
                    )}
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

                <div className="space-y-3">
                  <h3 className="font-medium">Instagram Profile</h3>
                  <p className="text-sm text-textSecondary">
                    Your Instagram profile will be displayed to buyers (ONLY for the Instagram logged-in users) to help
                    build trust, verify your identity and to contact you on DM.
                  </p>
                </div>

                <Separator />
                <div className="space-y-3">
                  <h3 className="font-medium">No Platform Fees</h3>
                  <p className="text-sm text-textSecondary">
                    Ticket Bazaar does not charge any fees for listing or selling
                    tickets. We simply connect buyers and sellers - all
                    transactions (exchange of tickets & payment) happen directly between users.
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


              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Instagram Handle Modal */}
      <InstagramHandleModal
        isOpen={showInstagramModal}
        onClose={handleInstagramModalClose}
        onSuccess={handleInstagramModalSuccess}
      />
    </LoadScript>
  );
}
