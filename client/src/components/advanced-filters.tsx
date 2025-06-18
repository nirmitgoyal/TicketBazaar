import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, IndianRupee, Filter, X, Clock, Users } from "lucide-react";

interface AdvancedFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onClose }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  useEffect(() => {
    setLocalFilters(filters);
    if (filters.minPrice || filters.maxPrice) {
      setPriceRange([filters.minPrice || 0, filters.maxPrice || 50000]);
    }
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setLocalFilters({
      ...localFilters,
      minPrice: value[0],
      maxPrice: value[1]
    });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const cleared = {};
    setLocalFilters(cleared);
    setPriceRange([0, 50000]);
    onFiltersChange(cleared);
  };

  const categories = [
    { id: 'concerts', label: 'Concerts', icon: '🎵' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'theater', label: 'Theater', icon: '🎭' },
    { id: 'comedy', label: 'Comedy', icon: '😄' },
    { id: 'festivals', label: 'Festivals', icon: '🎉' },
    { id: 'classical', label: 'Classical', icon: '🎼' },
    { id: 'dance', label: 'Dance', icon: '💃' },
    { id: 'movies', label: 'Movies', icon: '🎬' }
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Kochi'
  ];

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_weekend', label: 'This Weekend' },
    { id: 'next_week', label: 'Next Week' },
    { id: 'this_month', label: 'This Month' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Categories */}
          <div>
            <Label className="text-base font-medium mb-3 block">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={localFilters.category === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('category', 
                    localFilters.category === category.id ? undefined : category.id
                  )}
                  className="justify-start h-10"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cities */}
          <div>
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cities.map(city => (
                <Button
                  key={city}
                  variant={localFilters.city === city ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('city', 
                    localFilters.city === city ? undefined : city
                  )}
                  className="justify-start h-9 text-sm"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Price Range
            </Label>
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={50000}
                min={0}
                step={500}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Range */}
          <div>
            <Label className="text-base font-medium mb-3 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              When
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeRanges.map(range => (
                <Button
                  key={range.id}
                  variant={localFilters.timeRange === range.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('timeRange', 
                    localFilters.timeRange === range.id ? undefined : range.id
                  )}
                  className="justify-start h-9 text-sm"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quick Toggles */}
          <div>
            <Label className="text-base font-medium mb-3 block">Quick Filters</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="trending" className="flex items-center gap-2">
                  🔥 Trending events only
                </Label>
                <Switch
                  id="trending"
                  checked={localFilters.trending || false}
                  onCheckedChange={(checked) => handleFilterChange('trending', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="selling-fast" className="flex items-center gap-2">
                  ⚡ Selling fast
                </Label>
                <Switch
                  id="selling-fast"
                  checked={localFilters.sellingFast || false}
                  onCheckedChange={(checked) => handleFilterChange('sellingFast', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="transferrable" className="flex items-center gap-2">
                  📱 Electronic transfer only
                </Label>
                <Switch
                  id="transferrable"
                  checked={localFilters.electronicTransfer || false}
                  onCheckedChange={(checked) => handleFilterChange('electronicTransfer', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="verified" className="flex items-center gap-2">
                  ✅ Verified sellers only
                </Label>
                <Switch
                  id="verified"
                  checked={localFilters.verifiedSellers || false}
                  onCheckedChange={(checked) => handleFilterChange('verifiedSellers', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={clearFilters} variant="outline" className="flex-1">
              Clear All
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>

          {/* Active Filters Preview */}
          {Object.keys(localFilters).length > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {typeof value === 'boolean' ? 'Yes' : value.toString()}
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}