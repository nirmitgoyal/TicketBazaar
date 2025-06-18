import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, TrendingUp, MapPin, Calendar, Filter, X } from "lucide-react";

interface SmartSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  city?: string;
  category?: string;
  dateRange?: string;
  priceRange?: string;
}

interface SearchSuggestion {
  text: string;
  type: 'event' | 'city' | 'category' | 'trending';
  count?: number;
}

export function SmartSearch({ onSearch, className }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounced query for suggestions
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ticketBazaar_recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Get search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['/api/autocomplete/suggestions', debouncedQuery],
    enabled: debouncedQuery.length >= 2,
  });

  // Get trending searches
  const { data: trendingData } = useQuery({
    queryKey: ['/api/search/popular'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Update recent searches
      const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('ticketBazaar_recentSearches', JSON.stringify(updated));
      
      onSearch(finalQuery, activeFilters);
      setShowSuggestions(false);
    }
  }, [query, activeFilters, onSearch, recentSearches]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  }, [handleSearch]);

  const removeFilter = useCallback((filterKey: keyof SearchFilters) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      delete updated[filterKey];
      return updated;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Memoized suggestion groups
  const suggestionGroups = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return null;

    const groups: Record<string, SearchSuggestion[]> = {
      events: [],
      cities: [],
      categories: [],
    };

    suggestions.forEach((suggestion: SearchSuggestion) => {
      switch (suggestion.type) {
        case 'event':
          groups.events.push(suggestion);
          break;
        case 'city':
          groups.cities.push(suggestion);
          break;
        case 'category':
          groups.categories.push(suggestion);
          break;
      }
    });

    return groups;
  }, [suggestions]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search events, cities, or categories..."
          className="pl-10 pr-10"
        />
        <Button
          size="sm"
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
        >
          Search
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="pr-1">
              {key}: {value}
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => removeFilter(key as keyof SearchFilters)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-3">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recent Searches</h4>
                <div className="space-y-1">
                  {recentSearches.map((recent, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={() => handleSuggestionClick({ text: recent, type: 'event' })}
                    >
                      <Search className="h-3 w-3 mr-2" />
                      {recent}
                    </Button>
                  ))}
                </div>
                <Separator className="my-3" />
              </div>
            )}

            {/* Trending Searches */}
            {trendingData?.popularSearches && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </h4>
                <div className="space-y-1">
                  {trendingData.popularSearches.slice(0, 3).map((trend: any, index: number) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={() => handleSuggestionClick({ text: trend.suggestion, type: 'trending' })}
                    >
                      <TrendingUp className="h-3 w-3 mr-2" />
                      {trend.suggestion}
                    </Button>
                  ))}
                </div>
                <Separator className="my-3" />
              </div>
            )}

            {/* Search Suggestions */}
            {suggestionGroups && (
              <div>
                {suggestionGroups.events.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Events</h4>
                    <div className="space-y-1">
                      {suggestionGroups.events.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          {suggestion.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestionGroups.cities.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Cities</h4>
                    <div className="space-y-1">
                      {suggestionGroups.cities.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <MapPin className="h-3 w-3 mr-2" />
                          {suggestion.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestionGroups.categories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">Categories</h4>
                    <div className="space-y-1">
                      {suggestionGroups.categories.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Filter className="h-3 w-3 mr-2" />
                          {suggestion.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No suggestions */}
            {debouncedQuery.length >= 2 && (!suggestions || suggestions.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No suggestions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}