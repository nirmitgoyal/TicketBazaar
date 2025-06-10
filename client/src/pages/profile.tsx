import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, Plane, Upload, FileImage, Edit2, Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { Ticket, Transaction } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";


const instagramSchema = z.object({
  instagram: z
    .string()
    .min(1, "Instagram handle is required")
    .refine((handle) => {
      // Remove @ if user includes it and validate handle format
      const cleanHandle = handle.replace(/^@/, "");
      const handleRegex = /^[a-zA-Z0-9_.]+$/;
      return (
        handleRegex.test(cleanHandle) &&
        cleanHandle.length >= 1 &&
        cleanHandle.length <= 30
      );
    }, "Please enter a valid Instagram handle (e.g., username or @username)"),
});

const dataDeletionSchema = z.object({
  confirmDelete: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you want to delete all your data",
  }),
  reason: z.string().optional(),
});

type InstagramForm = z.infer<typeof instagramSchema>;
type DataDeletionForm = z.infer<typeof dataDeletionSchema>;

export default function Profile() {
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [isDataDeletionDialogOpen, setIsDataDeletionDialogOpen] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);

  const instagramForm = useForm<InstagramForm>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      instagram: user?.instagram || "",
    },
  });

  const dataDeletionForm = useForm<DataDeletionForm>({
    resolver: zodResolver(dataDeletionSchema),
    defaultValues: {
      confirmDelete: false,
      reason: "",
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
        description: "Your Instagram profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsInstagramDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description:
          error.message ||
          "Failed to update Instagram profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/data-privacy/export");
      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Data Export Complete",
        description: "Your personal data has been downloaded successfully.",
      });
      setIsExportingData(false);
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
      setIsExportingData(false);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (data: DataDeletionForm) => {
      const response = await apiRequest("POST", "/api/data-privacy/delete", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your account. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const onInstagramSubmit = (data: InstagramForm) => {
    updateInstagramMutation.mutate(data);
  };

  const onDataDeletionSubmit = (data: DataDeletionForm) => {
    deleteAccountMutation.mutate(data);
  };

  const handleExportData = () => {
    setIsExportingData(true);
    exportDataMutation.mutate();
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your profile.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated]);

  // Fetch user's transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<
    Transaction[]
  >({
    queryKey: [`/api/transactions/user/${user?.id}`],
    enabled: !!user,
  });

  // Calculate statistics
  const completedTransactions =
    transactions?.filter((t) => t.status === "completed") || [];
  const disputedTransactions =
    transactions?.filter((t) => t.status === "disputed") || [];

  // In P2P model, we don't track transaction amounts directly
  // These are placeholder values - can be calculated from contact requests if needed
  const totalSpent = 0; // Placeholder for P2P model
  const totalEarned = 0; // Placeholder for P2P model

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="My Profile | Account Management - Ticket Bazaar"
        description="Manage your Ticket Bazaar profile, view transaction history, update contact information, and configure account settings."
        keywords="profile, account, user settings, transaction history, ticket bazaar"
      />
      <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle>{user?.fullName}</CardTitle>
              <CardDescription>
                Member since {new Date().getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-textSecondary">
                      Instagram Profile
                    </p>
                    <Dialog
                      open={isInstagramDialogOpen}
                      onOpenChange={setIsInstagramDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            instagramForm.reset({
                              instagram: user?.instagram || "",
                            });
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Instagram Profile</DialogTitle>
                          <DialogDescription>
                            Update your Instagram handle. This will be shown to
                            other users for verification.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...instagramForm}>
                          <form
                            onSubmit={instagramForm.handleSubmit(
                              onInstagramSubmit,
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={instagramForm.control}
                              name="instagram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram Handle</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="yourusername or @yourusername"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsInstagramDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={updateInstagramMutation.isPending}
                              >
                                {updateInstagramMutation.isPending
                                  ? "Saving..."
                                  : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="font-medium">
                    {user?.instagram ? (
                      <a
                        href={`https://instagram.com/${user.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @{user.instagram}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary">Email ID</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary">Seller Rating</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(user?.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 15.934l-6.18 3.254 1.18-6.875-5-4.867 6.904-1.003L10 0l3.095 6.443 6.905 1.003-5 4.867 1.18 6.875L10 15.934z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm">
                      {user?.rating ? user.rating.toFixed(1) : "0.0"} (
                      {user?.ratingsCount || 0} ratings)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  logoutMutation.mutate(undefined, {
                    onSuccess: () => {
                      navigate("/");
                      toast({
                        title: "Logged Out",
                        description: "You have been successfully logged out.",
                      });
                    },
                  });
                }}
              >
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Activity and Stats */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notifications">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
                </TabsList>
                <TabsContent value="notifications" className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-textSecondary">
                          Receive emails about your activity
                        </p>
                      </div>
                      <div className="h-6 w-12 bg-primary rounded-full relative cursor-pointer">
                        <div className="h-5 w-5 absolute right-1 top-0.5 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-textSecondary">
                          Receive text messages for important updates
                        </p>
                      </div>
                      <div className="h-6 w-12 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="h-5 w-5 absolute left-1 top-0.5 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Communications</p>
                        <p className="text-sm text-textSecondary">
                          Receive updates about promotions and events
                        </p>
                      </div>
                      <div className="h-6 w-12 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="h-5 w-5 absolute left-1 top-0.5 rounded-full bg-white"></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="payment" className="p-4">
                  <div className="text-center py-6">
                    <p className="text-textSecondary">
                      You have no payment methods saved yet.
                    </p>
                    <Button className="mt-4">Add Payment Method</Button>
                  </div>
                </TabsContent>
                <TabsContent value="security" className="p-4">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full">
                      Two-factor Authentication
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="privacy" className="p-4">
                  <div className="space-y-6">
                    {/* Data Export Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Data Export</h3>
                      </div>
                      <p className="text-sm text-textSecondary">
                        Download a copy of all your personal data including tickets, 
                        contact requests, reviews, and account information.
                      </p>
                      <Button
                        onClick={handleExportData}
                        disabled={isExportingData || exportDataMutation.isPending}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isExportingData || exportDataMutation.isPending 
                          ? "Preparing Export..." 
                          : "Export My Data"}
                      </Button>
                    </div>

                    <Separator />

                    {/* Account Deletion Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 mb-2">
                          <strong>Warning:</strong> This action cannot be undone.
                        </p>
                        <p className="text-sm text-red-700">
                          Deleting your account will permanently remove:
                        </p>
                        <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                          <li>Your profile and account information</li>
                          <li>All ticket listings and transaction history</li>
                          <li>Contact requests and communications</li>
                          <li>Reviews and ratings given/received</li>
                          <li>All associated data</li>
                        </ul>
                      </div>
                      
                      <Dialog open={isDataDeletionDialogOpen} onOpenChange={setIsDataDeletionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete My Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to permanently delete your account and all associated data?
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...dataDeletionForm}>
                            <form
                              onSubmit={dataDeletionForm.handleSubmit(onDataDeletionSubmit)}
                              className="space-y-4"
                            >
                              <FormField
                                control={dataDeletionForm.control}
                                name="confirmDelete"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        I understand this action cannot be undone
                                      </FormLabel>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={dataDeletionForm.control}
                                name="reason"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reason for deletion (optional)</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Help us improve by sharing why you're leaving"
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsDataDeletionDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  disabled={deleteAccountMutation.isPending}
                                >
                                  {deleteAccountMutation.isPending
                                    ? "Deleting..."
                                    : "Delete Account"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Separator />

                    {/* Privacy Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Privacy Information</h3>
                      <div className="text-sm text-textSecondary space-y-2">
                        <p>
                          For questions about your data or privacy, please contact us at{" "}
                          <a href="mailto:privacy@ticketbazaar.com" className="text-primary hover:underline">
                            privacy@ticketbazaar.com
                          </a>
                        </p>
                        <p>
                          Review our{" "}
                          <a href="/privacy-policy" className="text-primary hover:underline">
                            Privacy Policy
                          </a>{" "}
                          to learn more about how we collect, use, and protect your data.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
