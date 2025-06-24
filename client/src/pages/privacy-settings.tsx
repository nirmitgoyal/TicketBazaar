import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Settings, 
  Cookie, 
  Download, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useLegalCompliance } from "@/hooks/use-legal-compliance";
import { LegalComplianceModal } from "@/components/ui/legal-compliance-modal";
import { SEOManager } from "@/components/seo-manager";
import { UnifiedSchema } from "@/components/unified-schema";

export default function PrivacySettings() {
  const { 
    hasAccepted, 
    consentSettings, 
    consentDate, 
    shouldShowModal,
    showModal,
    hideModal,
    updateConsentSettings,
    resetCompliance 
  } = useLegalCompliance();

  const handleUpdateConsent = (key: keyof typeof consentSettings, value: boolean) => {
    if (consentSettings) {
      const newSettings = { ...consentSettings, [key]: value };
      updateConsentSettings(newSettings);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEOManager
        title="Privacy Settings | Ticket Bazaar"
        description="Manage your privacy preferences, cookie settings, and data consent on Ticket Bazaar. Control how your information is used and processed."
        canonicalUrl="https://ticketbazaar.co.in/privacy-settings"
      >
        <UnifiedSchema />
      </SEOManager>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Privacy Settings</h1>
            <p className="text-muted-foreground">
              Manage your privacy preferences and data consent settings
            </p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasAccepted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-medium">
                  Legal Compliance Status
                </span>
              </div>
              <Badge variant={hasAccepted ? "default" : "secondary"}>
                {hasAccepted ? "Accepted" : "Pending"}
              </Badge>
            </div>

            {hasAccepted && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatDate(consentDate)}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={showModal}
              >
                Review Legal Policies
              </Button>
              {hasAccepted && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetCompliance}
                >
                  Reset Preferences
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cookie Preferences */}
        {hasAccepted && consentSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
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
                      handleUpdateConsent('analytics', !!checked)
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
                      handleUpdateConsent('marketing', !!checked)
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
                      handleUpdateConsent('functional', !!checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Under GDPR, CCPA, and other privacy laws, you have specific rights regarding your personal data:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Access & Portability</h4>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get a copy of all your personal data in a portable format
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Account Deletion</h4>
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Additional Rights</h4>
              <ul className="text-sm space-y-1 text-muted-foreground pl-4">
                <li>• Correct inaccurate information in your profile</li>
                <li>• Object to certain types of data processing</li>
                <li>• Request restriction of data processing</li>
                <li>• Withdraw consent for data processing (where applicable)</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                For data requests or questions, contact us at privacy@ticketbazaar.com. 
                We will respond within 30 days as required by law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For privacy-related questions, concerns, or requests:
              </p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Email:</strong> privacy@ticketbazaar.com
                </div>
                <div>
                  <strong>Response Time:</strong> Within 30 days
                </div>
                <div>
                  <strong>Business Registration:</strong> GSTIN 092500308978TRN
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Compliance Modal */}
      <LegalComplianceModal
        isOpen={shouldShowModal}
        onClose={hideModal}
        showOnFirstVisit={false}
      />
    </div>
  );
}