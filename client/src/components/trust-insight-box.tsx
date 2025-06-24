import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustAssessment {
  trustScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  summary: string;
  verifiedProfiles: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  riskWarnings: string[];
  lastVerified: string;
  confidence: number;
}

interface TrustInsightBoxProps {
  sellerId: number;
  className?: string;
}

export function TrustInsightBox({ sellerId, className }: TrustInsightBoxProps) {
  const [trustData, setTrustData] = useState<TrustAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrustAssessment();
  }, [sellerId]);

  const fetchTrustAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/seller-trust/${sellerId}`);
      const result = await response.json();
      
      if (result.success) {
        setTrustData(result.data);
      } else {
        setError(result.error || 'Failed to load trust assessment');
      }
    } catch (err) {
      setError('Network error while loading trust assessment');
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (score: number): string => {
    if (score >= 8.5) return "text-green-600";
    if (score >= 7.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'low': return "bg-green-100 text-green-800";
      case 'moderate': return "bg-yellow-100 text-yellow-800";
      case 'high': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card className={cn("border-blue-200 bg-blue-50/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <div className="font-semibold text-blue-900">Analyzing Seller Trust...</div>
              <div className="text-sm text-blue-700">AI verification in progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-gray-200 bg-gray-50/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">Trust Verification Unavailable</div>
                <div className="text-sm text-gray-600">Please rely on platform verification badges</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTrustAssessment}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trustData) {
    return null;
  }

  return (
    <Card className={cn("border-blue-200 bg-blue-50/50", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header with Trust Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRiskIcon(trustData.riskLevel)}
            <div>
              <div className="font-semibold text-gray-900">
                Trust Score: <span className={getTrustScoreColor(trustData.trustScore)}>
                  {trustData.trustScore.toFixed(1)}/10
                </span>
              </div>
              <Badge className={getRiskLevelColor(trustData.riskLevel)}>
                {trustData.riskLevel.charAt(0).toUpperCase() + trustData.riskLevel.slice(1)} Risk
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Confidence</div>
            <div className="text-sm font-medium">{trustData.confidence}%</div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
          <div className="text-sm text-gray-700 leading-relaxed">
            <strong>AI Assessment:</strong> {trustData.summary}
          </div>
          {trustData.fraudProbability !== undefined && (
            <div className="mt-2 text-xs text-gray-600">
              <strong>Fraud Risk:</strong> {trustData.fraudProbability}% probability
            </div>
          )}
        </div>

        {/* Verified Social Profiles */}
        {Object.keys(trustData.verifiedProfiles).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Verified Social Profiles:</div>
            <div className="flex flex-wrap gap-2">
              {trustData.verifiedProfiles.linkedin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trustData.verifiedProfiles.linkedin, '_blank')}
                  className="text-xs h-8"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  LinkedIn
                </Button>
              )}
              {trustData.verifiedProfiles.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trustData.verifiedProfiles.instagram, '_blank')}
                  className="text-xs h-8"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Instagram
                </Button>
              )}
              {trustData.verifiedProfiles.facebook && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trustData.verifiedProfiles.facebook, '_blank')}
                  className="text-xs h-8"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Facebook
                </Button>
              )}
              {trustData.verifiedProfiles.twitter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trustData.verifiedProfiles.twitter, '_blank')}
                  className="text-xs h-8"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Twitter
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Risk Warnings */}
        {trustData.riskWarnings.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Indicators:
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <ul className="text-sm text-red-800 space-y-1">
                {trustData.riskWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Last Verified */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-blue-100">
          <Clock className="h-3 w-3" />
          Last verified: {new Date(trustData.lastVerified).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}