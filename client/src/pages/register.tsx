import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userRegisterSchema } from "@shared/schema";
import { z } from "zod";
import { getAllCountries, detectUserCountry, getCountryInfo } from "@/lib/country-utils";

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    instagram: "",
    country: "",
    timezone: "",
    language: "en",
    preferredContactMethod: "email",
  });

  // Auto-detect user's location and preferences on component mount
  useEffect(() => {
    const detectedCountry = detectUserCountry();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userLanguage = navigator.language.split('-')[0];

    setFormData(prev => ({
      ...prev,
      country: detectedCountry,
      timezone: userTimezone,
      language: userLanguage,
    }));
  }, []);

  const registerMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userRegisterSchema>) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });
      navigate("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = userRegisterSchema.parse(formData);
      registerMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input to prevent XSS
    const sanitizedValue = value
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .trim();
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join our ticket marketplace to buy and sell tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country || undefined}
                onValueChange={(value) => {
                  handleInputChange("country", value);
                  const countryInfo = getCountryInfo(value);
                  if (countryInfo) {
                    handleInputChange("timezone", countryInfo.timezone);
                    handleInputChange("language", countryInfo.language);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {getAllCountries().map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder={getCountryInfo(formData.country)?.phoneCode || "+1"}
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram Handle (Optional)</Label>
              <Input
                id="instagram"
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder="@yourusername"
              />
            </div>
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.preferredContactMethod}
                onValueChange={(value) => handleInputChange("preferredContactMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
