"""
=============================================================================
Pomodoro Project - WSGI Configuration
=============================================================================

This module contains the WSGI application object used by production-grade
web servers (Gunicorn, uWSGI) to serve the Django application.

Part of Whole App:
    This is the WSGI entry point for production deployment. When deploying
    the Pomodoro backend to production servers, this file is referenced by
    the WSGI server to route HTTP requests to the Django application.

Architecture:
    - WSGI application factory
    - Production server integration point
    - Environment configuration for deployment
=============================================================================
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pomodoro_project.settings')

application = get_wsgi_application()
