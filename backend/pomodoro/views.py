"""
=============================================================================
Pomodoro App - API Views
=============================================================================

This module contains the view classes and functions that handle HTTP requests
for the Pomodoro API. It implements CRUD operations for sessions, statistics
retrieval, and settings management.

Part of Whole App:
    Views form the business logic layer of the application. They:
    - Receive HTTP requests from the frontend
    - Process data using models and serializers
    - Return appropriate HTTP responses (JSON)
    - Handle error cases and validation

Architecture:
    - SessionViewSet: Full CRUD for Pomodoro sessions
    - DailyStatsViewSet: Read-only access to daily statistics
    - UserSettingsView: Get/update user timer settings
    - TodayStatsView: Quick endpoint for today's statistics
    - All views use Django REST Framework for consistency
=============================================================================
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Count

from .models import Session, DailyStats, UserSettings
from .serializers import (
    SessionSerializer,
    DailyStatsSerializer,
    UserSettingsSerializer,
)


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Pomodoro sessions.

    Provides list, create, retrieve, update, and destroy operations
    for Pomodoro sessions. Includes custom actions for filtering
    by session type and date range.

    Endpoints:
        GET    /api/v1/sessions/          - List all sessions
        POST   /api/v1/sessions/          - Create a new session
        GET    /api/v1/sessions/{id}/     - Retrieve a specific session
        PUT    /api/v1/sessions/{id}/     - Update a session
        PATCH  /api/v1/sessions/{id}/     - Partial update
        DELETE /api/v1/sessions/{id}/     - Delete a session
        GET    /api/v1/sessions/today/    - Get today's sessions
        GET    /api/v1/sessions/complete/ - Complete current session
    """
    serializer_class = SessionSerializer

    def get_queryset(self):
        """Return sessions filtered by user if authenticated."""
        queryset = Session.objects.all()
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(user=user)
        return queryset

    def perform_create(self, serializer):
        """Set the user when creating a session."""
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get all sessions from today.
        Returns sessions filtered by the current date.
        """
        today = timezone.now().date()
        sessions = self.get_queryset().filter(
            started_at__date=today
        )
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a session as completed.
        Sets the ended_at timestamp and completed flag.
        Also updates the daily statistics.
        """
        session = self.get_object()
        session.ended_at = timezone.now()
        session.completed = True
        session.save()

        # Update daily stats
        self._update_daily_stats(session)

        serializer = self.get_serializer(session)
        return Response(serializer.data)

    def _update_daily_stats(self, session):
        """
        Update or create daily statistics based on completed session.
        This maintains an aggregated view for quick statistics retrieval.
        """
        if not session.completed or not session.user:
            return

        date = session.started_at.date()
        stats, created = DailyStats.objects.get_or_create(
            date=date,
            user=session.user,
            defaults={
                'total_focus_minutes': 0,
                'sessions_completed': 0,
                'total_break_minutes': 0,
            }
        )

        if session.session_type == 'focus':
            stats.total_focus_minutes += session.duration_minutes
            stats.sessions_completed += 1
        else:
            stats.total_break_minutes += session.duration_minutes

        stats.save()


class DailyStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for daily statistics.

    Provides list and retrieve operations for daily aggregated stats.
    Includes a custom action for getting the last N days of statistics.

    Endpoints:
        GET /api/v1/stats/          - List all daily stats
        GET /api/v1/stats/{id}/     - Retrieve specific day's stats
        GET /api/v1/stats/last_7/   - Get last 7 days of stats
    """
    serializer_class = DailyStatsSerializer

    def get_queryset(self):
        """Return stats filtered by user if authenticated."""
        queryset = DailyStats.objects.all()
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(user=user)
        return queryset

    @action(detail=False, methods=['get'])
    def last_7(self, request):
        """Get statistics for the last 7 days."""
        from datetime import timedelta
        seven_days_ago = timezone.now().date() - timedelta(days=7)
        stats = self.get_queryset().filter(date__gte=seven_days_ago)
        serializer = self.get_serializer(stats, many=True)
        return Response(serializer.data)


class TodayStatsView(APIView):
    """
    API view for retrieving today's focus statistics.

    Provides a quick summary of today's Pomodoro activity including
    total focus time, sessions completed, and current streak.

    Endpoint:
        GET /api/v1/today-stats/ - Get today's statistics summary
    """

    def get(self, request):
        """Return today's aggregated statistics."""
        today = timezone.now().date()
        user = request.user if request.user.is_authenticated else None

        # Get today's completed focus sessions
        today_sessions = Session.objects.filter(
            started_at__date=today,
            session_type='focus',
            completed=True,
        )
        if user:
            today_sessions = today_sessions.filter(user=user)

        total_focus = today_sessions.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0

        sessions_count = today_sessions.count()

        # Get today's break time
        today_breaks = Session.objects.filter(
            started_at__date=today,
            session_type__in=['short_break', 'long_break'],
            completed=True,
        )
        if user:
            today_breaks = today_breaks.filter(user=user)

        total_break = today_breaks.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0

        return Response({
            'date': str(today),
            'total_focus_minutes': total_focus,
            'sessions_completed': sessions_count,
            'total_break_minutes': total_break,
        })


class UserSettingsView(APIView):
    """
    API view for managing user timer settings.

    Handles GET (retrieve) and PUT/PATCH (update) operations for
    user-specific Pomodoro timer configuration.

    Endpoint:
        GET  /api/v1/settings/ - Get current settings
        PUT  /api/v1/settings/ - Update all settings
        PATCH /api/v1/settings/ - Partial update settings
    """

    def get(self, request):
        """Return current user settings or defaults."""
        if request.user.is_authenticated:
            settings, _ = UserSettings.objects.get_or_create(
                user=request.user
            )
        else:
            # Return default settings for anonymous users
            settings = UserSettings(
                focus_duration=25,
                short_break_duration=5,
                long_break_duration=15,
                sessions_before_long_break=4,
            )

        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        """Update user settings."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        settings, _ = UserSettings.objects.get_or_create(
            user=request.user
        )
        serializer = UserSettingsSerializer(settings, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """Partially update user settings."""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        settings, _ = UserSettings.objects.get_or_create(
            user=request.user
        )
        serializer = UserSettingsSerializer(
            settings, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
