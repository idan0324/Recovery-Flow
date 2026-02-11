import { useState, useEffect } from 'react';
import { Sport, BodySelection, UserProfile, StretchingRoutine, BodyRegion, SavedRoutine, Stretch, SessionFeedback, CompletedSession } from '@/types/recovery';
import { stretches } from '@/data/stretches';
import { foamRollingExercises } from '@/data/foam-rolling';
import { getInjuryAdjustments } from '@/components/InjuryInput';

const STORAGE_KEY = 'recovery-app-profile';
const CUSTOM_STRETCHES_KEY = 'recovery-app-custom-stretches';

const DURATION_REDUCTION_FACTOR = 0.6; // Reduce duration by 40% for injury-affected stretches

export interface FoamRollingOptions {
  enabled: boolean;
  duration: number; // in minutes
  holdDuration: number; // in seconds
}

const defaultProfile: UserProfile = {
  name: undefined,
  sport: null,
  sorenessAreas: [],
  injuries: [],
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  lastSessionDate: null,
  completedDates: [],
  completedSessions: [],
  savedRoutines: [],
  lastWeeklySummaryShown: undefined,
};

export function useRecovery() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultProfile;
  });

  const [customStretches, setCustomStretches] = useState<Stretch[]>(() => {
    const stored = localStorage.getItem(CUSTOM_STRETCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_STRETCHES_KEY, JSON.stringify(customStretches));
  }, [customStretches]);

  const addCustomStretch = (stretch: Stretch) => {
    setCustomStretches(prev => [...prev, stretch]);
  };

  const removeCustomStretch = (id: string) => {
    setCustomStretches(prev => prev.filter(s => s.id !== id));
  };

  const setName = (name: string) => {
    setProfile(prev => ({ ...prev, name }));
  };

  const setSport = (sport: Sport) => {
    setProfile(prev => ({ ...prev, sport }));
  };

  const toggleSorenessArea = (region: BodyRegion) => {
    setProfile(prev => {
      const existing = prev.sorenessAreas.find(s => s.region === region);
      if (existing) {
        return {
          ...prev,
          sorenessAreas: prev.sorenessAreas.filter(s => s.region !== region),
        };
      }
      return {
        ...prev,
        sorenessAreas: [...prev.sorenessAreas, { region, level: 'moderate' }],
      };
    });
  };

  const setSorenessLevel = (region: BodyRegion, level: BodySelection['level']) => {
    setProfile(prev => ({
      ...prev,
      sorenessAreas: prev.sorenessAreas.map(s =>
        s.region === region ? { ...s, level } : s
      ),
    }));
  };

  const addInjury = (injury: string) => {
    setProfile(prev => ({
      ...prev,
      injuries: [...prev.injuries, injury],
    }));
  };

  const removeInjury = (injury: string) => {
    setProfile(prev => ({
      ...prev,
      injuries: prev.injuries.filter(i => i !== injury),
    }));
  };

  const generateRoutine = (
    targetDuration: number = 10, 
    stretchDuration: number = 30,
    foamRollingOptions?: FoamRollingOptions
  ): StretchingRoutine => {
    const targetAreas: BodyRegion[] = [];
    
    // Get injury adjustments
    const { excludeStretches, reducedDuration, warnings } = getInjuryAdjustments(profile.injuries);
    
    // Add sore areas with priority
    profile.sorenessAreas.forEach(s => {
      if (!targetAreas.includes(s.region)) {
        targetAreas.push(s.region);
      }
    });

    // Add sport focus areas
    if (profile.sport) {
      profile.sport.focusAreas.forEach(area => {
        if (!targetAreas.includes(area)) {
          targetAreas.push(area);
        }
      });
    }

    // If no areas selected, use common areas
    if (targetAreas.length === 0) {
      targetAreas.push('hamstrings', 'quads', 'lower-back', 'shoulders', 'calves', 'hips');
    }

    const selectedExercises: Stretch[] = [];
    let totalDuration = 0;

    // Generate foam rolling exercises if enabled
    if (foamRollingOptions?.enabled) {
      const foamRollingMaxSeconds = foamRollingOptions.duration * 60;
      const foamRollingHold = foamRollingOptions.holdDuration;

      // Find foam rolling exercises for target areas
      const relevantFoamRolling = foamRollingExercises.filter(exercise =>
        exercise.targetAreas.some(area => targetAreas.includes(area))
      );

      // Identify bilateral foam rolling exercises
      const getBilateralBase = (id: string): string | null => {
        if (id.endsWith('-left')) return id.replace(/-left$/, '');
        if (id.endsWith('-right')) return id.replace(/-right$/, '');
        return null;
      };

      // Separate bilateral and non-bilateral foam rolling
      const foamBilateralBases = new Set<string>();
      const foamNonBilateral: Stretch[] = [];
      
      relevantFoamRolling.forEach(exercise => {
        const base = getBilateralBase(exercise.id);
        if (base) {
          foamBilateralBases.add(base);
        } else {
          foamNonBilateral.push(exercise);
        }
      });

      // Create foam rolling bilateral pairs
      const foamBilateralPairs: Stretch[][] = [];
      foamBilateralBases.forEach(base => {
        const left = relevantFoamRolling.find(s => s.id === `${base}-left`);
        const right = relevantFoamRolling.find(s => s.id === `${base}-right`);
        if (left && right) {
          foamBilateralPairs.push([left, right]);
        }
      });

      // Shuffle foam rolling groups
      const shuffledFoamPairs = [...foamBilateralPairs].sort(() => Math.random() - 0.5);
      const shuffledFoamNonBilateral = [...foamNonBilateral].sort(() => Math.random() - 0.5);

      let foamDuration = 0;
      let foamPairIndex = 0;
      let foamNonBiIndex = 0;
      let addFoamPairNext = true;

      while ((foamPairIndex < shuffledFoamPairs.length || foamNonBiIndex < shuffledFoamNonBilateral.length) && foamDuration < foamRollingMaxSeconds - 20) {
        if (addFoamPairNext && foamPairIndex < shuffledFoamPairs.length) {
          const [left, right] = shuffledFoamPairs[foamPairIndex];
          const pairDuration = foamRollingHold * 2;
          if (foamDuration + pairDuration <= foamRollingMaxSeconds) {
            selectedExercises.push({ ...left, duration: foamRollingHold });
            selectedExercises.push({ ...right, duration: foamRollingHold });
            foamDuration += pairDuration;
            totalDuration += pairDuration;
          }
          foamPairIndex++;
        } else if (foamNonBiIndex < shuffledFoamNonBilateral.length) {
          if (foamDuration + foamRollingHold <= foamRollingMaxSeconds) {
            selectedExercises.push({ ...shuffledFoamNonBilateral[foamNonBiIndex], duration: foamRollingHold });
            foamDuration += foamRollingHold;
            totalDuration += foamRollingHold;
          }
          foamNonBiIndex++;
        }
        addFoamPairNext = !addFoamPairNext;
        
        if (foamPairIndex >= shuffledFoamPairs.length) addFoamPairNext = false;
        if (foamNonBiIndex >= shuffledFoamNonBilateral.length) addFoamPairNext = true;
      }
    }

    // Find stretches for target areas, excluding injury-affected ones
    const relevantStretches = stretches.filter(s =>
      s.targetAreas.some(area => targetAreas.includes(area)) &&
      !excludeStretches.includes(s.id)
    );

    // Identify bilateral stretches (those with -left/-right suffixes)
    const getBilateralBase = (id: string): string | null => {
      if (id.endsWith('-left')) return id.replace(/-left$/, '');
      if (id.endsWith('-right')) return id.replace(/-right$/, '');
      return null;
    };

    // Separate bilateral and non-bilateral stretches
    const bilateralBases = new Set<string>();
    const nonBilateralStretches: Stretch[] = [];
    
    relevantStretches.forEach(s => {
      const base = getBilateralBase(s.id);
      if (base) {
        bilateralBases.add(base);
      } else {
        nonBilateralStretches.push(s);
      }
    });

    // Create bilateral pairs (left first, then right)
    const bilateralPairs: Stretch[][] = [];
    bilateralBases.forEach(base => {
      const left = relevantStretches.find(s => s.id === `${base}-left`);
      const right = relevantStretches.find(s => s.id === `${base}-right`);
      if (left && right) {
        bilateralPairs.push([left, right]);
      }
    });

    // Shuffle both groups
    const shuffledPairs = [...bilateralPairs].sort(() => Math.random() - 0.5);
    const shuffledNonBilateral = [...nonBilateralStretches].sort(() => Math.random() - 0.5);

    const maxSeconds = Math.min(targetDuration * 60, 900); // Max 15 minutes for stretching
    let stretchDurationTotal = 0;

    const addStretch = (stretch: Stretch): boolean => {
      let adjustedDuration = stretchDuration;
      if (reducedDuration.includes(stretch.id)) {
        adjustedDuration = Math.round(adjustedDuration * DURATION_REDUCTION_FACTOR);
      }
      
      if (stretchDurationTotal + adjustedDuration <= maxSeconds) {
        selectedExercises.push({
          ...stretch,
          duration: adjustedDuration,
        });
        stretchDurationTotal += adjustedDuration;
        totalDuration += adjustedDuration;
        return true;
      }
      return false;
    };

    // Interleave bilateral pairs and non-bilateral stretches
    let pairIndex = 0;
    let nonBiIndex = 0;
    let addPairNext = true;

    while ((pairIndex < shuffledPairs.length || nonBiIndex < shuffledNonBilateral.length) && stretchDurationTotal < maxSeconds - 20) {
      if (addPairNext && pairIndex < shuffledPairs.length) {
        const [left, right] = shuffledPairs[pairIndex];
        // Check if we can fit both stretches
        const pairDuration = stretchDuration * 2;
        if (stretchDurationTotal + pairDuration <= maxSeconds) {
          addStretch(left);
          addStretch(right);
        }
        pairIndex++;
      } else if (nonBiIndex < shuffledNonBilateral.length) {
        addStretch(shuffledNonBilateral[nonBiIndex]);
        nonBiIndex++;
      }
      addPairNext = !addPairNext;
      
      // If one group is exhausted, keep adding from the other
      if (pairIndex >= shuffledPairs.length) addPairNext = false;
      if (nonBiIndex >= shuffledNonBilateral.length) addPairNext = true;
    }

    // Ensure we have at least 5 stretches
    while (selectedExercises.length < 5 && (pairIndex < shuffledPairs.length || nonBiIndex < shuffledNonBilateral.length)) {
      if (pairIndex < shuffledPairs.length) {
        const [left, right] = shuffledPairs[pairIndex];
        addStretch(left);
        addStretch(right);
        pairIndex++;
      } else if (nonBiIndex < shuffledNonBilateral.length) {
        addStretch(shuffledNonBilateral[nonBiIndex]);
        nonBiIndex++;
      }
    }

    return {
      stretches: selectedExercises,
      totalDuration,
      focusAreas: targetAreas,
      injuryWarnings: warnings,
    };
  };

  const MIN_SESSION_TIME = 5 * 60; // 5 minutes in seconds

  const completeSessionWithFeedback = (feedback: SessionFeedback) => {
    // Use local date to avoid timezone issues (toISOString uses UTC)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

    const shouldAddToCalendar = feedback.totalActiveTime >= MIN_SESSION_TIME;

    setProfile(prev => {
      const completedDates = prev.completedDates || [];
      const completedSessions = prev.completedSessions || [];
      
      // Create session record with feedback
      const sessionRecord: CompletedSession = {
        date: today,
        feedback,
      };

      if (!shouldAddToCalendar) {
        // Session too short - just record the feedback but don't add to calendar/streaks
        return {
          ...prev,
          completedSessions: [...completedSessions, sessionRecord],
        };
      }

      const isConsecutive = prev.lastSessionDate === yesterday;
      const isToday = prev.lastSessionDate === today;

      const newStreak = isToday
        ? prev.currentStreak
        : isConsecutive
        ? prev.currentStreak + 1
        : 1;
      
      const newLongestStreak = Math.max(prev.longestStreak || 0, newStreak);

      return {
        ...prev,
        totalSessions: isToday ? prev.totalSessions : prev.totalSessions + 1,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastSessionDate: today,
        completedDates: isToday || completedDates.includes(today) 
          ? completedDates 
          : [...completedDates, today],
        completedSessions: [...completedSessions, sessionRecord],
      };
    });
  };

  // Legacy function for backwards compatibility (still used by StretchTimer/StretchChecklist internally)
  const completeSession = () => {
    // This is now a no-op as we use completeSessionWithFeedback
    // The actual completion is handled by the feedback flow
  };

  const dismissWeeklySummary = () => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const currentWeek = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
    
    setProfile(prev => ({
      ...prev,
      lastWeeklySummaryShown: currentWeek,
    }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
  };

  const saveRoutine = (name: string, routine: StretchingRoutine, existingId?: string) => {
    if (existingId) {
      // Update existing routine
      setProfile(prev => ({
        ...prev,
        savedRoutines: (prev.savedRoutines || []).map(r =>
          r.id === existingId
            ? { ...r, name, routine, createdAt: new Date().toISOString() }
            : r
        ),
      }));
      return;
    }
    
    // Create new routine
    const newRoutine: SavedRoutine = {
      id: `routine-${Date.now()}`,
      name,
      routine,
      createdAt: new Date().toISOString(),
    };
    setProfile(prev => ({
      ...prev,
      savedRoutines: [...(prev.savedRoutines || []), newRoutine],
    }));
    return newRoutine;
  };

  const deleteRoutine = (id: string) => {
    setProfile(prev => ({
      ...prev,
      savedRoutines: (prev.savedRoutines || []).filter(r => r.id !== id),
    }));
  };

  const clearOldSessions = (olderThanDays: number = 365) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffStr = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;

    setProfile(prev => {
      const filteredDates = (prev.completedDates || []).filter(date => date >= cutoffStr);
      const filteredSessions = (prev.completedSessions || []).filter(session => session.date >= cutoffStr);
      
      return {
        ...prev,
        completedDates: filteredDates,
        completedSessions: filteredSessions,
      };
    });

    return true;
  };

  return {
    profile,
    customStretches,
    setName,
    setSport,
    toggleSorenessArea,
    setSorenessLevel,
    addInjury,
    removeInjury,
    generateRoutine,
    completeSession,
    completeSessionWithFeedback,
    dismissWeeklySummary,
    resetProfile,
    saveRoutine,
    deleteRoutine,
    addCustomStretch,
    removeCustomStretch,
    clearOldSessions,
  };
}
