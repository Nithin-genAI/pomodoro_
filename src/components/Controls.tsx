/**
 * =============================================================================
 * Pomodoro Focus App - Controls Component
 * =============================================================================
 *
 * This component renders the timer control buttons: Start, Pause, Reset,
 * and Skip. It provides the primary interaction interface for the user
 * to control the Pomodoro timer.
 *
 * Part of Whole App:
 *     This component handles user interaction for timer control:
 *     - Start: Begin or resume the countdown
 *     - Pause: Temporarily stop the countdown
 *     - Reset: Reset current timer to initial duration
 *     - Skip: Skip to the next mode (focus/break)
 *
 * Architecture:
 *     - Receives control functions from parent via props
 *     - Renders appropriate button states (start vs pause)
 *     - Provides visual feedback through hover/active states
 *     - Accessible button labels and keyboard support
 * =============================================================================
 */

import React from 'react';
import { TimerState, TimerMode, MODE_CONFIGS } from '../types';

interface ControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
}

/**
 * Controls component - Timer control buttons and mode switcher.
 *
 * @param timerState - Current timer state
 * @param onStart - Start/resume timer callback
 * @param onPause - Pause timer callback
 * @param onReset - Reset timer callback
 * @param onSkip - Skip to next mode callback
 * @param onSwitchMode - Switch to specific mode callback
 */
const Controls: React.FC<ControlsProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSwitchMode,
}) => {
  const config = MODE_CONFIGS[timerState.mode];

  const getButtonColor = () => {
    switch (timerState.mode) {
      case 'focus':
        return 'bg-red-500 hover:bg-red-600 active:bg-red-700';
      case 'shortBreak':
        return 'bg-green-500 hover:bg-green-600 active:bg-green-700';
      case 'longBreak':
        return 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {(Object.keys(MODE_CONFIGS) as TimerMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onSwitchMode(mode)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              timerState.mode === mode
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {MODE_CONFIGS[mode].icon} {MODE_CONFIGS[mode].label}
          </button>
        ))}
      </div>

      {/* Main control buttons */}
      <div className="flex items-center gap-4">
        {/* Reset button */}
        <button
          onClick={onReset}
          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 
                     active:bg-gray-300 flex items-center justify-center 
                     transition-all duration-200 group"
          title="Reset"
          aria-label="Reset timer"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Start/Pause button */}
        <button
          onClick={timerState.isRunning && !timerState.isPaused ? onPause : onStart}
          className={`w-16 h-16 rounded-full ${getButtonColor()} text-white 
                     flex items-center justify-center shadow-lg 
                     hover:shadow-xl active:shadow-md transition-all duration-200`}
          title={timerState.isRunning && !timerState.isPaused ? 'Pause' : 'Start'}
          aria-label={timerState.isRunning && !timerState.isPaused ? 'Pause timer' : 'Start timer'}
        >
          {timerState.isRunning && !timerState.isPaused ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 
                     active:bg-gray-300 flex items-center justify-center 
                     transition-all duration-200 group"
          title="Skip to next"
          aria-label="Skip to next session"
        >
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5l0 14"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls;
