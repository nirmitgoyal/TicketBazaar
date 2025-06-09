import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Ticket } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { TicketVerification } from "@/components/ticket-verification";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, TicketX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";
import { OrganizationSchema } from "@/components/schema/organization-schema";

export default function TicketVerificationPage() {
  const [, setLocation] = useLocation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = parseInt(ticketId);

  const {
    data: ticket,
    isLoading: isLoadingTicket,
    error,
  } = useQuery<Ticket>({
    queryKey: ["/api/tickets", id],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json();
    },
    enabled: !isNaN(id),
    retry: 1,
    staleTime: 30000,
  });

  const generateQrMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/tickets/${ticketId}/generate-qr`,
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "QR Code Generated",
        description: "Your ticket QR code has been successfully generated",
      });
      queryClient.setQueryData(["/api/tickets", id], data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQR = () => {
    // In P2P model, QR codes are not generated - users handle verification directly
    if (false) {
      generateQrMutation.mutate(ticket.id);
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="container max-w-4xl mx-auto py-10 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container max-w-4xl mx-auto py-10 text-center">
        <TicketX className="h-16 w-16 mx-auto text-gray-400" />
        <h1 className="text-2xl font-bold mt-4">Ticket Not Found</h1>
        <p className="mt-2 text-gray-500">
          The ticket you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setLocation("/my-tickets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Tickets
        </Button>
      </div>
    );
  }

  // Check if the user is the seller of this ticket
  const isUserTicket = user && ticket && ticket.sellerId === user.id;

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <SEO
        title="Ticket Verification | Verify Authenticity - Ticket Bazaar"
        description="Verify your ticket authenticity and access your QR code for event entry. Secure ticket verification system protects against fraud and ensures valid entry."
        canonicalUrl={`https://ticketbazaar.co.in/ticket/verify/${ticket.id}`}
      >
        <OrganizationSchema />
      </SEO>
      <div className="flex items-center mb-8">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => setLocation("/my-tickets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Ticket Verification</h1>
      </div>

      {!isUserTicket && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-800">
            You don't have permission to verify this ticket.
          </p>
        </div>
      )}

      {ticket && false && isUserTicket && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-800 mb-3">
            This ticket doesn't have a QR code yet. Generate a QR code to enable
            verification.
          </p>
          <Button
            onClick={handleGenerateQR}
            disabled={generateQrMutation.isPending}
          >
            {generateQrMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate QR Code"
            )}
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
            <dl className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <dt className="font-medium text-gray-500">Event ID:</dt>
                <dd className="col-span-2">{ticket?.id || "-"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="font-medium text-gray-500">Section:</dt>
                <dd className="col-span-2">{ticket?.section || "-"}</dd>
              </div>
              {ticket?.row && (
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-medium text-gray-500">Row:</dt>
                  <dd className="col-span-2">{ticket.row}</dd>
                </div>
              )}
              {ticket?.seat && (
                <div className="grid grid-cols-3 gap-1">
                  <dt className="font-medium text-gray-500">Seat:</dt>
                  <dd className="col-span-2">{ticket.seat}</dd>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1">
                <dt className="font-medium text-gray-500">Price:</dt>
                <dd className="col-span-2">
                  ₹{ticket?.price?.toFixed(2) || "0.00"}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="font-medium text-gray-500">Status:</dt>
                <dd className="col-span-2 capitalize">
                  <span
                    className={
                      ticket?.status === "available"
                        ? "text-green-600"
                        : ticket?.status === "sold"
                          ? "text-blue-600"
                          : "text-gray-600"
                    }
                  >
                    {ticket?.status || "unknown"}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <dt className="font-medium text-gray-500">Verified:</dt>
                <dd className="col-span-2">
                  {false ? (
                    <span className="inline-flex items-center text-green-600">
                      Yes
                    </span>
                  ) : (
                    <span className="text-yellow-600">No</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          {false ? (
            <TicketVerification ticket={ticket} />
          ) : (
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 flex items-center justify-center h-full">
              <div className="text-center">
                <TicketX className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">
                  No QR code available for this ticket.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
