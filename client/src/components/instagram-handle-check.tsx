import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { InstagramHandleModal } from "./instagram-handle-modal";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function InstagramHandleCheck({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    // Bypass in development
    if (import.meta.env.MODE !== 'production') {
      setShowInstagramModal(false);
      return;
    }
    // Check if user is authenticated and doesn't have Instagram handle
    // Only show the modal once per session to avoid blocking the user repeatedly
    if (isAuthenticated && user && !user.instagram && !isLoading && !hasShownOnce) {
      // Check if we're on a protected page that requires action
      const protectedPages = ['/list-ticket', '/my-tickets', '/profile'];
      const isProtectedPage = protectedPages.some(page => location.startsWith(page));
      
      if (isProtectedPage) {
        // Show a toast notification first to acknowledge successful login
        toast({
          title: "Welcome back!",
          description: "Please add your Instagram handle to continue.",
        });
      }
      
      // Delay showing the modal to allow the page to load first
      const timer = setTimeout(() => {
        setShowInstagramModal(true);
        setHasShownOnce(true);
      }, 1500); // 1.5 second delay
      
      return () => clearTimeout(timer);
    } else if (user?.instagram) {
      setShowInstagramModal(false);
    }
  }, [isAuthenticated, user, isLoading, hasShownOnce, location, toast]);

  return (
    <>
      {children}
      {showInstagramModal && user && (
        <InstagramHandleModal 
          isOpen={showInstagramModal} 
          userId={user.id} 
        />
      )}
    </>
  );
}