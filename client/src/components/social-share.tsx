import React from "react";
import { Button } from "@/components/ui/button";
import { Event, Ticket } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CopyLinkIcon } from "@/components/ui/copy-link-icon";

interface SocialShareProps {
  event?: Event;
  ticket?: Ticket;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  fullWidth?: boolean;
}

export function SocialShare({
  event,
  ticket,
  variant = "outline",
  fullWidth = false,
}: SocialShareProps) {
  const { toast } = useToast();
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ticketbazaar.co.in";

  const getShareMessage = () => {
    if (ticket && event) {
      return `Check out this ticket for ${event.title} on Ticket Bazaar! Section: ${ticket.section}, Price: ₹${ticket.sellingPrice}`;
    } else if (event) {
      return `Check out ${event.title} on Ticket Bazaar! Event in ${event.venue} on ${new Date(event.date).toLocaleDateString()}`;
    }
    return "Check out Ticket Bazaar - India's trusted ticket reselling platform!";
  };

  const getShareUrl = () => {
    if (ticket && event) {
      return `${baseUrl}/tickets/${ticket.id}`;
    } else if (event) {
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
      await navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant={variant}
        size="icon"
        className="h-7 w-7"
        title="Copy link to clipboard"
        onClick={copyToClipboard}
      >
        <CopyLinkIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
