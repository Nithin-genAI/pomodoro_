"""
=============================================================================
Pomodoro App - Package Initialization
=============================================================================

This file marks the 'pomodoro' directory as a Python package, making it
an installable Django application within the project.

Part of Whole App:
    This __init__.py initializes the pomodoro app package. It contains the
    default app configuration that Django uses when loading the application.

Architecture:
    - Package initialization for the pomodoro Django app
    - Sets default app configuration
    - Enables Django to discover and load the app correctly
=============================================================================
"""

default_app_config = 'pomodoro.apps.PomodoroConfig'
