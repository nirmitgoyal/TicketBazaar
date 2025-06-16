import { useState, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SearchFilters {
    category?: string;
    location?: string;
    city?: string;
    date?: Date;
    dateRange?: string;
    trending?: boolean;
    sellingFast?: boolean;
}

interface SearchBarProps {
    initialQuery?: string;
    className?: string;
    placeholder?: string;
    onSearch?: (query: string, filters: SearchFilters) => void;
}

export default function SearchBar({
    initialQuery = "",
    className = "",
    placeholder = "Search events, venues, or artists...",
    onSearch,
}: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState<string>("any");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    // Handle form submission
    const handleSearch = useCallback((e: React.FormEvent) => {
        console.log("🔍 Search form submitted!");
        alert("🔍 Search button clicked! Query: " + query);
        e.preventDefault();

        if (!query.trim() && location === "any") {
            console.log("🔍 Empty search, skipping");
            return;
        }

        console.log("🔍 Performing search with:", { query: query.trim(), location });
        setIsSearching(true);

        const filters: SearchFilters = {};
        if (location && location !== "any") {
            filters.location = location;
        } if (onSearch) {
            console.log("🔍 Calling onSearch callback");
            onSearch(query.trim(), filters);
        } else {
            console.log("🔍 Making direct API call");
            performDirectSearch(query.trim(), filters);
        }

        // Reset searching state after a delay
        setTimeout(() => {
            setIsSearching(false);
        }, 2000);
    }, [query, location, onSearch]);

    // Direct API call function
    const performDirectSearch = async (searchQuery: string, filters: SearchFilters) => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) {
                params.set("q", searchQuery);
            }

            // Add filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.set(key, value.toString());
                }
            });

            const url = `/api/search/advanced?${params.toString()}`;
            console.log("🔍 Fetching:", url);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log("🔍 Search results:", result);

            // Handle results
            alert(`Search completed! Found ${result.tickets?.length || 0} tickets.`);

        } catch (error) {
            console.error("🔍 API call failed:", error);
            alert("Search failed: " + error.message);
        }
    };

    return (
        <div className={`bg-white rounded-lg p-3 sm:p-4 shadow-lg ${className}`}>
            <form onSubmit={handleSearch} className="w-full">
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search Input */}
                    <div className="flex-grow relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none z-10" />
                        <Input
                            type="text"
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-4 text-base rounded-lg min-h-[48px] focus:ring-2 focus:ring-primary"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={isSearching}
                        />
                    </div>

                    {/* Location Dropdown */}
                    <div className="sm:w-40">
                        <Select
                            value={location}
                            onValueChange={setLocation}
                            disabled={isSearching}
                        >
                            <SelectTrigger className="w-full h-12">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-700 flex-shrink-0" />
                                    <SelectValue placeholder="Location" />
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
                    </div>          {/* Search Button */}
                    <Button
                        type="submit"
                        className="w-full sm:w-auto h-12 text-base px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSearching}
                        onClick={() => {
                            console.log("🔍 Button clicked directly!");
                            alert("🔍 Button clicked directly!");
                        }}
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
            </form>
        </div>
    );
}

export { SearchBar };
