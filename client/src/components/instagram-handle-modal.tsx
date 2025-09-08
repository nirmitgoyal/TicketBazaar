import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Instagram handle validation schema
const instagramHandleSchema = z.object({
  instagram: z
    .string()
    .min(1, "Instagram handle is required")
    .max(20, "Instagram handle must be 20 characters or less")
    .transform((val) => val.replace(/^@/, "")) // Remove @ if present first
    .refine(
      (val) => /^[a-zA-Z0-9_.]+$/.test(val),
      "Invalid Instagram handle format. Must be 1-20 characters, contain only letters, numbers, periods, and underscores."
    ),
});

type InstagramHandleFormData = z.infer<typeof instagramHandleSchema>;

interface InstagramHandleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstagramHandleModal({ isOpen, onClose, onSuccess }: InstagramHandleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InstagramHandleFormData>({
    resolver: zodResolver(instagramHandleSchema),
    defaultValues: {
      instagram: "",
    },
  });

  // Mutation to update user's Instagram handle
  const updateInstagramMutation = useMutation({
    mutationFn: async (data: InstagramHandleFormData) => {
      console.log('Starting Instagram mutation with data:', data);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      console.log('Making API request to update Instagram handle');
      const response = await apiRequest("PATCH", `/api/users/${user.id}/instagram`, {
        instagram: data.instagram,
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API request failed:', error);
        throw new Error(error.message || "Failed to update Instagram handle");
      }
      
      console.log('Instagram handle updated successfully');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Instagram handle added!",
        description: "Your Instagram handle has been successfully added to your profile.",
      });
      // Call the provided onSuccess callback
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update Instagram handle",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InstagramHandleFormData) => {
    try {
      setIsSubmitting(true);
      await updateInstagramMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error submitting Instagram handle:', error);
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent 
        className="sm:max-w-[425px]" 
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Connect Your Instagram
          </AlertDialogTitle>
          <AlertDialogDescription>
            To ensure a safe marketplace, we require all users to link their Instagram handle. This helps build trust between buyers and sellers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (typeof form.handleSubmit !== 'function') {
                console.error('form.handleSubmit is not a function');
                return;
              }
              return form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-4"
          >
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your Instagram handle will be visible on your listings to help buyers verify your identity.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        @
                      </span>
                      <Input
                        {...field}
                        placeholder="username"
                        className="pl-8"
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter your Instagram username without the @ symbol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-xs text-muted-foreground text-center mt-2">
          This step is mandatory to continue using TicketBazaar
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}