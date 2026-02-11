import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  totalSessions: number;
  className?: string;
}

const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak === 2) return "2 days strong! 💪";
  if (streak === 3) return "Hat trick! You're on fire!";
  if (streak >= 4 && streak <= 6) return "Impressive consistency!";
  if (streak === 7) return "One full week! 🎉";
  if (streak >= 8 && streak <= 13) return "You're unstoppable!";
  if (streak === 14) return "Two weeks! Legend status!";
  if (streak >= 15 && streak <= 29) return "Recovery champion! 🏆";
  if (streak >= 30) return "30+ days! You're incredible!";
  return "Keep going!";
};

export function StreakDisplay({ currentStreak, longestStreak, totalSessions, className }: StreakDisplayProps) {
  const streakMessage = useMemo(() => getStreakMessage(currentStreak), [currentStreak]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Encouraging message */}
      <div className="flex items-center gap-2 text-sm">
        <Flame className={cn(
          "w-4 h-4",
          currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-medium",
          currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
        )}>
          {streakMessage}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Current Streak */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20">
          <Flame className={cn(
            "w-5 h-5",
            currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
          )} />
          <span className="font-semibold text-foreground">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>

      {/* Best Streak - only show if > 0 and different from current */}
      {longestStreak !== undefined && longestStreak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-foreground">{longestStreak}</span>
          <span className="text-sm text-muted-foreground">best</span>
        </div>
      )}

        {/* Total sessions */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{totalSessions}</span>
          <span className="text-sm text-muted-foreground">sessions</span>
        </div>
      </div>
    </div>
  );
}
