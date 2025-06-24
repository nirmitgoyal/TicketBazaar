import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cookie, 
  X, 
  Settings, 
  CheckCircle,
  Shield
} from "lucide-react";
import { useLegalCompliance } from "@/hooks/use-legal-compliance";
import { Link } from "wouter";

export function CookieConsentBanner() {
  const { hasAccepted, showModal } = useLegalCompliance();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't accepted compliance and it's been 3 seconds since page load
    if (!hasAccepted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAccepted]);

  const handleAcceptAll = () => {
    // Save basic consent and hide banner
    localStorage.setItem('ticketbazaar-legal-accepted', 'true');
    localStorage.setItem('ticketbazaar-consent-settings', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }));
    localStorage.setItem('ticketbazaar-consent-date', new Date().toISOString());
    setIsVisible(false);
    window.location.reload(); // Refresh to apply consent settings
  };

  const handleCustomize = () => {
    setIsVisible(false);
    showModal();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Set a temporary flag to not show again this session
    sessionStorage.setItem('cookie-banner-dismissed', 'true');
  };

  // Don't show if already accepted or dismissed this session
  if (hasAccepted || !isVisible || sessionStorage.getItem('cookie-banner-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-lg border-2 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 bg-primary/10 rounded-full">
                <Cookie className="h-4 w-4 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold">Cookie & Privacy Notice</h4>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    GDPR
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies to enhance your experience and analyze platform usage. 
                  By continuing, you agree to our use of cookies and data processing practices.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleAcceptAll}
                    className="flex-1 h-8 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCustomize}
                    className="flex-1 h-8 text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Customize
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 text-xs">
                    <Link href="/privacy-policy">
                      <Button variant="link" className="p-0 h-auto text-xs underline">
                        Privacy Policy
                      </Button>
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <Link href="/privacy-settings">
                      <Button variant="link" className="p-0 h-auto text-xs underline">
                        Manage Preferences
                      </Button>
                    </Link>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}