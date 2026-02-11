import { useEffect, useState } from 'react';
import { Confetti } from './Confetti';

interface CelebrationScreenProps {
  onComplete: () => void;
  duration?: number;
  userName?: string;
}

export function CelebrationScreen({ onComplete, duration = 2500, userName }: CelebrationScreenProps) {
  const [phase, setPhase] = useState<'running' | 'unraveling' | 'done'>('running');

  useEffect(() => {
    // Phase 1: Running animation (1.2 seconds)
    const runTimer = setTimeout(() => {
      setPhase('unraveling');
    }, 1200);

    // Phase 2: Unraveling into completion
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, duration);

    return () => {
      clearTimeout(runTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm overflow-hidden">
      <Confetti active={true} duration={duration} pieceCount={60} />
      
      {/* Running figure with trail */}
      <div className={`relative transition-all duration-700 ${
        phase === 'unraveling' ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Trail effect - multiple fading copies behind the runner */}
        <div className="relative">
          {/* Ghost trails */}
          {phase === 'running' && (
            <>
              <div className="absolute -left-8 opacity-20 animate-trail-1">
                <RunnerSVG />
              </div>
              <div className="absolute -left-16 opacity-10 animate-trail-2">
                <RunnerSVG />
              </div>
              <div className="absolute -left-24 opacity-5 animate-trail-3">
                <RunnerSVG />
              </div>
            </>
          )}
          
          {/* Main runner */}
          <div className={`relative ${phase === 'running' ? 'animate-runner-bounce' : ''}`}>
            <RunnerSVG isMain={true} isRunning={phase === 'running'} isUnraveling={phase === 'unraveling'} />
          </div>
          
          {/* Motion blur lines */}
          {phase === 'running' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
              <div className="flex flex-col gap-2 -ml-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full animate-speed-streak"
                    style={{ 
                      width: `${30 + Math.random() * 40}px`,
                      animationDelay: `${i * 80}ms`,
                      marginLeft: `${Math.random() * 20}px`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Great job text */}
        <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500 ${
          phase === 'unraveling' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center animate-bounce-slow">
            Great job{userName ? `, ${userName}` : ''}! 🎉
          </h2>
        </div>
      </div>
      
      {/* Unravel particles - burst outward */}
      {phase === 'unraveling' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-6 rounded-full animate-unravel-burst"
              style={{
                background: `linear-gradient(135deg, hsl(212, 80%, 55%), hsl(225, 70%, 60%))`,
                transform: `rotate(${i * 22.5}deg)`,
                '--rotation': `${i * 22.5}deg`,
                animationDelay: `${i * 30}ms`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Separate runner SVG component for reuse in trails
function RunnerSVG({ isMain = false, isRunning = false, isUnraveling = false }: { 
  isMain?: boolean; 
  isRunning?: boolean; 
  isUnraveling?: boolean;
}) {
  return (
    <svg 
      viewBox="0 0 140 140" 
      className={`w-36 h-36 sm:w-44 sm:h-44 transition-all duration-500 ${
        isUnraveling ? 'blur-lg scale-150' : ''
      }`}
    >
      <defs>
        <linearGradient id="runnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(212, 85%, 55%)" />
          <stop offset="50%" stopColor="hsl(220, 80%, 58%)" />
          <stop offset="100%" stopColor="hsl(230, 75%, 62%)" />
        </linearGradient>
        <filter id="runnerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Dynamic runner - more detailed athletic pose */}
      <g 
        fill="none" 
        stroke="url(#runnerGradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={isMain ? "url(#runnerGlow)" : undefined}
      >
        {/* Head */}
        <circle cx="70" cy="28" r="12" fill="url(#runnerGradient)" />
        
        {/* Torso - leaning forward */}
        <path d="M70 40 L62 70" className={isRunning ? 'animate-torso-lean' : ''} />
        
        {/* Front arm - pumping forward */}
        <path 
          d="M66 48 L50 38 L42 45" 
          className={isRunning ? 'animate-arm-pump' : ''}
        />
        
        {/* Back arm - pumping backward */}
        <path 
          d="M66 48 L82 58 L90 52" 
          className={isRunning ? 'animate-arm-pump-back' : ''}
        />
        
        {/* Front leg - extended forward */}
        <path 
          d="M62 70 L45 90 L30 95" 
          className={isRunning ? 'animate-leg-extend' : ''}
        />
        
        {/* Back leg - pushing off */}
        <path 
          d="M62 70 L80 85 L95 110" 
          className={isRunning ? 'animate-leg-push' : ''}
        />
        
        {/* Shoe details */}
        <ellipse cx="28" cy="98" rx="6" ry="3" fill="url(#runnerGradient)" className={isRunning ? 'animate-leg-extend' : ''} />
        <ellipse cx="98" cy="112" rx="6" ry="3" fill="url(#runnerGradient)" className={isRunning ? 'animate-leg-push' : ''} />
      </g>
      
      {/* Energy particles when running */}
      {isRunning && isMain && (
        <g>
          {[...Array(4)].map((_, i) => (
            <circle
              key={i}
              r="2"
              fill="hsl(212, 80%, 55%)"
              className="animate-energy-particle"
              style={{
                animationDelay: `${i * 150}ms`,
              }}
            >
              <animateMotion
                dur="0.6s"
                repeatCount="indefinite"
                path={`M70,70 Q${40 + i * 5},${60 + i * 10} ${20 + i * 10},${50 + i * 15}`}
              />
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}
