import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ticketListingSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

type TicketForm = z.infer<typeof ticketListingSchema>;

const categories = [
  "concert",
  "sports", 
  "theater",
  "comedy",
  "festival",
  "other"
];

export default function ListTicket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<TicketForm>({
    resolver: zodResolver(ticketListingSchema),
    defaultValues: {
      title: "",
      eventTitle: "",
      eventDescription: "",
      venue: "",
      venueAddress: "",
      eventDate: new Date(),
      category: "",
      section: "",
      price: 0,
      quantity: 1,
      transferMethod: "whatsapp",
      additionalInfo: "",
      showContactInfo: true,
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: (data: TicketForm) => apiRequest("/api/tickets", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket listed successfully",
      });
      setLocation("/my-tickets");
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to list ticket",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to list tickets",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    createTicketMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">List Your Ticket</h1>
        <p className="text-muted-foreground">Sell your tickets to other fans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2x VIP Concert Tickets" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Coldplay Mumbai Concert" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="eventDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the event..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. DY Patil Stadium" {...field} />
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
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. VIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000"
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details about the tickets..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? "Listing Ticket..." : "List Ticket"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}