import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FraudConfidenceIndicatorProps {
  ticket: {
    id: number;
    eventTitle: string;
    venue: string;
    eventDate: Date | string;
    city: string;
    category: string;
    sellerId: number;
  };
  className?: string;
}

interface FraudCheckResult {
  confidence: number;
  isLegitimate: boolean;
  reasons: string[];
}

export function FraudConfidenceIndicator({ ticket, className }: FraudConfidenceIndicatorProps) {
  const [fraudData, setFraudData] = useState<FraudCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFraud = async () => {
      try {
        const response = await fetch("/api/fraud-detection/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventTitle: ticket.eventTitle,
            venue: ticket.venue,
            eventDate: ticket.eventDate,
            city: ticket.city,
            category: ticket.category,
            sellerId: ticket.sellerId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFraudData(data);
        }
      } catch (error) {
        console.error("Failed to check fraud:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFraud();
  }, [ticket]);

  if (isLoading || !fraudData) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return ShieldCheck;
    if (confidence >= 60) return ShieldAlert;
    return ShieldX;
  };

  const Icon = getConfidenceIcon(fraudData.confidence);

  return (
    <div
      className={cn(
        "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        getConfidenceColor(fraudData.confidence),
        className
      )}
      title={fraudData.reasons.join(", ")}
    >
      <Icon className="w-3 h-3" />
      <span>{fraudData.confidence}%</span>
    </div>
  );
}