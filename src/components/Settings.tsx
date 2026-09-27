/**
 * =============================================================================
 * Pomodoro Focus App - Settings Component
 * =============================================================================
 *
 * This component provides the settings panel for customizing timer durations
 * and application preferences. Users can adjust focus time, break times,
 * and automation settings.
 *
 * Part of Whole App:
 *     This component handles user configuration of the Pomodoro timer:
 *     - Focus duration (1-120 minutes)
 *     - Short break duration (1-30 minutes)
 *     - Long break duration (1-60 minutes)
 *     - Sessions before long break (1-10)
 *     - Auto-start preferences
 *
 * Architecture:
 *     - Modal/panel that slides in from the right
 *     - Form inputs with validation
 *     - Saves settings to localStorage via parent callback
 *     - Provides visual feedback for changes
 * =============================================================================
 */

import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Settings component - Timer configuration panel.
 *
 * @param settings - Current settings
 * @param onSave - Save callback
 * @param onClose - Close panel callback
 * @param isOpen - Whether panel is visible
 */
const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClose, isOpen }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleChange = (field: keyof AppSettings, value: number | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartFocus: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 
                       flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Duration settings */}
        <div className="space-y-5">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Timer Durations
          </h3>

          {/* Focus Duration */}
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">🎯 Focus</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange('focusDuration', Math.max(1, localSettings.focusDuration - 5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={localSettings.focusDuration}
                onChange={(e) => handleChange('focusDuration', Math.min(120, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-300"
                min={1}
                max={120}
              />
              <button
                onClick={() => handleChange('focusDuration', Math.min(120, localSettings.focusDuration + 5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
              <span className="text-sm text-gray-400 w-8">min</span>
            </div>
          </div>

          {/* Short Break Duration */}
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">☕ Short Break</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange('shortBreakDuration', Math.max(1, localSettings.shortBreakDuration - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-300"
                min={1}
                max={30}
              />
              <button
                onClick={() => handleChange('shortBreakDuration', Math.min(30, localSettings.shortBreakDuration + 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
              <span className="text-sm text-gray-400 w-8">min</span>
            </div>
          </div>

          {/* Long Break Duration */}
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">🌿 Long Break</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange('longBreakDuration', Math.max(1, localSettings.longBreakDuration - 5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                min={1}
                max={60}
              />
              <button
                onClick={() => handleChange('longBreakDuration', Math.min(60, localSettings.longBreakDuration + 5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
              <span className="text-sm text-gray-400 w-8">min</span>
            </div>
          </div>

          {/* Sessions before long break */}
          <div className="flex items-center justify-between">
            <label className="text-gray-700 font-medium">🔄 Long break after</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange('sessionsBeforeLongBreak', Math.max(1, localSettings.sessionsBeforeLongBreak - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={localSettings.sessionsBeforeLongBreak}
                onChange={(e) => handleChange('sessionsBeforeLongBreak', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
                min={1}
                max={10}
              />
              <button
                onClick={() => handleChange('sessionsBeforeLongBreak', Math.min(10, localSettings.sessionsBeforeLongBreak + 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                +
              </button>
              <span className="text-sm text-gray-400 w-8">sess</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-5" />

        {/* Automation settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Automation
          </h3>

          <div className="flex items-center justify-between">
            <label className="text-gray-700">Auto-start breaks</label>
            <button
              onClick={() => handleChange('autoStartBreaks', !localSettings.autoStartBreaks)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                localSettings.autoStartBreaks ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  localSettings.autoStartBreaks ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-700">Auto-start focus</label>
            <button
              onClick={() => handleChange('autoStartFocus', !localSettings.autoStartFocus)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                localSettings.autoStartFocus ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  localSettings.autoStartFocus ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 
                       hover:bg-gray-50 font-medium transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 text-white 
                       hover:bg-gray-900 font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
