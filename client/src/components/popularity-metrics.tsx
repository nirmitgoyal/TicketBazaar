import { Eye, TrendingUp, Users, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PopularityMetricsProps {
  metrics: {
    totalViews: number;
    uniqueViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    popularityScore?: number;
    trendingFactor?: number;
    lastViewedAt?: string;
  };
  compact?: boolean;
  showTrending?: boolean;
}

export function PopularityMetrics({ 
  metrics, 
  compact = false, 
  showTrending = true 
}: PopularityMetricsProps) {
  const {
    totalViews,
    uniqueViews,
    viewsToday,
    viewsThisWeek,
    viewsThisMonth,
    popularityScore = 0,
    trendingFactor = 0,
    lastViewedAt
  } = metrics;

  // Calculate engagement rate
  const engagementRate = totalViews > 0 ? (uniqueViews / totalViews) * 100 : 0;
  
  // Determine popularity level
  const getPopularityLevel = (score: number) => {
    if (score >= 100) return { level: "Hot", color: "destructive" };
    if (score >= 50) return { level: "Popular", color: "default" };
    if (score >= 20) return { level: "Rising", color: "secondary" };
    return { level: "New", color: "outline" };
  };

  const popularityLevel = getPopularityLevel(popularityScore);

  // Determine trending status
  const getTrendingStatus = (factor: number) => {
    if (factor >= 10) return { status: "Trending", color: "destructive" };
    if (factor >= 5) return { status: "Rising", color: "default" };
    return null;
  };

  const trendingStatus = getTrendingStatus(trendingFactor);

  const formatLastViewed = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{totalViews}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{totalViews} total views ({uniqueViews} unique)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showTrending && trendingStatus && (
          <Badge variant={trendingStatus.color as any} className="text-xs px-1 py-0">
            <TrendingUp className="h-2 w-2 mr-1" />
            {trendingStatus.status}
          </Badge>
        )}

        <Badge variant={popularityLevel.color as any} className="text-xs px-1 py-0">
          {popularityLevel.level}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Popularity Metrics
          {trendingStatus && (
            <Badge variant={trendingStatus.color as any} className="ml-auto">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trendingStatus.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalViews}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{uniqueViews}</div>
            <div className="text-xs text-muted-foreground">Unique Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{viewsToday}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{viewsThisWeek}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
        </div>

        {/* Engagement rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Engagement Rate
            </span>
            <span className="font-medium">{engagementRate.toFixed(1)}%</span>
          </div>
          <Progress value={engagementRate} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {uniqueViews} unique visitors out of {totalViews} total views
          </div>
        </div>

        {/* Time-based breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Recent Activity
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-medium">{viewsToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Week:</span>
              <span className="font-medium">{viewsThisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month:</span>
              <span className="font-medium">{viewsThisMonth}</span>
            </div>
          </div>
        </div>

        {/* Popularity score and last viewed */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant={popularityLevel.color as any}>
              {popularityLevel.level}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Score: {popularityScore.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatLastViewed(lastViewedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PopularityBadge({ 
  popularityScore = 0, 
  trendingFactor = 0, 
  size = "sm" 
}: { 
  popularityScore?: number; 
  trendingFactor?: number; 
  size?: "xs" | "sm" | "default" 
}) {
  const getPopularityLevel = (score: number) => {
    if (score >= 100) return { level: "Hot", color: "destructive" };
    if (score >= 50) return { level: "Popular", color: "default" };
    if (score >= 20) return { level: "Rising", color: "secondary" };
    return { level: "New", color: "outline" };
  };

  const getTrendingStatus = (factor: number) => {
    if (factor >= 10) return { status: "Trending", color: "destructive" };
    if (factor >= 5) return { status: "Rising", color: "default" };
    return null;
  };

  const popularityLevel = getPopularityLevel(popularityScore);
  const trendingStatus = getTrendingStatus(trendingFactor);

  return (
    <div className="flex items-center gap-1">
      {trendingStatus && (
        <Badge variant={trendingStatus.color as any} className={`${size === "xs" ? "text-xs px-1 py-0" : ""}`}>
          <TrendingUp className={`${size === "xs" ? "h-2 w-2" : "h-3 w-3"} mr-1`} />
          {trendingStatus.status}
        </Badge>
      )}
      <Badge variant={popularityLevel.color as any} className={`${size === "xs" ? "text-xs px-1 py-0" : ""}`}>
        {popularityLevel.level}
      </Badge>
    </div>
  );
}