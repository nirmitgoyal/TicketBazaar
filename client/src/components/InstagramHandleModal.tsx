import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const instagramHandleSchema = z.object({
  instagram_handle: z
    .string()
    .min(1, "Instagram handle is required")
    .max(20, "Instagram handle must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_.]+$/, "Instagram handle can only contain letters, numbers, dots, and underscores"),
});

type InstagramHandleForm = z.infer<typeof instagramHandleSchema>;

interface InstagramHandleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstagramHandleModal({ isOpen, onClose, onSuccess }: InstagramHandleModalProps) {
  // Bypass modal entirely in development to avoid blocking flows
  if (import.meta.env.MODE !== 'production') {
    return null;
  }
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InstagramHandleForm>({
    resolver: zodResolver(instagramHandleSchema),
    defaultValues: {
      instagram_handle: "",
    },
  });

  const updateInstagramMutation = useMutation({
    mutationFn: async (data: InstagramHandleForm) => {
      setIsSubmitting(true);
      const response = await apiRequest(
        "PUT",
        `/api/users/${user?.id}/instagram`,
        data
      );
      
      // 204 No Content is expected
      if (response.status !== 204) {
        throw new Error("Failed to update Instagram handle");
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Instagram Handle Added",
        description: "Your Instagram handle has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update Instagram handle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InstagramHandleForm) => {
    updateInstagramMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Handle Required
          </DialogTitle>
          <DialogDescription>
            To list tickets on our platform, we require sellers to have a verified Instagram handle. This helps build trust between buyers and sellers.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            Your Instagram handle will be visible to potential buyers to verify your identity.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        @
                      </span>
                      <Input
                        placeholder="yourusername"
                        className="pl-8"
                        {...field}
                        onChange={(e) => {
                          // Remove @ if user types it
                          const value = e.target.value.replace(/^@/, "");
                          field.onChange(value);
                        }}
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

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}