import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Ticket } from "@shared/schema";
import {
  Phone,
  MessageCircle,
  Mail,
  Star,
  Shield,
  Instagram,
  User as UserIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SellerProfileModal } from "./seller-profile-modal";
import { handleInstagramLink, logInstagramWebViewInfo, isInstagramWebView } from "@/utils/instagram-webview";

interface SellerContactCardProps {
  seller: User;
  ticket: Ticket;
  isAuthenticated: boolean;
  onContactSeller: () => void;
}

export function SellerContactCard({
  seller,
  ticket,
  isAuthenticated,
  onContactSeller,
}: SellerContactCardProps) {
  const [showFullContact, setShowFullContact] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Log Instagram WebView info on mount for debugging
  useEffect(() => {
    if (isInstagramWebView()) {
      logInstagramWebViewInfo();
    }
  }, []);

  const formatPhoneNumber = (phone: string) => {
    // Format Indian phone numbers nicely
    if (phone.startsWith("+91")) {
      return phone.replace("+91", "+91 ");
    }
    return phone;
  };

  const handlePhoneClick = () => {
    if (seller.phone) {
      window.open(`tel:${seller.phone}`, "_blank");
    }
  };

  const handleEmailClick = () => {
    if (seller.email) {
      const subject = encodeURIComponent(
        `Interested in your tickets: ${ticket.title}`,
      );
      const body = encodeURIComponent(
        `Hi ${seller.fullName},\n\nI'm interested in your tickets for ${ticket.title} in section ${ticket.section}.\n\nPlease let me know if they're still available.\n\nThanks!`,
      );
      window.open(
        `mailto:${seller.email}?subject=${subject}&body=${body}`,
        "_blank",
      );
    }
  };

  const handleInstagramClick = () => {
    if (seller.instagram) {
      handleInstagramLink(seller.instagram, {
        ticket,
        onError: (error) => {
          console.error('Instagram link failed:', error);
          // Show user-friendly error message
          alert('Sorry, we had trouble opening Instagram. Please try again.');
        }
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">
                Sign in to contact seller
              </h3>
              <p className="text-textSecondary text-sm">
                Create an account or sign in to view seller contact details and
                connect directly
              </p>
            </div>
            <Button onClick={onContactSeller} className="w-full">
              Sign In to Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Contact Seller</CardTitle>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {seller.rating?.toFixed(1) || "New"}
              </span>
              {seller.ratingsCount && seller.ratingsCount > 0 && (
                <span className="text-xs text-textSecondary">
                  ({seller.ratingsCount})
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{seller.fullName}</h4>
              <p className="text-sm text-textSecondary">@{seller.instagram}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileModal(true)}
              className="text-primary hover:text-primary/80"
            >
              <UserIcon className="h-4 w-4 mr-1" />
              View Profile
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h5 className="font-medium text-sm">Contact Seller</h5>

            <div className="space-y-2">
              {seller.instagram && (
                <Button
                  variant="outline"
                  onClick={handleInstagramClick}
                  className="w-full justify-start gap-2 h-auto py-3 border-pink-200 hover:bg-pink-50"
                >
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <div className="text-left">
                    <div className="font-medium">Message on Instagram</div>
                    <div className="text-xs text-textSecondary">
                      @{seller.instagram?.replace("@", "")}
                    </div>
                  </div>
                </Button>
              )}

              {seller.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePhoneClick}
                  className="w-full justify-start gap-2 h-auto py-3"
                >
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Call</div>
                    <div className="text-xs text-textSecondary">
                      {formatPhoneNumber(seller.phone)}
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h5 className="font-medium text-sm">Transfer Information</h5>
            {ticket.transferMethod && (
              <p className="text-sm text-textSecondary">
                <strong>Method:</strong> {ticket.transferMethod}
              </p>
            )}
            {ticket.additionalInfo && (
              <p className="text-sm text-textSecondary">
                <strong>Notes:</strong> {ticket.additionalInfo}
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <h6 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
              Safety Tips
            </h6>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Meet in a public place for ticket exchange</li>
              <li>• Verify payment before transferring tickets</li>
              <li>• Use secure payment methods</li>
              <li>• Check ticket authenticity before buying</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <SellerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        seller={seller}
        onContactSeller={onContactSeller}
      />
    </>
  );
}
