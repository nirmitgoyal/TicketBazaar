import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star, 
  Target,
  Brain,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface RecommendationScore {
  overall: number;
  priceMatch: number;
  locationMatch: number;
  categoryMatch: number;
  timeMatch: number;
  trendingBonus: number;
}

interface SmartRecommendation {
  id: number;
  title: string;
  eventTitle: string;
  city: string;
  venue: string;
  eventDate: string;
  price: number;
  category: string;
  trending: boolean;
  sellingFast: boolean;
  score: RecommendationScore;
  reason: string;
  confidence: number;
  tags: string[];
}

interface UserProfile {
  preferredCategories: string[];
  preferredCities: string[];
  priceRange: [number, number];
  viewHistory: number[];
  searchHistory: string[];
}

export function RecommendationEngine() {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    preferredCategories: ['concerts', 'classical', 'sports'],
    preferredCities: ['Mumbai', 'Chennai', 'Delhi'],
    priceRange: [1000, 15000],
    viewHistory: [126, 110, 117, 100],
    searchHistory: ['music', 'concert', 'classical', 'mumbai events']
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateSmartRecommendations();
  }, [userProfile]);

  const generateSmartRecommendations = () => {
    setIsLoading(true);
    
    // Simulate ML-powered recommendation generation
    setTimeout(() => {
      const baseTickets = [
        {
          id: 126,
          title: 'MISSION: IMPOSSIBLE Tickets',
          eventTitle: 'Mission: Impossible - Dead Reckoning Part One',
          city: 'Mumbai',
          venue: 'PVR Phoenix Mumbai',
          eventDate: '2025-07-25T19:30:00Z',
          price: 850,
          category: 'movies',
          trending: true,
          sellingFast: true
        },
        {
          id: 110,
          title: 'Chennai Music Season Opening Concert',
          eventTitle: 'Carnatic Music Concert - L. Subramaniam',
          city: 'Chennai',
          venue: 'Music Academy',
          eventDate: '2025-07-15T18:00:00Z',
          price: 1500,
          category: 'classical',
          trending: true,
          sellingFast: false
        },
        {
          id: 117,
          title: 'Kochi International Music Festival Pass',
          eventTitle: 'Kerala Classical Music Festival',
          city: 'Kochi',
          venue: 'Durbar Hall Ground',
          eventDate: '2025-08-10T17:00:00Z',
          price: 2500,
          category: 'festivals',
          trending: false,
          sellingFast: true
        },
        {
          id: 200,
          title: 'AR Rahman Live Concert',
          eventTitle: 'AR Rahman - Music of Peace',
          city: 'Mumbai',
          venue: 'NSCI Dome',
          eventDate: '2025-08-20T20:00:00Z',
          price: 3500,
          category: 'concerts',
          trending: true,
          sellingFast: true
        },
        {
          id: 201,
          title: 'IPL Finals 2025',
          eventTitle: 'IPL Championship Final',
          city: 'Mumbai',
          venue: 'Wankhede Stadium',
          eventDate: '2025-07-30T19:30:00Z',
          price: 8500,
          category: 'sports',
          trending: true,
          sellingFast: true
        }
      ];

      const smartRecommendations = baseTickets.map(ticket => {
        const score = calculateRecommendationScore(ticket, userProfile);
        const { reason, confidence, tags } = generateRecommendationInsights(ticket, score, userProfile);
        
        return {
          ...ticket,
          score,
          reason,
          confidence,
          tags
        };
      });

      // Sort by overall score
      smartRecommendations.sort((a, b) => b.score.overall - a.score.overall);
      
      setRecommendations(smartRecommendations.slice(0, 4));
      setIsLoading(false);
    }, 1500);
  };

  const calculateRecommendationScore = (ticket: any, profile: UserProfile): RecommendationScore => {
    // Price matching (0-25 points)
    const priceInRange = ticket.price >= profile.priceRange[0] && ticket.price <= profile.priceRange[1];
    const priceMatch = priceInRange ? 25 : Math.max(0, 25 - Math.abs(ticket.price - profile.priceRange[1]) / 1000);

    // Location matching (0-20 points)
    const locationMatch = profile.preferredCities.includes(ticket.city) ? 20 : 10;

    // Category matching (0-25 points)
    const categoryMatch = profile.preferredCategories.includes(ticket.category) ? 25 : 5;

    // Time relevance (0-15 points)
    const eventDate = new Date(ticket.eventDate);
    const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    const timeMatch = daysUntilEvent > 0 && daysUntilEvent < 60 ? 
      Math.max(0, 15 - daysUntilEvent / 4) : 0;

    // Trending bonus (0-15 points)
    const trendingBonus = (ticket.trending ? 10 : 0) + (ticket.sellingFast ? 5 : 0);

    const overall = priceMatch + locationMatch + categoryMatch + timeMatch + trendingBonus;

    return {
      overall: Math.round(overall),
      priceMatch: Math.round(priceMatch),
      locationMatch: Math.round(locationMatch),
      categoryMatch: Math.round(categoryMatch),
      timeMatch: Math.round(timeMatch),
      trendingBonus: Math.round(trendingBonus)
    };
  };

  const generateRecommendationInsights = (ticket: any, score: RecommendationScore, profile: UserProfile) => {
    const reasons = [];
    const tags = [];
    
    if (score.categoryMatch > 20) {
      reasons.push(`matches your interest in ${ticket.category}`);
      tags.push('Perfect Match');
    }
    
    if (score.locationMatch > 15) {
      reasons.push(`in your preferred city ${ticket.city}`);
      tags.push('Local');
    }
    
    if (score.priceMatch > 20) {
      reasons.push('within your budget');
      tags.push('Good Value');
    }
    
    if (ticket.trending) {
      reasons.push('currently trending');
      tags.push('🔥 Trending');
    }
    
    if (ticket.sellingFast) {
      reasons.push('selling fast');
      tags.push('⚡ Popular');
    }

    // Check viewing history
    if (profile.viewHistory.length > 0) {
      reasons.push('similar to your recent views');
      tags.push('AI Recommended');
    }

    const reason = reasons.length > 0 ? 
      `Recommended because it ${reasons.slice(0, 2).join(' and ')}` :
      'Suggested based on your activity';

    const confidence = Math.min(95, Math.max(60, score.overall * 0.9 + Math.random() * 10));

    return { reason, confidence: Math.round(confidence), tags };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Generating Smart Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Smart Recommendations
          <Badge variant="secondary" className="ml-auto">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1 line-clamp-1">
                      {rec.eventTitle}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {rec.city} • {rec.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(rec.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score.overall)}`}>
                      {rec.score.overall}% Match
                    </div>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      ₹{rec.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>Category Match</span>
                    <span>{rec.score.categoryMatch}%</span>
                  </div>
                  <Progress value={rec.score.categoryMatch} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Price Match</span>
                    <span>{rec.score.priceMatch}%</span>
                  </div>
                  <Progress value={rec.score.priceMatch} className="h-1" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{rec.confidence}% Confidence</span>
                  </div>
                  <Link href={`/tickets/${rec.id}`}>
                    <Button size="sm" className="ml-auto">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={generateSmartRecommendations}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}