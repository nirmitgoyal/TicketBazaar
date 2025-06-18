import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Eye, Users, TrendingUp, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveActivity {
  id: string;
  type: 'view' | 'purchase' | 'listing' | 'price_drop';
  ticketId: number;
  ticketTitle: string;
  city: string;
  timestamp: number;
  userCount?: number;
  priceChange?: number;
}

interface RealTimeUpdatesProps {
  onActivityUpdate?: (activities: LiveActivity[]) => void;
}

export function RealTimeUpdates({ onActivityUpdate }: RealTimeUpdatesProps) {
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [viewerCounts, setViewerCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    // Simulate real-time activity generation
    const generateActivity = (): LiveActivity => {
      const activities = [
        {
          type: 'view' as const,
          templates: [
            'Someone is viewing {title} in {city}',
            '{count} people viewing {title}',
            'High interest in {title}'
          ]
        },
        {
          type: 'purchase' as const,
          templates: [
            'Ticket sold: {title}',
            'Just purchased in {city}'
          ]
        },
        {
          type: 'listing' as const,
          templates: [
            'New listing: {title}',
            'Fresh tickets available for {title}'
          ]
        },
        {
          type: 'price_drop' as const,
          templates: [
            'Price dropped for {title}',
            '₹{amount} reduction on {title}'
          ]
        }
      ];

      const tickets = [
        { id: 126, title: 'Mission: Impossible - Dead Reckoning', city: 'Mumbai' },
        { id: 110, title: 'Carnatic Music Concert', city: 'Chennai' },
        { id: 117, title: 'Kerala Classical Music Festival', city: 'Kochi' },
        { id: 100, title: 'Sufi Music Night', city: 'Delhi' },
        { id: 103, title: 'Bollywood Dance Show', city: 'Mumbai' },
        { id: 104, title: 'Stand-up Comedy Night', city: 'Bangalore' },
        { id: 106, title: 'Rock Concert', city: 'Pune' }
      ];

      const randomTicket = tickets[Math.floor(Math.random() * tickets.length)];
      const randomActivityType = activities[Math.floor(Math.random() * activities.length)];
      
      return {
        id: `activity_${Date.now()}_${Math.random()}`,
        type: randomActivityType.type,
        ticketId: randomTicket.id,
        ticketTitle: randomTicket.title,
        city: randomTicket.city,
        timestamp: Date.now(),
        userCount: randomActivityType.type === 'view' ? Math.floor(Math.random() * 15) + 1 : undefined,
        priceChange: randomActivityType.type === 'price_drop' ? Math.floor(Math.random() * 2000) + 500 : undefined
      };
    };

    // Generate initial activities
    const initialActivities = Array.from({ length: 5 }, generateActivity);
    setLiveActivities(initialActivities);

    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setLiveActivities(prev => [newActivity, ...prev].slice(0, 8));
      
      // Update viewer counts
      if (newActivity.type === 'view' && newActivity.userCount) {
        setViewerCounts(prev => ({
          ...prev,
          [newActivity.ticketId]: newActivity.userCount!
        }));
      }
      
      onActivityUpdate?.([newActivity, ...liveActivities]);
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, [onActivityUpdate, liveActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-3 w-3" />;
      case 'purchase': return <TrendingUp className="h-3 w-3" />;
      case 'listing': return <Bell className="h-3 w-3" />;
      case 'price_drop': return <TrendingUp className="h-3 w-3 text-green-500" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'purchase': return 'bg-green-50 border-green-200 text-green-700';
      case 'listing': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'price_drop': return 'bg-orange-50 border-orange-200 text-orange-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Bell className="h-4 w-4 mr-1" />
        Live Activity
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-hidden z-50 shadow-xl bg-white/95 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Activity</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          <AnimatePresence>
            {liveActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-2 rounded-lg border text-xs ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {activity.ticketTitle}
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{activity.city}</span>
                      {activity.userCount && (
                        <>
                          <Users className="h-3 w-3 ml-1" />
                          <span>{activity.userCount} viewing</span>
                        </>
                      )}
                      {activity.priceChange && (
                        <span className="text-green-600 font-medium">
                          -₹{activity.priceChange}
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {Object.keys(viewerCounts).length > 0 && (
          <div className="mt-3 pt-2 border-t">
            <div className="text-xs font-medium mb-1">Current Viewers</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(viewerCounts).slice(0, 3).map(([ticketId, count]) => (
                <Badge key={ticketId} variant="secondary" className="text-xs">
                  Ticket #{ticketId}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}