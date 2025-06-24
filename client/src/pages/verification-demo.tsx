import { useState } from "react";
import { motion } from "framer-motion";
import { TrustScoreMeter } from "@/components/trust-score-meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, RefreshCw, Zap, ArrowRight } from "lucide-react";

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  eventType: string;
  trustScore: number;
  fraudRisk: 'low' | 'medium' | 'high';
  eventData: {
    name: string;
    venue: string;
    price: number;
    seller: string;
  };
}

const demoScenarios: DemoScenario[] = [
  {
    id: "excellent",
    title: "Premium IPL Match",
    description: "High-trust verification with excellent scores",
    eventType: "Sports",
    trustScore: 92,
    fraudRisk: "low",
    eventData: {
      name: "IPL Final 2024 - MI vs CSK",
      venue: "Wankhede Stadium",
      price: 8500,
      seller: "Verified Sports Fan"
    }
  },
  {
    id: "good",
    title: "Concert Tickets",
    description: "Good verification with minor pricing concerns",
    eventType: "Music",
    trustScore: 74,
    fraudRisk: "low",
    eventData: {
      name: "AR Rahman Live Concert",
      venue: "Phoenix MarketCity",
      price: 3200,
      seller: "Music Enthusiast"
    }
  },
  {
    id: "moderate",
    title: "Tech Conference",
    description: "Moderate trust with venue verification issues",
    eventType: "Conference",
    trustScore: 58,
    fraudRisk: "medium",
    eventData: {
      name: "Tech Summit 2024",
      venue: "Convention Center",
      price: 1500,
      seller: "New User"
    }
  },
  {
    id: "risky",
    title: "Suspicious Listing",
    description: "High-risk verification with multiple red flags",
    eventType: "Entertainment",
    trustScore: 28,
    fraudRisk: "high",
    eventData: {
      name: "Exclusive VIP Event",
      venue: "Private Location",
      price: 15000,
      seller: "Anonymous Seller"
    }
  }
];

export default function VerificationDemo() {
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = (scenario: DemoScenario) => {
    setIsAnalyzing(true);
    setActiveScenario(null);
    
    setTimeout(() => {
      setActiveScenario(scenario);
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetDemo = () => {
    setActiveScenario(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Verification Demo
            </h1>
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience our advanced AI-powered ticket verification system with animated trust score meters 
            and comprehensive fraud risk assessment.
          </p>
        </motion.div>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {demoScenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      scenario.fraudRisk === 'low' ? 'default' : 
                      scenario.fraudRisk === 'medium' ? 'secondary' : 
                      'destructive'
                    }>
                      {scenario.eventType}
                    </Badge>
                    <div className={`text-sm font-bold ${
                      scenario.trustScore >= 80 ? 'text-green-600' :
                      scenario.trustScore >= 60 ? 'text-yellow-600' :
                      scenario.trustScore >= 40 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {scenario.trustScore}%
                    </div>
                  </div>
                  <CardTitle className="text-sm">{scenario.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <div><strong>Event:</strong> {scenario.eventData.name}</div>
                    <div><strong>Venue:</strong> {scenario.eventData.venue}</div>
                    <div><strong>Price:</strong> ₹{scenario.eventData.price.toLocaleString()}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAnalyze(scenario)}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Zap className="h-3 w-3 mr-1 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Verify Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Verification Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {!activeScenario && !isAnalyzing ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a Scenario to Begin
              </h3>
              <p className="text-gray-500">
                Choose any ticket scenario above to see our AI verification system in action
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                System Analysis in Progress
              </h3>
              <p className="text-gray-500">
                Scanning event data, verifying seller credentials, and analyzing pricing patterns...
              </p>
            </div>
          ) : activeScenario && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Verification Results
                  </h3>
                  <p className="text-gray-600">{activeScenario.eventData.name}</p>
                </div>
                <Button variant="outline" size="sm" onClick={resetDemo}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset Demo
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trust Score Display */}
                <div className="space-y-6">
                  <div className="text-center">
                    <TrustScoreMeter
                      score={activeScenario.trustScore}
                      label="Overall Trust Score"
                      size="lg"
                      fraudRisk={activeScenario.fraudRisk}
                      animate={true}
                    />
                  </div>

                  {/* Individual Metrics */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="text-center">
                      <TrustScoreMeter
                        score={Math.max(activeScenario.trustScore - 5, 15)}
                        label="Event"
                        size="sm"
                        showDetails={false}
                        animate={true}
                      />
                    </div>
                    <div className="text-center">
                      <TrustScoreMeter
                        score={Math.max(activeScenario.trustScore - 10, 10)}
                        label="Seller"
                        size="sm"
                        showDetails={false}
                        animate={true}
                      />
                    </div>
                    <div className="text-center">
                      <TrustScoreMeter
                        score={Math.min(activeScenario.trustScore + 5, 95)}
                        label="Pricing"
                        size="sm"
                        showDetails={false}
                        animate={true}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Analysis Details */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3, duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      System Analysis Summary
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {activeScenario.fraudRisk === 'low' ? (
                        <>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                            <span>Event verified through official sources</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                            <span>Venue information confirmed and authentic</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                            <span>Pricing within reasonable market range</span>
                          </div>
                        </>
                      ) : activeScenario.fraudRisk === 'medium' ? (
                        <>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5" />
                            <span>Event details partially verified</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5" />
                            <span>Venue requires additional confirmation</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                            <span>Pricing appears reasonable</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                            <span>Unable to verify event authenticity</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                            <span>Venue information incomplete or suspicious</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
                            <span>Pricing significantly above market rate</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Safety Recommendations */}
                  <div className={`p-4 rounded-lg border ${
                    activeScenario.fraudRisk === 'high' 
                      ? 'bg-red-50 border-red-200' 
                      : activeScenario.fraudRisk === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Safety Recommendations
                    </h4>
                    <div className="space-y-2 text-sm">
                      {activeScenario.fraudRisk === 'low' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-green-600" />
                            <span>Proceed with confidence - this appears legitimate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-green-600" />
                            <span>Use secure payment methods for protection</span>
                          </div>
                        </>
                      ) : activeScenario.fraudRisk === 'medium' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-yellow-600" />
                            <span>Verify seller credentials before purchase</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-yellow-600" />
                            <span>Confirm venue details independently</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-yellow-600" />
                            <span>Meet in public place for ticket transfer</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-red-600" />
                            <span>Exercise extreme caution - high fraud risk detected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-red-600" />
                            <span>Consider alternative verified listings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-red-600" />
                            <span>Do not make advance payments without verification</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}