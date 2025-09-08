import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const instagramSchema = z.object({
  instagram: z
    .string()
    .min(1, "Instagram handle is required")
    .max(20, "Instagram handle must be 20 characters or less")
    .refine((handle) => {
      // Remove @ if user includes it and validate handle format
      const cleanHandle = handle.replace(/^@/, "");
      const handleRegex = /^[a-zA-Z0-9_.]+$/;
      return (
        handleRegex.test(cleanHandle) &&
        cleanHandle.length >= 1 &&
        cleanHandle.length <= 20
      );
    }, "Please enter a valid Instagram handle (1-20 characters, letters, numbers, dots, and underscores only)"),
});

type InstagramForm = z.infer<typeof instagramSchema>;

export default function CompleteProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();  const form = useForm<InstagramForm>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      instagram: "",
    },
  });

  const updateInstagramMutation = useMutation({
    mutationFn: async (data: InstagramForm) => {
      // Clean the handle by removing @ if present
      const cleanHandle = data.instagram.replace(/^@/, "");
      const response = await apiRequest("PATCH", "/api/auth/user/instagram", {
        instagram: cleanHandle,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your Instagram ID has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update Instagram ID. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InstagramForm) => {
    updateInstagramMutation.mutate(data);
  };

  // Show loading while user data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show this page for users who need to update their Instagram
  // In development, bypass this requirement and redirect home
  const isProd = import.meta.env.MODE === 'production';
  if (!isProd || !user || (user.instagram && user.instagram.trim() !== "")) {
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Ticket Bazaar!</CardTitle>
          <CardDescription>
            To complete your account setup, please provide your Instagram
            handle. This helps verify your identity and builds trust between
            users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Instagram Handle Required</AlertTitle>
            <AlertDescription>
              Your Instagram handle will be displayed to buyers to verify your
              identity. You can enter just your username or include the @
              symbol.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="yourusername or @yourusername"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your Instagram handle. This will be used to verify
                      your identity and build trust with other users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateInstagramMutation.isPending}
              >
                {updateInstagramMutation.isPending
                  ? "Saving..."
                  : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
