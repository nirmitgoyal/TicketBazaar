import { apiRequest } from "@/lib/queryClient";
import { User, Ticket } from "@shared/schema";

export const api = {
  // Auth
  register: async (userData: {
    username: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    email: string;
    phone?: string;
  }) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },



  // Tickets
  createTicket: async (
    ticketData: Omit<Ticket, "id" | "verified">,
  ): Promise<Ticket> => {
    const response = await apiRequest("POST", "/api/tickets", ticketData);
    return response.json();
  },

  getTicketsByEvent: async (eventId: number): Promise<Ticket[]> => {
    const response = await apiRequest(
      "GET",
      `/api/tickets/event/${eventId}`,
      undefined,
    );
    return response.json();
  },

  getTicketsBySeller: async (sellerId: number): Promise<Ticket[]> => {
    const response = await apiRequest(
      "GET",
      `/api/tickets/seller/${sellerId}`,
      undefined,
    );
    return response.json();
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await apiRequest("GET", `/api/tickets/${id}`, undefined);
    return response.json();
  },


};
