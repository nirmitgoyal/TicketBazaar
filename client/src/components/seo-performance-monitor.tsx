/**
 * SEO Performance Monitor Component
 * Tracks and reports on SEO metrics and ranking performance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

interface SEOMetrics {
  seoScore: number;
  metaTagsComplete: boolean;
  structuredDataValid: boolean;
  sitemapStatus: boolean;
  robotsTxtValid: boolean;
  pageSpeedScore: number;
  keywordDensity: { [key: string]: number };
  aiCrawlerSupport: string[];
  lastUpdated: string;
}

interface SearchRankings {
  keyword: string;
  position: number;
  previousPosition: number;
  trend: 'up' | 'down' | 'stable';
}

export default function SEOPerformanceMonitor() {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [rankings, setRankings] = useState<SearchRankings[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Target keywords for TicketBazaar
  const targetKeywords = [
    'sell tickets online india',
    'ticket resale marketplace',
    'how to sell concert tickets',
    'second hand tickets',
    'buy tickets online india',
    'concert tickets online',
    'ticketbazaar',
    'ticket bazaar',
    'where to sell tickets',
    'resell tickets safely'
  ];

  // AI Crawlers we support
  const aiCrawlers = [
    'GPTBot',
    'Google-Extended', 
    'ChatGPT-User',
    'CCBot',
    'anthropic-ai',
    'Claude-Web'
  ];

  useEffect(() => {
    loadSEOMetrics();
  }, []);

  const loadSEOMetrics = async () => {
    setLoading(true);
    
    // Simulate loading SEO metrics
    // In production, this would call actual SEO APIs
    setTimeout(() => {
      const mockMetrics: SEOMetrics = {
        seoScore: 95,
        metaTagsComplete: true,
        structuredDataValid: true,
        sitemapStatus: true,
        robotsTxtValid: true,
        pageSpeedScore: 89,
        keywordDensity: {
          'sell tickets online': 2.3,
          'ticket marketplace': 1.8,
          'concert tickets': 2.1,
          'second hand tickets': 1.5,
          'ticketbazaar': 3.2
        },
        aiCrawlerSupport: aiCrawlers,
        lastUpdated: new Date().toISOString()
      };

      const mockRankings: SearchRankings[] = [
        { keyword: 'sell tickets online india', position: 3, previousPosition: 5, trend: 'up' },
        { keyword: 'ticket resale marketplace', position: 1, previousPosition: 2, trend: 'up' },
        { keyword: 'how to sell concert tickets', position: 2, previousPosition: 1, trend: 'down' },
        { keyword: 'second hand tickets', position: 4, previousPosition: 4, trend: 'stable' },
        { keyword: 'ticketbazaar', position: 1, previousPosition: 1, trend: 'stable' },
        { keyword: 'concert tickets online', position: 6, previousPosition: 8, trend: 'up' },
        { keyword: 'where to sell tickets', position: 2, previousPosition: 3, trend: 'up' }
      ];

      setMetrics(mockMetrics);
      setRankings(mockRankings);
      setLoading(false);
      setLastRefresh(new Date());
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500 transform rotate-90" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading SEO metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load SEO Metrics</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <Button onClick={loadSEOMetrics}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO Performance Monitor</h1>
          <p className="text-gray-600">Track TicketBazaar's search ranking performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={loadSEOMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.seoScore}%</div>
            <Progress value={metrics.seoScore} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">Excellent optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Speed</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageSpeedScore}</div>
            <Progress value={metrics.pageSpeedScore} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">Core Web Vitals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Crawlers</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.aiCrawlerSupport.length}</div>
            <p className="text-xs text-gray-600 mt-1">Supported platforms</p>
            <div className="flex gap-1 mt-2">
              {metrics.aiCrawlerSupport.slice(0, 3).map((crawler) => (
                <Badge key={crawler} variant="outline" className="text-xs">
                  {crawler}
                </Badge>
              ))}
              {metrics.aiCrawlerSupport.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{metrics.aiCrawlerSupport.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keywords</CardTitle>
            <Search className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(metrics.keywordDensity).length}</div>
            <p className="text-xs text-gray-600 mt-1">Tracked keywords</p>
            <div className="mt-2">
              <div className="text-xs text-gray-600">Top: ticketbazaar (3.2%)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="rankings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rankings">Search Rankings</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="ai">AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Rankings</CardTitle>
              <CardDescription>Current positions for target keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((ranking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{ranking.keyword}</div>
                      <div className="text-sm text-gray-600">Position {ranking.position}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(ranking.trend)}
                      <span className={`text-sm ${getTrendColor(ranking.trend)}`}>
                        {ranking.trend === 'stable' ? 'No change' : 
                         ranking.trend === 'up' ? `+${ranking.previousPosition - ranking.position}` :
                         `-${ranking.position - ranking.previousPosition}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Status</CardTitle>
              <CardDescription>Core technical SEO implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Meta Tags Complete</span>
                  <Badge variant={metrics.metaTagsComplete ? "default" : "destructive"}>
                    {metrics.metaTagsComplete ? "Complete" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Structured Data Valid</span>
                  <Badge variant={metrics.structuredDataValid ? "default" : "destructive"}>
                    {metrics.structuredDataValid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sitemap Status</span>
                  <Badge variant={metrics.sitemapStatus ? "default" : "destructive"}>
                    {metrics.sitemapStatus ? "Active" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Robots.txt Valid</span>
                  <Badge variant={metrics.robotsTxtValid ? "default" : "destructive"}>
                    {metrics.robotsTxtValid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Density Analysis</CardTitle>
              <CardDescription>Target keyword optimization levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.keywordDensity).map(([keyword, density]) => (
                  <div key={keyword} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{keyword}</span>
                      <span className="text-sm text-gray-600">{density}%</span>
                    </div>
                    <Progress value={density * 20} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI/LLM Optimization</CardTitle>
              <CardDescription>Generative Engine Optimization status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Supported AI Crawlers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {metrics.aiCrawlerSupport.map((crawler) => (
                      <Badge key={crawler} variant="outline" className="justify-center">
                        {crawler}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AI Optimization Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">llms.txt file present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Citation-optimized content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Question-based headings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Structured FAQ content</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}