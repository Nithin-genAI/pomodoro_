"""
=============================================================================
Pomodoro App - REST API Serializers
=============================================================================

This module defines the serializers for converting between complex data types
(Python objects/QuerySets) and native Python datatypes that can then be easily
rendered into JSON for API responses.

Part of Whole App:
    Serializers act as the data transformation layer between the database
    models and the API responses. They handle:
    - Converting model instances to JSON-serializable dictionaries
    - Validating incoming data from API requests
    - Creating/updating model instances from validated data
    - Including computed fields and related data in responses

Architecture:
    - SessionSerializer: Serializes Pomodoro session data
    - DailyStatsSerializer: Serializes daily statistics
    - UserSettingsSerializer: Serializes user timer settings
    - Each serializer includes validation logic and custom fields
=============================================================================
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Session, DailyStats, UserSettings


class SessionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Session model.

    Converts Session model instances to/from JSON format for API communication.
    Includes computed fields like actual_duration and human-readable session type.

    Fields:
        id: Session primary key
        session_type: Type of session (focus, short_break, long_break)
        session_type_display: Human-readable session type name
        duration_minutes: Planned duration
        actual_duration_minutes: Computed actual duration
        started_at: Session start timestamp
        ended_at: Session end timestamp
        completed: Whether session was completed
        created_at: Record creation timestamp
    """
    session_type_display = serializers.CharField(
        source='get_session_type_display',
        read_only=True
    )
    actual_duration_minutes = serializers.FloatField(
        read_only=True
    )

    class Meta:
        model = Session
        fields = [
            'id', 'session_type', 'session_type_display',
            'duration_minutes', 'actual_duration_minutes',
            'started_at', 'ended_at', 'completed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'actual_duration_minutes']

    def validate_duration_minutes(self, value):
        """Ensure duration is within reasonable bounds (1-120 minutes)."""
        if value < 1 or value > 120:
            raise serializers.ValidationError(
                "Duration must be between 1 and 120 minutes."
            )
        return value


class DailyStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for the DailyStats model.

    Provides daily aggregated statistics in a clean JSON format.

    Fields:
        id: Record primary key
        date: The date for these statistics
        total_focus_minutes: Total focus time
        sessions_completed: Number of completed sessions
        total_break_minutes: Total break time
    """
    class Meta:
        model = DailyStats
        fields = [
            'id', 'date', 'total_focus_minutes',
            'sessions_completed', 'total_break_minutes'
        ]
        read_only_fields = ['id']


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserSettings model.

    Handles validation and serialization of user timer preferences.

    Fields:
        focus_duration: Focus session length
        short_break_duration: Short break length
        long_break_duration: Long break length
        sessions_before_long_break: Sessions count before long break
        auto_start_breaks: Auto-start breaks flag
        auto_start_pomodoros: Auto-start pomodoros flag
    """
    class Meta:
        model = UserSettings
        fields = [
            'focus_duration', 'short_break_duration',
            'long_break_duration', 'sessions_before_long_break',
            'auto_start_breaks', 'auto_start_pomodoros'
        ]

    def validate_focus_duration(self, value):
        """Validate focus duration is between 1 and 120 minutes."""
        if value < 1 or value > 120:
            raise serializers.ValidationError(
                "Focus duration must be between 1 and 120 minutes."
            )
        return value

    def validate_short_break_duration(self, value):
        """Validate short break duration is between 1 and 30 minutes."""
        if value < 1 or value > 30:
            raise serializers.ValidationError(
                "Short break duration must be between 1 and 30 minutes."
            )
        return value

    def validate_long_break_duration(self, value):
        """Validate long break duration is between 1 and 60 minutes."""
        if value < 1 or value > 60:
            raise serializers.ValidationError(
                "Long break duration must be between 1 and 60 minutes."
            )
        return value

    def validate_sessions_before_long_break(self, value):
        """Validate sessions count is between 1 and 10."""
        if value < 1 or value > 10:
            raise serializers.ValidationError(
                "Sessions before long break must be between 1 and 10."
            )
        return value
