import React from "react";
import { Button } from "@/components/ui/button";
import { Ticket } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CopyLinkIcon } from "@/components/ui/copy-link-icon";
import { MessageCircle, Share2 } from "lucide-react";

interface SocialShareProps {
  ticket?: Ticket;
  event?: any;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  fullWidth?: boolean;
  showWhatsApp?: boolean;
  showCopy?: boolean;
}

export function SocialShare({
  ticket,
  event,
  variant = "outline",
  fullWidth = false,
  showWhatsApp = true,
  showCopy = true,
}: SocialShareProps) {
  const { toast } = useToast();
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ticketbazaar.co.in";

  const getShareMessage = () => {
    if (ticket) {
      const eventDate = new Date(ticket.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `🎫 *${ticket.eventTitle}*\n📅 ${eventDate}\n📍 ${ticket.venue}, ${ticket.city}\n🎭 Section: ${ticket.section}${ticket.row ? `, Row: ${ticket.row}` : ''}${ticket.seat ? `, Seat: ${ticket.seat}` : ''}\n\nAvailable for transfer on Ticket Bazaar - India's trusted ticket marketplace!`;
    }
    if (event) {
      const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `🎫 *${event.eventTitle}*\n📅 ${eventDate}\n📍 ${event.venue}, ${event.city}\n\nCheck out tickets on Ticket Bazaar - India's trusted ticket marketplace!`;
    }
    return "🎫 Check out Ticket Bazaar - India's trusted ticket reselling platform! Find tickets for concerts, sports, theater and more!";
  };

  const getShareUrl = () => {
    if (ticket) {
      return `${baseUrl}/tickets/${ticket.id}`;
    }
    if (event) {
      return `${baseUrl}/events/${event.id}`;
    }
    return baseUrl;
  };

  const shareMessage = getShareMessage();
  const shareUrl = getShareUrl();
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(shareUrl);

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to copy: ", err);
      }
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = () => {
    const whatsappMessage = `${shareMessage}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, try to open WhatsApp app first
      window.location.href = `whatsapp://send?text=${encodeURIComponent(whatsappMessage)}`;
      // Fallback to web version after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 500);
    } else {
      // On desktop, open WhatsApp Web
      window.open(whatsappUrl, "_blank", "width=800,height=600");
    }
  };

  

  return (
    <div className="flex gap-1">
      {showWhatsApp && (
        <Button
          variant={variant}
          size="icon"
          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Share on WhatsApp"
          onClick={shareOnWhatsApp}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      )}
      
      {showCopy && (
        <Button
          variant={variant}
          size="icon"
          className="h-7 w-7"
          title="Copy link to clipboard"
          onClick={copyToClipboard}
        >
          <CopyLinkIcon className="h-3.5 w-3.5" />
        </Button>
      )}
      
      
    </div>
  );
}
