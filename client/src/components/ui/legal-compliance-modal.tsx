import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  FileText, 
  Cookie, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Lock,
  UserCheck
} from "lucide-react";
import { Link } from "wouter";

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showOnFirstVisit?: boolean;
}

interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export function LegalComplianceModal({ 
  isOpen, 
  onClose, 
  onAccept,
  showOnFirstVisit = false 
}: LegalComplianceModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);

  useEffect(() => {
    // Check if user has previously accepted compliance
    const hasAccepted = localStorage.getItem('ticketbazaar-legal-accepted');
    if (hasAccepted && !showOnFirstVisit) {
      onClose();
    }
  }, [onClose, showOnFirstVisit]);

  const handleAcceptAll = () => {
    const updatedConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setConsentSettings(updatedConsent);
    saveConsent(updatedConsent);
  };

  const handleAcceptSelected = () => {
    saveConsent(consentSettings);
  };

  const saveConsent = (consent: ConsentSettings) => {
    localStorage.setItem('ticketbazaar-legal-accepted', 'true');
    localStorage.setItem('ticketbazaar-consent-settings', JSON.stringify(consent));
    localStorage.setItem('ticketbazaar-consent-date', new Date().toISOString());
    
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  const canProceed = hasAcceptedTerms && hasAcceptedPrivacy;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Legal Compliance & Privacy</DialogTitle>
          </div>
          <DialogDescription>
            Welcome to TicketBazaar. Before you continue, please review our legal policies and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="text-sm">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="terms" className="text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Terms
              </TabsTrigger>
              <TabsTrigger value="cookies" className="text-sm">
                <Cookie className="h-4 w-4 mr-2" />
                Cookies
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      Your Rights & Our Commitment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          What We Do
                        </h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                          <li>• Connect ticket buyers with sellers</li>
                          <li>• Provide a secure discovery platform</li>
                          <li>• Verify user identities for trust</li>
                          <li>• Ensure legal compliance</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-green-600" />
                          What We Don't Do
                        </h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                          <li>• Handle payments or transactions</li>
                          <li>• Hold ticket inventory</li>
                          <li>• Act as a broker or reseller</li>
                          <li>• Share data without consent</li>
                        </ul>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Legal Compliance Status</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Badge variant="secondary" className="justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          GDPR Compliant
                        </Badge>
                        <Badge variant="secondary" className="justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          CCPA Compliant
                        </Badge>
                        <Badge variant="secondary" className="justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          GSTIN: 092500308978TRN
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Required Agreements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="accept-terms"
                        checked={hasAcceptedTerms}
                        onCheckedChange={setHasAcceptedTerms}
                      />
                      <div className="flex-1">
                        <label htmlFor="accept-terms" className="text-sm font-medium cursor-pointer">
                          I have read and agree to the{" "}
                          <Link href="/terms-of-service">
                            <Button variant="link" className="p-0 h-auto underline">
                              Terms of Service
                            </Button>
                          </Link>
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          This covers your rights and responsibilities while using our platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="accept-privacy"
                        checked={hasAcceptedPrivacy}
                        onCheckedChange={setHasAcceptedPrivacy}
                      />
                      <div className="flex-1">
                        <label htmlFor="accept-privacy" className="text-sm font-medium cursor-pointer">
                          I have read and understand the{" "}
                          <Link href="/privacy-policy">
                            <Button variant="link" className="p-0 h-auto underline">
                              Privacy Policy
                            </Button>
                          </Link>
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          This explains how we collect, use, and protect your data.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Policy Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Data We Collect</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                        <li>• Account information (email, phone, Instagram profile)</li>
                        <li>• Ticket listings and event preferences</li>
                        <li>• Communication records between users</li>
                        <li>• Technical data (IP address, device info, usage analytics)</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">How We Use Your Data</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                        <li>• Facilitate connections between buyers and sellers</li>
                        <li>• Verify user identities for trust and safety</li>
                        <li>• Send notifications about relevant tickets</li>
                        <li>• Improve our platform and services</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Your Rights</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                        <li>• Access and download your data</li>
                        <li>• Correct inaccurate information</li>
                        <li>• Delete your account and data</li>
                        <li>• Object to certain data processing</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        We never sell your personal data or share it with third parties for marketing without your explicit consent.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Terms of Service Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Platform Purpose</h4>
                      <p className="text-sm text-muted-foreground">
                        TicketBazaar is a discovery and contact platform that connects individual ticket sellers with buyers. 
                        We do not handle payments, hold inventory, or facilitate transactions directly.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">User Responsibilities</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                        <li>• Provide accurate and truthful information</li>
                        <li>• Use the platform for legitimate ticket transactions only</li>
                        <li>• Respect other users and follow community guidelines</li>
                        <li>• Comply with applicable laws in your jurisdiction</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Prohibited Activities</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                        <li>• Fraudulent or misleading ticket listings</li>
                        <li>• Harassment or inappropriate communication</li>
                        <li>• Violation of event organizer terms</li>
                        <li>• Automated scraping or data harvesting</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        All transactions are peer-to-peer. We recommend meeting in safe, public locations for ticket exchanges.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cookies" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Cookie & Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Necessary Cookies</h4>
                          <p className="text-xs text-muted-foreground">
                            Required for basic platform functionality and security
                          </p>
                        </div>
                        <Checkbox checked={true} disabled />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Analytics Cookies</h4>
                          <p className="text-xs text-muted-foreground">
                            Help us understand how users interact with our platform
                          </p>
                        </div>
                        <Checkbox 
                          checked={consentSettings.analytics}
                          onCheckedChange={(checked) => 
                            setConsentSettings(prev => ({ ...prev, analytics: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Marketing Cookies</h4>
                          <p className="text-xs text-muted-foreground">
                            Enable personalized content and relevant event recommendations
                          </p>
                        </div>
                        <Checkbox 
                          checked={consentSettings.marketing}
                          onCheckedChange={(checked) => 
                            setConsentSettings(prev => ({ ...prev, marketing: !!checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Functional Cookies</h4>
                          <p className="text-xs text-muted-foreground">
                            Remember your preferences and improve user experience
                          </p>
                        </div>
                        <Checkbox 
                          checked={consentSettings.functional}
                          onCheckedChange={(checked) => 
                            setConsentSettings(prev => ({ ...prev, functional: !!checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAcceptAll}
                        className="flex-1"
                      >
                        Accept All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAcceptSelected}
                        className="flex-1"
                      >
                        Save Selected
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="border-t pt-4 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Last updated: June 24, 2025</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            {activeTab === "overview" ? (
              <Button 
                onClick={() => setActiveTab("cookies")} 
                disabled={!canProceed}
                size="sm"
              >
                Continue to Settings
              </Button>
            ) : (
              <Button 
                onClick={handleAcceptSelected} 
                disabled={!canProceed}
                size="sm"
              >
                Accept & Continue
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}