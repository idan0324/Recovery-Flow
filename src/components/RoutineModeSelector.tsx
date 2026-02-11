import { Button } from '@/components/ui/button';
import { Timer, ListChecks, ArrowLeft } from 'lucide-react';

export type RoutineMode = 'guided' | 'checklist';

interface RoutineModeSelectorProps {
  onSelectMode: (mode: RoutineMode) => void;
  onBack: () => void;
  routineName?: string;
  stretchCount: number;
  totalDuration: number;
}

export function RoutineModeSelector({ 
  onSelectMode, 
  onBack,
  routineName,
  stretchCount,
  totalDuration
}: RoutineModeSelectorProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto animate-fade-up">
      <button 
        onClick={onBack} 
        className="self-start flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
        {routineName || 'Your Routine'}
      </h2>
      <p className="text-muted-foreground mb-8 text-center">
        {stretchCount} exercises · {formatDuration(totalDuration)}
      </p>

      <p className="text-sm text-muted-foreground mb-4">Choose your mode:</p>

      <div className="grid gap-4 w-full">
        {/* Guided Timer Mode */}
        <button
          onClick={() => onSelectMode('guided')}
          className="glass-card rounded-2xl p-6 text-left hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Timer className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Guided Timer</h3>
              <p className="text-sm text-muted-foreground">
                Auto-advances through each stretch with a countdown timer. Perfect for staying on track.
              </p>
            </div>
          </div>
        </button>

        {/* Checklist Mode */}
        <button
          onClick={() => onSelectMode('checklist')}
          className="glass-card rounded-2xl p-6 text-left hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ListChecks className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Checklist</h3>
              <p className="text-sm text-muted-foreground">
                See all stretches at once and check them off at your own pace. Great for self-paced sessions.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
