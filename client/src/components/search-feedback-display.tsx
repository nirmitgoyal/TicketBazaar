import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  Search, 
  TrendingUp,
  MapPin,
  Calendar,
  Music
} from "lucide-react";
import { SearchFeedback } from "@/hooks/use-search-feedback";

interface SearchFeedbackDisplayProps {
  feedback: SearchFeedback;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'suggestion':
    default:
      return Lightbulb;
  }
};

const getAlertVariant = (type: string): "default" | "destructive" => {
  switch (type) {
    case 'warning':
      return 'destructive';
    case 'info':
    case 'suggestion':
    default:
      return 'default';
  }
};

const getSuggestionIcon = (suggestion: string) => {
  const lower = suggestion.toLowerCase();
  if (lower.includes('concert') || lower.includes('music')) return Music;
  if (lower.includes('mumbai') || lower.includes('delhi') || lower.includes('in ')) return MapPin;
  if (lower.includes('event') || lower.includes('festival')) return Calendar;
  if (lower.includes('trending') || lower.includes('popular')) return TrendingUp;
  return Search;
};

export function SearchFeedbackDisplay({ 
  feedback, 
  onSuggestionClick, 
  className = "" 
}: SearchFeedbackDisplayProps) {
  const Icon = getIcon(feedback.type);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main feedback message */}
      <Alert variant={getAlertVariant(feedback.type)}>
        <Icon className="h-4 w-4" />
        <AlertTitle>
          {feedback.type === 'warning' ? 'Search Help' : 
           feedback.type === 'info' ? 'Search Tips' : 
           'Search Suggestions'}
        </AlertTitle>
        <AlertDescription>
          {feedback.message}
        </AlertDescription>
      </Alert>

      {/* Suggestions */}
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">
              {feedback.type === 'warning' || feedback.type === 'info' 
                ? 'Try these instead:' 
                : 'Popular searches:'}
            </h4>
            <div className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => {
                const SuggestionIcon = getSuggestionIcon(suggestion);
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-3 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    <SuggestionIcon className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="flex-1">{suggestion}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      Search
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular tickets hint */}
      {feedback.showPopularTickets && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Or browse trending events below
          </p>
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <TrendingUp className="h-3 w-3" />
            <span>Popular events are shown by default</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFeedbackDisplay;