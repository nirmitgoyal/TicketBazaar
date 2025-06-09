import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function ReferralNavItem() {
  const { data: creditsData } = useQuery({
    queryKey: ["/api/referrals/credits"],
    staleTime: 30000, // Cache for 30 seconds
  });

  const credits = (creditsData as any)?.credits || 0;

  return (
    <Link href="/referrals">
      <Button variant="ghost" className="flex items-center gap-2 relative">
        <Gift className="h-4 w-4" />
        <span className="hidden md:inline">Referrals</span>
        {credits > 0 && (
          <Badge variant="secondary" className="ml-1 px-1 text-xs">
            ₹{credits}
          </Badge>
        )}
      </Button>
    </Link>
  );
}

export function ReferralQuickStats() {
  const { data: statsData } = useQuery({
    queryKey: ["/api/referrals/stats"],
    staleTime: 60000, // Cache for 1 minute
  });

  const stats = (statsData as any)?.stats;

  if (!stats || stats.totalReferrals === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{stats.totalReferrals} referred</span>
      </div>
      <div className="flex items-center gap-1">
        <Gift className="h-3 w-3" />
        <span>₹{stats.totalEarnings} earned</span>
      </div>
    </div>
  );
}