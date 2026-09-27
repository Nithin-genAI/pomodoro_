"""
=============================================================================
Pomodoro App - Django Admin Configuration
=============================================================================

This module registers the Pomodoro models with the Django admin interface,
providing a user-friendly way to manage session data, statistics, and
user settings through the built-in admin panel.

Part of Whole App:
    The admin configuration enables developers and administrators to:
    - View and manage all Pomodoro sessions
    - Inspect daily statistics
    - Modify user settings
    - Search and filter records for debugging and analysis

Architecture:
    - Custom admin classes with list displays, filters, and search
    - Read-only fields for computed values
    - Date-based filtering for session management
    - Export-friendly list configurations
=============================================================================
"""

from django.contrib import admin
from .models import Session, DailyStats, UserSettings


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Session model.

    Provides a comprehensive view of all Pomodoro sessions with
    filtering, searching, and date-based organization.
    """
    list_display = [
        'session_type', 'duration_minutes', 'started_at',
        'ended_at', 'completed', 'user', 'created_at'
    ]
    list_filter = ['session_type', 'completed', 'started_at']
    search_fields = ['user__username', 'session_type']
    date_hierarchy = 'started_at'
    readonly_fields = ['created_at']

    fieldsets = (
        ('Session Details', {
            'fields': ('session_type', 'duration_minutes', 'completed')
        }),
        ('Timing', {
            'fields': ('started_at', 'ended_at')
        }),
        ('User & Metadata', {
            'fields': ('user', 'created_at')
        }),
    )


@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    """
    Admin configuration for the DailyStats model.

    Shows daily aggregated statistics with date-based filtering
    and sorting capabilities.
    """
    list_display = [
        'date', 'total_focus_minutes', 'sessions_completed',
        'total_break_minutes', 'user'
    ]
    list_filter = ['date']
    search_fields = ['user__username']
    date_hierarchy = 'date'


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """
    Admin configuration for the UserSettings model.

    Allows administrators to view and modify user timer preferences.
    """
    list_display = [
        'user', 'focus_duration', 'short_break_duration',
        'long_break_duration', 'sessions_before_long_break'
    ]
    search_fields = ['user__username']
