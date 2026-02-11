import { useCallback, useRef, useEffect, useState } from 'react';
import { selectSpeechSynthesisVoice } from '@/lib/tts/voiceSelection';

export type VoiceGender = 'female' | 'male' | 'none';

interface UseAudioGuidanceOptions {
  enabled: boolean;
  volume?: number;
  voiceGender?: VoiceGender;
}

// Helper to wait for voices to be available
const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let voices = synth.getVoices();
    
    if (voices.length > 0) {
      console.log('[TTS] Voices already loaded:', voices.length);
      resolve(voices);
      return;
    }
    
    // Poll for voices with timeout
    let attempts = 0;
    const maxAttempts = 40; // 2 seconds max
    
    const checkVoices = () => {
      voices = synth.getVoices();
      attempts++;
      
      if (voices.length > 0) {
        console.log('[TTS] Voices loaded after polling:', voices.length);
        resolve(voices);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.warn('[TTS] Voice loading timeout, proceeding with empty voices');
        resolve([]);
        return;
      }
      
      setTimeout(checkVoices, 50);
    };
    
    // Also listen for the event
    synth.onvoiceschanged = () => {
      voices = synth.getVoices();
      if (voices.length > 0) {
        console.log('[TTS] Voices loaded via event:', voices.length);
        resolve(voices);
      }
    };
    
    checkVoices();
  });
};

export function useAudioGuidance({ 
  enabled, 
  volume = 0.7,
  voiceGender = 'female'
}: UseAudioGuidanceOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isActivatedRef = useRef(false);
  const resumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load speech synthesis and voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    speechSynthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const voices = speechSynthRef.current?.getVoices() || [];
      if (voices.length > 0) {
        setVoicesLoaded(true);
        selectVoice(voices, voiceGender);
        console.log('[TTS] Initial voices loaded:', voices.length);
      }
    };
    
    // Try to load voices immediately
    loadVoices();
    
    // Chrome requires listening for voiceschanged event
    if (speechSynthRef.current) {
      speechSynthRef.current.onvoiceschanged = loadVoices;
    }
    
    return () => {
      speechSynthRef.current?.cancel();
      if (speechSynthRef.current) {
        speechSynthRef.current.onvoiceschanged = null;
      }
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
      }
    };
  }, []);

  // Update selected voice when gender changes
  useEffect(() => {
    if (!voicesLoaded || !speechSynthRef.current) return;
    const voices = speechSynthRef.current.getVoices();
    selectVoice(voices, voiceGender);
  }, [voiceGender, voicesLoaded]);

  // Select voice based on gender preference
  const selectVoice = (voices: SpeechSynthesisVoice[], gender: VoiceGender) => {
    if (voices.length === 0) return;
    
    // Filter English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    
    // Log available voices for debugging
    console.log('[TTS] Available English voices:', englishVoices.map(v => `${v.name} (${v.lang})`));
    
    if (englishVoices.length === 0) {
      // Fallback to any voice
      selectedVoiceRef.current = voices[0];
      console.log('[TTS] Selected fallback voice:', voices[0]?.name);
      return;
    }

    const { voice, debug } = selectSpeechSynthesisVoice(englishVoices, gender);
    selectedVoiceRef.current = voice || englishVoices[0];
    console.log('[TTS] Voice pick:', debug);
    console.log('[TTS] Final selected voice for', gender, ':', selectedVoiceRef.current?.name);
  };

  // Helper to safely speak without Chrome cancel→speak race condition.
  // IMPORTANT: Use a microtask (not setTimeout) to preserve transient user activation.
  const safeSpeak = useCallback((utterance: SpeechSynthesisUtterance) => {
    const synth = speechSynthRef.current;
    if (!synth) return;

    const doSpeak = () => {
      try {
        synth.speak(utterance);
      } catch (e) {
        console.warn('[TTS] speak threw:', e);
      }
    };

    // NOTE: On Chrome, calling cancel() and then speak() as part of the same gesture
    // can cause the NEW utterance to be immediately canceled. In your logs, synth.pending
    // appears to be "stuck" true, which made us cancel every time.
    //
    // So we avoid cancel() here and let SpeechSynthesis queue the utterance instead.
    console.log('[TTS] safeSpeak state:', {
      speaking: synth.speaking,
      pending: synth.pending,
      paused: synth.paused,
    });

    // Speak immediately (queues if something is already speaking)
    doSpeak();
  }, []);

  // Activate speech synthesis - MUST be called directly in user gesture handler
  const activateSpeechSynthesis = useCallback(async (): Promise<void> => {
    console.log('[TTS] activateSpeechSynthesis called, isActivated:', isActivatedRef.current);
    
    if (!speechSynthRef.current) {
      console.warn('[TTS] No speechSynthesis available');
      return;
    }

    // Wait for voices to be ready
    const voices = await waitForVoices();
    
    if (voices.length > 0 && !selectedVoiceRef.current) {
      selectVoice(voices, voiceGender);
    }

    // Create and speak a nearly-silent utterance to unlock Chrome
    const utterance = new SpeechSynthesisUtterance('.');
    utterance.volume = 0.01;
    utterance.rate = 2;
    utterance.lang = selectedVoiceRef.current?.lang || 'en-US';
    
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    
    console.log('[TTS] Activation utterance created, voice:', utterance.voice?.name || 'default');

    return new Promise((resolve) => {
      utterance.onend = () => {
        console.log('[TTS] Activation completed successfully');
        isActivatedRef.current = true;
        resolve();
      };

      utterance.onerror = (e) => {
        console.log('[TTS] Activation error:', e.error, '- still marking as activated');
        isActivatedRef.current = true;
        resolve();
      };

      // Don't cancel before activation - just speak immediately
      speechSynthRef.current!.speak(utterance);
      
      // Fallback timeout
      setTimeout(() => {
        if (!isActivatedRef.current) {
          console.log('[TTS] Activation timeout, marking as activated anyway');
          isActivatedRef.current = true;
          resolve();
        }
      }, 1000);
    });
  }, [voiceGender]);

  // Test speak function - for the Test button
  const testSpeak = useCallback(() => {
    console.log('[TTS] testSpeak called');
    
    if (!speechSynthRef.current) {
      console.warn('[TTS] No speechSynthesis for test');
      return;
    }
    
    // Try to get a voice if none selected
    if (!selectedVoiceRef.current) {
      const voices = speechSynthRef.current.getVoices();
      if (voices.length > 0) {
        selectVoice(voices, voiceGender);
      }
    }
    
    // Use more natural speech with pauses
    const utterance = new SpeechSynthesisUtterance('Testing... voice guidance.');
    utterance.lang = selectedVoiceRef.current?.lang || 'en-US';
    utterance.volume = volume;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = voiceGender === 'female' ? 1.0 : 1.05; // Female natural, male slightly higher
    
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
      console.log('[TTS] Test using voice:', selectedVoiceRef.current.name);
    } else {
      console.log('[TTS] Test using default browser voice');
    }
    
    utterance.onstart = () => console.log('[TTS] Test speech started');
    utterance.onend = () => console.log('[TTS] Test speech ended');
    utterance.onerror = (e) => console.warn('[TTS] Test speech error:', e.error);
    
    // Use safeSpeak to avoid cancel/speak race condition
    safeSpeak(utterance);
  }, [volume, voiceGender, safeSpeak]);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('[Audio] AudioContext created');
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
      console.log('[Audio] AudioContext resumed from suspended state');
    }
    return audioContextRef.current;
  }, []);

  // Expose initAudio for external calls during user gestures
  const initAudio = useCallback(() => {
    initAudioContext();
  }, [initAudioContext]);

  // Play a beep tone
  const playBeep = useCallback((frequency: number = 800, duration: number = 150, type: OscillatorType = 'sine') => {
    if (!enabled) return;
    
    try {
      const ctx = initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [enabled, volume, initAudioContext]);

  // Play countdown beep (higher pitch for final beep)
  const playCountdownBeep = useCallback((secondsLeft: number) => {
    if (!enabled) return;
    
    if (secondsLeft <= 3 && secondsLeft > 0) {
      playBeep(600, 100, 'sine');
    } else if (secondsLeft === 0) {
      // Final beep - higher and longer
      playBeep(900, 200, 'sine');
    }
  }, [enabled, playBeep]);

  // Play transition chime (pleasant two-tone)
  const playTransitionChime = useCallback(() => {
    if (!enabled) return;
    
    try {
      const ctx = initAudioContext();
      const now = ctx.currentTime;
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 523.25; // C5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(volume * 0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);
      
      // Second note (higher)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 659.25; // E5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(volume * 0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [enabled, volume, initAudioContext]);

  // Speak text using Web Speech API - DIRECTLY speaks without delay for user gesture context
  const speak = useCallback((text: string, rate: number = 0.85) => {
    console.log('[TTS] speak called:', text);
    
    // Skip speech if voice is set to 'none' (beeps only mode)
    if (voiceGender === 'none') {
      console.log('[TTS] speak skipped - voice set to none (beeps only)');
      return;
    }
    
    if (!enabled || !speechSynthRef.current) {
      console.log('[TTS] speak aborted - enabled:', enabled, 'synth:', !!speechSynthRef.current);
      return;
    }
    
    // Ensure we have a voice selected
    if (!selectedVoiceRef.current) {
      const voices = speechSynthRef.current.getVoices();
      console.log('[TTS] No voice selected, attempting reload, got:', voices.length);
      if (voices.length > 0) {
        selectVoice(voices, voiceGender);
      }
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoiceRef.current?.lang || 'en-US';
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = voiceGender === 'female' ? 1.0 : 1.05; // Female natural, male slightly higher
    
    // Use the selected voice, or fall back to default
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
      console.log('[TTS] Using voice:', selectedVoiceRef.current.name);
    } else {
      console.log('[TTS] Using default browser voice');
    }
    
    // Chrome resume workaround - keeps speech from getting stuck
    utterance.onstart = () => {
      console.log('[TTS] Speech started:', text);
      // Set up periodic resume to prevent Chrome from pausing
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
      }
      resumeIntervalRef.current = setInterval(() => {
        if (speechSynthRef.current?.speaking) {
          speechSynthRef.current.resume();
        }
      }, 10000);
    };
    
    utterance.onend = () => {
      console.log('[TTS] Speech ended:', text);
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
    };
    
    // Handle errors
    utterance.onerror = (e) => {
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
      // 'interrupted' and 'canceled' are not real errors
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[TTS] Speech error:', e.error);
      }
    };
    
    // Use safeSpeak to avoid cancel/speak race condition
    safeSpeak(utterance);
  }, [enabled, volume, voiceGender, safeSpeak]);

  // Announce stretch name with encouraging tone
  const announceStretch = useCallback((stretchName: string) => {
    if (!enabled) return;
    speak(stretchName, 0.85);
  }, [enabled, speak]);

  // Announce transition with context
  const announceTransition = useCallback((nextStretchName: string) => {
    if (!enabled) return;
    playTransitionChime();
    setTimeout(() => {
      speak(`Next up: ${nextStretchName}`, 0.85);
    }, 600);
  }, [enabled, playTransitionChime, speak]);

  // Announce completion with celebration
  const announceComplete = useCallback(() => {
    if (!enabled) return;
    playTransitionChime();
    setTimeout(() => {
      speak('Excellent work! Your routine is complete.', 0.8);
    }, 600);
  }, [enabled, playTransitionChime, speak]);

  // Stop all audio
  const stopAudio = useCallback(() => {
    speechSynthRef.current?.cancel();
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  return {
    initAudio,
    playBeep,
    playCountdownBeep,
    playTransitionChime,
    speak,
    announceStretch,
    announceTransition,
    announceComplete,
    stopAudio,
    activateSpeechSynthesis,
    testSpeak,
  };
}
