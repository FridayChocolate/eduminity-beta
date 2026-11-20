import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type SoundStyle = 
  | "none"
  | "soft-click"
  | "hard-beat"
  | "pop"
  | "mechanical"
  | "retro";

interface SoundOption {
  id: SoundStyle;
  name: string;
  description: string;
}

export const soundOptions: SoundOption[] = [
  { id: "none", name: "No Sound", description: "Silent clicks" },
  { id: "soft-click", name: "Soft Click", description: "Gentle tap sound" },
  { id: "hard-beat", name: "Hard Beat", description: "Punchy bass hit" },
  { id: "pop", name: "Pop", description: "Bubbly pop sound" },
  { id: "mechanical", name: "Mechanical", description: "Keyboard-like click" },
  { id: "retro", name: "Retro", description: "8-bit game sound" },
];

interface SoundContextType {
  soundStyle: SoundStyle;
  setSoundStyle: (style: SoundStyle) => void;
  playClickSound: () => void;
  volume: number;
  setVolume: (vol: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Sound generators using Web Audio API for satisfying clicks
const generateSoftClick = (ctx: AudioContext, volume: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.3 * volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
};

const generateHardBeat = (ctx: AudioContext, volume: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
  
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.5 * volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
};

const generatePop = (ctx: AudioContext, volume: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.02);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
  
  gain.gain.setValueAtTime(0.4 * volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
};

const generateMechanical = (ctx: AudioContext, volume: number) => {
  // Create white noise burst
  const bufferSize = ctx.sampleRate * 0.02;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  filter.type = "highpass";
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  
  noiseGain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  
  noise.start(ctx.currentTime);
  
  // Add a click tone
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(4000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.015);
  
  oscGain.gain.setValueAtTime(0.2 * volume, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
};

const generateRetro = (ctx: AudioContext, volume: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = "square";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(660, ctx.currentTime + 0.03);
  osc.frequency.setValueAtTime(440, ctx.currentTime + 0.06);
  
  gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
  gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.09);
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundStyle, setSoundStyleState] = useState<SoundStyle>(() => {
    const stored = localStorage.getItem("eduminity-sound-style");
    return (stored as SoundStyle) || "soft-click";
  });

  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem("eduminity-sound-volume");
    return stored ? parseFloat(stored) : 0.5;
  });

  const setSoundStyle = (style: SoundStyle) => {
    setSoundStyleState(style);
    localStorage.setItem("eduminity-sound-style", style);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem("eduminity-sound-volume", vol.toString());
  };

  const playClickSound = useCallback(() => {
    if (soundStyle === "none") return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      switch (soundStyle) {
        case "soft-click":
          generateSoftClick(ctx, volume);
          break;
        case "hard-beat":
          generateHardBeat(ctx, volume);
          break;
        case "pop":
          generatePop(ctx, volume);
          break;
        case "mechanical":
          generateMechanical(ctx, volume);
          break;
        case "retro":
          generateRetro(ctx, volume);
          break;
      }
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }, [soundStyle, volume]);

  // Add global click listener for interactive elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickableElements = ["BUTTON", "A", "INPUT", "SELECT", "LABEL"];
      const isClickable = 
        clickableElements.includes(target.tagName) ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest("[role='menuitem']") ||
        target.closest("[role='option']") ||
        target.closest("[data-radix-collection-item]") ||
        target.classList.contains("cursor-pointer");
      
      if (isClickable) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playClickSound]);

  return (
    <SoundContext.Provider value={{ soundStyle, setSoundStyle, playClickSound, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};
