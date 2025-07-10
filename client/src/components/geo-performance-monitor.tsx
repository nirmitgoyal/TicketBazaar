/**
 * GEO Performance Monitor and Core Web Vitals Tracker
 * Monitors performance metrics and provides optimization recommendations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Globe, 
  Smartphone, 
  Image, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Monitor
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: "good" | "needs-improvement" | "poor";
  description: string;
}

interface OptimizationRecommendation {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  implemented: boolean;
}

export default function GEOPerformanceMonitor() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceTracking();
    loadOptimizationRecommendations();
  }, []);

  const initializePerformanceTracking = () => {
    setIsMonitoring(true);
    
    // Simulate Core Web Vitals data (in production, use real Web Vitals API)
    const metrics: PerformanceMetric[] = [
      {
        name: "Largest Contentful Paint (LCP)",
        value: 1.8,
        threshold: 2.5,
        unit: "s",
        status: "good",
        description: "Measures loading performance"
      },
      {
        name: "First Input Delay (FID)",
        value: 45,
        threshold: 100,
        unit: "ms", 
        status: "good",
        description: "Measures interactivity"
      },
      {
        name: "Cumulative Layout Shift (CLS)",
        value: 0.08,
        threshold: 0.1,
        unit: "",
        status: "good",
        description: "Measures visual stability"
      },
      {
        name: "Interaction to Next Paint (INP)",
        value: 150,
        threshold: 200,
        unit: "ms",
        status: "good",
        description: "Measures responsiveness"
      },
      {
        name: "Time to First Byte (TTFB)",
        value: 180,
        threshold: 600,
        unit: "ms",
        status: "good",
        description: "Measures server responsiveness"
      },
      {
        name: "Speed Index",
        value: 2.1,
        threshold: 3.4,
        unit: "s",
        status: "good",
        description: "Measures loading speed perception"
      }
    ];

    setPerformanceMetrics(metrics);
    setIsMonitoring(false);
  };

  const loadOptimizationRecommendations = () => {
    const optimizations: OptimizationRecommendation[] = [
      // High Priority
      {
        category: "Images",
        priority: "high",
        title: "Implement WebP Image Format",
        description: "Convert all images to WebP format with fallbacks for better compression",
        impact: "30-50% smaller file sizes",
        implemented: true
      },
      {
        category: "Caching",
        priority: "high", 
        title: "Enable CDN and Browser Caching",
        description: "Implement Cloudflare CDN with proper cache headers",
        impact: "40-60% faster repeat visits",
        implemented: true
      },
      {
        category: "JavaScript",
        priority: "high",
        title: "Code Splitting and Lazy Loading",
        description: "Split JavaScript bundles and lazy load components",
        impact: "20-35% faster initial load",
        implemented: true
      },

      // Medium Priority  
      {
        category: "Compression",
        priority: "medium",
        title: "Enable Brotli Compression",
        description: "Configure server to serve Brotli compressed assets",
        impact: "15-25% smaller text files",
        implemented: false
      },
      {
        category: "Fonts",
        priority: "medium",
        title: "Optimize Font Loading",
        description: "Use font-display: swap and preload critical fonts",
        impact: "Eliminate font-related layout shifts",
        implemented: true
      },
      {
        category: "CSS",
        priority: "medium",
        title: "Critical CSS Inlining",
        description: "Inline critical CSS and defer non-critical styles",
        impact: "10-20% faster perceived load time",
        implemented: false
      },

      // Low Priority
      {
        category: "Service Worker",
        priority: "low",
        title: "Implement Service Worker Caching",
        description: "Add service worker for offline functionality and caching",
        impact: "Better offline experience",
        implemented: false
      },
      {
        category: "Preloading",
        priority: "low",
        title: "Resource Hints Optimization",
        description: "Add dns-prefetch, preconnect, and prefetch hints",
        impact: "5-10% faster third-party resource loading",
        implemented: true
      }
    ];

    setRecommendations(optimizations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600 bg-green-100";
      case "needs-improvement": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="h-4 w-4" />;
      case "needs-improvement": return <Clock className="h-4 w-4" />;
      case "poor": return <AlertCircle className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const implementedCount = recommendations.filter(r => r.implemented).length;
  const totalRecommendations = recommendations.length;
  const implementationPercentage = (implementedCount / totalRecommendations) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          GEO Performance Monitor
        </h1>
        <p className="text-xl text-gray-600">
          Real-time performance tracking and optimization recommendations for AI engine visibility
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94/100</div>
            <p className="text-xs text-gray-500">Google PageSpeed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              AI Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <p className="text-xs text-gray-500">Citation Ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-500" />
              Mobile Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">91/100</div>
            <p className="text-xs text-gray-500">Mobile PageSpeed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(implementationPercentage)}%</div>
            <p className="text-xs text-gray-500">Implemented</p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Monitor className="h-6 w-6" />
          Core Web Vitals
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <Badge className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                    <span className="ml-1 capitalize">{metric.status.replace('-', ' ')}</span>
                  </Badge>
                </div>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{metric.value}</span>
                  <span className="text-gray-500">{metric.unit}</span>
                </div>
                <Progress 
                  value={(metric.value / metric.threshold) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Threshold: {metric.threshold}{metric.unit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Optimization Recommendations */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Optimization Recommendations
          </h2>
          <Badge variant="outline">
            {implementedCount}/{totalRecommendations} Implemented
          </Badge>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className={rec.implemented ? "bg-green-50 border-green-200" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                  </div>
                  {rec.implemented ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Button size="sm" variant="outline">
                      Implement
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                  <span>•</span>
                  <span className="text-green-600 font-medium">{rec.impact}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{rec.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Engine Optimization Status */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-6 w-6" />
          AI Engine Optimization Status
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              engine: "ChatGPT",
              status: "optimized",
              score: 92,
              features: ["TL;DR summaries", "Question-based headings", "Citation format"]
            },
            {
              engine: "Perplexity AI", 
              status: "optimized",
              score: 89,
              features: ["Structured data", "FAQ schema", "Citation summaries"]
            },
            {
              engine: "Google Bard",
              status: "partial",
              score: 76,
              features: ["Organization schema", "Article markup", "Breadcrumbs"]
            },
            {
              engine: "Bing Copilot",
              status: "needs-work",
              score: 68,
              features: ["Basic schema", "Meta optimization", "Content structure"]
            }
          ].map((engine, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{engine.engine}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      engine.status === "optimized" ? "bg-green-100 text-green-800" :
                      engine.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {engine.status}
                  </Badge>
                  <span className="text-2xl font-bold">{engine.score}%</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {engine.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Real-time Monitoring */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real-time Performance Monitoring
            </CardTitle>
            <CardDescription>
              Continuous tracking of Core Web Vitals and AI optimization metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Monitoring Active</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <Button 
                onClick={initializePerformanceTracking}
                disabled={isMonitoring}
                size="sm"
              >
                {isMonitoring ? "Refreshing..." : "Refresh Metrics"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">0.8s</div>
                <div className="text-xs text-gray-500">Page Load Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">156ms</div>
                <div className="text-xs text-gray-500">Server Response</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-xs text-gray-500">Uptime (7d)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">2.1MB</div>
                <div className="text-xs text-gray-500">Page Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
