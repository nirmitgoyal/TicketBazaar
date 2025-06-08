import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VerificationBadge } from "./verification-badge";
import { 
  Shield, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Ticket, User as UserType } from "@shared/schema";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  seller?: UserType;
}

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  reasons: string[];
  sources: string[];
  fraudRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface ComprehensiveVerification {
  ticket: Ticket;
  seller: UserType;
  verification: {
    event: VerificationResult;
    seller: VerificationResult;
    pricing: VerificationResult;
    overall: VerificationResult;
  };
  recommendations: string[];
}

export function VerificationModal({ isOpen, onClose, ticket, seller }: VerificationModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: verificationData, isLoading, error } = useQuery<{ data: ComprehensiveVerification }>({
    queryKey: [`/api/verification/comprehensive/${ticket.id}`],
    enabled: isOpen,
  });

  const verification = verificationData?.data;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 animate-pulse" />
              Verifying Authenticity...
            </DialogTitle>
            <DialogDescription>
              Using AI to verify ticket and seller authenticity
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing with Perplexity AI...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !verification) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Verification Failed
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              Unable to verify this ticket at the moment. Please try again later.
            </p>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authenticity Verification Report
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis of ticket and seller authenticity
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="event">Event Analysis</TabsTrigger>
            <TabsTrigger value="seller">Seller Analysis</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] w-full">
            <TabsContent value="overview" className="space-y-6">
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Overall Verification Status                      <VerificationBadge 
                        isVerified={verification.verification.overall.fraudRisk === 'low'}
                        confidence={verification.verification.overall.confidence}
                        fraudRisk={verification.verification.overall.fraudRisk}
                        size="lg"
                      />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getConfidenceColor(verification.verification.overall.confidence)}`}>
                        {verification.verification.overall.confidence}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold capitalize ${getRiskColor(verification.verification.overall.fraudRisk)}`}>
                        {verification.verification.overall.fraudRisk}
                      </div>
                      <div className="text-sm text-muted-foreground">Risk Level</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${verification.verification.overall.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {verification.verification.overall.isVerified ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-muted-foreground">Verified</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Analysis */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Event</span>
                      </div>                      <VerificationBadge 
                        isVerified={verification.verification.event.fraudRisk === 'low'}
                        confidence={verification.verification.event.confidence}
                        fraudRisk={verification.verification.event.fraudRisk}
                        size="sm"
                      />
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Seller</span>
                      </div>                      <VerificationBadge 
                        isVerified={verification.verification.seller.fraudRisk === 'low'}
                        confidence={verification.verification.seller.confidence}
                        fraudRisk={verification.verification.seller.fraudRisk}
                        size="sm"
                      />
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Pricing</span>
                      </div>                      <VerificationBadge 
                        isVerified={verification.verification.pricing.fraudRisk === 'low'}
                        confidence={verification.verification.pricing.confidence}
                        fraudRisk={verification.verification.pricing.fraudRisk}
                        size="sm"
                      />
                    </Card>
                  </div>

                  {/* Safety Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Safety Recommendations
                    </h4>
                    <div className="space-y-2">
                      {verification.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Event Date
                      </div>
                      <div className="font-medium">{formatDate(ticket.eventDate)}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Venue
                      </div>
                      <div className="font-medium">{ticket.venue}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Price
                      </div>
                      <div className="font-medium">₹{ticket.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Section
                      </div>
                      <div className="font-medium">{ticket.section}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="event" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Event Verification Analysis
                    <VerificationBadge 
                      isVerified={verification.verification.event.fraudRisk === 'low'}
                      confidence={verification.verification.event.confidence}
                      fraudRisk={verification.verification.event.fraudRisk}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    <div className="space-y-2">
                      {verification.verification.event.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {verification.verification.event.sources.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Verified Sources</h4>
                      <div className="space-y-2">
                        {verification.verification.event.sources.map((source, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {source}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      {verification.verification.event.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seller" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Seller Verification Analysis
                    <VerificationBadge 
                      isVerified={verification.verification.seller.fraudRisk === 'low'}
                      confidence={verification.verification.seller.confidence}
                      fraudRisk={verification.verification.seller.fraudRisk}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Seller Name</div>
                      <div className="font-medium">{verification.seller.fullName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                      <div className="font-medium">{verification.seller.rating?.toFixed(1) || 'N/A'}/5.0</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Reviews</div>
                      <div className="font-medium">{verification.seller.ratingsCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Contact Method</div>
                      <div className="font-medium capitalize">{verification.seller.preferredContactMethod || 'Not specified'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    <div className="space-y-2">
                      {verification.verification.seller.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {verification.verification.seller.sources.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Verification Sources</h4>
                      <div className="space-y-2">
                        {verification.verification.seller.sources.map((source, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {source}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pricing Analysis
                    <VerificationBadge 
                      isVerified={verification.verification.pricing.fraudRisk === 'low'}
                      confidence={verification.verification.pricing.confidence}
                      fraudRisk={verification.verification.pricing.fraudRisk}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{ticket.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Listed Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{ticket.quantity}</div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{(ticket.price * ticket.quantity).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Pricing Analysis</h4>
                    <div className="space-y-2">
                      {verification.verification.pricing.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                          <span className="text-sm">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {verification.verification.pricing.sources.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Price Comparison Sources</h4>
                      <div className="space-y-2">
                        {verification.verification.pricing.sources.map((source, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {source}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}