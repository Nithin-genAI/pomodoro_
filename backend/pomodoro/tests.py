"""
=============================================================================
Pomodoro App - Python Tests
=============================================================================

This module contains the test suite for the Pomodoro Django application.
It includes unit tests for models, views, and serializers to ensure
the application functions correctly.

Part of Whole App:
    Tests verify the correctness of all backend components:
    - Model creation and validation
    - API endpoint responses
    - Serializer data transformation
    - Business logic for session management

Architecture:
    - Model tests: Verify database operations
    - View tests: Verify API endpoint behavior
    - Serializer tests: Verify data transformation
    - Uses Django's test framework with DRF's test client
=============================================================================
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta

from .models import Session, DailyStats, UserSettings


class SessionModelTest(TestCase):
    """Tests for the Session model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )

    def test_create_focus_session(self):
        """Test creating a focus session."""
        session = Session.objects.create(
            session_type='focus',
            duration_minutes=25,
            user=self.user
        )
        self.assertEqual(session.session_type, 'focus')
        self.assertEqual(session.duration_minutes, 25)
        self.assertFalse(session.completed)

    def test_session_completion(self):
        """Test marking a session as completed."""
        session = Session.objects.create(
            session_type='focus',
            duration_minutes=25,
            user=self.user
        )
        session.completed = True
        session.ended_at = timezone.now()
        session.save()
        self.assertTrue(session.completed)
        self.assertIsNotNone(session.ended_at)

    def test_actual_duration_calculation(self):
        """Test the actual_duration_minutes property."""
        now = timezone.now()
        session = Session.objects.create(
            session_type='focus',
            duration_minutes=25,
            started_at=now - timedelta(minutes=20),
            ended_at=now,
            user=self.user
        )
        self.assertAlmostEqual(session.actual_duration_minutes, 20, places=0)


class TodayStatsViewTest(APITestCase):
    """Tests for the TodayStatsView API endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )

    def test_get_today_stats_empty(self):
        """Test getting today's stats when no sessions exist."""
        response = self.client.get('/api/v1/today-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_focus_minutes'], 0)
        self.assertEqual(response.data['sessions_completed'], 0)

    def test_get_today_stats_with_sessions(self):
        """Test getting today's stats with completed sessions."""
        Session.objects.create(
            session_type='focus',
            duration_minutes=25,
            completed=True,
            user=self.user
        )
        Session.objects.create(
            session_type='focus',
            duration_minutes=25,
            completed=True,
            user=self.user
        )
        response = self.client.get('/api/v1/today-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_focus_minutes'], 50)
        self.assertEqual(response.data['sessions_completed'], 2)


class UserSettingsViewTest(APITestCase):
    """Tests for the UserSettingsView API endpoint."""

    def test_get_default_settings(self):
        """Test getting default settings for anonymous user."""
        response = self.client.get('/api/v1/settings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['focus_duration'], 25)
        self.assertEqual(response.data['short_break_duration'], 5)
        self.assertEqual(response.data['long_break_duration'], 15)
