import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";

export function useTicketView() {
  const { user } = useAuth();

  const recordView = useMutation({
    mutationFn: async ({ ticketId, eventId }: { ticketId: number; eventId: number }) => {
      if (!user?.id) return;
      
      return apiRequest("/api/ticket-views", "POST", {
        userId: user.id,
        ticketId,
        eventId,
      });
    },
  });

  const recordTicketView = (ticketId: number, eventId: number) => {
    if (user?.id) {
      recordView.mutate({ ticketId, eventId });
    }
  };

  return {
    recordTicketView,
  };
}