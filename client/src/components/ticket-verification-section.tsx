import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, Eye, TrendingUp, FileText } from "lucide-react";
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
      
      const response = await fetch(`/api/ai-verification/verify/${ticket.id}`, {
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
    
    if (overall.fraudRisk === 'low' && overall.confidence >= 70) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Verified ({overall.confidence}%)
        </Badge>
      );
    } else if (overall.fraudRisk === 'medium') {
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
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        {!verificationResult && getVerificationBadge()}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVerify}
          disabled={isVerifying}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-1" />
              {verificationResult ? 'Re-analyze with AI' : 'Verify with AI'}
            </>
          )}
        </Button>
      </div>
      
      <AnimatePresence mode="wait">
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Trust Score */}
            <div className="flex justify-center">
              <TrustScoreMeter
                score={verificationResult.verification.overall.confidence}
                label="Overall Trust Score"
                size="md"
                fraudRisk={verificationResult.verification.overall.fraudRisk}
                animate={true}
              />
            </div>
            
            {/* Detailed Scores */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="text-center">
                <TrustScoreMeter
                  score={verificationResult?.verificationResults?.event?.confidence || 75}
                  label="Event"
                  size="sm"
                  showDetails={false}
                  animate={true}
                />
              </div>
              <div className="text-center">
                <TrustScoreMeter
                  score={verificationResult?.verificationResults?.seller?.confidence || 70}
                  label="Seller"
                  size="sm"
                  showDetails={false}
                  animate={true}
                />
              </div>
              <div className="text-center">
                <TrustScoreMeter
                  score={verificationResult?.verificationResults?.pricing?.confidence || 80}
                  label="Pricing"
                  size="sm"
                  showDetails={false}
                  animate={true}
                />
              </div>
            </motion.div>
            
            {/* System Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                System Analysis
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                {verificationResult?.recommendations?.map((reason: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.2 + (index * 0.2), duration: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </motion.div>
                )) || []}
              </div>
            </motion.div>
            
            {/* Safety Recommendations */}
            {verificationResult.recommendations && verificationResult.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.5, duration: 0.5 }}
                className={`p-3 rounded-lg ${
                  verificationResult.verification.overall.fraudRisk === 'high' 
                    ? 'bg-red-50 border border-red-200' 
                    : verificationResult.verification.overall.fraudRisk === 'medium'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="text-xs font-medium mb-2 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Safety Recommendations
                </div>
                <ul className="text-xs space-y-1">
                  {verificationResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.7 + (index * 0.1), duration: 0.3 }}
                      className="flex items-start gap-2"
                    >
                      <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Detailed Report Button */}
      {verificationResult && !verificationResult.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.5 }}
          className="mt-4 text-center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailedModal(true)}
            className="text-xs"
          >
            <FileText className="h-3 w-3 mr-1" />
            View Detailed AI Report
          </Button>
        </motion.div>
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