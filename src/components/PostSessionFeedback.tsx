import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Download, RotateCcw, ThumbsUp, Minus, AlertCircle, TrendingDown, Calendar, CalendarX } from 'lucide-react';
import { Stretch, BodyFeelRating, SessionFeedback, BodySelection, BodyRegion } from '@/types/recovery';
import { cn } from '@/lib/utils';
import { generateSessionPDF } from '@/lib/generateSessionPDF';
interface PostSessionFeedbackProps {
  totalActiveTime: number; // in seconds
  stretches: Stretch[];
  sorenessAreas: BodySelection[];
  focusAreas: BodyRegion[];
  userName?: string;
  onSubmitFeedback: (feedback: SessionFeedback) => boolean; // returns whether it counted for calendar
  onNewSession: () => void;
}
const MIN_SESSION_TIME = 5 * 60; // 5 minutes in seconds

// Google Form configuration
const GOOGLE_FORM_CONFIG = {
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSd_jlFCjPAfzg2v8gqFxTXyPm0sx8wJ6oXAMx54R_OHc-NmIA/formResponse',
  entries: {
    userName: 'entry.712097759',
    timeSpent: 'entry.698477850',
    stretchesCompleted: 'entry.1476208455',
    sessionCompletion: 'entry.958851969',
    hardestArea: 'entry.1362447921',
    manageability: 'entry.1331279159',
    bodyFeel: 'entry.395378846'
  }
};
type SessionCompletionType = 'all' | 'mostly' | 'stopped-early';
type ManageabilityType = 'very' | 'mostly' | 'bit-hard' | 'too-hard';
const completionOptions: {
  value: SessionCompletionType;
  label: string;
}[] = [{
  value: 'all',
  label: 'Yes, all completed'
}, {
  value: 'mostly',
  label: 'Mostly (skipped 1–2)'
}, {
  value: 'stopped-early',
  label: 'No, stopped early'
}];
const manageabilityOptions: {
  value: ManageabilityType;
  label: string;
}[] = [{
  value: 'very',
  label: 'Very manageable'
}, {
  value: 'mostly',
  label: 'Mostly manageable'
}, {
  value: 'bit-hard',
  label: 'A bit hard'
}, {
  value: 'too-hard',
  label: 'Too hard'
}];
const feelingOptions: {
  value: BodyFeelRating;
  label: string;
  icon: React.ReactNode;
  selectedColor: string;
}[] = [{
  value: 'better',
  label: 'Better',
  icon: <ThumbsUp className="w-5 h-5" />,
  selectedColor: 'bg-green-500/20 border-green-500 text-green-400'
}, {
  value: 'same',
  label: 'Same',
  icon: <Minus className="w-5 h-5" />,
  selectedColor: 'bg-blue-500/20 border-blue-500 text-blue-400'
}, {
  value: 'still-tight',
  label: 'Still Tight',
  icon: <AlertCircle className="w-5 h-5" />,
  selectedColor: 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
}, {
  value: 'more-sore',
  label: 'More Sore',
  icon: <TrendingDown className="w-5 h-5" />,
  selectedColor: 'bg-red-500/20 border-red-500 text-red-400'
}];
const regionLabels: Record<BodyRegion, string> = {
  'neck': 'Neck',
  'shoulders': 'Shoulders',
  'upper-back': 'Upper Back',
  'lower-back': 'Lower Back',
  'chest': 'Chest',
  'arms': 'Arms',
  'wrists': 'Wrists',
  'hips': 'Hips',
  'quads': 'Quads',
  'hamstrings': 'Hamstrings',
  'calves': 'Calves',
  'ankles': 'Ankles'
};
export function PostSessionFeedback({
  totalActiveTime,
  stretches,
  sorenessAreas,
  focusAreas,
  userName,
  onSubmitFeedback,
  onNewSession
}: PostSessionFeedbackProps) {
  // Q1: Session completion
  const [sessionCompletion, setSessionCompletion] = useState<SessionCompletionType | null>(null);
  // Q2: Hardest area
  const [hardestArea, setHardestArea] = useState<BodyRegion | 'none' | null>(null);
  // Q3: Manageability
  const [manageability, setManageability] = useState<ManageabilityType | null>(null);
  // Q4: Body feel (existing)
  const [bodyFeel, setBodyFeel] = useState<BodyFeelRating | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const minutes = Math.floor(totalActiveTime / 60);
  const seconds = totalActiveTime % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  const willCountForCalendar = totalActiveTime >= MIN_SESSION_TIME;

  // Dynamic Q2 options based on soreness areas or focus areas
  const hardestAreaOptions = useMemo(() => {
    const areas = sorenessAreas.length > 0 ? sorenessAreas.map(s => s.region) : focusAreas;

    // Remove duplicates and limit to 5 options (leaving room for "none")
    const uniqueAreas = [...new Set(areas)].slice(0, 5);
    const areaOptions: {
      value: BodyRegion | 'none';
      label: string;
    }[] = uniqueAreas.map(region => ({
      value: region,
      label: regionLabels[region]
    }));

    // Add "None were difficult" option
    areaOptions.push({
      value: 'none',
      label: 'None were difficult'
    });
    return areaOptions;
  }, [sorenessAreas, focusAreas]);

  // Google Form submission (fire-and-forget)
  const submitToGoogleForm = async (data: {
    userName: string;
    timeSpent: string;
    stretchesCompleted: string;
    sessionCompletion: string;
    hardestArea: string;
    manageability: string;
    bodyFeel: string;
  }) => {
    try {
      const formData = new URLSearchParams();
      formData.append(GOOGLE_FORM_CONFIG.entries.userName, data.userName);
      formData.append(GOOGLE_FORM_CONFIG.entries.timeSpent, data.timeSpent);
      formData.append(GOOGLE_FORM_CONFIG.entries.stretchesCompleted, data.stretchesCompleted);
      formData.append(GOOGLE_FORM_CONFIG.entries.sessionCompletion, data.sessionCompletion);
      formData.append(GOOGLE_FORM_CONFIG.entries.hardestArea, data.hardestArea);
      formData.append(GOOGLE_FORM_CONFIG.entries.manageability, data.manageability);
      formData.append(GOOGLE_FORM_CONFIG.entries.bodyFeel, data.bodyFeel);
      await fetch(GOOGLE_FORM_CONFIG.formUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for cross-origin Google Form submission
      });
      console.log('[CheckIn] Submitted to Google Form');
    } catch (error) {
      console.error('[CheckIn] Form submission error:', error);
      // Silent fail - don't block user flow
    }
  };
  const handleSubmitFeedback = () => {
    if (!bodyFeel || !sessionCompletion || !hardestArea || !manageability) return;

    // Only submit to Google Form if session was 5+ minutes
    if (willCountForCalendar) {
      // Format time spent
      const mins = Math.floor(totalActiveTime / 60);
      const secs = totalActiveTime % 60;
      const formattedTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

      // Format stretches list
      const stretchesList = stretches.map(s => s.name).join(', ');

      // Submit to Google Form (async, non-blocking)
      submitToGoogleForm({
        userName: userName || 'Anonymous',
        timeSpent: formattedTime,
        stretchesCompleted: stretchesList,
        sessionCompletion: completionOptions.find(o => o.value === sessionCompletion)?.label || '',
        hardestArea: hardestArea === 'none' ? 'None were difficult' : regionLabels[hardestArea],
        manageability: manageabilityOptions.find(o => o.value === manageability)?.label || '',
        bodyFeel: feelingOptions.find(o => o.value === bodyFeel)?.label || ''
      });
    }

    // Continue with existing local state update
    const feedback: SessionFeedback = {
      bodyFeel,
      addedToCalendar: willCountForCalendar,
      totalActiveTime
    };
    const counted = onSubmitFeedback(feedback);
    setAddedToCalendar(counted);
    setFeedbackSubmitted(true);
  };
  const handleDownload = () => {
    generateSessionPDF({
      date: new Date(),
      stretches,
      totalActiveTime
    });
    setDownloaded(true);
  };
  const encouragingMessages = ["You're building a healthier you! 💪", "Your body thanks you for this care! 🙌", "Consistency is key—you're crushing it! 🔥", "Every stretch brings you closer to your goals! ⭐", "Amazing dedication to your recovery! 🎯"];
  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
  const allQuestionsAnswered = bodyFeel && sessionCompletion && hardestArea && manageability;
  return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-up px-4">
      {/* Completion icon */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-glow animate-breathe gradient-hero">
        <Check className="w-12 h-12 text-primary-foreground" />
      </div>
      
      <h2 className="text-3xl font-bold text-foreground mb-2">Great Work!</h2>
      <p className="text-muted-foreground mb-2">
        You completed {stretches.length} stretches ({timeDisplay})
      </p>
      <p className="text-lg text-primary font-medium mb-6">
        {randomMessage}
      </p>

      {/* Check-In Questions - only show for sessions >= 5 minutes */}
      {willCountForCalendar && !feedbackSubmitted ? <div className="glass-card rounded-2xl p-6 mb-6 w-full max-w-sm max-h-[60vh] overflow-y-auto">
          {/* Q1: Session Completion */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Did you complete all stretches as intended?
            </h3>
            <div className="flex flex-wrap gap-2">
              {completionOptions.map(option => <button key={option.value} onClick={() => setSessionCompletion(option.value)} className={cn("px-3 py-2 rounded-lg border-2 text-sm transition-all", sessionCompletion === option.value ? "bg-primary/20 border-primary text-primary" : "border-border bg-muted/30 hover:bg-muted/50 text-foreground")}>
                  {option.label}
                </button>)}
            </div>
          </div>

          {/* Q2: Hardest Area (dynamic) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Which stretch felt the hardest today?
            </h3>
            <div className="flex flex-wrap gap-2">
              {hardestAreaOptions.map(option => <button key={option.value} onClick={() => setHardestArea(option.value)} className={cn("px-3 py-2 rounded-lg border-2 text-sm transition-all", hardestArea === option.value ? "bg-primary/20 border-primary text-primary" : "border-border bg-muted/30 hover:bg-muted/50 text-foreground")}>
                  {option.label}
                </button>)}
            </div>
          </div>

          {/* Q3: Manageability */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              How manageable did today's session feel?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {manageabilityOptions.map(option => <button key={option.value} onClick={() => setManageability(option.value)} className={cn("px-3 py-2 rounded-lg border-2 text-sm transition-all", manageability === option.value ? "bg-primary/20 border-primary text-primary" : "border-border bg-muted/30 hover:bg-muted/50 text-foreground")}>
                  {option.label}
                </button>)}
            </div>
          </div>

          {/* Q4: Body Feel (existing, with colors & icons) */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              How does your body feel now?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {feelingOptions.map(option => {
            const isSelected = bodyFeel === option.value;
            const colorClass = option.value === 'better' ? 'text-green-400' : option.value === 'same' ? 'text-blue-400' : option.value === 'still-tight' ? 'text-yellow-400' : 'text-red-400';
            return <button key={option.value} onClick={() => setBodyFeel(option.value)} className={cn("flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all", isSelected ? option.selectedColor : "border-border bg-muted/30 hover:bg-muted/50")}>
                    <span className={cn(isSelected ? "" : colorClass)}>
                      {option.icon}
                    </span>
                    <span className="text-sm mt-2">{option.label}</span>
                  </button>;
          })}
            </div>
          </div>

          <Button onClick={handleSubmitFeedback} variant="hero" size="lg" className="w-full" disabled={!allQuestionsAnswered}>
            Submit Feedback
          </Button>
        </div> : feedbackSubmitted ? (/* Calendar Notification - session logged */
    <div className="glass-card rounded-2xl p-4 mb-6 w-full max-w-sm flex items-center gap-3 border-green-500/30">
          <Calendar className="w-6 h-6 text-green-400 flex-shrink-0" />
          <p className="text-sm text-left">
            <span className="font-semibold text-green-400">Session logged! Great job! 🎉</span>
            <br />
            <span className="text-muted-foreground">This session counts towards your streak.</span>
          </p>
        </div>) : (/* Session too short notification */
    <div className="glass-card rounded-2xl p-4 mb-6 w-full max-w-sm flex items-center gap-3 border-yellow-500/30">
          <CalendarX className="w-6 h-6 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-left">
            <span className="font-semibold text-yellow-400">Session not logged</span>
            <br />
            <span className="text-muted-foreground">Sessions under 5 minutes aren't recorded. Keep it up next time!</span>
          </p>
        </div>)}

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
            {stretches.slice(0, 6).map((stretch, i) => <span key={i} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                {stretch.name}
              </span>)}
            {stretches.length > 6 && <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full">
                +{stretches.length - 6} more
              </span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={handleDownload} variant="hero" size="lg" className={cn("w-full", downloaded && "bg-green-600 hover:bg-green-700")}>
          {downloaded ? <>
              <Check className="w-5 h-5 mr-2" />
              Downloaded!
            </> : <>
              <Download className="w-5 h-5 mr-2" />
              Download Session Sheet
            </>}
        </Button>
        <p className="text-xs text-muted-foreground">
          Save a PDF with your session details
        </p>
        <Button onClick={onNewSession} variant="outline" size="lg" className="w-full" disabled={willCountForCalendar && !feedbackSubmitted}>
          <RotateCcw className="w-5 h-5 mr-2" />
          New Session
        </Button>
        {willCountForCalendar && !feedbackSubmitted && <p className="text-xs text-center text-primary font-semibold">
            Complete the survey above to start a new session
          </p>}
      </div>
    </div>;
}