import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface ProfileForm {
  fullName: string;
  phone: string;
  instagram?: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      instagram: user?.instagram || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => apiRequest(`/api/users/${user?.id}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Username:</span>
            <span>{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Rating:</span>
            <span>{user.rating}/5 ({user.ratingsCount} reviews)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => logout()}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}