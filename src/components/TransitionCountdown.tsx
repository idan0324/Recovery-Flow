import { StretchIllustration } from './StretchIllustration';
import { getStretchIllustrationId } from '@/data/stretches';
import { getFoamRollingIllustrationId } from '@/data/foam-rolling';
import { Stretch } from '@/types/recovery';

interface TransitionCountdownProps {
  nextStretch: Stretch;
  secondsLeft: number;
}

export function TransitionCountdown({ nextStretch, secondsLeft }: TransitionCountdownProps) {
  const illustrationId = nextStretch.id.startsWith('foam-roll')
    ? getFoamRollingIllustrationId(nextStretch.id)
    : getStretchIllustrationId(nextStretch.id);

  const progress = ((5 - secondsLeft) / 5) * 100;

  return (
    <div className="flex flex-col items-center w-full animate-fade-up">
      <p className="text-sm text-muted-foreground mb-2">Get ready for</p>
      
      {/* Timer and illustration side by side - matching stretching layout */}
      <div className="flex flex-row items-center justify-start gap-6 mb-4 w-full">
        {/* Countdown timer - same size as stretch timer */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0">
          {/* Outer glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-xl transition-opacity duration-500 opacity-40"
            style={{ 
              background: `conic-gradient(from 0deg, hsl(168 76% 42% / ${progress / 100}) 0%, hsl(180 60% 50% / ${progress / 100}) ${progress}%, transparent ${progress}%)`,
            }}
          />
          
          {/* Timer ring SVG */}
          <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 192 192">
            <defs>
              <linearGradient id="transitionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(168, 76%, 42%)" />
                <stop offset="100%" stopColor="hsl(180, 60%, 50%)" />
              </linearGradient>
              <filter id="transitionGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="transitionInnerShadow">
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
              filter="url(#transitionInnerShadow)"
            />
            
            {/* Progress arc with glow */}
            <circle
              cx="96"
              cy="96"
              r="82"
              fill="none"
              stroke="url(#transitionGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 82}
              strokeDashoffset={2 * Math.PI * 82 * (1 - progress / 100)}
              className="transition-all duration-1000 ease-linear"
              filter="url(#transitionGlow)"
            />
          </svg>
          
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {secondsLeft}
            </span>
            <span className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 uppercase tracking-wider">seconds</span>
          </div>
        </div>

        {/* Preview illustration - same size as stretch illustration */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 p-3 rounded-2xl bg-accent/30 border border-primary/20 flex items-center justify-center">
            <StretchIllustration stretchId={illustrationId} isActive={false} />
          </div>
        </div>
      </div>

      {/* Stretch info */}
      <div className="text-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
          {nextStretch.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {nextStretch.duration} seconds
        </p>
      </div>
    </div>
  );
}
