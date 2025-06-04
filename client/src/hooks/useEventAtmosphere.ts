import { useState, useEffect } from "react";
import { Event } from "@shared/schema";

export interface AtmosphereConfig {
  backgroundGradient: string;
  particles: {
    enabled: boolean;
    color: string;
    density: number;
    animation: "float" | "sparkle" | "pulse" | "wave";
  };
  lighting: {
    color: string;
    intensity: number;
    pattern: "spotlight" | "strobe" | "ambient" | "concert";
  };
  overlay: {
    pattern: "none" | "dots" | "lines" | "mesh" | "stars";
    opacity: number;
  };
}

const getAtmosphereForEvent = (event: Event): AtmosphereConfig => {
  const { title, category, venue } = event;
  const titleLower = title.toLowerCase();
  const venueLower = venue.toLowerCase();

  // Coldplay concert atmosphere
  if (titleLower.includes("coldplay")) {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      particles: {
        enabled: true,
        color: "#f093fb",
        density: 50,
        animation: "sparkle",
      },
      lighting: {
        color: "#667eea",
        intensity: 0.8,
        pattern: "concert",
      },
      overlay: {
        pattern: "stars",
        opacity: 0.3,
      },
    };
  }

  // Cricket/IPL atmosphere
  if (titleLower.includes("ipl") || titleLower.includes("cricket")) {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #11998e 0%, #38ef7d 50%, #4facfe 100%)",
      particles: {
        enabled: true,
        color: "#38ef7d",
        density: 30,
        animation: "wave",
      },
      lighting: {
        color: "#11998e",
        intensity: 0.9,
        pattern: "spotlight",
      },
      overlay: {
        pattern: "mesh",
        opacity: 0.2,
      },
    };
  }

  // Classical music atmosphere
  if (titleLower.includes("classical") || titleLower.includes("orchestra")) {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #2c3e50 0%, #4a6741 50%, #8b5a2b 100%)",
      particles: {
        enabled: true,
        color: "#f4d03f",
        density: 20,
        animation: "float",
      },
      lighting: {
        color: "#f4d03f",
        intensity: 0.6,
        pattern: "ambient",
      },
      overlay: {
        pattern: "lines",
        opacity: 0.15,
      },
    };
  }

  // Rock/Metal concerts
  if (titleLower.includes("rock") || titleLower.includes("metal")) {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #000000 0%, #434343 50%, #ff6b6b 100%)",
      particles: {
        enabled: true,
        color: "#ff6b6b",
        density: 60,
        animation: "pulse",
      },
      lighting: {
        color: "#ff6b6b",
        intensity: 1.0,
        pattern: "strobe",
      },
      overlay: {
        pattern: "dots",
        opacity: 0.4,
      },
    };
  }

  // Sports events
  if (category === "sports") {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      particles: {
        enabled: true,
        color: "#ff9a9e",
        density: 40,
        animation: "wave",
      },
      lighting: {
        color: "#ff9a9e",
        intensity: 0.7,
        pattern: "spotlight",
      },
      overlay: {
        pattern: "mesh",
        opacity: 0.25,
      },
    };
  }

  // Movie events
  if (category === "movies") {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      particles: {
        enabled: true,
        color: "#ffd700",
        density: 25,
        animation: "sparkle",
      },
      lighting: {
        color: "#ffd700",
        intensity: 0.5,
        pattern: "ambient",
      },
      overlay: {
        pattern: "stars",
        opacity: 0.2,
      },
    };
  }

  // Travel/Bus events
  if (category === "buses") {
    return {
      backgroundGradient:
        "linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00b894 100%)",
      particles: {
        enabled: true,
        color: "#74b9ff",
        density: 15,
        animation: "float",
      },
      lighting: {
        color: "#74b9ff",
        intensity: 0.4,
        pattern: "ambient",
      },
      overlay: {
        pattern: "lines",
        opacity: 0.1,
      },
    };
  }

  // Default event atmosphere
  return {
    backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    particles: {
      enabled: true,
      color: "#667eea",
      density: 30,
      animation: "float",
    },
    lighting: {
      color: "#667eea",
      intensity: 0.6,
      pattern: "ambient",
    },
    overlay: {
      pattern: "dots",
      opacity: 0.2,
    },
  };
};

export const useEventAtmosphere = (event: Event | null) => {
  const [atmosphere, setAtmosphere] = useState<AtmosphereConfig | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (event) {
      const config = getAtmosphereForEvent(event);
      setAtmosphere(config);
    } else {
      setAtmosphere(null);
    }
  }, [event]);

  const activateAtmosphere = () => setIsActive(true);
  const deactivateAtmosphere = () => setIsActive(false);

  return {
    atmosphere,
    isActive,
    activateAtmosphere,
    deactivateAtmosphere,
  };
};
