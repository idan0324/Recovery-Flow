import { Button } from '@/components/ui/button';
import { Check, Download, RotateCcw, ThumbsUp, Minus, AlertCircle, TrendingDown, Calendar, CalendarX } from 'lucide-react';
import { Stretch, BodyFeelRating, SessionFeedback, BodySelection, BodyRegion } from '@/types/recovery';
import { cn } from '@/lib/utils';
import { generateSessionPDF } from '@/lib/generateSessionPDF';
import { useState, useMemo, useEffect } from 'react';

interface PostSessionFeedbackProps {
  totalActiveTime: number;
  stretches: Stretch[];
  sorenessAreas: BodySelection[];
  focusAreas: BodyRegion[];
  userName?: string;
  onSubmitFeedback: (feedback: SessionFeedback) => boolean;
  onNewSession: () => void;
}

const MIN_SESSION_TIME = 5 * 60;

// Google Form configuration
const GOOGLE_FORM_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf533X5Sp1FVTCmeiWyAZEPmIIzBG4xGXG6h36cZS55OkqqVw/formResponse',
  entries: {
    userName:             'entry.412410809',
    timeSpent:            'entry.1568068239',
    stretchesCompleted:   'entry.1355899857',
    sessionCompletion:    'entry.1858383607',
    physicalPerformance:  'entry.587245154',
    mentalPerformance:    'entry.1372070017',
    emotionalBalance:     'entry.188354006',
    overallRecovery:      'entry.1418623378',
    muscularStress:       'entry.47533689',
    lackOfActivation:     'entry.1848914173',
    negativeEmotional:    'entry.904823590',
    overallStress:        'entry.1843572204',
    feelBetter:           'entry.695763711',
  }
};

type SessionCompletionType = 'yes' | 'mostly' | 'no';

const completionOptions: { value: SessionCompletionType; label: string }[] = [
  { value: 'yes',    label: 'Yes, all completed' },
  { value: 'mostly', label: 'Mostly (skipped 1–2)' },
  { value: 'no',     label: 'No, stopped early' },
];

// SRSS scale: 0–6
const SRSS_SCALE = [0, 1, 2, 3, 4, 5, 6];

const srssQuestions = [
  {
    key: 'physicalPerformance' as const,
    category: 'Physical Performance',
    question: 'Right now, I feel physically ready to perform (run, train).',
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'mentalPerformance' as const,
    category: 'Mental Performance',
    question: 'Right now, I feel mentally focused and able to concentrate on training.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'emotionalBalance' as const,
    category: 'Emotional Balance',
    question: 'Right now, my mood feels stable and positive.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Applies fully',
  },
  {
    key: 'overallRecovery' as const,
    category: 'Overall Recovery',
    question: 'Overall, I feel well recovered from recent training.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Applies fully',
  },
  {
    key: 'muscularStress' as const,
    category: 'Muscular Stress',
    question: 'Right now, my muscles feel tired, sore, or heavy.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'lackOfActivation' as const,
    category: 'Lack of Activation',
    question: "Right now, I feel sluggish or not 'switched on' for training.",
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'negativeEmotional' as const,
    category: 'Negative Emotional State',
    question: 'Right now, I feel down, irritated, or in a bad mood.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'overallStress' as const,
    category: 'Overall Stress',
    question: 'Overall, I feel stressed by training, school/work, or life.',
    lowLabel: 'Does not apply at all',
    highLabel: 'Fully applies',
  },
  {
    key: 'feelBetter' as const,
    category: 'Post-Stretch Improvement',
    question: 'How much better do you feel after stretching?',
    lowLabel: 'Same / worse',
    highLabel: 'Wayy better',
  },
];

type SrssKey = typeof srssQuestions[number]['key'];
type SrssRatings = Partial<Record<SrssKey, number>>;

export function PostSessionFeedback({
  totalActiveTime,
  stretches,
  sorenessAreas,
  focusAreas,
  userName,
  onSubmitFeedback,
  onNewSession,
}: PostSessionFeedbackProps) {
  const [sessionCompletion, setSessionCompletion] = useState<SessionCompletionType | null>(null);
  const [srssRatings, setSrssRatings] = useState<SrssRatings>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Warn user before refreshing during questionnaire
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!feedbackSubmitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [feedbackSubmitted]);

const minutes = Math.floor(totalActiveTime / 60);
  const minutes = Math.floor(totalActiveTime / 60);
  const seconds = totalActiveTime % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  const willCountForCalendar = totalActiveTime >= MIN_SESSION_TIME;

  const allQuestionsAnswered =
    sessionCompletion !== null &&
    srssQuestions.every(q => srssRatings[q.key] !== undefined);

  const submitToGoogleForm = async () => {
    try {
      const mins = Math.floor(totalActiveTime / 60);
      const secs = totalActiveTime % 60;
      const formattedTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      const stretchesList = stretches.map(s => s.name).join(', ');

      const formData = new URLSearchParams();
      formData.append(GOOGLE_FORM_CONFIG.entries.userName, userName || 'Anonymous');
      formData.append(GOOGLE_FORM_CONFIG.entries.timeSpent, formattedTime);
      formData.append(GOOGLE_FORM_CONFIG.entries.stretchesCompleted, stretchesList);
      formData.append(GOOGLE_FORM_CONFIG.entries.sessionCompletion,
        completionOptions.find(o => o.value === sessionCompletion)?.label || '');
      
      // SRSS ratings
      srssQuestions.forEach(q => {
        const val = srssRatings[q.key];
        if (val !== undefined) {
          formData.append(GOOGLE_FORM_CONFIG.entries[q.key], String(val));
        }
      });

      await fetch(GOOGLE_FORM_CONFIG.formUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });
      console.log('[CheckIn] Submitted to Google Form');
    } catch (error) {
      console.error('[CheckIn] Form submission error:', error);
    }
  };

  const handleSubmitFeedback = () => {
    if (!allQuestionsAnswered) return;

    if (willCountForCalendar) {
      submitToGoogleForm();
    }

    // Use feelBetter as the bodyFeel proxy for local state
    // Map 0-2 = more-sore, 3 = same, 4-5 = still-tight, 6 = better
    const feelBetterVal = srssRatings['feelBetter'] ?? 3;
    const bodyFeel: BodyFeelRating =
      feelBetterVal >= 5 ? 'better' :
      feelBetterVal >= 3 ? 'same' :
      feelBetterVal >= 1 ? 'still-tight' : 'more-sore';

    const feedback: SessionFeedback = {
      bodyFeel,
      addedToCalendar: willCountForCalendar,
      totalActiveTime,
    };
    const counted = onSubmitFeedback(feedback);
    setAddedToCalendar(counted);
    setFeedbackSubmitted(true);
  };

  const handleDownload = () => {
    generateSessionPDF({ date: new Date(), stretches, totalActiveTime });
    setDownloaded(true);
  };

  const encouragingMessages = [
    "You're building a healthier you! 💪",
    "Your body thanks you for this care! 🙌",
    "Consistency is key—you're crushing it! 🔥",
    "Every stretch brings you closer to your goals! ⭐",
    "Amazing dedication to your recovery! 🎯",
  ];
  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-up px-4">
      {/* Completion icon */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-glow animate-breathe gradient-hero">
        <Check className="w-12 h-12 text-primary-foreground" />
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-2">Great Work!</h2>
      <p className="text-muted-foreground mb-2">
        You completed {stretches.length} stretches ({timeDisplay})
      </p>
      <p className="text-lg text-primary font-medium mb-6">{randomMessage}</p>

      {/* Check-In Questions */}
      {willCountForCalendar && !feedbackSubmitted ? (
        <div className="glass-card rounded-2xl p-6 mb-6 w-full max-w-sm max-h-[60vh] overflow-y-auto">

          {/* Q1: Session Completion */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Session Completion
            </h3>
            <p className="text-sm text-foreground mb-3">Did you complete all of the stretches as intended?</p>
            <div className="flex flex-wrap gap-2">
              {completionOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSessionCompletion(option.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 text-sm transition-all",
                    sessionCompletion === option.value
                      ? "bg-primary/20 border-primary text-primary"
                      : "border-border bg-muted/30 hover:bg-muted/50 text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* SRSS Questions */}
          {srssQuestions.map((q, idx) => (
            <div key={q.key} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {q.category}
              </h3>
              <p className="text-sm text-foreground mb-3 italic">"{q.question}"</p>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{q.lowLabel}</span>
                <span>{q.highLabel}</span>
              </div>
              <div className="flex justify-between gap-1">
                {SRSS_SCALE.map(val => (
                  <button
                    key={val}
                    onClick={() => setSrssRatings(prev => ({ ...prev, [q.key]: val }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all",
                      srssRatings[q.key] === val
                        ? "bg-primary/20 border-primary text-primary"
                        : "border-border bg-muted/30 hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={handleSubmitFeedback}
            variant="hero"
            size="lg"
            className="w-full"
            disabled={!allQuestionsAnswered}
          >
            Submit Feedback
          </Button>
        </div>
      ) : feedbackSubmitted ? (
        <div className="glass-card rounded-2xl p-4 mb-6 w-full max-w-sm flex items-center gap-3 border-green-500/30">
          <Calendar className="w-6 h-6 text-green-400 flex-shrink-0" />
          <p className="text-sm text-left">
            <span className="font-semibold text-green-400">Session logged! Great job! 🎉</span>
            <br />
            <span className="text-muted-foreground">This session counts towards your streak.</span>
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-4 mb-6 w-full max-w-sm flex items-center gap-3 border-yellow-500/30">
          <CalendarX className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-left">
            <span className="font-semibold text-yellow-400">Session not logged</span>
            <br />
            <span className="text-muted-foreground">Sessions under 5 minutes aren't recorded. Keep it up next time!</span>
          </p>
        </div>
      )}

      {/* Session Summary Card */}
      <div className="glass-card rounded-2xl p-6 mb-6 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Session Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{timeDisplay}</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stretches.length}</p>
            <p className="text-xs text-muted-foreground">Stretches</p>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Stretches completed:</p>
          <div className="flex flex-wrap gap-1.5">
            {stretches.slice(0, 6).map((stretch, i) => (
              <span key={i} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                {stretch.name}
              </span>
            ))}
            {stretches.length > 6 && (
              <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                +{stretches.length - 6} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={handleDownload}
          variant="hero"
          size="lg"
          className={cn("w-full", downloaded && "bg-green-600 hover:bg-green-700")}
        >
          {downloaded ? (
            <><Check className="w-5 h-5 mr-2" />Downloaded!</>
          ) : (
            <><Download className="w-5 h-5 mr-2" />Download Session Sheet</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">Save a PDF with your session details</p>
        <Button
          onClick={onNewSession}
          variant="outline"
          size="lg"
          className="w-full"
          disabled={willCountForCalendar && !feedbackSubmitted}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          New Session
        </Button>
        {willCountForCalendar && !feedbackSubmitted && (
          <p className="text-xs text-center text-primary font-semibold">
            Complete the survey above to start a new session
          </p>
        )}
      </div>
    </div>
  );
}