import { useState, useEffect, useCallback } from 'react';
import { StretchingRoutine } from '@/types/recovery';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { StretchIllustration } from './StretchIllustration';
import { getStretchIllustrationId } from '@/data/stretches';
import { getFoamRollingIllustrationId } from '@/data/foam-rolling';
import { Progress } from '@/components/ui/progress';
import { StretchHelpLink } from './StretchHelpLink';
import { useAudioGuidance } from '@/hooks/useAudioGuidance';


interface StretchChecklistProps {
  routine: StretchingRoutine;
  onComplete: (totalActiveTime: number) => void;
  onBack: () => void;
}

export function StretchChecklist({ routine, onComplete, onBack }: StretchChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('checklist-audio-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const progress = (checkedItems.size / routine.stretches.length) * 100;

  // Audio guidance - beeps only (no voice)
  const { playTransitionChime, initAudio } = useAudioGuidance({ 
    enabled: audioEnabled, 
    volume: 0.7,
    voiceGender: 'none' // Beeps only, no voice
  });

  // Save audio preference
  useEffect(() => {
    localStorage.setItem('checklist-audio-enabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  const handleToggleAudio = () => {
    if (!audioEnabled) {
      initAudio(); // Initialize on enable
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleTestBeep = () => {
    initAudio();
    playTransitionChime();
  };

  // Background elapsed time tracker - starts immediately on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);


  // Per-stretch timer logic
  useEffect(() => {
    if (activeTimer === null || isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete - play chime and auto-check the item
          playTransitionChime();
          const newChecked = new Set(checkedItems);
          newChecked.add(activeTimer);
          setCheckedItems(newChecked);
          setActiveTimer(null);
          
          // Check if all items are now completed
          if (newChecked.size === routine.stretches.length) {
            const finalElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
            setTimeout(() => {
              setIsCompleted(true);
              onComplete(finalElapsed);
            }, 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isPaused, timeRemaining, checkedItems, routine.stretches.length, onComplete, sessionStartTime, playTransitionChime]);

  const startTimer = useCallback((index: number, duration: number) => {
    // Init audio on first user interaction
    initAudio();
    
    if (activeTimer === index) {
      // Toggle pause
      setIsPaused(prev => !prev);
    } else {
      // Start new timer
      setActiveTimer(index);
      setTimeRemaining(duration);
      setIsPaused(false);
    }
  }, [activeTimer, initAudio]);

  const resetTimer = useCallback((index: number, duration: number) => {
    if (activeTimer === index) {
      setTimeRemaining(duration);
      setIsPaused(false);
    }
  }, [activeTimer]);

  const toggleItem = (index: number) => {
    // Init audio on first user interaction
    initAudio();
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
      // Stop timer if checking manually
      if (activeTimer === index) {
        setActiveTimer(null);
      }
    }
    setCheckedItems(newChecked);

    // Check if all items are completed
    if (newChecked.size === routine.stretches.length) {
      playTransitionChime();
      const finalElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setTimeout(() => {
        setIsCompleted(true);
        onComplete(finalElapsed);
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
  };

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Completion is now handled by parent component via onComplete callback

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm pb-4 z-10">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
          <span>{checkedItems.size} of {routine.stretches.length} completed</span>
          <div className="flex items-center gap-2">
            {/* Audio toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleAudio}
              className={`h-8 px-2 gap-1.5 ${audioEnabled ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* Test beep button - only show when audio is enabled */}
            {audioEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestBeep}
                className="h-8 px-2 text-xs"
              >
                Test
              </Button>
            )}
            <span className="flex items-center gap-1.5 font-mono text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {formatTimerDisplay(elapsedTime)}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stretch list */}
      <div className="space-y-3 pb-6">
        {routine.stretches.map((stretch, index) => {
          const isChecked = checkedItems.has(index);
          const isTimerActive = activeTimer === index;
          const timerProgress = isTimerActive ? ((stretch.duration - timeRemaining) / stretch.duration) * 100 : 0;
          const illustrationId = stretch.id?.startsWith('foam-roll')
            ? getFoamRollingIllustrationId(stretch.id || '')
            : getStretchIllustrationId(stretch.id || '');

          return (
            <div
              key={`${stretch.id}-${index}`}
              className={`glass-card rounded-xl p-4 transition-all duration-300 ${
                isChecked ? 'opacity-60 bg-muted/50' : isTimerActive ? 'border-primary/50 shadow-glow' : 'hover:border-primary/30'
              }`}
            >
              {/* Timer progress bar */}
              {isTimerActive && (
                <div className="mb-3 -mt-1">
                  <Progress value={timerProgress} className="h-1" />
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                {/* Top row: Checkbox + Illustration */}
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="pt-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(index)}
                      className="w-6 h-6"
                    />
                  </div>

                  {/* Illustration - same size, centered */}
                  <div className="flex-1 flex justify-center">
                    <div className={`relative w-36 h-36 rounded-xl bg-accent/30 border border-primary/20 p-4 flex items-center justify-center transition-all ${
                      isChecked ? 'grayscale' : ''
                    }`}>
                      <StretchIllustration 
                        stretchId={illustrationId} 
                        isActive={!isChecked}
                      />
                    </div>
                  </div>
                </div>

                {/* Text and controls below */}
                <div className="px-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-foreground ${
                      isChecked ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {stretch.name}
                    </h3>
                    {/* Help link - next to title for visibility */}
                    {!isChecked && (
                      <StretchHelpLink 
                        stretchId={stretch.id} 
                        onClickBeforeNavigate={() => {
                          if (isTimerActive) {
                            setIsPaused(true);
                          }
                        }}
                      />
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed mb-3 ${
                    isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {stretch.description}
                  </p>
                  
                  {/* Timer controls */}
                  {!isChecked && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isTimerActive ? "default" : "outline"}
                        size="lg"
                        className={`h-11 px-5 text-base ${isTimerActive ? 'gradient-hero' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startTimer(index, stretch.duration);
                        }}
                      >
                        {isTimerActive ? (
                          isPaused ? (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              {formatTimerDisplay(timeRemaining)}
                            </>
                          ) : (
                            <>
                              <Pause className="w-5 h-5 mr-2" />
                              {formatTimerDisplay(timeRemaining)}
                            </>
                          )
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            {formatTime(stretch.duration)}
                          </>
                        )}
                      </Button>
                      
                      {isTimerActive && (
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-11 w-11 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetTimer(index, stretch.duration);
                          }}
                        >
                          <RotateCw className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {isChecked && (
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                      {formatTime(stretch.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mark all complete button */}
      {checkedItems.size < routine.stretches.length && (
        <div className="sticky bottom-4 flex justify-center">
          <Button
            onClick={() => {
              initAudio();
              playTransitionChime();
              
              setActiveTimer(null);
              const allIndexes = new Set(routine.stretches.map((_, i) => i));
              setCheckedItems(allIndexes);
              
              const finalElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
              setTimeout(() => {
                setIsCompleted(true);
                onComplete(finalElapsed);
              }, 500);
            }}
            variant="outline"
            size="sm"
            className="bg-background/95 backdrop-blur-sm"
          >
            Mark all complete
          </Button>
        </div>
      )}
    </div>
  );
}
