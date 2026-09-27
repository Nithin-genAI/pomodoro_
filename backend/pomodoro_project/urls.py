"""
=============================================================================
Pomodoro Project - Root URL Configuration
=============================================================================

This module defines the root URL routing for the Pomodoro Focus application.
It maps URL patterns to the appropriate view modules and includes the
Django admin interface.

Part of Whole App:
    This is the top-level URL dispatcher that routes incoming HTTP requests
    to the correct application-level URL configurations. It serves as the
    entry point for all API endpoints and admin panel access.

Architecture:
    - Root URL routing and dispatching
    - Admin panel URL inclusion
    - API v1 URL namespace inclusion
    - Health check endpoint for monitoring
=============================================================================
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """
    Health check endpoint for monitoring and load balancers.
    Returns a simple JSON response indicating the server is running.
    """
    return JsonResponse({'status': 'healthy', 'service': 'pomodoro-api'})


urlpatterns = [
    # Django Admin Interface
    path('admin/', admin.site.urls),

    # API v1 Endpoints
    path('api/v1/', include('pomodoro.urls')),

    # Health Check
    path('api/health/', health_check, name='health-check'),
]
