import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
  ExternalLink,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  Globe,
  Zap,
} from "lucide-react";
import { TrustScoreMeter } from "./trust-score-meter";

interface AIVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationData: any;
  ticketData: any;
}

export function AIVerificationModal({
  isOpen,
  onClose,
  verificationData,
  ticketData,
}: AIVerificationModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'sources'>('overview');

  if (!verificationData) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Verification Report
          </DialogTitle>
          <DialogDescription>
            Powered by Perplexity AI - Comprehensive ticket and seller analysis
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="rounded-none"
          >
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('details')}
            className="rounded-none"
          >
            <Eye className="h-4 w-4 mr-2" />
            Detailed Analysis
          </Button>
          <Button
            variant={activeTab === 'sources' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sources')}
            className="rounded-none"
          >
            <Globe className="h-4 w-4 mr-2" />
            Sources & Citations
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Trust Score */}
                <div className="text-center">
                  <TrustScoreMeter
                    score={verificationData.verification.overall.confidence}
                    label="Overall Trust Score"
                    size="lg"
                    fraudRisk={verificationData.verification.overall.fraudRisk}
                    animate={true}
                  />
                  <Badge 
                    className={`mt-4 ${getRiskColor(verificationData.verification.overall.fraudRisk)}`}
                  >
                    {verificationData.verification.overall.fraudRisk.toUpperCase()} RISK
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getConfidenceIcon(verificationData.verificationResults.event.confidence)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {verificationData.verificationResults.event.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">Event Legitimacy</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getConfidenceIcon(verificationData.verificationResults.seller.confidence)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {verificationData.verificationResults.seller.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">Seller Trust</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getConfidenceIcon(verificationData.verificationResults.pricing.confidence)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {verificationData.verificationResults.pricing.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">Price Fairness</div>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Key Findings
                  </h3>
                  <div className="space-y-2">
                    {verificationData.verification.overall.reasons?.slice(0, 5).map((reason: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Safety Recommendations
                  </h3>
                  <div className="space-y-2">
                    {verificationData.recommendations?.slice(0, 4).map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Ticket Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Event Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Event</div>
                      <div className="text-sm text-gray-600">{verificationData.ticketDetails.eventTitle}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Venue</div>
                      <div className="text-sm text-gray-600">{verificationData.ticketDetails.venue}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Date</div>
                      <div className="text-sm text-gray-600">
                        {new Date(verificationData.ticketDetails.eventDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Legitimacy Status</div>
                      <div className="flex items-center gap-2">
                        {verificationData.verificationResults.event.isLegitimate ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {verificationData.verificationResults.event.isLegitimate ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Event Findings</div>
                    <div className="space-y-1">
                      {verificationData.verificationResults.event.findings?.map((finding: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Seller Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Seller Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Name</div>
                      <div className="text-sm text-gray-600">{verificationData.sellerDetails.fullName}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Rating</div>
                      <div className="text-sm text-gray-600">
                        {verificationData.sellerDetails.rating || 'No ratings'} 
                        ({verificationData.sellerDetails.ratingsCount || 0} reviews)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Phone Verified</div>
                      <div className="flex items-center gap-2">
                        {verificationData.sellerDetails.phoneVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {verificationData.sellerDetails.phoneVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Trustworthiness</div>
                      <div className="flex items-center gap-2">
                        {verificationData.verificationResults.seller.isTrustworthy ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {verificationData.verificationResults.seller.isTrustworthy ? 'Trustworthy' : 'Questionable'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Seller Findings</div>
                    <div className="space-y-1">
                      {verificationData.verificationResults.seller.findings?.map((finding: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Pricing Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Listing Price</div>
                      <div className="text-sm text-gray-600">${verificationData.ticketDetails.price}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Original Price</div>
                      <div className="text-sm text-gray-600">
                        ${verificationData.ticketDetails.originalPrice || 'Unknown'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Price Fairness</div>
                      <div className="flex items-center gap-2">
                        {verificationData.verificationResults.pricing.isFair ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {verificationData.verificationResults.pricing.isFair ? 'Fair Price' : 'Overpriced'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Pricing Findings</div>
                    <div className="space-y-1">
                      {verificationData.verificationResults.pricing.findings?.map((finding: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sources' && (
              <motion.div
                key="sources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Sources & Citations
                  </h3>
                  <p className="text-sm text-gray-600">
                    This analysis was powered by Perplexity AI's real-time web search capabilities.
                    The following sources were referenced during the verification process:
                  </p>
                  
                  {verificationData.citations && verificationData.citations.length > 0 ? (
                    <div className="space-y-3">
                      {verificationData.citations.map((citation: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <a
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {citation}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No external sources were cited for this analysis.</p>
                      <p className="text-sm mt-2">The analysis was based on pattern recognition and internal verification algorithms.</p>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">Analysis Timestamp</div>
                        <div className="text-sm text-blue-700">
                          {new Date(verificationData.analysisTimestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-6 pt-0 flex justify-end">
          <Button onClick={onClose}>Close Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}