/**
 * =============================================================================
 * Pomodoro Focus App - Timer Display Component
 * =============================================================================
 *
 * This component renders the main timer display showing the countdown
 * in MM:SS format with a circular progress indicator.
 *
 * Part of Whole App:
 *     This is the primary visual element of the Pomodoro app. It displays:
 *     - Current time remaining in large, readable format
 *     - Circular progress ring showing session progress
 *     - Current mode indicator (Focus/Short Break/Long Break)
 *     - Visual feedback through color changes per mode
 *
 * Architecture:
 *     - Receives timer state from parent via props
 *     - Calculates progress percentage for the ring
 *     - Formats time as MM:SS string
 *     - Uses SVG for the circular progress indicator
 * =============================================================================
 */

import React from 'react';
import { TimerState, TimerMode, MODE_CONFIGS } from '../types';

interface TimerDisplayProps {
  timerState: TimerState;
}

/** Format seconds into MM:SS string */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/** Get progress percentage (0-100) */
const getProgress = (timeRemaining: number, totalTime: number): number => {
  if (totalTime === 0) return 0;
  return ((totalTime - timeRemaining) / totalTime) * 100;
};

/** Get color scheme based on timer mode */
const getModeColors = (mode: TimerMode) => {
  switch (mode) {
    case 'focus':
      return { ring: '#ef4444', ringBg: '#fecaca', text: '#dc2626' };
    case 'shortBreak':
      return { ring: '#22c55e', ringBg: '#bbf7d0', text: '#16a34a' };
    case 'longBreak':
      return { ring: '#3b82f6', ringBg: '#bfdbfe', text: '#2563eb' };
  }
};

/**
 * TimerDisplay component - Shows the countdown timer with progress ring.
 *
 * @param timerState - Current state of the timer
 */
const TimerDisplay: React.FC<TimerDisplayProps> = ({ timerState }) => {
  const progress = getProgress(timerState.timeRemaining, timerState.totalTime);
  const colors = getModeColors(timerState.mode);
  const config = MODE_CONFIGS[timerState.mode];

  // SVG circle parameters
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Mode indicator */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">{config.icon}</span>
        <span
          className="text-lg font-semibold tracking-wide uppercase"
          style={{ color: colors.text }}
        >
          {config.label}
        </span>
      </div>

      {/* Timer circle */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.ringBg}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-6xl font-light tracking-tight tabular-nums"
            style={{ color: colors.text }}
          >
            {formatTime(timerState.timeRemaining)}
          </span>
          <span className="text-sm text-gray-400 mt-2">
            Session {timerState.completedSessions + 1}
          </span>
        </div>
      </div>

      {/* Session dots */}
      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < timerState.completedSessions % 4
                ? 'bg-red-400 scale-110'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TimerDisplay;
