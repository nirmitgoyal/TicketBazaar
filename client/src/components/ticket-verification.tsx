import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TicketVerificationProps {
  ticket: Ticket;
}

export function TicketVerification({ ticket }: TicketVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<
    "success" | "error" | null
  >(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async ({ id, code }: { id: number; code: string }) => {
      const res = await apiRequest("POST", `/api/tickets/${id}/verify`, {
        code,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Verification failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setVerificationResult("success");
      toast({
        title: "Ticket Verified",
        description: "The ticket has been successfully verified.",
      });
      queryClient.setQueryData(["/api/tickets", ticket.id], data);
    },
    onError: (error: Error) => {
      setVerificationResult("error");
      toast({
        title: "Verification Failed",
        description:
          error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }

    if (!ticket?.id) {
      toast({
        title: "Error",
        description: "Ticket information is missing",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({ id: ticket.id, code: verificationCode });
  };

  if (ticket?.verified) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold mt-4 text-green-800">
          Ticket Already Verified
        </h3>
        <p className="mt-2 text-green-700">
          This ticket has already been successfully verified and is valid.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Verify Ticket</h2>

      {ticket?.qrCode ? (
        <div className="mb-6">
          <div className="bg-white p-4 border rounded-md mb-4 flex justify-center">
            <img
              src={ticket.qrCode}
              alt="Ticket QR Code"
              className="max-w-full h-auto"
              style={{ maxHeight: "200px" }}
            />
          </div>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Scan this QR code at the venue entrance for verification
          </p>

          {ticket?.verificationCode && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-700 font-medium">
                Verification Code
              </p>
              <p className="text-lg tracking-wider font-mono pt-1">
                {ticket.verificationCode}
              </p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <div className="flex gap-2">
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the verification code"
                className="font-mono"
              />
              <Button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || !verificationCode.trim()}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>

            {verificationResult === "success" && (
              <div className="mt-4 flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Ticket successfully verified!</span>
              </div>
            )}

            {verificationResult === "error" && (
              <div className="mt-4 flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                <span>Invalid verification code. Please try again.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            QR code not generated yet for this ticket.
          </p>
        </div>
      )}
    </div>
  );
}
