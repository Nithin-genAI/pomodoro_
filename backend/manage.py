"""
=============================================================================
Pomodoro Focus App - Django Management Script
=============================================================================

This is the Django management entry point for the Pomodoro Focus application.
It serves as the command-line utility for running Django commands such as:
    - python manage.py runserver    : Start the development server
    - python manage.py migrate      : Apply database migrations
    - python manage.py createsuperuser : Create admin user
    - python manage.py shell        : Interactive Python shell

Part of Whole App:
    This file is the bootstrap script that initializes the Django environment
    and allows execution of management commands. It is essential for running
    the backend server that serves the Pomodoro API endpoints.

Architecture:
    - Entry point for all Django management operations
    - Sets DJANGO_SETTINGS_MODULE environment variable
    - Delegates to django.core.management for command execution
=============================================================================
"""

#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pomodoro_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
