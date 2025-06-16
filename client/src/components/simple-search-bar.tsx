import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SimpleSearchBarProps {
    onSearch?: (query: string) => void;
}

export function SimpleSearchBar({ onSearch }: SimpleSearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🔥 BUTTON CLICKED! Query:", query);
        alert(`Search clicked with query: ${query}`);

        if (onSearch) {
            console.log("🔥 Calling onSearch callback");
            onSearch(query);
        }
    };

    const handleButtonClick = () => {
        console.log("🔥 DIRECT BUTTON CLICK!");
        alert(`Direct button click! Query: ${query}`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">
                        Search (Submit)
                    </Button>
                    <Button type="button" onClick={handleButtonClick}>
                        Search (Click)
                    </Button>
                </div>
            </form>
        </div>
    );
}
