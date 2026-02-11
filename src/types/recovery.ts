export type Sport = {
  id: string;
  name: string;
  icon: string;
  focusAreas: BodyRegion[];
};

export type BodyRegion = 
  | 'neck'
  | 'shoulders'
  | 'upper-back'
  | 'lower-back'
  | 'chest'
  | 'arms'
  | 'wrists'
  | 'hips'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'ankles';

export type SorenessLevel = 'none' | 'light' | 'moderate' | 'severe';

export type BodySelection = {
  region: BodyRegion;
  level: SorenessLevel;
};

export type Stretch = {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  targetAreas: BodyRegion[];
  imageUrl?: string;
};

export type StretchingRoutine = {
  name?: string;
  stretches: Stretch[];
  totalDuration: number;
  focusAreas: BodyRegion[];
  injuryWarnings?: string[];
};

export type SavedRoutine = {
  id: string;
  name: string;
  routine: StretchingRoutine;
  createdAt: string;
};

export type BodyFeelRating = 'better' | 'same' | 'still-tight' | 'more-sore';

export type SessionFeedback = {
  bodyFeel: BodyFeelRating;
  addedToCalendar: boolean;
  totalActiveTime: number; // in seconds
};

export type CompletedSession = {
  date: string; // YYYY-MM-DD
  feedback?: SessionFeedback;
};

export type UserProfile = {
  name?: string;
  sport: Sport | null;
  sorenessAreas: BodySelection[];
  injuries: string[];
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  lastSessionDate: string | null;
  completedDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  completedSessions: CompletedSession[]; // Array with feedback data
  savedRoutines: SavedRoutine[];
  lastWeeklySummaryShown?: string; // ISO week string (YYYY-WW)
};
