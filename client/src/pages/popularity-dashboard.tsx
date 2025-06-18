import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Calendar,
  BarChart3,
  RefreshCw,
  Crown,
  Flame
} from "lucide-react";
import { PopularityMetrics } from "@/components/popularity-metrics";
import { TicketCard } from "@/components/ticket-card";
import { SEOManager } from "@/components/helmet-manager";
import { 
  usePopularTickets, 
  useTrendingTickets, 
  usePopularityAnalytics,
  useRefreshPopularity 
} from "@/hooks/use-popularity-tracking";
import { Ticket } from "@shared/schema";

export function PopularityDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Get search parameters from URL to maintain search context
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q") || "";
  const locationFilter = urlParams.get("location") || "";
  const categoryFilter = urlParams.get("category") || "";

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = usePopularityAnalytics();
  const { data: popularTickets, isLoading: popularLoading } = usePopularTickets(15);
  const { data: trendingTickets, isLoading: trendingLoading } = useTrendingTickets(15);
  const refreshMutation = useRefreshPopularity();
  
  // Filter tickets based on search parameters
  const filteredPopularTickets = (popularTickets as any)?.data?.filter((ticket: Ticket) => {
    if (searchQuery && !ticket.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !ticket.venue?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.city?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (locationFilter && !ticket.city?.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter && categoryFilter !== "all" && ticket.category !== categoryFilter) {
      return false;
    }
    return true;
  }) || [];

  const filteredTrendingTickets = (trendingTickets as any)?.data?.filter((ticket: Ticket) => {
    if (searchQuery && !ticket.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !ticket.venue?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.city?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (locationFilter && !ticket.city?.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter && categoryFilter !== "all" && ticket.category !== categoryFilter) {
      return false;
    }
    return true;
  }) || [];

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEOManager 
        title="Popularity Dashboard | Ticket Bazaar"
        description="Discover the most popular and trending tickets based on real-time view analytics and user engagement metrics."
        keywords="popular tickets, trending events, ticket analytics, most viewed tickets"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Popularity Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time analytics of the most popular and trending tickets
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Most Popular
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Trending Now
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Summary */}
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber((analytics as any)?.data?.summary?.totalViews || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all tickets
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber((analytics as any)?.data?.summary?.totalUniqueViews || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Individual users
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(((analytics as any)?.data?.summary?.averageEngagement || 0) * 100).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unique vs total views
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Tickets Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Top Popular Tickets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {((analytics as any)?.data?.popular || []).slice(0, 5).map((ticket: any, index: number) => (
                          <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <div>
                                <p className="font-medium text-sm truncate max-w-[200px]">
                                  {ticket.eventTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {ticket.venue}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">
                                {ticket.popularity?.totalViews || 0} views
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.popularity?.uniqueViews || 0} unique
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Trending Tickets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {((analytics as any)?.data?.trending || []).slice(0, 5).map((ticket: any, index: number) => (
                          <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <div>
                                <p className="font-medium text-sm truncate max-w-[200px]">
                                  {ticket.eventTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {ticket.venue}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">
                                {ticket.popularity?.viewsToday || 0} today
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Trending: {ticket.popularity?.trendingFactor?.toFixed(1) || 0}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Most Popular Tickets</h2>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Ranked by total views
              </Badge>
            </div>
            
            {popularLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPopularTickets.map((ticket: Ticket & { popularity?: any }, index: number) => (
                  <div key={ticket.id} className="relative">
                    <Badge className="absolute top-2 left-2 z-10 bg-yellow-500 hover:bg-yellow-600">
                      #{index + 1}
                    </Badge>
                    <TicketCard ticket={ticket} index={index} />
                    {ticket.popularity && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <span className="font-medium">{ticket.popularity.totalViews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unique:</span>
                          <span className="font-medium">{ticket.popularity.uniqueViews}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Trending Tickets</h2>
              <Badge variant="destructive" className="flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Hot right now
              </Badge>
            </div>
            
            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {((trendingTickets as any)?.data || []).map((ticket: Ticket & { popularity?: any }, index: number) => (
                  <div key={ticket.id} className="relative">
                    <Badge className="absolute top-2 left-2 z-10 bg-orange-500 hover:bg-orange-600">
                      🔥 #{index + 1}
                    </Badge>
                    <TicketCard ticket={ticket} index={index} />
                    {ticket.popularity && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Today:</span>
                          <span className="font-medium">{ticket.popularity.viewsToday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trending:</span>
                          <span className="font-medium">{ticket.popularity.trendingFactor?.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}