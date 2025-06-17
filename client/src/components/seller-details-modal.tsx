import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Phone, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Star,
  ExternalLink,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Ticket } from "@shared/schema";

interface SellerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
}

interface SellerData {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  rating: number;
  ratingsCount: number;
  preferredContactMethod: string;
  country: string;
  verificationStatus: string;
  governmentIdVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export function SellerDetailsModal({ isOpen, onClose, ticket }: SellerDetailsModalProps) {
  const { data: seller, isLoading, error } = useQuery<SellerData>({
    queryKey: [`/api/users/${ticket.sellerId}`],
    enabled: isOpen && !!ticket.sellerId,
  });

  if (!isOpen) return null;

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">
          <ShieldX className="h-3 w-3 mr-1" />
          Unverified
        </Badge>;
    }
  };

  const formatInstagramHandle = (handle?: string) => {
    if (!handle) return null;
    // Remove @ if present and ensure it's a valid handle
    const cleanHandle = handle.replace(/^@/, '');
    return cleanHandle;
  };

  const getInstagramUrl = (handle?: string) => {
    const cleanHandle = formatInstagramHandle(handle);
    return cleanHandle ? `https://instagram.com/${cleanHandle}` : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Seller Information
          </DialogTitle>
          <DialogDescription>
            View detailed information about the ticket seller, including verification status and contact details.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : seller ? (
          <div className="space-y-6">
            {/* Seller Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {seller.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{seller.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {seller.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{seller.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">
                            ({seller.ratingsCount} review{seller.ratingsCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">Verification Status:</span>
                  {getVerificationBadge(seller.verificationStatus)}
                </div>
              </CardContent>
            </Card>

            {/* Verification Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Email Verified</span>
                  </div>
                  {getVerificationIcon(seller.emailVerified)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Phone Verified</span>
                  </div>
                  {getVerificationIcon(seller.phoneVerified)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Government ID Verified</span>
                  </div>
                  {getVerificationIcon(seller.governmentIdVerified)}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{seller.email}</span>
                </div>
                
                {seller.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{seller.phone}</span>
                  </div>
                )}
                
                {seller.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{seller.whatsapp}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Preferred contact: {seller.preferredContactMethod}
                </div>
              </CardContent>
            </Card>

            {/* Instagram Profile */}
            {seller.instagram && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    Instagram Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">@{formatInstagramHandle(seller.instagram)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = getInstagramUrl(seller.instagram);
                        if (url) window.open(url, '_blank');
                      }}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle>About This Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Event:</span> {ticket.eventTitle}
                </div>

                <div className="text-sm">
                  <span className="font-medium">Transfer Method:</span> {ticket.transferMethod}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Quantity:</span> {ticket.quantity}
                </div>
                {ticket.section && (
                  <div className="text-sm">
                    <span className="font-medium">Section:</span> {ticket.section}
                    {ticket.row && `, Row ${ticket.row}`}
                    {ticket.seat && `, Seat ${ticket.seat}`}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Contact Seller
              </Button>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Failed to load seller information</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Seller information not available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}