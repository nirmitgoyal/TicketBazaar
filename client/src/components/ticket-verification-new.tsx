import { CheckCircle } from "lucide-react";
import { Ticket } from "@shared/schema";

interface TicketVerificationProps {
  ticket: Ticket;
}

export function TicketVerification({ ticket }: TicketVerificationProps) {
  // In P2P model, tickets don't have built-in verification system
  // Users handle verification themselves through direct contact with sellers
  
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
      <CheckCircle className="h-16 w-16 text-blue-500 mx-auto" />
      <h3 className="text-xl font-semibold mt-4 text-blue-800">
        P2P Verification Model
      </h3>
      <p className="mt-2 text-blue-700 max-w-md mx-auto">
        In our peer-to-peer marketplace, ticket verification is handled directly between buyers and sellers. 
        Contact the seller to arrange verification and transfer details.
      </p>
      <div className="mt-4 text-sm text-blue-600">
        <p>• Meet in person for verification</p>
        <p>• Check original purchase confirmation</p>
        <p>• Verify seller's identity</p>
      </div>
    </div>
  );
}
