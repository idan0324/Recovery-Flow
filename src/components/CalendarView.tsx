import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, ThumbsUp, Minus, AlertCircle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompletedSession, BodyFeelRating } from '@/types/recovery';

interface CalendarViewProps {
  completedDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  completedSessions?: CompletedSession[]; // Sessions with feedback data
  currentStreak: number;
  longestStreak: number;
}

const feedbackIcons: Record<BodyFeelRating, { icon: React.ReactNode; color: string }> = {
  'better': { icon: <ThumbsUp className="w-2.5 h-2.5" />, color: 'text-green-400' },
  'same': { icon: <Minus className="w-2.5 h-2.5" />, color: 'text-primary-foreground/70' },
  'still-tight': { icon: <AlertCircle className="w-2.5 h-2.5" />, color: 'text-primary-foreground/70' },
  'more-sore': { icon: <TrendingDown className="w-2.5 h-2.5" />, color: 'text-primary-foreground/70' },
};

export function CalendarView({ completedDates, completedSessions = [], currentStreak, longestStreak }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isCompleted = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return completedDates.includes(dateStr);
  };

  const getFeedback = (day: number): BodyFeelRating | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const session = completedSessions.find(s => s.date === dateStr);
    return session?.feedback?.bodyFeel || null;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const isFuture = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate stats
  const completedThisMonth = completedDates.filter(date => {
    const d = new Date(date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-foreground">
          {monthNames[month]} {year}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const completed = isCompleted(day);
          const today = isToday(day);
          const future = isFuture(day);
          const feedback = getFeedback(day);
          
          return (
            <div
              key={day}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative",
                completed && "gradient-primary text-primary-foreground shadow-soft",
                today && !completed && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                future && "text-muted-foreground/50",
                !completed && !future && "text-foreground hover:bg-muted/50"
              )}
            >
              {completed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {feedback && (
                    <span className={cn("mt-0.5", feedbackIcons[feedback].color)}>
                      {feedbackIcons[feedback].icon}
                    </span>
                  )}
                </>
              ) : (
                <span className={cn(today && "font-bold")}>{day}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{completedThisMonth}</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{completedDates.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Device storage notice */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground/70 text-center flex items-center justify-center gap-1.5">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="20" x2="7" y2="24" />
            <line x1="17" y1="20" x2="17" y2="24" />
          </svg>
          Progress saved on this device only
        </p>
      </div>
    </div>
  );
}
