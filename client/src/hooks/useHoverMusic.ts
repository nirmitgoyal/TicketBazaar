import { useRef, useCallback } from "react";
import { Event } from "@shared/schema";

// Get specific music file for each event based on its content
const getMusicFileForEvent = (event: Event): string => {
  const { title, category, venue } = event;
  const titleLower = title.toLowerCase();
  const venueLower = venue.toLowerCase();

  // Specific artist/event music mapping
  if (titleLower.includes("coldplay")) {
    return "/sounds/coldplay-preview.mp3"; // Coldplay signature sound
  }

  if (titleLower.includes("classical") || titleLower.includes("orchestra")) {
    return "/sounds/classical-orchestra.mp3"; // Classical music snippet
  }

  if (titleLower.includes("ipl") || titleLower.includes("cricket")) {
    return "/sounds/cricket-stadium.mp3"; // Cricket match atmosphere
  }

  if (titleLower.includes("football") || titleLower.includes("soccer")) {
    return "/sounds/football-stadium.mp3"; // Football crowd chants
  }

  if (
    titleLower.includes("bollywood") ||
    (category === "movies" && venueLower.includes("mumbai"))
  ) {
    return "/sounds/bollywood-music.mp3"; // Bollywood track snippet
  }

  if (titleLower.includes("rock") || titleLower.includes("metal")) {
    return "/sounds/rock-concert.mp3"; // Rock music preview
  }

  if (titleLower.includes("jazz")) {
    return "/sounds/jazz-club.mp3"; // Jazz instrumental
  }

  if (titleLower.includes("pop") || titleLower.includes("concert")) {
    return "/sounds/pop-concert.mp3"; // Pop music snippet
  }

  // Category-based defaults
  if (category === "sports") {
    return "/sounds/sports-arena.mp3"; // General sports atmosphere
  }

  if (category === "movies") {
    return "/sounds/cinema-theme.mp3"; // Movie theater ambience
  }

  if (category === "buses") {
    return "/sounds/travel-music.mp3"; // Travel/journey themed music
  }

  if (category === "events") {
    return "/sounds/live-event.mp3"; // General live event atmosphere
  }

  // Default fallback
  return "/sounds/default-event.mp3";
};

export const useHoverMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentEventRef = useRef<string | null>(null);

  const playEventMusic = useCallback((event: Event) => {
    return; // Music disabled
    const eventKey = `${event.id}-${event.title}`;

    // Don't restart if same event
    if (
      currentEventRef.current === eventKey &&
      audioRef.current &&
      !audioRef.current.paused
    ) {
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    currentEventRef.current = eventKey;

    // Get the specific music file for this event
    const musicFile = getMusicFileForEvent(event);

    // Create new audio instance
    audioRef.current = new Audio(musicFile);
    audioRef.current.volume = 0.4; // Set to 40% volume
    audioRef.current.loop = true; // Loop the 5-second clip

    // Play with error handling - fallback to Web Audio if file doesn't exist
    audioRef.current.play().catch((error) => {
      console.log("Audio file not found, using fallback tone");
      // If audio file doesn't exist, create a themed Web Audio tone
      createEventFallbackMusic(event);
    });
  }, []);

  const stopEventMusic = useCallback(() => {
    return; // Music disabled
  }, []);

  // Create unique fallback music for each specific event
  const createEventFallbackMusic = useCallback((event: Event) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Get unique frequencies based on event properties
      const { title, category } = event;
      const titleLower = title.toLowerCase();

      let frequencies: number[] = [];
      let waveType: OscillatorType = "sine";

      // Different sounds for different events
      if (titleLower.includes("coldplay")) {
        frequencies = [440, 554.37, 659.25]; // A major chord
        waveType = "sawtooth";
      } else if (titleLower.includes("ipl") || titleLower.includes("cricket")) {
        frequencies = [523.25, 659.25, 783.99]; // C major - energetic
        waveType = "square";
      } else if (category === "sports") {
        frequencies = [293.66, 369.99, 440]; // D major
        waveType = "square";
      } else if (category === "movies") {
        frequencies = [349.23, 440, 523.25]; // F major - cinematic
        waveType = "triangle";
      } else {
        frequencies = [440, 523.25, 659.25]; // Default A major
        waveType = "sine";
      }

      // Create the sound
      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = waveType;

        const startTime = audioContext.currentTime + index * 0.1;
        const volume = 0.05 - index * 0.01; // Decreasing volume for harmony

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 1.0);

        oscillator.start(startTime);
        oscillator.stop(startTime + 1.0);
      });
    } catch (error) {
      console.log("Audio not available");
    }
  }, []);

  // Enhanced: Create beautiful themed tones using Web Audio API (legacy fallback)
  const createHoverTone = useCallback((category: string) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create multiple oscillators for richer sound
      const createOscillator = (
        frequency: number,
        type: OscillatorType,
        volume: number,
        delay: number = 0,
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + delay + 0.1,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + delay + 0.8,
        );

        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.8);
      };

      // Different sound profiles for each category
      switch (category) {
        case "events":
          // Concert-like chord progression
          createOscillator(440, "sine", 0.05); // A4
          createOscillator(554.37, "sine", 0.03, 0.1); // C#5
          createOscillator(659.25, "sine", 0.02, 0.2); // E5
          break;

        case "sports":
          // Stadium-like energetic sound
          createOscillator(523.25, "square", 0.04); // C5
          createOscillator(659.25, "square", 0.03, 0.1); // E5
          createOscillator(783.99, "triangle", 0.02, 0.15); // G5
          break;

        case "movies":
          // Cinematic orchestral feel
          createOscillator(349.23, "sine", 0.06); // F4
          createOscillator(440, "sine", 0.04, 0.15); // A4
          createOscillator(523.25, "triangle", 0.02, 0.3); // C5
          break;

        case "buses":
          // Travel-themed gentle sound
          createOscillator(293.66, "triangle", 0.05); // D4
          createOscillator(369.99, "sine", 0.03, 0.2); // F#4
          break;

        default:
          // Default pleasant chord
          createOscillator(440, "sine", 0.04);
          createOscillator(554.37, "sine", 0.02, 0.1);
      }
    } catch (error) {
      console.log("Audio not available");
    }
  }, []);

  return {
    playEventMusic,
    stopEventMusic,
  };
};
