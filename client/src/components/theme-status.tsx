import React from 'react';
import { Moon, Sun, MapPin, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeStatus() {
  const { theme, isLoading, location, sunsetData, toggleTheme, isDarkTime } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
        <span className="text-xs text-muted-foreground">Detecting location...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 px-2 gap-1.5"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to toggle theme manually</p>
          </TooltipContent>
        </Tooltip>

        {location && sunsetData && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs gap-1 px-2 py-1">
                <Clock className="h-3 w-3" />
                {isDarkTime ? (
                  <>
                    <Moon className="h-3 w-3" />
                    <span>Night Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3 w-3" />
                    <span>Day Mode</span>
                  </>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">Automatic Theme</p>
                <div className="text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    <span>Sunrise: {sunsetData.sunrise}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="h-3 w-3" />
                    <span>Sunset: {sunsetData.sunset}</span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {location && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Location detected for automatic theme</p>
              <p className="text-xs text-muted-foreground">
                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}