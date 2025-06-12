import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe, DollarSign, Users, TrendingUp, Map, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getAllCurrencies } from "@/lib/currency-utils";
import { getAllCountries } from "@/lib/country-utils";

interface MarketplaceStats {
  totalTickets: number;
  totalCountries: number;
  totalCurrencies: number;
  totalUsers: number;
  topCountries: Array<{ country: string; count: number; flag: string }>;
  topCurrencies: Array<{ currency: string; count: number; symbol: string }>;
  recentActivity: Array<{ type: string; country: string; currency: string; timestamp: Date }>;
}

export function GlobalMarketplaceStats() {
  const { data: stats, isLoading } = useQuery<MarketplaceStats>({
    queryKey: ["/api/marketplace/stats"],
    queryFn: async () => {
      // Simulate global marketplace statistics
      const countries = getAllCountries();
      const currencies = getAllCurrencies();
      
      return {
        totalTickets: 12847,
        totalCountries: 10,
        totalCurrencies: 7,
        totalUsers: 3421,
        topCountries: [
          { country: "United States", count: 4250, flag: "🇺🇸" },
          { country: "United Kingdom", count: 2134, flag: "🇬🇧" },
          { country: "Canada", count: 1876, flag: "🇨🇦" },
          { country: "Australia", count: 1542, flag: "🇦🇺" },
          { country: "Germany", count: 1298, flag: "🇩🇪" },
        ],
        topCurrencies: [
          { currency: "USD", count: 4250, symbol: "$" },
          { currency: "GBP", count: 2134, symbol: "£" },
          { currency: "EUR", count: 1876, symbol: "€" },
          { currency: "CAD", count: 1542, symbol: "C$" },
          { currency: "AUD", count: 1298, symbol: "A$" },
        ],
        recentActivity: [
          { type: "listing", country: "US", currency: "USD", timestamp: new Date() },
          { type: "sale", country: "GB", currency: "GBP", timestamp: new Date() },
          { type: "listing", country: "CA", currency: "CAD", timestamp: new Date() },
        ]
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Global Tickets",
      value: stats.totalTickets.toLocaleString(),
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subtitle: "Active listings worldwide"
    },
    {
      title: "Countries",
      value: stats.totalCountries.toString(),
      icon: Map,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subtitle: "Markets served"
    },
    {
      title: "Currencies",
      value: stats.totalCurrencies.toString(),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      subtitle: "Supported currencies"
    },
    {
      title: "Global Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: "Registered worldwide"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Top Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-sm">{country.country}</p>
                      <p className="text-xs text-gray-500">{country.count} tickets</p>
                    </div>
                  </div>
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Popular Currencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCurrencies.map((currency, index) => (
                <div key={currency.currency} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{currency.symbol}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{currency.currency}</p>
                      <p className="text-xs text-gray-500">{currency.count} listings</p>
                    </div>
                  </div>
                  <Badge variant={index < 3 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Live Global Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <p className="text-sm">Real-time activity feed coming soon</p>
            <p className="text-xs mt-2">Track global ticket listings and sales as they happen</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}