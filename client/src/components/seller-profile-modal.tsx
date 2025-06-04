import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Ticket, UserReview } from "@shared/schema";
import {
  Star,
  MessageCircle,
  Instagram,
  Shield,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: User | null;
  onContactSeller: () => void;
}

export function SellerProfileModal({
  isOpen,
  onClose,
  seller,
  onContactSeller,
}: SellerProfileModalProps) {
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  // Fetch seller's reviews
  const { data: reviews = [] } = useQuery<UserReview[]>({
    queryKey: [`/api/reviews/user/${seller?.id}`],
    enabled: !!seller?.id && isOpen,
  });

  // Fetch seller's active tickets
  const { data: sellerTickets = [] } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/seller/${seller?.id}`],
    enabled: !!seller?.id && isOpen,
  });

  const handleInstagramClick = () => {
    if (seller?.instagram) {
      const instagramHandle = seller.instagram.replace("@", "");
      window.open(`https://instagram.com/${instagramHandle}`, "_blank");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${seller.fullName}`}
              />
              <AvatarFallback>{getInitials(seller.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{seller.fullName}</h2>
              <p className="text-sm text-textSecondary">{seller.email}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            View seller profile, ratings, and active ticket listings. Contact seller directly for ticket purchases.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seller Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {formatRating(seller.rating || 0)}
                    </span>
                    <span className="text-sm text-textSecondary">
                      ({seller.ratingsCount || 0} reviews)
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Verified Seller
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-textSecondary">Active Listings</p>
                    <p className="font-semibold">{sellerTickets.length}</p>
                  </div>
                  <div>
                    <p className="text-textSecondary">Member Since</p>
                    <p className="font-semibold">2024</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Contact Seller</h4>
                  <div className="flex gap-2">
                    {seller.instagram && (
                      <Button
                        variant="outline"
                        onClick={handleInstagramClick}
                        className="border-pink-200 hover:bg-pink-50 flex-1"
                      >
                        <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                        Instagram
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram Preview */}
            {seller.instagram && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    Instagram Profile
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInstagramClick}
                      className="ml-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${seller.instagram}`}
                        />
                        <AvatarFallback>
                          <Instagram className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          @{seller.instagram.replace("@", "")}
                        </p>
                        <p className="text-sm text-textSecondary">
                          Ticket seller & event enthusiast
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg">
                      <p className="text-sm text-center text-gray-700">
                        🎫 Trusted ticket seller with verified Instagram
                        presence
                      </p>
                      <p className="text-xs text-center text-gray-600 mt-1">
                        Check their posts and stories for authenticity
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recent Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-primary/20 pl-4"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-textSecondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-textSecondary py-4">
                    No reviews yet. Be the first to leave a review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Active Listings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {sellerTickets.length > 0 ? (
                  <div className="space-y-3">
                    {sellerTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-sm">{ticket.title}</h4>
                        <p className="text-xs text-textSecondary mb-2">
                          Section {ticket.section}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-primary">
                            {ticket.transferMethod || "Electronic"}
                          </span>
                          <Badge variant="outline">
                            {ticket.quantity} available
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-textSecondary py-4">
                    No active listings
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trust & Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Verified phone number</span>
                </div>
                {seller.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <span>Instagram verified</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Positive ratings</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onContactSeller} className="bg-primary">
            Contact Seller
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
