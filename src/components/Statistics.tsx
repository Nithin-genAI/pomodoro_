/**
 * =============================================================================
 * Pomodoro Focus App - Statistics Component
 * =============================================================================
 *
 * This component displays today's focus statistics including total focus time,
 * completed sessions, and a visual breakdown of the day's productivity.
 *
 * Part of Whole App:
 *     This component provides the analytics view of the Pomodoro app:
 *     - Today's total focus time
 *     - Number of completed sessions
 *     - Total break time
 *     - Visual progress indicators
 *     - Recent session history
 *
 * Architecture:
 *     - Receives session data from parent
 *     - Calculates today's aggregated statistics
 *     - Renders stat cards with icons and values
 *     - Shows recent session timeline
 * =============================================================================
 */

import React from 'react';
import { Session, DailyStats, MODE_CONFIGS } from '../types';

interface StatisticsProps {
  sessions: Session[];
  todayStats: DailyStats;
}

/**
 * Statistics component - Displays today's focus analytics.
 *
 * @param sessions - All session records
 * @param todayStats - Pre-calculated today's statistics
 */
const Statistics: React.FC<StatisticsProps> = ({ sessions, todayStats }) => {
  // Get today's sessions for the timeline
  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return sessionDate === today;
  });

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Focus time */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xl font-bold text-gray-800">
            {formatMinutes(todayStats.totalFocusMinutes)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Focus Time</div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-xl font-bold text-gray-800">
            {todayStats.sessionsCompleted}
          </div>
          <div className="text-xs text-gray-400 mt-1">Sessions</div>
        </div>

        {/* Break time */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-2xl mb-1">☕</div>
          <div className="text-xl font-bold text-gray-800">
            {formatMinutes(todayStats.totalBreakMinutes)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Break Time</div>
        </div>
      </div>

      {/* Focus progress bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Daily Goal</span>
          <span className="text-sm text-gray-400">
            {todayStats.totalFocusMinutes} / 120 min
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (todayStats.totalFocusMinutes / 120) * 100)}%` }}
          />
        </div>
      </div>

      {/* Recent sessions */}
      {todaySessions.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Today's Sessions
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todaySessions.slice(0, 10).map((session) => {
              const config = MODE_CONFIGS[session.mode];
              const time = new Date(session.startedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-sm text-gray-700">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{time}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(session.duration / 60)}m
                    </span>
                    {session.completed ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
