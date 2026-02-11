import { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Calendar, Smile, Meh, Frown, AlertTriangle, Info } from 'lucide-react';
import { CompletedSession, BodyFeelRating } from '@/types/recovery';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MIN_SESSION_TIME = 5 * 60; // 5 minutes in seconds
interface WeeklySummaryProps {
  completedSessions: CompletedSession[];
  onDismiss: () => void;
}

const getWeekNumber = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const getWeekStartDate = (weeksAgo: number = 0): Date => {
  const now = new Date();
  // Clone to avoid mutating during calculation
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = monday.getDay();
  // Adjust to Monday (day 1), treating Sunday (day 0) as end of previous week
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysToSubtract - (weeksAgo * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getWeekEndDate = (startDate: Date): Date => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const bodyFeelLabels: Record<BodyFeelRating, { label: string; icon: React.ReactNode; color: string }> = {
  'better': { label: 'Better', icon: <Smile className="w-4 h-4" />, color: 'text-green-500' },
  'same': { label: 'Same', icon: <Meh className="w-4 h-4" />, color: 'text-blue-500' },
  'still-tight': { label: 'Still tight', icon: <Frown className="w-4 h-4" />, color: 'text-yellow-500' },
  'more-sore': { label: 'More sore', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500' },
};

export function WeeklySummary({ completedSessions, onDismiss }: WeeklySummaryProps) {
  const summary = useMemo(() => {
    const thisWeekStart = getWeekStartDate(0);
    const thisWeekEnd = getWeekEndDate(thisWeekStart);
    const lastWeekStart = getWeekStartDate(1);
    const lastWeekEnd = getWeekEndDate(lastWeekStart);

    // Parse YYYY-MM-DD as local date (avoid UTC interpretation)
    const parseLocalDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    // Filter sessions for this week
    const thisWeekSessions = completedSessions.filter(session => {
      const sessionDate = parseLocalDate(session.date);
      return sessionDate >= thisWeekStart && sessionDate <= thisWeekEnd;
    });

    // Filter sessions for last week
    const lastWeekSessions = completedSessions.filter(session => {
      const sessionDate = parseLocalDate(session.date);
      return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
    });

    // Separate full sessions (5+ min) from quick sessions (under 5 min)
    const isFullSession = (session: CompletedSession) => 
      session.feedback?.addedToCalendar || (session.feedback?.totalActiveTime ?? 0) >= MIN_SESSION_TIME;

    const thisWeekFullSessions = thisWeekSessions.filter(isFullSession);
    const thisWeekQuickSessions = thisWeekSessions.filter(s => !isFullSession(s));
    const lastWeekFullSessions = lastWeekSessions.filter(isFullSession);

    // Count body feel ratings from ALL sessions (valuable regardless of duration)
    const feelCounts: Record<BodyFeelRating, number> = {
      'better': 0,
      'same': 0,
      'still-tight': 0,
      'more-sore': 0,
    };

    thisWeekSessions.forEach(session => {
      if (session.feedback?.bodyFeel) {
        feelCounts[session.feedback.bodyFeel]++;
      }
    });

    // Calculate trend based on FULL sessions only
    const fullSessionCount = thisWeekFullSessions.length;
    const prevFullSessionCount = lastWeekFullSessions.length;
    let trend: 'up' | 'down' | 'same' = 'same';
    if (fullSessionCount > prevFullSessionCount) trend = 'up';
    else if (fullSessionCount < prevFullSessionCount) trend = 'down';

    // Format date range for this week
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dateRange = `${formatDate(thisWeekStart)} - ${formatDate(thisWeekEnd)}`;

    return {
      fullSessionCount,
      quickSessionCount: thisWeekQuickSessions.length,
      prevFullSessionCount,
      trend,
      dateRange,
      feelCounts,
    };
  }, [completedSessions]);

  // Get top body feel ratings (non-zero)
  const topFeels = Object.entries(summary.feelCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-up relative">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Weekly Recovery Summary</h3>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">{summary.dateRange}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Full sessions count */}
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold text-foreground">{summary.fullSessionCount}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Sessions of 5+ minutes count toward your calendar & streaks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">Sessions completed</p>
          {summary.quickSessionCount > 0 && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              +{summary.quickSessionCount} quick session{summary.quickSessionCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Trend */}
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            {summary.trend === 'up' && (
              <>
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-lg font-bold text-green-500">+{summary.fullSessionCount - summary.prevFullSessionCount}</span>
              </>
            )}
            {summary.trend === 'down' && (
              <>
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-lg font-bold text-red-500">{summary.fullSessionCount - summary.prevFullSessionCount}</span>
              </>
            )}
            {summary.trend === 'same' && (
              <>
                <Minus className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-bold text-muted-foreground">0</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">vs previous week</p>
        </div>
      </div>

      {/* Body feel breakdown */}
      {topFeels.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">How you felt after sessions:</p>
          <div className="flex flex-wrap gap-2">
            {topFeels.map(([feel, count]) => {
              const feelData = bodyFeelLabels[feel as BodyFeelRating];
              return (
                <div
                  key={feel}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs",
                    feelData.color
                  )}
                >
                  {feelData.icon}
                  <span className="text-foreground">{feelData.label}</span>
                  <span className="text-muted-foreground">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {summary.fullSessionCount === 0 && summary.quickSessionCount === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No sessions last week. Time to get stretching! 🧘
        </p>
      )}

      {summary.fullSessionCount === 0 && summary.quickSessionCount > 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          You had {summary.quickSessionCount} quick session{summary.quickSessionCount > 1 ? 's' : ''} last week. Try stretching for 5+ minutes to count toward your streak! 💪
        </p>
      )}
    </div>
  );
}

export function shouldShowWeeklySummary(lastShownWeek: string | undefined): boolean {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  
  // Show on Monday or later in a new week
  if (now.getDay() === 0) return false; // Don't show on Sunday
  
  return lastShownWeek !== currentWeek;
}

export function getCurrentWeekId(): string {
  return getWeekNumber(new Date());
}
