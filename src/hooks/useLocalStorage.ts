/**
 * =============================================================================
 * Pomodoro Focus App - Local Storage Hook
 * =============================================================================
 *
 * This module provides a custom React hook for persisting state to
 * localStorage with automatic JSON serialization/deserialization.
 *
 * Part of Whole App:
 *     This hook enables data persistence across browser sessions without
 *     requiring a backend database. It stores:
 *     - User settings (timer durations, preferences)
 *     - Session history (completed Pomodoro sessions)
 *     - Daily statistics (aggregated focus time)
 *     - Timer state (current mode, progress)
 *
 * Architecture:
 *     - useLocalStorage: Generic hook for any serializable state
 *     - Automatic JSON parse/stringify
 *     - Error handling for corrupted localStorage data
 *     - SSR-safe (checks for window object)
 * =============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage.
 *
 * @param key - The localStorage key to store the value under
 * @param initialValue - Default value if no stored value exists
 * @returns Tuple of [storedValue, setValue] similar to useState
 *
 * @example
 * const [settings, setSettings] = useLocalStorage('pomodoro-settings', DEFAULT_SETTINGS);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Persist to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Return wrapped setter that also updates state
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  }, []);

  return [storedValue, setValue];
}

/**
 * Hook specifically for managing session history in localStorage.
 *
 * @returns Object with sessions array and helper functions
 */
export function useSessionStorage() {
  const [sessions, setSessions] = useLocalStorage<import('../types').Session[]>(
    'pomodoro-sessions',
    []
  );

  const addSession = useCallback((session: import('../types').Session) => {
    setSessions((prev) => [session, ...prev].slice(0, 500)); // Keep last 500 sessions
  }, [setSessions]);

  const getTodaySessions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter((s) => {
      const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
      return sessionDate === today;
    });
  }, [sessions]);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, [setSessions]);

  return { sessions, addSession, getTodaySessions, clearSessions };
}
