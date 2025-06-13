import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Music,
  Film,
  Theater,
  CreditCard,
  Flame,
  Zap,
  BarChart2,
  Clock,
  Filter,
  Ticket,
  ShoppingBag,
  Trash2,
  Award,
  Heart,
  BookOpen,
  Shirt,
  Users,
} from "lucide-react";
import { SearchHints } from "@/components/search-hints";
import { useQuery } from "@tanstack/react-query";

// Debounce utility function to prevent excessive API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  format,
  addDays,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
} from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  initialQuery?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  date?: Date;
  dateRange?: string;
  trending?: boolean;
  sellingFast?: boolean;
  city?: string;
  country?: string;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  concert: <Music className="h-4 w-4" />,
  sports: <Users className="h-4 w-4" />,
  theater: <Theater className="h-4 w-4" />,
  comedy: <Heart className="h-4 w-4" />,
  festival: <Award className="h-4 w-4" />,
  exhibition: <BookOpen className="h-4 w-4" />,
  conference: <Shirt className="h-4 w-4" />,
  workshop: <ShoppingBag className="h-4 w-4" />,
  other: <Ticket className="h-4 w-4" />,
};

// Category options
const categoryOptions = [
  { value: "concert", label: "Concerts" },
  { value: "sports", label: "Sports" },
  { value: "theater", label: "Theater" },
  { value: "comedy", label: "Comedy" },
  { value: "festival", label: "Festivals" },
  { value: "exhibition", label: "Exhibitions" },
  { value: "conference", label: "Conferences" },
  { value: "workshop", label: "Workshops" },
  { value: "other", label: "Other" },
];

// Date range options
const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this-week", label: "This Week" },
  { value: "this-weekend", label: "This Weekend" },
  { value: "this-month", label: "This Month" },
  { value: "next-month", label: "Next Month" },
  { value: "custom", label: "Custom Date" },
];

export function SearchBar({
  className = "",
  initialQuery = "",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState<string>("any");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [trending, setTrending] = useState<boolean>(false);
  const [sellingFast, setSellingFast] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Autocomplete states
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState<number>(-1);

  const [, navigate] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Create debounced versions of state values for improved performance
  const debouncedQuery = useDebounce(query, 500);
  const debouncedAutocompleteQuery = useDebounce(query, 300);

  // Fetch autocomplete suggestions
  const { data: autocompleteResults } = useQuery({
    queryKey: ['/api/events/search', debouncedAutocompleteQuery],
    queryFn: async () => {
      if (!debouncedAutocompleteQuery || debouncedAutocompleteQuery.length < 2) {
        return [];
      }
      
      const params = new URLSearchParams();
      params.set('q', debouncedAutocompleteQuery);
      
      const response = await fetch(`/api/autocomplete/suggestions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const results = await response.json();
      
      // The autocomplete endpoint already returns structured suggestions
      return results;
      
      // Extract and prioritize suggestions from the results
      const suggestions = new Map<string, { text: string; type: string; priority: number; category?: string }>();
      
      // Helper function to calculate string similarity (for typo tolerance)
      const calculateSimilarity = (str1: string, str2: string): number => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        const editDistance = levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
      };
      
      // Simple Levenshtein distance calculation
      const levenshteinDistance = (str1: string, str2: string): number => {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
          for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
              matrix[j][i - 1] + 1,
              matrix[j - 1][i] + 1,
              matrix[j - 1][i - 1] + cost
            );
          }
        }
        return matrix[str2.length][str1.length];
      };

      results.forEach((event: any) => {
        const query = debouncedAutocompleteQuery.toLowerCase();
        
        // Event titles (highest priority)
        if (event.eventTitle) {
          const eventTitle = event.eventTitle.toLowerCase();
          const exactMatch = eventTitle.includes(query);
          const startsWithQuery = eventTitle.startsWith(query);
          const similarity = calculateSimilarity(query, eventTitle);
          
          if (exactMatch || similarity > 0.6) {
            const key = event.eventTitle.toLowerCase();
            if (!suggestions.has(key)) {
              let priority = 3;
              if (startsWithQuery) priority = 5;
              else if (exactMatch) priority = 4;
              else if (similarity > 0.8) priority = 3;
              else priority = 2;
              
              suggestions.set(key, {
                text: event.eventTitle,
                type: 'event',
                priority,
                category: event.category
              });
            }
          }
        }
        
        // Venues (medium priority)
        if (event.venue) {
          const venue = event.venue.toLowerCase();
          const exactMatch = venue.includes(query);
          const startsWithQuery = venue.startsWith(query);
          const similarity = calculateSimilarity(query, venue);
          
          if (exactMatch || similarity > 0.6) {
            const key = event.venue.toLowerCase();
            if (!suggestions.has(key)) {
              let priority = 2;
              if (startsWithQuery) priority = 4;
              else if (exactMatch) priority = 3;
              else if (similarity > 0.8) priority = 2;
              else priority = 1;
              
              suggestions.set(key, {
                text: event.venue,
                type: 'venue',
                priority
              });
            }
          }
        }
        
        // Cities (lower priority)
        if (event.city) {
          const city = event.city.toLowerCase();
          const exactMatch = city.includes(query);
          const startsWithQuery = city.startsWith(query);
          const similarity = calculateSimilarity(query, city);
          
          if (exactMatch || similarity > 0.6) {
            const key = event.city.toLowerCase();
            if (!suggestions.has(key)) {
              let priority = 1;
              if (startsWithQuery) priority = 3;
              else if (exactMatch) priority = 2;
              else if (similarity > 0.8) priority = 1;
              else priority = 1;
              
              suggestions.set(key, {
                text: event.city,
                type: 'city',
                priority
              });
            }
          }
        }
      });
      
      // Sort by priority and return structured suggestions
      return Array.from(suggestions.values())
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
    },
    enabled: debouncedAutocompleteQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize form based on URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || initialQuery);
    setLocation(params.get("location") || "any");
    setCategory(params.get("category") || "");

    // Handle date param
    const dateParam = params.get("date");
    if (dateParam) {
      try {
        setDate(new Date(dateParam));
      } catch (e) {
        setDate(undefined);
      }
    }

    // Handle date range
    setDateRange(params.get("dateRange") || "");



    // Handle boolean filters
    setTrending(params.get("trending") === "true");
    setSellingFast(params.get("sellingFast") === "true");

    // Handle categories
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [initialQuery]);

  // Count active filters for the badge
  useEffect(() => {
    let count = 0;
    if (category) count++;
    if (location && location !== "any") count++;
    if (date) count++;
    if (dateRange) count++;
    if (trending) count++;
    if (sellingFast) count++;
    if (selectedCategories.length > 0) count++;

    setActiveFiltersCount(count);
  }, [
    category,
    location,
    date,
    dateRange,
    trending,
    sellingFast,
    selectedCategories,
  ]);

  // Auto-search when debounced values change
  useEffect(() => {
    // Skip on initial render to prevent unnecessary API calls
    if (debouncedQuery === initialQuery) {
      return;
    }

    // Skip if there's no meaningful change from initial state
    if (
      debouncedQuery === "" &&
      !trending &&
      !sellingFast
    ) {
      return;
    }

    // Don't auto-search if query is too short (performance optimization)
    if (debouncedQuery !== "" && debouncedQuery.length < 2) {
      return;
    }

    // Automatically perform search with optimized timing
    performSearch();
  }, [
    debouncedQuery,
    location,
    category,
    date,
    dateRange,
    trending,
    sellingFast,
  ]);

  // Extract search logic to separate function
  const performSearch = useCallback(() => {
    const filters: SearchFilters = {};

    // Add filters from state
    if (category) filters.category = category;
    if (location && location !== "any") filters.location = location;
    if (date) filters.date = date;
    if (dateRange) filters.dateRange = dateRange;
    if (trending) filters.trending = trending;
    if (sellingFast) filters.sellingFast = sellingFast;

    setIsSearching(true);

    if (onSearch) {
      onSearch(query.trim(), filters);
      setIsSearching(false);
    } else {
      let searchPath = "/?";
      const params = new URLSearchParams();

      // Add params from filters
      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (category) {
        params.set("category", category);
      }

      if (location && location !== "any") {
        params.set("location", location);
      }

      if (date) {
        params.set("date", format(date, "yyyy-MM-dd"));
      }

      if (dateRange) {
        params.set("dateRange", dateRange);
      }



      if (trending) {
        params.set("trending", "true");
      }

      if (sellingFast) {
        params.set("sellingFast", "true");
      }

      navigate(`${searchPath}${params.toString()}`);
      setIsSearching(false);
    }
  }, [
    query,
    category,
    location,
    date,
    dateRange,
    trending,
    sellingFast,
    onSearch,
    navigate,
  ]);

  // Handle category selection
  const toggleCategory = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== categoryValue),
      );
      if (category === categoryValue) {
        setCategory("");
      }
    } else {
      setSelectedCategories([...selectedCategories, categoryValue]);
      if (!category) {
        setCategory(categoryValue);
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setLocation("any");
    setCategory("");
    setDate(undefined);
    setDateRange("");
    setTrending(false);
    setSellingFast(false);
    setSelectedCategories([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };



  // Handle date range selection
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    if (range === "custom") {
      setCalendarOpen(true);
    } else {
      setDate(undefined); // Clear custom date when using predefined ranges
    }
  };

  // Handle search hint clicks
  const handleHintClick = (hint: string) => {
    setQuery(hint);
    performSearch();
  };

  // Handle autocomplete selection
  const handleAutocompleteSelect = (suggestion: any) => {
    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setQuery(suggestionText);
    setShowAutocomplete(false);
    setAutocompleteIndex(-1);
    
    // Immediately navigate to search results for this suggestion
    if (onSearch) {
      // If there's a custom onSearch handler, use it
      onSearch(suggestionText.trim(), {});
    } else {
      // Otherwise navigate to the search results page
      const params = new URLSearchParams();
      params.set("q", suggestionText.trim());
      navigate(`/?${params.toString()}`);
    }
  };

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || !autocompleteResults?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setAutocompleteIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setAutocompleteIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (autocompleteIndex >= 0) {
          handleAutocompleteSelect(autocompleteResults[autocompleteIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setAutocompleteIndex(-1);
        break;
    }
  };

  // Show/hide autocomplete based on input focus and results
  useEffect(() => {
    if (autocompleteResults && autocompleteResults.length > 0 && query.length >= 2) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
    setAutocompleteIndex(-1);
  }, [autocompleteResults, query]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const autocompleteElement = document.querySelector('.autocomplete-dropdown');
      
      // Don't close if clicking on the search input or autocomplete dropdown
      if (searchInputRef.current && 
          (searchInputRef.current.contains(target) || 
           (autocompleteElement && autocompleteElement.contains(target)))) {
        return;
      }
      
      setShowAutocomplete(false);
      setAutocompleteIndex(-1);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search context for AI hints
  const searchContext = {
    query,
    location: location !== "any" ? location : undefined,
    preferences: {
      categories:
        selectedCategories.length > 0 ? selectedCategories : undefined,
      datePreference: dateRange || undefined,
    },
  };

  return (
    <div
      className={`bg-white rounded-lg mobile-container p-3 sm:p-4 shadow-lg ${className}`}
    >
      <form onSubmit={handleSearch}>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col xs:flex-row gap-2">
            {/* Search Input */}
            <div className="flex-grow relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none z-10" />
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Tickets..."
                  className={`w-full pl-10 pr-4 py-4 text-base rounded-lg touch-manipulation touch-target min-h-[48px] focus:ring-2 focus:ring-primary ${isSearching ? "opacity-60" : ""}`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (autocompleteResults && autocompleteResults.length > 0 && query.length >= 2) {
                      setShowAutocomplete(true);
                    }
                  }}
                  disabled={isSearching}
                  inputMode="search"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
                
                {/* Autocomplete Dropdown */}
                {showAutocomplete && autocompleteResults && autocompleteResults.length > 0 && (
                  <div className="autocomplete-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {autocompleteResults.map((suggestion, index) => {
                      const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
                      const suggestionType = typeof suggestion === 'string' ? 'event' : suggestion.type;
                      const suggestionCategory = typeof suggestion === 'string' ? undefined : suggestion.category;
                      
                      // Choose appropriate icon based on type
                      let icon = <Search className="h-4 w-4 mr-2 text-gray-400" />;
                      if (suggestionType === 'event') {
                        icon = categoryIcons[suggestionCategory?.toLowerCase()] || <Ticket className="h-4 w-4 mr-2 text-blue-500" />;
                      } else if (suggestionType === 'venue') {
                        icon = <MapPin className="h-4 w-4 mr-2 text-green-500" />;
                      } else if (suggestionType === 'city') {
                        icon = <MapPin className="h-4 w-4 mr-2 text-orange-500" />;
                      }

                      return (
                        <button
                          key={suggestionText}
                          type="button"
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                            index === autocompleteIndex ? 'bg-primary/5 text-primary' : 'text-gray-700'
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAutocompleteSelect(suggestion);
                          }}
                          onMouseEnter={() => setAutocompleteIndex(index)}
                        >
                          <div className="flex items-center">
                            {icon}
                            <div className="flex-1 min-w-0">
                              <span className="truncate block">{suggestionText}</span>
                              {suggestionType !== 'event' && (
                                <span className="text-xs text-gray-500 capitalize">{suggestionType}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="xs:w-44 sm:w-40">
              <Select
                value={location}
                onValueChange={setLocation}
                disabled={isSearching}
              >
                <SelectTrigger
                  className={`w-full h-12 touch-manipulation touch-target ${isSearching ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-700 flex-shrink-0" />
                    <SelectValue placeholder="Location" />
                    {isSearching && (
                      <span className="animate-spin ml-auto h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any location</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi NCR</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="chennai">Chennai</SelectItem>
                  <SelectItem value="kolkata">Kolkata</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 md:h-10 text-base md:text-sm touch-manipulation"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* AI Search Hints */}
      <SearchHints
        searchContext={searchContext}
        onHintClick={handleHintClick}
        showTitle={query.length >= 3}
      />
    </div>
  );
}
