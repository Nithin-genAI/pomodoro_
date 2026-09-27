"""
=============================================================================
Pomodoro Focus App - Django Backend README
=============================================================================

This directory contains the Django backend for the Pomodoro Focus application.
It provides a RESTful API for managing Pomodoro sessions, tracking statistics,
and storing user settings.

PART OF WHOLE APP:
    The Django backend serves as the server-side component that:
    - Stores session data in a persistent database
    - Provides REST API endpoints for the frontend
    - Handles user authentication (optional)
    - Manages daily statistics aggregation
    - Supports multi-user deployments

ARCHITECTURE:
    pomodoro_project/       # Django project configuration
    ├── __init__.py         # Package initialization
    ├── settings.py         # Project settings (DB, apps, middleware)
    ├── urls.py             # Root URL routing
    └── wsgi.py             # WSGI application for production

    pomodoro/               # Main Django app
    ├── __init__.py         # Package initialization
    ├── apps.py             # App configuration
    ├── models.py           # Database models (Session, DailyStats, UserSettings)
    ├── views.py            # API views (SessionViewSet, StatsView, SettingsView)
    ├── serializers.py      # DRF serializers for JSON conversion
    ├── urls.py             # App URL routing
    ├── admin.py            # Django admin configuration
    ├── tests.py            # Unit tests
    └── migrations/         # Database migrations
        ├── __init__.py
        └── 0001_initial.py # Initial schema migration

    manage.py               # Django management script
    requirements.txt        # Python dependencies

SETUP:
    1. Create virtual environment:
       python -m venv venv
       source venv/bin/activate  # Linux/Mac
       venv\\Scripts\\activate     # Windows

    2. Install dependencies:
       pip install -r requirements.txt

    3. Run migrations:
       python manage.py migrate

    4. Create superuser (optional):
       python manage.py createsuperuser

    5. Start development server:
       python manage.py runserver

API ENDPOINTS:
    GET    /api/v1/sessions/           - List all sessions
    POST   /api/v1/sessions/           - Create a session
    GET    /api/v1/sessions/{id}/      - Get session details
    POST   /api/v1/sessions/{id}/complete/ - Complete a session
    GET    /api/v1/sessions/today/     - Today's sessions
    GET    /api/v1/stats/              - Daily statistics
    GET    /api/v1/stats/last_7/       - Last 7 days stats
    GET    /api/v1/today-stats/        - Today's summary
    GET    /api/v1/settings/           - Get user settings
    PUT    /api/v1/settings/           - Update settings
    GET    /api/health/                - Health check

MODELS:
    - Session: Records individual Pomodoro sessions
    - DailyStats: Aggregated daily statistics
    - UserSettings: User timer preferences

TECHNOLOGIES:
    - Django 4.2+
    - Django REST Framework
    - SQLite (dev) / PostgreSQL (production)
    - django-cors-headers for CORS support
=============================================================================
"""
