import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Clock, Timer, Cylinder } from 'lucide-react';

interface DurationSettingsProps {
  sessionDuration: number; // in minutes (7-15)
  stretchDuration: number; // in seconds (25-60)
  onSessionDurationChange: (value: number) => void;
  onStretchDurationChange: (value: number) => void;
  // Foam rolling options
  includeFoamRolling?: boolean;
  onIncludeFoamRollingChange?: (value: boolean) => void;
  foamRollingDuration?: number; // in minutes (3-10)
  onFoamRollingDurationChange?: (value: number) => void;
  foamRollingHoldDuration?: number; // in seconds (20-45)
  onFoamRollingHoldDurationChange?: (value: number) => void;
}

export function DurationSettings({
  sessionDuration,
  stretchDuration,
  onSessionDurationChange,
  onStretchDurationChange,
  includeFoamRolling = false,
  onIncludeFoamRollingChange,
  foamRollingDuration = 5,
  onFoamRollingDurationChange,
  foamRollingHoldDuration = 30,
  onFoamRollingHoldDurationChange,
}: DurationSettingsProps) {
  const totalTime = sessionDuration + (includeFoamRolling ? foamRollingDuration : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Session Settings
        </h3>
        <span className="text-xs text-muted-foreground">
          Total: ~{totalTime} min
        </span>
      </div>

      {/* Recommended defaults notice */}
      <p className="text-xs text-muted-foreground bg-accent/30 rounded-lg px-3 py-2">
        ✨ These are recommended defaults for optimal recovery. Feel free to adjust to your needs.
      </p>

      {/* Stretching Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Timer className="w-4 h-4 text-primary" />
          Stretching
        </div>

        {/* Session Duration */}
        <div className="space-y-3 pl-6">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">
              Total Stretch Time
            </label>
            <span className="text-sm font-medium text-foreground">
              {sessionDuration} min
            </span>
          </div>
          <Slider
            value={[sessionDuration]}
            onValueChange={(values) => onSessionDurationChange(values[0])}
            min={7}
            max={15}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>7 min</span>
            <span>15 min</span>
          </div>
        </div>

        {/* Stretch Duration */}
        <div className="space-y-3 pl-6">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">
              Each Stretch Hold
            </label>
            <span className="text-sm font-medium text-foreground">
              {stretchDuration} sec
            </span>
          </div>
          <Slider
            value={[stretchDuration]}
            onValueChange={(values) => onStretchDurationChange(values[0])}
            min={25}
            max={60}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>25 sec</span>
            <span>60 sec</span>
          </div>
        </div>
      </div>

      {/* Foam Rolling Section */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Cylinder className="w-4 h-4 text-primary" />
            Foam Rolling
            <span className="text-xs text-muted-foreground font-normal">(add-on)</span>
          </div>
          {onIncludeFoamRollingChange && (
            <Switch
              checked={includeFoamRolling}
              onCheckedChange={onIncludeFoamRollingChange}
            />
          )}
        </div>

        {includeFoamRolling && onFoamRollingDurationChange && onFoamRollingHoldDurationChange && (
          <div className="space-y-4 animate-fade-up">
            {/* Foam Rolling Duration */}
            <div className="space-y-3 pl-6">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">
                  Total Roll Time
                </label>
                <span className="text-sm font-medium text-foreground">
                  {foamRollingDuration} min
                </span>
              </div>
              <Slider
                value={[foamRollingDuration]}
                onValueChange={(values) => onFoamRollingDurationChange(values[0])}
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 min</span>
                <span>10 min</span>
              </div>
            </div>

            {/* Foam Rolling Hold Duration */}
            <div className="space-y-3 pl-6">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">
                  Each Roll Hold
                </label>
                <span className="text-sm font-medium text-foreground">
                  {foamRollingHoldDuration} sec
                </span>
              </div>
              <Slider
                value={[foamRollingHoldDuration]}
                onValueChange={(values) => onFoamRollingHoldDurationChange(values[0])}
                min={20}
                max={45}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20 sec</span>
                <span>45 sec</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pl-6">
              Foam rolling will be added before your stretches
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
