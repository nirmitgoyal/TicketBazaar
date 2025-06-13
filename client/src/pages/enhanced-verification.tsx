import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  Phone, 
  Mail, 
  FileText, 
  Camera, 
  MapPin,
  Star,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  governmentIdVerified: boolean;
  verificationStatus: string;
  verificationLevel: number;
}

interface FraudStats {
  totalAssessments: number;
  highRiskDetected: number;
  fraudPrevented: number;
  averageRiskScore: number;
  topRiskFactors: string[];
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const verificationLevels = [
  { level: 0, name: "Unverified", color: "bg-gray-500", description: "No verification completed" },
  { level: 1, name: "Bronze", color: "bg-amber-600", description: "Basic email verification" },
  { level: 2, name: "Silver", color: "bg-gray-400", description: "Email + phone verification" },
  { level: 3, name: "Gold", color: "bg-yellow-500", description: "Email + phone + ID verification" },
  { level: 4, name: "Platinum", color: "bg-purple-600", description: "Complete verification suite" }
];

export default function EnhancedVerificationPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  // Query verification status
  const { data: verificationStatus, isLoading: statusLoading } = useQuery<VerificationStatus>({
    queryKey: ['/api/verification/status'],
    enabled: isAuthenticated
  });

  // Query fraud statistics (demo data)
  const { data: fraudStats } = useQuery<FraudStats>({
    queryKey: ['/api/fraud-detection/fraud-statistics'],
    enabled: isAuthenticated && user?.isAdmin,
    retry: false
  });

  // Send verification code mutation
  const sendCodeMutation = useMutation({
    mutationFn: (data: { type: string; contact: string }) =>
      apiRequest('/api/verification/send-code', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: "Please check your phone or email for the verification code."
      });
    },
    onError: () => {
      toast({
        title: "Failed to send code",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Verify code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: (data: { type: string; contact: string; code: string }) =>
      apiRequest('/api/verification/verify-code', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({
        title: "Verification successful",
        description: "Your verification has been completed."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    },
    onError: () => {
      toast({
        title: "Verification failed",
        description: "Invalid code. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Upload documents mutation
  const uploadDocumentsMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest('/api/verification/upload-documents', { 
        method: 'POST', 
        body: formData,
        headers: {} // Let browser set multipart/form-data headers
      }),
    onSuccess: () => {
      toast({
        title: "Documents uploaded",
        description: "Your documents are being processed for verification."
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSendCode = (type: 'phone' | 'email') => {
    const contact = type === 'phone' ? phoneNumber : email;
    if (!contact) {
      toast({
        title: "Contact required",
        description: `Please enter your ${type} ${type === 'phone' ? 'number' : 'address'}.`,
        variant: "destructive"
      });
      return;
    }
    sendCodeMutation.mutate({ type, contact });
  };

  const handleVerifyCode = (type: 'phone' | 'email') => {
    const contact = type === 'phone' ? phoneNumber : email;
    if (!contact || !verificationCode) {
      toast({
        title: "Information required",
        description: "Please enter both contact information and verification code.",
        variant: "destructive"
      });
      return;
    }
    verifyCodeMutation.mutate({ type, contact, code: verificationCode });
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [key]: file }));
    } else {
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[key];
        return newFiles;
      });
    }
  };

  const handleDocumentUpload = () => {
    if (Object.keys(selectedFiles).length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one document to upload.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    Object.entries(selectedFiles).forEach(([key, file]) => {
      formData.append(key, file);
    });

    uploadDocumentsMutation.mutate(formData);
  };

  const currentLevel = verificationStatus?.verificationLevel || 0;
  const levelInfo = verificationLevels[currentLevel];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Please log in to access verification features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Enhanced Verification & Trust</h1>
        <p className="text-muted-foreground">
          Secure your account with advanced verification and fraud protection
        </p>
      </div>

      {/* Current Verification Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Verification Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="animate-pulse">Loading verification status...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${levelInfo.color} flex items-center justify-center text-white font-bold`}>
                  {currentLevel}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{levelInfo.name}</h3>
                  <p className="text-muted-foreground">{levelInfo.description}</p>
                </div>
              </div>
              
              <Progress value={(currentLevel / 4) * 100} className="w-full" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {verificationStatus?.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  {verificationStatus?.phoneVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Phone</span>
                </div>
                <div className="flex items-center gap-2">
                  {verificationStatus?.governmentIdVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">ID</span>
                </div>
                <div className="flex items-center gap-2">
                  {verificationStatus?.verificationStatus === 'verified' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">Complete</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Shield className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{currentLevel}/4</p>
                  <p className="text-sm text-muted-foreground">Trust Level</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {[verificationStatus?.emailVerified, verificationStatus?.phoneVerified, verificationStatus?.governmentIdVerified].filter(Boolean).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified Methods</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{user?.rating?.toFixed(1) || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">User Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Activity className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fraud Detection Statistics (if user is admin) */}
          {fraudStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fraud Detection Statistics
                </CardTitle>
                <CardDescription>
                  Real-time security insights and threat prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-bold">{fraudStats.totalAssessments}</p>
                    <p className="text-sm text-muted-foreground">Total Assessments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{fraudStats.highRiskDetected}</p>
                    <p className="text-sm text-muted-foreground">High Risk Detected</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{fraudStats.fraudPrevented}</p>
                    <p className="text-sm text-muted-foreground">Fraud Prevented</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{fraudStats.averageRiskScore}</p>
                    <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Distribution</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-green-500 text-xl font-bold">{fraudStats.riskDistribution.low}%</div>
                      <div className="text-sm text-muted-foreground">Low Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-500 text-xl font-bold">{fraudStats.riskDistribution.medium}%</div>
                      <div className="text-sm text-muted-foreground">Medium Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-500 text-xl font-bold">{fraudStats.riskDistribution.high}%</div>
                      <div className="text-sm text-muted-foreground">High Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-500 text-xl font-bold">{fraudStats.riskDistribution.critical}%</div>
                      <div className="text-sm text-muted-foreground">Critical Risk</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Top Risk Factors</h4>
                  <ul className="space-y-1">
                    {fraudStats.topRiskFactors.map((factor, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Verification
                </CardTitle>
                <CardDescription>
                  Verify your phone number for enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus?.phoneVerified ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Phone number verified successfully</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => handleSendCode('phone')}
                      disabled={sendCodeMutation.isPending}
                      className="w-full"
                    >
                      {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
                    </Button>
                    <div>
                      <Label htmlFor="phoneCode">Verification Code</Label>
                      <Input
                        id="phoneCode"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => handleVerifyCode('phone')}
                      disabled={verifyCodeMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Email Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Verification
                </CardTitle>
                <CardDescription>
                  Confirm your email address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus?.emailVerified ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Email address verified successfully</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                      />
                    </div>
                    <Button 
                      onClick={() => handleSendCode('email')}
                      disabled={sendCodeMutation.isPending}
                      className="w-full"
                    >
                      {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
                    </Button>
                    <div>
                      <Label htmlFor="emailCode">Verification Code</Label>
                      <Input
                        id="emailCode"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => handleVerifyCode('email')}
                      disabled={verifyCodeMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Verification
              </CardTitle>
              <CardDescription>
                Upload government-issued ID for enhanced verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {verificationStatus?.governmentIdVerified ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Government ID verified successfully</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="frontImage">Front of ID</Label>
                      <Input
                        id="frontImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('frontImage', e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backImage">Back of ID</Label>
                      <Input
                        id="backImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('backImage', e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="selfieImage">Selfie</Label>
                      <Input
                        id="selfieImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('selfieImage', e.target.files?.[0] || null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="proofOfAddress">Proof of Address</Label>
                      <Input
                        id="proofOfAddress"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('proofOfAddress', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertDescription>
                      Please ensure all documents are clear, well-lit, and all text is readable. 
                      Your selfie should clearly show your face matching the ID photo.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleDocumentUpload}
                    disabled={uploadDocumentsMutation.isPending || Object.keys(selectedFiles).length === 0}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadDocumentsMutation.isPending ? "Uploading..." : "Upload Documents"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Features
              </CardTitle>
              <CardDescription>
                Advanced fraud detection and account protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">Real-time Fraud Detection</h4>
                      <p className="text-sm text-muted-foreground">AI-powered monitoring of suspicious activities</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Biometric Verification</h4>
                      <p className="text-sm text-muted-foreground">Face recognition and liveness detection</p>
                    </div>
                  </div>
                  <Badge variant={verificationStatus?.governmentIdVerified ? "default" : "outline"}>
                    {verificationStatus?.governmentIdVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Document Authentication</h4>
                      <p className="text-sm text-muted-foreground">Advanced OCR and security feature detection</p>
                    </div>
                  </div>
                  <Badge variant={verificationStatus?.governmentIdVerified ? "default" : "outline"}>
                    {verificationStatus?.governmentIdVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Behavioral Analysis</h4>
                      <p className="text-sm text-muted-foreground">Pattern recognition for unusual activities</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Monitoring</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Security Recommendations</h4>
                <div className="space-y-2">
                  {!verificationStatus?.phoneVerified && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Complete phone verification to improve account security</span>
                    </div>
                  )}
                  {!verificationStatus?.governmentIdVerified && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Upload government ID for maximum trust level</span>
                    </div>
                  )}
                  {currentLevel < 3 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span>Higher verification levels unlock premium features</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}