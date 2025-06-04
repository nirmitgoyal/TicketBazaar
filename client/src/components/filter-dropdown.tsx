import { useState, useEffect } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "wouter";

interface FilterDropdownProps {
  onFilter: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

export interface FilterValues {
  dateRange?: string;
  venueLocation?: string;
  seatingTypes?: string[];
  rating?: number;
  showVerifiedOnly?: boolean;
  sortBy?: string;
  availability?: string;
}

export function FilterDropdown({
  onFilter,
  initialFilters,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>("any");
  const [venueLocation, setVenueLocation] = useState<string>("any");
  const [seatingTypes, setSeatingTypes] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [availability, setAvailability] = useState<string>("all");
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  // Load initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.dateRange) setDateRange(initialFilters.dateRange);
      if (initialFilters.venueLocation)
        setVenueLocation(initialFilters.venueLocation);
      if (initialFilters.seatingTypes)
        setSeatingTypes(initialFilters.seatingTypes);
      if (initialFilters.rating !== undefined) setRating(initialFilters.rating);
      if (initialFilters.showVerifiedOnly !== undefined)
        setShowVerifiedOnly(initialFilters.showVerifiedOnly);
      if (initialFilters.sortBy) setSortBy(initialFilters.sortBy);
      if (initialFilters.availability)
        setAvailability(initialFilters.availability);
    }
  }, [initialFilters]);

  // Count active filters for the badge
  useEffect(() => {
    let count = 0;
    if (dateRange !== "any") count++;
    if (venueLocation !== "any") count++;
    if (seatingTypes.length > 0) count++;
    if (rating > 0) count++;
    if (showVerifiedOnly) count++;
    if (sortBy !== "relevance") count++;
    if (availability !== "all") count++;

    setActiveFilterCount(count);
  }, [
    dateRange,
    venueLocation,
    seatingTypes,
    rating,
    showVerifiedOnly,
    sortBy,
    availability,
  ]);

  const handleApplyFilters = () => {
    onFilter({
      dateRange: dateRange !== "any" ? dateRange : undefined,
      venueLocation: venueLocation !== "any" ? venueLocation : undefined,
      seatingTypes: seatingTypes.length > 0 ? seatingTypes : undefined,
      rating: rating > 0 ? rating : undefined,
      showVerifiedOnly: showVerifiedOnly || undefined,
      sortBy: sortBy !== "relevance" ? sortBy : undefined,
      availability: availability !== "all" ? availability : undefined,
    });
    setOpen(false);
  };

  const handleResetFilters = () => {
    setDateRange("any");
    setVenueLocation("any");
    setSeatingTypes([]);
    setRating(0);
    setShowVerifiedOnly(false);
    setSortBy("relevance");
    setAvailability("all");

    onFilter({});
  };

  const handleSeatingTypeChange = (type: string) => {
    setSeatingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs text-muted-foreground"
            >
              Reset all
            </Button>
          </div>

          <Separator />

          {/* Date Range */}
          <div>
            <h3 className="text-sm font-medium mb-2">Date</h3>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Any date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="weekend">This weekend</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="nextWeek">Next week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="nextMonth">Next month</SelectItem>
                <SelectItem value="custom">Custom date range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Venue Location */}
          <div>
            <h3 className="text-sm font-medium mb-2">Venue Location</h3>
            <Select value={venueLocation} onValueChange={setVenueLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Any location" />
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

          <Separator />

          {/* Seating Types */}
          <div>
            <h3 className="text-sm font-medium mb-2">Seating Types</h3>
            <div className="space-y-2">
              {["VIP", "Premium", "General", "Standing", "Box"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`seating-${type.toLowerCase()}`}
                    checked={seatingTypes.includes(type.toLowerCase())}
                    onCheckedChange={() =>
                      handleSeatingTypeChange(type.toLowerCase())
                    }
                  />
                  <Label htmlFor={`seating-${type.toLowerCase()}`}>
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Verified Only */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Verified Listings Only</h3>
              <p className="text-xs text-muted-foreground">
                Show only tickets verified by our team
              </p>
            </div>
            <Switch
              checked={showVerifiedOnly}
              onCheckedChange={setShowVerifiedOnly}
            />
          </div>

          <Separator />

          {/* Availability */}
          <div>
            <h3 className="text-sm font-medium mb-2">Availability</h3>
            <RadioGroup value={availability} onValueChange={setAvailability}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-availability" />
                <Label htmlFor="all-availability">All tickets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available-only" />
                <Label htmlFor="available-only">Available only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lastMinute" id="last-minute" />
                <Label htmlFor="last-minute">Last minute deals</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Sort Order */}
          <div>
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="availability">
                  Most Tickets Available
                </SelectItem>
                <SelectItem value="dateAsc">Date: Soonest First</SelectItem>
                <SelectItem value="dateDesc">Date: Latest First</SelectItem>
                <SelectItem value="popular">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
