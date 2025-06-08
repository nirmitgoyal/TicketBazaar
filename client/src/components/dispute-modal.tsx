import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Transaction, InsertUserFeedback } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";

interface DisputeModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

const disputeSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  description: z
    .string()
    .min(
      10,
      "Please provide more details about your issue (minimum 10 characters)",
    ),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

export function DisputeModal({
  transaction,
  isOpen,
  onClose,
}: DisputeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async (values: DisputeFormValues) => {
      if (!user) throw new Error("User not authenticated");

      const feedbackData: InsertUserFeedback = {
        userId: user.id,
        ticketId: transaction.ticketId, // Use ticketId from transaction
        feedbackType: "report",
        description: values.description,
        status: "pending",
      };

      const response = await apiRequest("POST", "/api/user-feedback", feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dispute Submitted",
        description:
          "Your issue has been reported. We'll review it and get back to you soon.",
        variant: "default",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/transactions/user/${user?.id}`],
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to Submit Dispute",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DisputeFormValues) => {
    disputeMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins">
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Submit details about the issue you're experiencing with your ticket
            purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 bg-blue-50 p-4 rounded-md text-blue-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Transaction #{transaction.id}: Our team will review your issue and
              work to resolve it promptly. You'll be notified of any updates.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What issue are you experiencing?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="tickets_not_received"
                            id="tickets_not_received"
                          />
                          <Label htmlFor="tickets_not_received">
                            Tickets not received
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="invalid_tickets"
                            id="invalid_tickets"
                          />
                          <Label htmlFor="invalid_tickets">
                            Invalid tickets or verification issues
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="wrong_tickets"
                            id="wrong_tickets"
                          />
                          <Label htmlFor="wrong_tickets">
                            Received wrong tickets
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="event_cancelled"
                            id="event_cancelled"
                          />
                          <Label htmlFor="event_cancelled">
                            Event cancelled or rescheduled
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other issue</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provide details about your issue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue in detail including any relevant information..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any important details that will help us resolve
                      your issue quickly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={disputeMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={disputeMutation.isPending}
                >
                  {disputeMutation.isPending
                    ? "Submitting..."
                    : "Submit Dispute"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
