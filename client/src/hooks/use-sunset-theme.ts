import { useState, useEffect } from 'react';

interface SunsetData {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: string;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function useSunsetTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [sunsetData, setSunsetData] = useState<SunsetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userThemePreference, setUserThemePreference] = useState<'light' | 'dark' | 'auto'>('auto');

  // Get user's location
  const getUserLocation = (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000 * 60 * 15, // Cache for 15 minutes
        }
      );
    });
  };

  // Fetch sunset data from sunrise-sunset.org API
  const fetchSunsetData = async (coords: LocationCoords): Promise<SunsetData> => {
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${coords.latitude}&lng=${coords.longitude}&formatted=0`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch sunset data');
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error('Invalid response from sunset API');
    }

    return data.results;
  };

  // Check if current time is after sunset
  const isDarkTime = (sunsetData: SunsetData): boolean => {
    const now = new Date();
    const sunset = new Date(sunsetData.sunset);
    const sunrise = new Date(sunsetData.sunrise);
    
    // Add 30 minutes buffer after sunset to account for twilight
    const sunsetWithBuffer = new Date(sunset.getTime() + 30 * 60 * 1000);
    
    return now >= sunsetWithBuffer || now < sunrise;
  };

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setTheme(newTheme);
  };

  // Initialize theme based on location and sunset data
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user location
        const coords = await getUserLocation();
        setLocation(coords);

        // Fetch sunset data
        const data = await fetchSunsetData(coords);
        setSunsetData(data);

        // Determine and apply theme
        const shouldBeDark = isDarkTime(data);
        applyTheme(shouldBeDark ? 'dark' : 'light');

      } catch (err) {
        console.warn('Failed to get location or sunset data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to system preference or light mode
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(systemPrefersDark ? 'dark' : 'light');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);



  // Update theme every minute to catch sunset/sunrise transitions (only if auto mode)
  useEffect(() => {
    if (!sunsetData || userThemePreference !== 'auto') return;

    const interval = setInterval(() => {
      const shouldBeDark = isDarkTime(sunsetData);
      const newTheme = shouldBeDark ? 'dark' : 'light';
      
      if (newTheme !== theme) {
        applyTheme(newTheme);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sunsetData, theme, userThemePreference]);

  // Listen for system theme changes as fallback
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only use system preference if we don't have sunset data and user hasn't set manual preference
      if (!sunsetData && !isLoading && userThemePreference === 'auto') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [sunsetData, isLoading, userThemePreference]);

  // Manual theme toggle - disables automatic switching
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setUserThemePreference(newTheme);
    applyTheme(newTheme);
  };

  // Get readable sunset/sunrise times for display
  const getDisplayTimes = () => {
    if (!sunsetData) return null;
    
    const sunset = new Date(sunsetData.sunset);
    const sunrise = new Date(sunsetData.sunrise);
    
    return {
      sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return {
    theme,
    isLoading,
    error,
    location,
    sunsetData: getDisplayTimes(),
    toggleTheme,
    isDarkTime: sunsetData ? isDarkTime(sunsetData) : false,
  };
}