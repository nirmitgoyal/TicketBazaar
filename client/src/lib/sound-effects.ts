/**
 * Sound effects utility for UI interactions
 * Uses authentic audio clips and procedural sounds for user interactions
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false; // Disabled by default
  private audioCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported");
      this.enabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return null;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn("Could not resume audio context");
        return null;
      }
    }

    return this.audioContext;
  }

  private createTone(
    frequency: number,
    duration: number,
    volume: number = 0.1,
    waveType: OscillatorType = "sine",
  ) {
    return new Promise<void>(async (resolve) => {
      const audioContext = await this.ensureAudioContext();
      if (!audioContext) {
        resolve();
        return;
      }

      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + 0.01,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        oscillator.onended = () => resolve();
      } catch (error) {
        console.warn("Error playing sound:", error);
        resolve();
      }
    });
  }

  private createFrequencySweep(
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number = 0.1,
  ) {
    return new Promise<void>(async (resolve) => {
      const audioContext = await this.ensureAudioContext();
      if (!audioContext) {
        resolve();
        return;
      }

      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sawtooth"; // More aggressive sound for horn effect
        oscillator.frequency.setValueAtTime(
          startFreq,
          audioContext.currentTime,
        );
        oscillator.frequency.exponentialRampToValueAtTime(
          endFreq,
          audioContext.currentTime + duration,
        );

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          audioContext.currentTime + 0.02,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        oscillator.onended = () => resolve();
      } catch (error) {
        console.warn("Error playing sound:", error);
        resolve();
      }
    });
  }

  // Load and cache audio files
  private async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Cache the failure so we don't keep trying
        this.audioCache.set(url, null as any);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      this.audioCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      // Cache the failure to avoid repeated attempts
      this.audioCache.set(url, null as any);
      return null;
    }
  }

  // Play audio buffer
  private async playAudioBuffer(
    buffer: AudioBuffer | null,
    volume: number = 0.8,
  ) {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext || !buffer) return;

    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = volume;

      source.start(0);
    } catch (error) {
      console.warn("Error playing audio buffer:", error);
    }
  }

  // Category-specific hover sounds for ticket cards
  async playTicketHover(category?: string, eventTitle?: string) {
    return; // Sounds disabled

    // Check for specific event audio first
    if (eventTitle?.toLowerCase().includes("arijit singh")) {
      const audioBuffer = await this.loadAudioFile(
        "/audio/arijit-singh-line.mp3",
      );
      if (audioBuffer) {
        await this.playAudioBuffer(audioBuffer, 0.6);
        return;
      }
    }

    // Check for IPL/cricket events
    if (
      eventTitle?.toLowerCase().includes("ipl") ||
      eventTitle?.toLowerCase().includes("cricket") ||
      category?.toLowerCase() === "sports"
    ) {
      const audioBuffer = await this.loadAudioFile("/audio/ipl-horn.mp3");
      if (audioBuffer) {
        await this.playAudioBuffer(audioBuffer, 0.7);
        return;
      }
    }

    // Check for music events
    if (
      category?.toLowerCase() === "music" ||
      category?.toLowerCase() === "concert"
    ) {
      const audioBuffer = await this.loadAudioFile("/audio/concert-crowd.mp3");
      if (audioBuffer) {
        await this.playAudioBuffer(audioBuffer, 0.5);
        return;
      }
    }

    // Fallback to procedural sounds if no audio files are available
    switch (category?.toLowerCase()) {
      case "sports":
      case "cricket":
        await this.createFrequencySweep(150, 800, 0.4, 0.12);
        break;
      case "music":
      case "concert":
        await this.createTone(440, 0.15, 0.05);
        break;
      default:
        await this.createTone(800, 0.1, 0.05);
    }
  }

  // Button hover sound
  async playButtonHover() {
    return; // Sounds disabled
  }

  // Click/tap sound
  async playClick() {
    return; // Sounds disabled
  }

  // Success sound
  async playSuccess() {
    return; // Sounds disabled
  }

  // Error sound
  async playError() {
    return; // Sounds disabled
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// React hook for sound effects
export function useSoundEffects() {
  return {
    playTicketHover: (category?: string, eventTitle?: string) =>
      soundManager.playTicketHover(category, eventTitle),
    playButtonHover: () => soundManager.playButtonHover(),
    playClick: () => soundManager.playClick(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: () => soundManager.isEnabled(),
  };
}
