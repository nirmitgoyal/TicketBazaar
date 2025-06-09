import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Share2, Copy, Gift, Users, TrendingUp, Coins, CheckCircle, Clock, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SEOOptimizedPage from "@/components/seo-optimized-page";
import { cn } from "@/lib/utils";

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  rewardedReferrals: number;
  totalEarnings: number;
}

interface Referral {
  id: number;
  refereeId: number;
  status: string;
  referralCode: string;
  createdAt: string;
  completedAt?: string;
  rewardedAt?: string;
}

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shareUrl, setShareUrl] = useState("");

  // Fetch referral code
  const { data: referralData, isLoading: loadingCode } = useQuery({
    queryKey: ["/api/referrals/my-code"],
  });

  // Fetch referral stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/referrals/stats"],
  });

  // Fetch credit balance
  const { data: creditsData, isLoading: loadingCredits } = useQuery({
    queryKey: ["/api/referrals/credits"],
  });

  // Fetch credit transactions
  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/referrals/credits/history"],
  });

  const referralCode = (referralData as any)?.referralCode;
  const stats: ReferralStats = (statsData as any)?.stats || {
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    rewardedReferrals: 0,
    totalEarnings: 0,
  };
  const referrals: Referral[] = (statsData as any)?.referrals || [];
  const credits = (creditsData as any)?.credits || 0;
  const transactions: CreditTransaction[] = (transactionsData as any)?.transactions || [];

  // Generate share URL when referral code is available
  useState(() => {
    if (referralCode) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/register?ref=${referralCode}`);
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join TicketSwap with my referral code ${referralCode} and get ₹25 bonus credits! ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareViaInstagram = () => {
    const message = `Join TicketSwap with my referral code ${referralCode} and get ₹25 bonus credits!`;
    toast({
      title: "Share on Instagram",
      description: "Copy this message and share it as a story or post",
    });
    copyToClipboard(message);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rewarded: { variant: "default" as const, icon: Award, color: "text-blue-600" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={cn("h-3 w-3", config.color)} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+₹${amount}` : `-₹${Math.abs(amount)}`;
  };

  if (loadingCode || loadingStats || loadingCredits) {
    return (
      <SEOOptimizedPage
        title="Referral Program - Loading"
        description="Loading referral program data..."
      >
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </SEOOptimizedPage>
    );
  }

  return (
    <SEOOptimizedPage
      title="Referral Program - Earn Credits"
      description="Refer friends to TicketSwap and earn credits. Get ₹50 for each successful referral and help your friends get ₹25 bonus credits."
      keywords="referral program, earn credits, ticket discounts, refer friends, bonus credits"
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Invite friends to join TicketSwap and earn credits for every successful referral. 
            You get ₹50, they get ₹25 - everyone wins!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{credits}</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Friends invited</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rewardedReferrals}</div>
              <p className="text-xs text-muted-foreground">Completed & rewarded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">From referrals</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share & Earn</TabsTrigger>
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="credits">Credits History</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Referral Code
                </CardTitle>
                <CardDescription>
                  Share this code with friends to earn ₹50 for each successful referral
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={referralCode || ""}
                    readOnly
                    className="font-mono text-lg text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(referralCode || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Share your referral link:</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={shareViaWhatsApp} className="flex-1">
                      Share on WhatsApp
                    </Button>
                    <Button variant="outline" onClick={shareViaInstagram} className="flex-1">
                      Share on Instagram
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-blue-900">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your referral code with friends</li>
                    <li>• They sign up using your code and get ₹25 bonus credits</li>
                    <li>• When they make their first ticket purchase, you earn ₹50 credits</li>
                    <li>• Use credits to get discounts on future ticket purchases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Referral Activity</CardTitle>
                <CardDescription>Track your referrals and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals yet. Start sharing your code to earn credits!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">Referral #{referral.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined on {formatDate(referral.createdAt)}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {getStatusBadge(referral.status)}
                          {referral.status === "rewarded" && (
                            <div className="text-sm text-green-600 font-medium">+₹50</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Credits Transaction History</CardTitle>
                <CardDescription>View all your credit earnings and usage</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet. Start referring friends to earn credits!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </div>
                        <div className={cn(
                          "font-bold",
                          transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatAmount(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SEOOptimizedPage>
  );
}