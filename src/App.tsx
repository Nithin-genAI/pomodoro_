/**
 * =============================================================================
 * Pomodoro Focus App - Main Application Component
 * =============================================================================
 *
 * This is the root component of the Pomodoro Focus web application.
 * It orchestrates all child components, manages global state, and
 * handles data persistence through localStorage.
 *
 * Part of Whole App:
 *     This component serves as the application shell that:
 *     - Initializes and manages the timer logic (useTimer hook)
 *     - Persists settings and sessions to localStorage (useLocalStorage hook)
 *     - Calculates daily statistics from session history
 *     - Coordinates child components (Timer, Controls, Settings, Statistics)
 *     - Handles view switching between timer and statistics
 *
 * Architecture:
 *     - Root component with state management
 *     - Composes child components for modular UI
 *     - Uses custom hooks for timer logic and persistence
 *     - Responsive layout with header, main content, and footer
 *     - Clean, minimal aesthetic with smooth transitions
 * =============================================================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS, Session, DailyStats, TimerMode } from './types';
import { useLocalStorage, useSessionStorage } from './hooks/useLocalStorage';
import { useTimer } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import Settings from './components/Settings';
import Statistics from './components/Statistics';

/**
 * Main App component - Root of the Pomodoro Focus application.
 *
 * Manages global state, data persistence, and component composition.
 * Provides the complete Pomodoro timer experience with focus tracking.
 */
const App: React.FC = () => {
  // State management with localStorage persistence
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'pomodoro-settings',
    DEFAULT_SETTINGS
  );
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState<'timer' | 'stats'>('timer');

  // Session storage hook
  const { sessions, addSession, getTodaySessions } = useSessionStorage();

  // Session completion handler
  const handleSessionComplete = useCallback(
    (session: Session) => {
      addSession(session);
    },
    [addSession]
  );

  // Timer hook
  const { timerState, start, pause, reset, skip, switchMode } = useTimer({
    settings,
    onSessionComplete: handleSessionComplete,
  });

  // Calculate today's statistics
  const todayStats: DailyStats = useMemo(() => {
    const todaySessions = getTodaySessions();
    const focusSessions = todaySessions.filter(
      (s) => s.mode === 'focus' && s.completed
    );
    const breakSessions = todaySessions.filter(
      (s) => (s.mode === 'shortBreak' || s.mode === 'longBreak') && s.completed
    );

    return {
      date: new Date().toISOString().split('T')[0],
      totalFocusMinutes: Math.round(
        focusSessions.reduce((sum, s) => sum + s.duration / 60, 0)
      ),
      sessionsCompleted: focusSessions.length,
      totalBreakMinutes: Math.round(
        breakSessions.reduce((sum, s) => sum + s.duration / 60, 0)
      ),
    };
  }, [sessions, getTodaySessions]);

  // Handle settings save
  const handleSaveSettings = useCallback(
    (newSettings: AppSettings) => {
      setSettings(newSettings);
      // Reset timer when settings change
      reset();
    },
    [setSettings, reset]
  );

  // Handle mode switch
  const handleSwitchMode = useCallback(
    (mode: TimerMode) => {
      switchMode(mode);
    },
    [switchMode]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <h1 className="text-xl font-bold text-gray-800">Pomodoro</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveView('timer')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeView === 'timer'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeView === 'stats'
                  ? 'bg-white shadow-sm text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Stats
            </button>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 
                       flex items-center justify-center transition-colors"
            title="Settings"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        {activeView === 'timer' ? (
          <div className="flex flex-col items-center gap-10 w-full max-w-md">
            {/* Timer display */}
            <TimerDisplay timerState={timerState} />

            {/* Controls */}
            <Controls
              timerState={timerState}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
              onSwitchMode={handleSwitchMode}
            />

            {/* Quick stats preview */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <span>🎯</span>
                <span>{todayStats.totalFocusMinutes}m focused</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span>✅</span>
                <span>{todayStats.sessionsCompleted} sessions</span>
              </div>
            </div>
          </div>
        ) : (
          <Statistics sessions={sessions} todayStats={todayStats} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          Stay focused. Take breaks. Be productive. 🍅
        </p>
      </footer>

      {/* Settings modal */}
      <Settings
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
        isOpen={showSettings}
      />
    </div>
  );
};

export default App;
