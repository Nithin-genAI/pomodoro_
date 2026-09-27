/**
 * =============================================================================
 * Pomodoro Focus App - TypeScript Type Definitions
 * =============================================================================
 *
 * This module defines all TypeScript types and interfaces used throughout
 * the Pomodoro Focus application frontend.
 *
 * Part of Whole App:
 *     These types provide compile-time safety and documentation for:
 *     - Timer mode configurations (focus, short break, long break)
 *     - Session data structures for localStorage persistence
 *     - Application state interfaces
 *     - Settings configuration types
 *
 * Architecture:
 *     - TimerMode: Enum-like type for session modes
 *     - Session: Individual timer session record
 *     - DailyStats: Aggregated daily statistics
 *     - AppSettings: User-customizable timer settings
 *     - TimerState: Current timer running state
 * =============================================================================
 */

/** Valid timer modes for the Pomodoro technique */
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

/** Display information for each timer mode */
export interface ModeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

/** A single Pomodoro session record */
export interface Session {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  startedAt: number; // timestamp
  endedAt: number | null; // timestamp
  completed: boolean;
}

/** Daily aggregated statistics */
export interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalFocusMinutes: number;
  sessionsCompleted: number;
  totalBreakMinutes: number;
}

/** User-customizable timer settings */
export interface AppSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

/** Current state of the timer */
export interface TimerState {
  mode: TimerMode;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  completedSessions: number; // focus sessions completed in current cycle
}

/** Mode configuration map */
export const MODE_CONFIGS: Record<TimerMode, ModeConfig> = {
  focus: {
    label: 'Focus',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '🎯',
  },
  shortBreak: {
    label: 'Short Break',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '☕',
  },
  longBreak: {
    label: 'Long Break',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🌿',
  },
};

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};
