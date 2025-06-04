import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const { showToast = true, logError = true, onError } = options;

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (logError) {
        console.error(`Error${context ? ` in ${context}` : ""}:`, error);
      }

      if (showToast) {
        toast({
          title: "Something went wrong",
          description: errorMessage,
          variant: "destructive",
        });
      }

      if (onError && error instanceof Error) {
        onError(error);
      }
    },
    [toast, showToast, logError, onError],
  );

  const handleApiError = useCallback(
    (error: unknown, context?: string) => {
      let message = "Failed to connect to server";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          message =
            "Network connection error. Please check your internet connection.";
        } else if (error.message.includes("unauthorized")) {
          message = "Please log in to continue.";
        } else {
          message = error.message;
        }
      }

      if (logError) {
        console.error(`API Error${context ? ` in ${context}` : ""}:`, error);
      }

      if (showToast) {
        toast({
          title: "Connection Error",
          description: message,
          variant: "destructive",
        });
      }

      if (onError && error instanceof Error) {
        onError(error);
      }
    },
    [toast, showToast, logError, onError],
  );

  return { handleError, handleApiError };
}
