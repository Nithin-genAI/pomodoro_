"""
=============================================================================
Pomodoro App - URL Routing
=============================================================================

This module defines the URL patterns for the Pomodoro API endpoints.
It maps URL paths to their corresponding view classes using Django REST
Framework's router for ViewSets and explicit paths for APIViews.

Part of Whole App:
    This URL configuration is included by the project-level urls.py under
    the 'api/v1/' namespace. It defines all the REST API endpoints that
    the frontend communicates with for session management, statistics,
    and settings.

Architecture:
    - Uses DRF DefaultRouter for automatic URL generation from ViewSets
    - Explicit URL patterns for custom API views
    - Clean, RESTful URL structure
    - Namespace support for URL reversing
=============================================================================
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSet-based endpoints
router = DefaultRouter()
router.register(r'sessions', views.SessionViewSet, basename='session')
router.register(r'stats', views.DailyStatsViewSet, basename='dailystats')

# URL patterns for the pomodoro app
urlpatterns = [
    # Router-generated URLs (sessions CRUD, stats read-only)
    path('', include(router.urls)),

    # Custom API views
    path('today-stats/', views.TodayStatsView.as_view(), name='today-stats'),
    path('settings/', views.UserSettingsView.as_view(), name='user-settings'),
]
