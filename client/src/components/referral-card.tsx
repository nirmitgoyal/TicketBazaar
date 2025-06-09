import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReferralCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: creditsData } = useQuery({
    queryKey: ["/api/referrals/credits"],
    staleTime: 30000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/referrals/stats"],
    staleTime: 60000,
  });

  const { data: referralData } = useQuery({
    queryKey: ["/api/referrals/my-code"],
    staleTime: 300000, // 5 minutes
  });

  const credits = (creditsData as any)?.credits || 0;
  const stats = (statsData as any)?.stats;
  const referralCode = (referralData as any)?.referralCode;

  const copyReferralCode = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Earn credits by inviting friends to join TicketSwap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">₹{credits}</div>
            <div className="text-sm text-green-700">Available Credits</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-sm text-blue-700">Friends Referred</div>
          </div>
        </div>

        {referralCode && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Your Referral Code</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {referralCode}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyReferralCode}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <Link href="/referrals">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Referral Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>How it works:</strong> Share your code with friends. You earn ₹50 
          when they make their first purchase, and they get ₹25 welcome bonus.
        </div>
      </CardContent>
    </Card>
  );
}