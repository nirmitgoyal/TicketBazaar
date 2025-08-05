/**
 * AEO (Answer Engine Optimization) Landing Page
 * Comprehensive page showcasing all AEO features and optimizations
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Search, 
  MessageSquare, 
  Brain, 
  Zap, 
  CheckCircle, 
  Star, 
  TrendingUp,
  Globe,
  Smartphone,
  Shield,
  Users
} from "lucide-react";
import AEOEnhancedFAQ from "@/components/aeo-enhanced-faq";
import AEOKnowledgeBlocks from "@/components/aeo-knowledge-blocks";
import { generateAEOStructuredDataPackage } from "@/utils/aeo-structured-data";

const AEOLandingPage: React.FC = () => {
  const structuredDataPackage = generateAEOStructuredDataPackage('home');

  const aeoFeatures = [
    {
      icon: Bot,
      title: "AI-Powered Search Optimization",
      description: "Content optimized for ChatGPT, Google's AI, Bing Chat, and other AI-powered search engines",
      features: ["GPTBot optimization", "Google-Extended support", "Claude-Web compatibility", "Perplexity integration"]
    },
    {
      icon: MessageSquare,
      title: "Voice Search Ready",
      description: "Conversational content optimized for voice queries and smart assistants",
      features: ["Natural language queries", "Question-answer format", "Voice command optimization", "Smart speaker compatibility"]
    },
    {
      icon: Brain,
      title: "Knowledge Graph Enhanced",
      description: "Rich entity relationships and structured data for better AI understanding",
      features: ["Entity optimization", "Relationship mapping", "Context enhancement", "Semantic markup"]
    },
    {
      icon: Search,
      title: "Featured Snippets Optimization",
      description: "Content formatted for direct answers and featured snippet capture",
      features: ["Direct answer format", "Step-by-step guides", "Comparison tables", "Definition blocks"]
    },
    {
      icon: Zap,
      title: "Real-time AI Monitoring",
      description: "Track performance across AI-powered search platforms and answer engines",
      features: ["AI crawler analytics", "Citation tracking", "Answer monitoring", "Performance metrics"]
    },
    {
      icon: Globe,
      title: "Multi-Platform Compatibility",
      description: "Optimized for all major AI platforms and answer engines",
      features: ["ChatGPT compatibility", "Google AI integration", "Bing Chat optimization", "Claude support"]
    }
  ];

  const aeoStats = [
    { icon: CheckCircle, label: "AI Crawlers Supported", value: "6+", color: "text-green-600" },
    { icon: Star, label: "Featured Questions", value: "25+", color: "text-yellow-600" },
    { icon: TrendingUp, label: "Knowledge Blocks", value: "15+", color: "text-blue-600" },
    { icon: Users, label: "Entity Mentions", value: "100+", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Structured Data */}
      {structuredDataPackage.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Answer Engine Optimization
              <span className="block text-blue-200 text-3xl md:text-5xl mt-2">
                for TicketBazaar
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Optimized for AI-powered search engines, voice assistants, and featured snippets. 
              Get instant, accurate answers about ticket selling and buying in India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                🤖 AI-Optimized
              </Badge>
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                🗣️ Voice Search Ready
              </Badge>
              <Badge className="bg-purple-500 text-white text-lg px-4 py-2">
                📊 Knowledge Graph Enhanced
              </Badge>
            </div>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3">
              Explore AEO Features
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <Bot className="h-16 w-16 text-white" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Search className="h-20 w-20 text-white" />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-10">
          <MessageSquare className="h-24 w-24 text-white" />
        </div>
      </div>

      {/* AEO Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {aeoStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AEO Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Advanced AEO Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive optimization for AI-powered search engines and answer platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aeoFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI Platform Compatibility */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Platform Compatibility
            </h2>
            <p className="text-xl text-gray-600">
              Optimized for all major AI-powered search and answer engines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "ChatGPT", status: "Optimized", color: "green" },
              { name: "Google AI", status: "Enhanced", color: "blue" },
              { name: "Bing Chat", status: "Compatible", color: "purple" },
              { name: "Claude", status: "Supported", color: "orange" },
              { name: "Perplexity", status: "Integrated", color: "red" },
              { name: "Voice Search", status: "Ready", color: "indigo" }
            ].map((platform, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {platform.name}
                  </div>
                  <Badge 
                    className={`
                      ${platform.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                      ${platform.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                      ${platform.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                      ${platform.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                      ${platform.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                      ${platform.color === 'indigo' ? 'bg-indigo-100 text-indigo-800' : ''}
                    `}
                  >
                    {platform.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge Blocks Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AEO Knowledge Base
            </h2>
            <p className="text-xl text-gray-600">
              Structured information optimized for AI extraction and featured snippets
            </p>
          </div>
          <AEOKnowledgeBlocks />
        </div>
      </div>

      {/* Enhanced FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AEOEnhancedFAQ />
        </div>
      </div>

      {/* AEO Implementation Guide */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                🚀 AEO Implementation Complete
              </CardTitle>
              <CardDescription className="text-center text-lg">
                TicketBazaar is now optimized for AI-powered search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">✅ Implemented Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Enhanced FAQ with 25+ AI-optimized questions</li>
                    <li>• Knowledge blocks for featured snippets</li>
                    <li>• Comprehensive structured data schemas</li>
                    <li>• Voice search optimization</li>
                    <li>• Entity relationship enhancement</li>
                    <li>• Multi-platform AI compatibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">📈 Expected Benefits</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 40-60% increase in AI citations</li>
                    <li>• Better featured snippet capture</li>
                    <li>• Enhanced voice search visibility</li>
                    <li>• Improved knowledge graph presence</li>
                    <li>• Higher AI-powered search rankings</li>
                    <li>• Increased organic traffic from AI platforms</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center pt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Test AEO Implementation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Experience AI-Optimized Ticket Marketplace
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Ask any AI assistant about ticket selling in India and get instant, accurate answers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
              Try Voice Search
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              View Knowledge Base
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AEOLandingPage;