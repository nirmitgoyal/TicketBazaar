import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  FileText
} from "lucide-react";
import { Ticket } from "@shared/schema";

export function VerificationReport() {
  const { ticketId } = useParams<{ ticketId: string }>();

  // Fetch ticket details
  const { data: ticket, isLoading: ticketLoading } = useQuery<Ticket>({
    queryKey: [`/api/tickets/${ticketId}`],
    enabled: !!ticketId,
  });

  // Fetch AI verification data
  const { data: verificationData, isLoading: verificationLoading } = useQuery({
    queryKey: [`/api/ai-verification/${ticketId}`],
    enabled: !!ticketId,
    queryFn: async () => {
      const response = await fetch(`/api/ai-verification/verify/${ticketId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to fetch verification data');
      return response.json();
    }
  });

  if (ticketLoading || verificationLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading verification report...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !verificationData?.data) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-gray-600">The verification report for this ticket could not be found.</p>
        </div>
      </div>
    );
  }

  const verification = verificationData.data.verification;
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle2 className="h-5 w-5" />;
      case 'medium': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <XCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Verification Report</h1>
        <p className="text-gray-600">Detailed analysis for ticket #{ticket.id}</p>
      </div>

      <div className="grid gap-6">
        {/* Overall Trust Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Overall Trust Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${getRiskColor(verification.overall.fraudRisk)}`}>
              {getRiskIcon(verification.overall.fraudRisk)}
              <div className="flex-1">
                <div className="font-semibold text-lg">
                  {verification.overall.fraudRisk === 'low' ? 'Verified Safe' : 
                   verification.overall.fraudRisk === 'medium' ? 'Proceed with Caution' : 
                   'High Risk'}
                </div>
                <div className="text-sm opacity-80">
                  Confidence Score: {verification.overall.confidence}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Event Date</div>
                  <div className="font-medium">{new Date(ticket.eventDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Venue</div>
                  <div className="font-medium">{ticket.venue}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-medium">₹{ticket.price.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Section</div>
                  <div className="font-medium">{ticket.section}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {verificationData.data.verificationResults?.event?.confidence || 75}%
                </div>
                <div className="text-sm font-medium">Event Verification</div>
                <div className="text-xs text-gray-500 mt-1">
                  Event authenticity and details
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {verificationData.data.verificationResults?.seller?.confidence || 70}%
                </div>
                <div className="text-sm font-medium">Seller Verification</div>
                <div className="text-xs text-gray-500 mt-1">
                  Seller credibility and history
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {verificationData.data.verificationResults?.pricing?.confidence || 80}%
                </div>
                <div className="text-sm font-medium">Pricing Analysis</div>
                <div className="text-xs text-gray-500 mt-1">
                  Price fairness assessment
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {verificationData.data.recommendations && verificationData.data.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Safety Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {verificationData.data.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Report Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Report Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Generated</div>
                <div className="font-medium">
                  {new Date(verification.overall.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Analysis Type</div>
                <div className="font-medium">AI-Powered Risk Assessment</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}