/**
 * =============================================================================
 * Pomodoro Focus App - Timer Logic Hook
 * =============================================================================
 *
 * This module provides the core timer logic for the Pomodoro application.
 * It manages countdown timing, mode transitions, session tracking, and
 * the Pomodoro cycle (focus → break → focus → ... → long break).
 *
 * Part of Whole App:
 *     This hook is the heart of the Pomodoro timer. It handles:
 *     - Countdown timer with 1-second intervals
 *     - Mode transitions (focus → short break → focus → ... → long break)
 *     - Session completion tracking
 *     - Audio notifications on completion
 *     - Auto-start functionality based on user settings
 *
 * Architecture:
 *     - Uses setInterval for countdown precision
 *     - Manages Pomodoro cycle state (session count)
 *     - Integrates with localStorage for persistence
 *     - Provides callbacks for UI components
 * =============================================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, TimerState, AppSettings, Session, DEFAULT_SETTINGS } from '../types';

/** Generate a unique ID for sessions */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/** Get duration in seconds for a given mode */
const getDurationSeconds = (mode: TimerMode, settings: AppSettings): number => {
  switch (mode) {
    case 'focus':
      return settings.focusDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
  }
};

/** Determine the next mode after current session completes */
const getNextMode = (
  currentMode: TimerMode,
  completedFocusSessions: number,
  settings: AppSettings
): TimerMode => {
  if (currentMode === 'focus') {
    // After focus, check if we need a long break
    if (completedFocusSessions % settings.sessionsBeforeLongBreak === 0) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  // After any break, go back to focus
  return 'focus';
};

interface UseTimerProps {
  settings: AppSettings;
  onSessionComplete: (session: Session) => void;
}

interface UseTimerReturn {
  timerState: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (mode: TimerMode) => void;
}

/**
 * Custom hook for Pomodoro timer logic.
 *
 * @param settings - User timer settings
 * @param onSessionComplete - Callback when a session completes
 * @returns Timer state and control functions
 */
export function useTimer({ settings, onSessionComplete }: UseTimerProps): UseTimerReturn {
  const [timerState, setTimerState] = useState<TimerState>(() => ({
    mode: 'focus',
    timeRemaining: getDurationSeconds('focus', settings),
    totalTime: getDurationSeconds('focus', settings),
    isRunning: false,
    isPaused: false,
    completedSessions: 0,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  // Play notification sound
  const playNotification = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not available, silently fail
    }
  }, []);

  // Handle session completion
  const completeSession = useCallback(() => {
    const session: Session = {
      id: generateId(),
      mode: timerState.mode,
      duration: timerState.totalTime,
      startedAt: sessionStartRef.current,
      endedAt: Date.now(),
      completed: true,
    };

    onSessionComplete(session);
    playNotification();

    // Determine next mode
    const newCompletedSessions =
      timerState.mode === 'focus'
        ? timerState.completedSessions + 1
        : timerState.completedSessions;

    const nextMode = getNextMode(timerState.mode, newCompletedSessions, settings);
    const nextDuration = getDurationSeconds(nextMode, settings);

    setTimerState({
      mode: nextMode,
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      isRunning: settings.autoStartBreaks || settings.autoStartFocus,
      isPaused: false,
      completedSessions: newCompletedSessions,
    });

    sessionStartRef.current = Date.now();
  }, [timerState, settings, onSessionComplete, playNotification]);

  // Timer countdown effect
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Session complete
            clearInterval(intervalRef.current!);
            return { ...prev, timeRemaining: 0, isRunning: false };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused]);

  // Watch for time reaching zero
  useEffect(() => {
    if (timerState.timeRemaining === 0 && timerState.isRunning) {
      completeSession();
    }
  }, [timerState.timeRemaining, timerState.isRunning, completeSession]);

  // Start the timer
  const start = useCallback(() => {
    if (!startTimeRef.current) {
      sessionStartRef.current = Date.now();
    }
    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
  }, []);

  // Pause the timer
  const pause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: true,
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Reset the current timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const duration = getDurationSeconds(timerState.mode, settings);
    setTimerState((prev) => ({
      ...prev,
      timeRemaining: duration,
      totalTime: duration,
      isRunning: false,
      isPaused: false,
    }));
    startTimeRef.current = null;
  }, [timerState.mode, settings]);

  // Skip to next mode
  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const newCompletedSessions =
      timerState.mode === 'focus'
        ? timerState.completedSessions + 1
        : timerState.completedSessions;

    const nextMode = getNextMode(timerState.mode, newCompletedSessions, settings);
    const nextDuration = getDurationSeconds(nextMode, settings);

    setTimerState({
      mode: nextMode,
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      isRunning: false,
      isPaused: false,
      completedSessions: newCompletedSessions,
    });
  }, [timerState.mode, timerState.completedSessions, settings]);

  // Switch to a specific mode
  const switchMode = useCallback(
    (mode: TimerMode) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const duration = getDurationSeconds(mode, settings);
      setTimerState((prev) => ({
        ...prev,
        mode,
        timeRemaining: duration,
        totalTime: duration,
        isRunning: false,
        isPaused: false,
      }));
      startTimeRef.current = null;
    },
    [settings]
  );

  return {
    timerState,
    start,
    pause,
    reset,
    skip,
    switchMode,
  };
}
