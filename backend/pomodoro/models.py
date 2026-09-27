"""
=============================================================================
Pomodoro App - Database Models
=============================================================================

This module defines the database models for the Pomodoro Focus application.
It contains the data structures for tracking focus sessions, break sessions,
user settings, and daily statistics.

Part of Whole App:
    These models form the data layer of the application. They define how
    Pomodoro session data is stored, related, and queried. The models
    support:
    - Recording individual focus/break sessions with timestamps
    - Tracking daily aggregated statistics
    - Storing user-customizable timer settings
    - Maintaining session history for analytics

Architecture:
    - Session model: Records each completed Pomodoro session
    - DailyStats model: Aggregated daily focus time statistics
    - UserSettings model: Customizable timer durations per user
    - All models include proper indexing for efficient queries
=============================================================================
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Session(models.Model):
    """
    Represents a single Pomodoro session (focus, short break, or long break).

    Each session records its type, duration, start/end times, and completion
    status. Sessions are the fundamental unit of data in the Pomodoro system.

    Attributes:
        SESSION_TYPES: Tuple of valid session type choices
        session_type: The type of session (focus, short_break, long_break)
        duration_minutes: Planned duration in minutes
        started_at: When the session was started
        ended_at: When the session was ended (null if still running)
        completed: Whether the session was completed without interruption
        user: Foreign key to the User (null for anonymous sessions)
        created_at: Auto-generated timestamp for record creation
    """
    SESSION_TYPES = [
        ('focus', 'Focus Session'),
        ('short_break', 'Short Break'),
        ('long_break', 'Long Break'),
    ]

    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPES,
        default='focus',
        db_index=True
    )
    duration_minutes = models.PositiveIntegerField(
        default=25,
        help_text="Planned duration in minutes"
    )
    started_at = models.DateTimeField(
        default=timezone.now,
        help_text="When the session was started"
    )
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the session was ended"
    )
    completed = models.BooleanField(
        default=False,
        help_text="Whether the session was completed without interruption"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='pomodoro_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'started_at']),
            models.Index(fields=['session_type', 'completed']),
        ]
        verbose_name = 'Pomodoro Session'
        verbose_name_plural = 'Pomodoro Sessions'

    def __str__(self):
        status = "Completed" if self.completed else "Incomplete"
        return f"{self.get_session_type_display()} - {self.duration_minutes}min ({status})"

    @property
    def actual_duration_minutes(self):
        """Calculate the actual duration if the session has ended."""
        if self.ended_at and self.started_at:
            delta = self.ended_at - self.started_at
            return delta.total_seconds() / 60
        return 0


class DailyStats(models.Model):
    """
    Aggregated daily statistics for Pomodoro focus tracking.

    This model stores pre-computed daily totals to enable fast retrieval
    of statistics without recalculating from individual sessions.

    Attributes:
        date: The date for these statistics
        total_focus_minutes: Total minutes of focused work
        sessions_completed: Number of completed focus sessions
        total_break_minutes: Total minutes spent on breaks
        user: Foreign key to the User
    """
    date = models.DateField(db_index=True)
    total_focus_minutes = models.PositiveIntegerField(default=0)
    sessions_completed = models.PositiveIntegerField(default=0)
    total_break_minutes = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='daily_stats'
    )

    class Meta:
        unique_together = ['date', 'user']
        ordering = ['-date']
        verbose_name = 'Daily Statistics'
        verbose_name_plural = 'Daily Statistics'

    def __str__(self):
        return f"Stats for {self.date}: {self.total_focus_minutes}min focus, {self.sessions_completed} sessions"


class UserSettings(models.Model):
    """
    Customizable timer settings for each user.

    Allows users to configure their preferred durations for focus sessions,
    short breaks, long breaks, and the number of sessions before a long break.

    Attributes:
        user: One-to-one relationship with User
        focus_duration: Duration of focus sessions in minutes
        short_break_duration: Duration of short breaks in minutes
        long_break_duration: Duration of long breaks in minutes
        sessions_before_long_break: Number of focus sessions before long break
        auto_start_breaks: Whether to automatically start breaks
        auto_start_pomodoros: Whether to automatically start next focus session
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='pomodoro_settings'
    )
    focus_duration = models.PositiveIntegerField(
        default=25,
        help_text="Focus session duration in minutes"
    )
    short_break_duration = models.PositiveIntegerField(
        default=5,
        help_text="Short break duration in minutes"
    )
    long_break_duration = models.PositiveIntegerField(
        default=15,
        help_text="Long break duration in minutes"
    )
    sessions_before_long_break = models.PositiveIntegerField(
        default=4,
        help_text="Number of focus sessions before a long break"
    )
    auto_start_breaks = models.BooleanField(
        default=False,
        help_text="Automatically start break after focus session"
    )
    auto_start_pomodoros = models.BooleanField(
        default=False,
        help_text="Automatically start next focus session after break"
    )

    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'

    def __str__(self):
        return f"Settings for {self.user.username}: {self.focus_duration}/{self.short_break_duration}/{self.long_break_duration}"
