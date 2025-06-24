import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, Eye, TrendingUp, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Ticket } from "@shared/schema";
import { TrustScoreMeter } from "./trust-score-meter";
import { AIVerificationModal } from "./ai-verification-modal";
import { motion, AnimatePresence } from "framer-motion";

interface TicketVerificationSectionProps {
  ticket: Ticket;
}

export function TicketVerificationSection({ ticket }: TicketVerificationSectionProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`/api/verification/verify/${ticket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVerificationResult(data.data);
        } else {
          throw new Error(data.message || 'AI verification failed');
        }
      } else {
        let errorMessage = 'AI verification request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Response not JSON, use default message
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('AI verification error:', error);
      
      let errorMessage = 'AI verification service temporarily unavailable. Please try again later.';
      if (error.name === 'AbortError') {
        errorMessage = 'Verification request timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setVerificationResult({
        error: true,
        message: errorMessage,
        verification: {
          overall: {
            isVerified: false,
            confidence: 0,
            fraudRisk: 'unknown',
            reasons: [errorMessage]
          }
        },
        verificationResults: {
          event: { confidence: 0, isLegitimate: false, findings: [] },
          seller: { confidence: 0, isTrustworthy: false, findings: [] },
          pricing: { confidence: 0, isFair: false, findings: [] }
        },
        recommendations: ['Please check your connection and try again', 'Contact support if the issue persists']
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerificationBadge = () => {
    if (!verificationResult || verificationResult.error) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          <Shield className="h-3 w-3 mr-1" />
          Not Verified
        </Badge>
      );
    }

    const overall = verificationResult.verification?.overall;
    if (!overall) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          <Shield className="h-3 w-3 mr-1" />
          Not Verified
        </Badge>
      );
    }
    
    if (overall.fraudRisk === 'medium') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Medium Risk ({overall.confidence}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {overall.fraudRisk === 'unknown' ? 'Service Error' : `High Risk (${overall.confidence}%)`}
        </Badge>
      );
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-start mb-3">
        
      </div>
      
      {verificationResult && (
        <div className="flex items-center gap-2">
          {verificationResult.verification.overall.fraudRisk === 'low' ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Verified Safe</span>
            </div>
          ) : verificationResult.verification.overall.fraudRisk === 'medium' ? (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Proceed with Caution</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">High Risk</span>
            </div>
          )}
          <span className="text-xs text-textSecondary">
            {verificationResult.verification.overall.confidence}% confidence
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/verification-report/${ticket.id}`, '_blank');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
          >
            View Report
          </button>
        </div>
      )}

      {/* AI Verification Modal */}
      <AIVerificationModal
        isOpen={showDetailedModal}
        onClose={() => setShowDetailedModal(false)}
        verificationData={verificationResult}
        ticketData={ticket}
      />
    </div>
  );
}