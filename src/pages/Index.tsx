import { useState, useEffect, useCallback } from 'react';
import { useRecovery, FoamRollingOptions } from '@/hooks/useRecovery';
import { SportSelector } from '@/components/SportSelector';
import { BodyMap } from '@/components/BodyMap';
import { StretchTimer } from '@/components/StretchTimer';
import { StretchChecklist } from '@/components/StretchChecklist';
import { RoutineModeSelector, RoutineMode } from '@/components/RoutineModeSelector';
import { StreakDisplay } from '@/components/StreakDisplay';
import { CalendarView } from '@/components/CalendarView';
import { CustomRoutineBuilder } from '@/components/CustomRoutineBuilder';
import { DataBackup } from '@/components/DataBackup';
import { InjuryInput } from '@/components/InjuryInput';
import { DurationSettings } from '@/components/DurationSettings';
import { PostSessionFeedback } from '@/components/PostSessionFeedback';
import { WeeklySummary } from '@/components/WeeklySummary';
import { NameInput } from '@/components/NameInput';
import { SettingsDialog } from '@/components/SettingsDialog';
import { CelebrationScreen } from '@/components/CelebrationScreen';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, ArrowLeft, Sparkles, Heart, Calendar, Dumbbell, TrendingUp, Settings } from 'lucide-react';
import { StretchingRoutine, SessionFeedback } from '@/types/recovery';

type Step = 'home' | 'sport' | 'soreness' | 'mode-select' | 'routine' | 'celebration' | 'feedback' | 'history' | 'custom';

const Index = () => {
  const [step, setStep] = useState<Step>('home');
  const [routine, setRoutine] = useState<StretchingRoutine | null>(null);
  const [routineMode, setRoutineMode] = useState<RoutineMode>('guided');
  const [routineOrigin, setRoutineOrigin] = useState<'auto' | 'custom'>('auto');
  const [sessionDuration, setSessionDuration] = useState(12);
  const [stretchDuration, setStretchDuration] = useState(45);
  const [sessionActiveTime, setSessionActiveTime] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Foam rolling state
  const [includeFoamRolling, setIncludeFoamRolling] = useState(false);
  const [foamRollingDuration, setFoamRollingDuration] = useState(6);
  const [foamRollingHoldDuration, setFoamRollingHoldDuration] = useState(45);

  const {
    profile,
    customStretches,
    setName,
    setSport,
    toggleSorenessArea,
    generateRoutine,
    completeSessionWithFeedback,
    
    saveRoutine,
    deleteRoutine,
    addInjury,
    removeInjury,
    addCustomStretch,
    removeCustomStretch,
    resetProfile,
    clearOldSessions
  } = useRecovery();

  // Show name input if user hasn't set their name yet
  const needsName = !profile.name;

  // Warn user before leaving during an active stretch session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === 'routine') {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  // Check if user has sessions to show summary
  const hasSessions = (profile.completedSessions?.length || 0) > 0;

  const handleStartSession = () => {
    setStep('sport');
  };

  const handleSportNext = () => {
    setStep('soreness');
  };

  const handleGenerateRoutine = () => {
    const foamRollingOptions: FoamRollingOptions | undefined = includeFoamRolling ? {
      enabled: true,
      duration: foamRollingDuration,
      holdDuration: foamRollingHoldDuration
    } : undefined;
    const newRoutine = generateRoutine(sessionDuration, stretchDuration, foamRollingOptions);
    setRoutine(newRoutine);
    setRoutineOrigin('auto');
    setStep('mode-select');
  };

  const handleSessionComplete = (totalActiveTime: number) => {
    setSessionActiveTime(totalActiveTime);
    setStep('celebration'); // Show celebration first, then feedback
  };

  const handleCelebrationComplete = useCallback(() => {
    setStep('feedback');
  }, []);

  const handleBack = () => {
    if (step === 'sport') setStep('home');
    else if (step === 'soreness') setStep('sport');
    else if (step === 'mode-select') {
      // Navigate back based on where the routine originated
      if (routineOrigin === 'custom') {
        setStep('custom');
      } else {
        setStep('soreness');
      }
    }
    else if (step === 'routine') setStep('home');
    else if (step === 'celebration') setStep('home');
    else if (step === 'feedback') setStep('home');
    else if (step === 'history') setStep('home');
    else if (step === 'custom') setStep('home');
    if (step !== 'mode-select' && step !== 'feedback' && step !== 'celebration') setRoutine(null);
  };

  const handleCustomRoutineStart = (customRoutine: StretchingRoutine) => {
    setRoutine(customRoutine);
    setRoutineOrigin('custom');
    setStep('mode-select');
  };

  const handleModeSelect = (mode: RoutineMode) => {
    setRoutineMode(mode);
    setStep('routine');
  };

  const handleFeedbackSubmit = (feedback: SessionFeedback): boolean => {
    completeSessionWithFeedback(feedback);
    return feedback.totalActiveTime >= 5 * 60; // 5 minutes minimum
  };

  // Name Input Screen (first-time users)
  if (needsName) {
    return <NameInput onSubmit={setName} />;
  }

  // Celebration Screen
  if (step === 'celebration') {
    return (
      <CelebrationScreen 
        onComplete={handleCelebrationComplete} 
        duration={2500}
        userName={profile.name}
      />
    );
  }

  // Post-Session Feedback Screen
  if (step === 'feedback' && routine) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <PostSessionFeedback
          totalActiveTime={sessionActiveTime}
          stretches={routine.stretches}
          sorenessAreas={profile.sorenessAreas}
          focusAreas={routine.focusAreas}
          userName={profile.name}
          onSubmitFeedback={handleFeedbackSubmit}
          onNewSession={() => {
            setStep('home');
            setRoutine(null);
          }}
        />
      </div>
    );
  }

  // Custom Routine Builder
  if (step === 'custom') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <button onClick={handleBack} className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex-1 animate-fade-up">
          <CustomRoutineBuilder
            onStartRoutine={handleCustomRoutineStart}
            savedRoutines={profile.savedRoutines || []}
            onSaveRoutine={saveRoutine}
            onDeleteRoutine={deleteRoutine}
            customStretches={customStretches}
            onAddCustomStretch={addCustomStretch}
            onRemoveCustomStretch={removeCustomStretch}
          />
        </div>
      </div>
    );
  }

  // History View
  if (step === 'history') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <button onClick={handleBack} className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <h2 className="text-2xl font-bold text-foreground mb-6">Your Progress</h2>

        <div className="glass-card rounded-2xl p-6 animate-fade-up">
          <CalendarView
            completedDates={profile.completedDates || []}
            completedSessions={profile.completedSessions || []}
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak || 0}
          />
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Keep up the streak! Consistency is key to injury prevention.
          </p>
          
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Backup & Storage</h3>
            <DataBackup onClearOldSessions={clearOldSessions} />
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  if (step === 'home') {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all text-foreground hover:scale-105 z-10 shadow-md border border-border"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          currentName={profile.name || ''}
          onChangeName={setName}
          onResetData={resetProfile}
        />
        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center text-secondary-foreground bg-secondary">
          {/* Logo/Icon */}
          <div className="w-20 h-20 rounded-3xl gradient-hero flex items-center justify-center mb-6 shadow-glow animate-float text-primary-foreground">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-up text-foreground">
            RecoverFlow
          </h1>
          
          <p className="text-lg max-w-md mb-4 animate-fade-up text-muted-foreground" style={{ animationDelay: '0.1s' }}>
            Train hard. Recover harder.
          </p>

          {/* Weekly Summary Button */}
          {hasSessions && (
            <Button
              onClick={() => setShowWeeklySummary(true)}
              variant="outline"
              size="sm"
              className="mb-6 animate-fade-up shadow-glow border-primary/40 hover:border-primary/60 hover:shadow-[0_0_30px_hsl(212_80%_50%/0.3)]"
              style={{ animationDelay: '0.15s' }}
            >
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              Weekly Summary
            </Button>
          )}

          {/* Weekly Summary Dialog */}
          <Dialog open={showWeeklySummary} onOpenChange={setShowWeeklySummary}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="sr-only">Weekly Recovery Summary</DialogTitle>
              </DialogHeader>
              <WeeklySummary
                completedSessions={profile.completedSessions || []}
                onDismiss={() => setShowWeeklySummary(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Streak display */}
          <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <StreakDisplay
              currentStreak={profile.currentStreak}
              longestStreak={profile.longestStreak || 0}
              totalSessions={profile.totalSessions}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button onClick={handleStartSession} variant="hero" size="lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Recovery Session
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button onClick={() => setStep('history')} variant="outline" size="lg">
              <Calendar className="w-5 h-5 mr-2" />
              View Progress
            </Button>

            <Button onClick={() => setStep('custom')} variant="glass" size="lg">
              <Dumbbell className="w-5 h-5 mr-2" />
              Custom Routine
            </Button>
          </div>

          {/* Motivational text */}
          <p className="text-sm mt-8 max-w-sm animate-fade-up text-muted-foreground" style={{ animationDelay: '0.4s' }}>
            Just 5-15 minutes of stretching daily can reduce injury risk and improve performance.
          </p>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Made for athletes, by athletes 💪
          </p>
        </footer>
      </div>
    );
  }

  // Sport Selection
  if (step === 'sport') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <button onClick={handleBack} className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex-1 animate-fade-up">
          <SportSelector selected={profile.sport} onSelect={setSport} />
        </div>

        <div className="pt-6">
          <Button onClick={handleSportNext} variant="hero" size="lg" className="w-full" disabled={!profile.sport}>
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Soreness Selection
  if (step === 'soreness') {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <button onClick={handleBack} className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex-1 animate-fade-up space-y-6">
          <BodyMap selections={profile.sorenessAreas} onToggle={toggleSorenessArea} />
          
          {/* Injury input section */}
          <div className="glass-card rounded-2xl p-4">
            <InjuryInput injuries={profile.injuries} onAddInjury={addInjury} onRemoveInjury={removeInjury} />
          </div>

          {/* Duration settings */}
          <div className="glass-card rounded-2xl p-4">
            <DurationSettings
              sessionDuration={sessionDuration}
              stretchDuration={stretchDuration}
              onSessionDurationChange={setSessionDuration}
              onStretchDurationChange={setStretchDuration}
              includeFoamRolling={includeFoamRolling}
              onIncludeFoamRollingChange={setIncludeFoamRolling}
              foamRollingDuration={foamRollingDuration}
              onFoamRollingDurationChange={setFoamRollingDuration}
              foamRollingHoldDuration={foamRollingHoldDuration}
              onFoamRollingHoldDurationChange={setFoamRollingHoldDuration}
            />
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <Button onClick={handleGenerateRoutine} variant="hero" size="lg" className="w-full">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Routine
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {profile.sorenessAreas.length === 0 && profile.injuries.length === 0
              ? "Skip if nothing feels sore - we'll use your sport's focus areas"
              : profile.injuries.length > 0
              ? "Your routine will be adjusted for your injuries"
              : "Your routine will prioritize these areas"}
          </p>
        </div>
      </div>
    );
  }

  // Mode Selection
  if (step === 'mode-select' && routine) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <RoutineModeSelector
          onSelectMode={handleModeSelect}
          onBack={handleBack}
          routineName={routine.name}
          stretchCount={routine.stretches.length}
          totalDuration={routine.totalDuration}
        />
      </div>
    );
  }

  // Stretching Routine
  if (step === 'routine' && routine) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <button onClick={() => setShowCancelDialog(true)} className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Cancel Session
        </button>

        <div className="flex-1">
          {routineMode === 'guided' ? (
            <StretchTimer routine={routine} onComplete={handleSessionComplete} onBack={handleBack} />
          ) : (
            <StretchChecklist routine={routine} onComplete={handleSessionComplete} onBack={handleBack} />
          )}
        </div>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress won't be saved. Are you sure you want to cancel this stretching session?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Stretching</AlertDialogCancel>
              <AlertDialogAction onClick={handleBack}>Yes, Cancel</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
};

export default Index;
