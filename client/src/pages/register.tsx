import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect to login page
  useEffect(() => {
    toast({
      title: "Registration Simplified",
      description:
        "We now use only Google Authentication for a faster, more secure sign-in process.",
    });

    navigate("/login");
  }, [navigate, toast]);

  // This is just a fallback in case the redirect doesn't work immediately
  return null;
}
