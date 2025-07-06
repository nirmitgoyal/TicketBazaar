import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { InstagramHandleModal } from "./instagram-handle-modal";

export function InstagramHandleCheck({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showInstagramModal, setShowInstagramModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and doesn't have Instagram handle
    if (isAuthenticated && user && !user.instagram && !isLoading) {
      setShowInstagramModal(true);
    } else {
      setShowInstagramModal(false);
    }
  }, [isAuthenticated, user, isLoading]);

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