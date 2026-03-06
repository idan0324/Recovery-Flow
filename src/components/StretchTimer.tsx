import { useState, useEffect, useCallback, useRef } from 'react';
import { StretchingRoutine } from '@/types/recovery';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Check, RotateCcw } from 'lucide-react';
import { StretchIllustration } from './StretchIllustration';
import { getStretchIllustrationId } from '@/data/stretches';
import { getFoamRollingIllustrationId } from '@/data/foam-rolling';
import { AudioSettings, AudioSettingsState, VoiceGender } from './AudioSettings';
import { TransitionCountdown } from './TransitionCountdown';
import { InjuryWarningBanner } from './InjuryWarningBanner';
import { useAudioGuidance } from '@/hooks/useAudioGuidance';
import { StretchHelpLink } from './StretchHelpLink';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StretchTimerProps {
  routine: StretchingRoutine;
  onComplete: (totalActiveTime: number) => void;
  onBack: () => void;
}

type TimerPhase = 'stretching' | 'transition';
const TRANSITION_DURATION = 5;

const DEFAULT_AUDIO_SETTINGS: AudioSettingsState = {
  enabled: false,
  volume: 0.7,
  voiceGender: 'female',
};

export function StretchTimer({ routine, onComplete, onBack }: StretchTimerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(routine.stretches[0]?.duration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('stretching');
  const [transitionTime, setTransitionTime] = useState(TRANSITION_DURATION);
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [audioSettings, setAudioSettings] = useState<AudioSettingsState>(() => {
    const saved = localStorage.getItem('stretch-audio-settings');
    return saved !== null ? JSON.parse(saved) : DEFAULT_AUDIO_SETTINGS;
  });

  // Ref to track totalActiveTime without causing dependency updates
  const totalActiveTimeRef = useRef(0);

  // Keep the ref in sync with state
  useEffect(() => {
    totalActiveTimeRef.current = totalActiveTime;
  }, [totalActiveTime]);

  const audio = useAudioGuidance({ 
    enabled: audioSettings.enabled,
    volume: audioSettings.volume,
    voiceGender: audioSettings.voiceGender,
  });

  // IMPORTANT: useAudioGuidance returns a new object each render.
  // If we include `audio` in timer effect deps, the interval is torn down/recreated on *every* render,
  // which can lead to the countdown running extremely slowly on some devices.
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  const handleActivateAudio = useCallback(async () => {
    console.log('[StretchTimer] handleActivateAudio called');
    audio.initAudio(); // Initialize AudioContext for beeps
    await audio.activateSpeechSynthesis();
    // Speak confirmation immediately in user gesture context
    audio.speak('Audio enabled');
  }, [audio]);

  const handleTestVoice = useCallback(() => {
    console.log('[StretchTimer] handleTestVoice called');
    audio.testSpeak();
  }, [audio]);
  const currentStretch = routine.stretches[currentIndex];
  const nextStretch = routine.stretches[currentIndex + 1];
  const progress = currentStretch ? ((currentStretch.duration - timeLeft) / currentStretch.duration) * 100 : 0;
  const totalProgress = ((currentIndex + (progress / 100)) / routine.stretches.length) * 100;

  // Save audio preferences
  useEffect(() => {
    localStorage.setItem('stretch-audio-settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  // Background elapsed time tracker - starts when play is first pressed
  useEffect(() => {
    if (sessionStartTime === null) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Note: First stretch announcement is now handled in handleTogglePlay
  // to ensure it happens within user gesture context for Chrome


  const startTransition = useCallback(() => {
    if (currentIndex < routine.stretches.length - 1) {
      setPhase('transition');
      setTransitionTime(TRANSITION_DURATION);
      audioRef.current.announceTransition(routine.stretches[currentIndex + 1].name);
    } else {
      // Last stretch completed
      setIsPlaying(false);
      setIsCompleted(true);
      audioRef.current.announceComplete();
      onComplete(totalActiveTimeRef.current);
    }
  }, [currentIndex, routine.stretches, onComplete]);

  const moveToNextStretch = useCallback(() => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(routine.stretches[nextIndex].duration);
    setPhase('stretching');
    // Announce the new stretch
    setTimeout(() => {
      audioRef.current.announceStretch(routine.stretches[nextIndex].name);
    }, 300);
  }, [currentIndex, routine.stretches]);

  const skipToNext = useCallback(() => {
    audioRef.current.stopAudio();
    if (phase === 'transition') {
      moveToNextStretch();
    } else if (currentIndex < routine.stretches.length - 1) {
      // Track the time spent on this stretch before skipping
      const timeSpent = (routine.stretches[currentIndex]?.duration || 0) - timeLeft;
      setTotalActiveTime(prev => prev + timeSpent);
      startTransition();
    } else {
      // Track time for last stretch
      const timeSpent = (routine.stretches[currentIndex]?.duration || 0) - timeLeft;
      const finalTime = totalActiveTimeRef.current + timeSpent;
      setTotalActiveTime(finalTime);
      setIsPlaying(false);
      setIsCompleted(true);
      audioRef.current.announceComplete();
      onComplete(finalTime);
    }
  }, [phase, currentIndex, routine.stretches, timeLeft, moveToNextStretch, startTransition, onComplete]);

  const prevStretch = useCallback(() => {
    audioRef.current.stopAudio();
    if (phase === 'transition') {
      // If in transition, go back to current stretch
      setPhase('stretching');
      setTimeLeft(routine.stretches[currentIndex].duration);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setTimeLeft(routine.stretches[currentIndex - 1].duration);
      setPhase('stretching');
      audioRef.current.announceStretch(routine.stretches[currentIndex - 1].name);
    }
  }, [currentIndex, routine.stretches, phase]);

  const resetCurrentStretch = useCallback(() => {
    audioRef.current.stopAudio();
    setIsPlaying(false);
    setTimeLeft(routine.stretches[currentIndex]?.duration || 0);
    if (phase === 'transition') {
      setPhase('stretching');
    }
  }, [currentIndex, routine.stretches, phase]);

  // Main timer effect for stretching phase
  useEffect(() => {
    if (!isPlaying || phase !== 'stretching') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        
        const newTime = prev - 1;
        
        // Track active stretching time
        setTotalActiveTime(t => t + 1);
        
        // Play countdown beeps for last 3 seconds
        if (newTime <= 3 && newTime > 0) {
          audioRef.current.playCountdownBeep(newTime);
        }
        
        if (newTime <= 0) {
          audioRef.current.playCountdownBeep(0);
          startTransition();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, phase, startTransition]);

  // Timer effect for transition phase
  useEffect(() => {
    if (!isPlaying || phase !== 'transition' || transitionTime <= 0) return;

    const interval = setInterval(() => {
      setTransitionTime(prev => {
        const newTime = prev - 1;
        
        // Play beep for last 3 seconds of transition
        if (newTime <= 3 && newTime > 0) {
          audioRef.current.playCountdownBeep(newTime);
        }
        
        if (newTime <= 0) {
          audioRef.current.playCountdownBeep(0);
          moveToNextStretch();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, phase, transitionTime, moveToNextStretch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Warn user before refreshing/closing during an active session
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isPlaying || totalActiveTime > 0) {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome to show the dialog
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isPlaying, totalActiveTime]);
  const formatElapsedDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    console.log('[StretchTimer] handleTogglePlay, isPlaying:', isPlaying, 'phase:', phase);
    if (!isPlaying && phase === 'stretching') {
      // Start background session timer if not already started
      if (sessionStartTime === null) {
        setSessionStartTime(Date.now());
      }
      // Initialize audio context on first play (user gesture required for AudioContext)
      audio.initAudio();
      // Starting - announce current stretch IMMEDIATELY in user gesture context
      console.log('[StretchTimer] Announcing stretch:', currentStretch?.name);
      audio.announceStretch(currentStretch?.name || '');
    }
    setIsPlaying(!isPlaying);
  };

  // Completion is now handled by parent component via onComplete callback
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative">
      {/* Injury warning banner */}
      {routine.injuryWarnings && routine.injuryWarnings.length > 0 && (
        <InjuryWarningBanner warnings={routine.injuryWarnings} />
      )}

      {/* Audio settings */}
      <div className="w-full flex justify-end mb-4">
        <AudioSettings 
          settings={audioSettings} 
          onSettingsChange={setAudioSettings}
          onActivateAudio={handleActivateAudio}
          onTestVoice={handleTestVoice}
        />
      </div>

      {/* Overall progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Stretch {currentIndex + 1} of {routine.stretches.length}</span>
          <div className="flex items-center gap-3">
            {sessionStartTime && (
              <span className="flex items-center gap-1.5 font-mono text-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {formatElapsedDisplay(elapsedTime)}
              </span>
            )}
            <span>{Math.round(totalProgress)}% complete</span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Transition countdown or current stretch */}
      {phase === 'transition' && nextStretch ? (
        <TransitionCountdown nextStretch={nextStretch} secondsLeft={transitionTime} />
      ) : (
        <>
          {/* Timer and illustration side by side on mobile */}
          <div className="flex flex-row items-center justify-start gap-6 mb-4 w-full">
            {/* Current stretch timer - slightly bigger */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0">
              {/* Outer glow effect */}
              <div 
                className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${isPlaying ? 'opacity-40' : 'opacity-30 animate-pulse-soft'}`}
                style={{ 
                  background: `conic-gradient(from 0deg, hsl(212 80% 55% / ${progress / 100}) 0%, hsl(225 70% 60% / ${progress / 100}) ${progress}%, transparent ${progress}%)`,
                }}
              />
              
              {/* Timer ring SVG */}
              <svg className={`w-full h-full transform -rotate-90 relative z-10 ${!isPlaying ? 'animate-pulse-soft' : ''}`} viewBox="0 0 192 192">
                <defs>
                  {/* Gradient for progress arc */}
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(212, 85%, 55%)" />
                    <stop offset="50%" stopColor="hsl(220, 80%, 60%)" />
                    <stop offset="100%" stopColor="hsl(230, 75%, 65%)" />
                  </linearGradient>
                  {/* Glow filter */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  {/* Inner shadow for depth */}
                  <filter id="innerShadow">
                    <feOffset dx="0" dy="1"/>
                    <feGaussianBlur stdDeviation="1" result="offset-blur"/>
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                    <feFlood floodColor="hsl(0, 0%, 0%)" floodOpacity="0.3" result="color"/>
                    <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                    <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                  </filter>
                </defs>
                
                {/* Background track */}
                <circle
                  cx="96"
                  cy="96"
                  r="82"
                  fill="none"
                  stroke="hsl(var(--muted) / 0.5)"
                  strokeWidth="14"
                  filter="url(#innerShadow)"
                />
                
                {/* Progress arc with glow */}
                <circle
                  cx="96"
                  cy="96"
                  r="82"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 82}
                  strokeDashoffset={2 * Math.PI * 82 * (1 - progress / 100)}
                  className="transition-all duration-300"
                  filter="url(#glow)"
                />
              </svg>
              
              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 uppercase tracking-wider">remaining</span>
              </div>
            </div>

            {/* Current stretch illustration - smaller on mobile */}
            <div className="animate-fade-up flex-shrink-0" key={`illustration-${currentIndex}`}>
              <div className="w-28 h-28 sm:w-32 sm:h-32 p-3 rounded-2xl bg-accent/30 border border-primary/20 flex items-center justify-center">
                <StretchIllustration 
                  stretchId={
                    currentStretch?.id?.startsWith('foam-roll') 
                      ? getFoamRollingIllustrationId(currentStretch?.id || '')
                      : getStretchIllustrationId(currentStretch?.id || '')
                  } 
                  isActive={isPlaying}
                />
              </div>
              {/* Help link - opens tutorial in new tab, pauses timer */}
              <div className="mt-1 flex justify-center">
                <StretchHelpLink 
                  stretchId={currentStretch?.id || ''} 
                  onClickBeforeNavigate={() => setIsPlaying(false)}
                />
              </div>
            </div>
          </div>

          {/* Current stretch info */}
          <div className="text-center mb-4 animate-fade-up" key={currentIndex}>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
              {currentStretch?.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {currentStretch?.description}
            </p>
          </div>
        </>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Previous button */}
        <Button
          onClick={prevStretch}
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
          disabled={currentIndex === 0 && phase === 'stretching'}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {/* Reset button with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full"
              title="Reset current stretch"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Timer?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset the current stretch timer back to the beginning. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={resetCurrentStretch}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Play/Pause button */}
        <Button
          onClick={handleTogglePlay}
          variant="hero"
          size="xl"
          className="w-16 h-16 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </Button>
        
        {/* Next button */}
        <Button
          onClick={skipToNext}
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Upcoming stretches (only show during stretching phase) */}
      {phase === 'stretching' && currentIndex < routine.stretches.length - 1 && (
        <div className="mt-6 w-full">
          <p className="text-xs text-muted-foreground mb-2">Up next</p>
          <div className="glass-card rounded-xl p-3">
            <p className="font-medium text-foreground text-sm">
              {routine.stretches[currentIndex + 1]?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {routine.stretches[currentIndex + 1]?.duration} seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
