"""Configuration for the source databases used by the app-user API.

Set these values through environment variables in production. Do not commit
database passwords or other secrets to this file.
"""

import os


SOURCE_DB_HOST = os.getenv("SOURCE_DB_HOST", "localhost")
SOURCE_DB_PORT = os.getenv("SOURCE_DB_PORT", "5432")
SOURCE_DB_USER = os.getenv("SOURCE_DB_USER", "postgres")
SOURCE_DB_PASSWORD = os.getenv("SOURCE_DB_PASSWORD", "")

SOURCE_DATABASES = {
    "thinnai": os.getenv("THINNAI_DB_NAME", "thinnai"),
    "lms_ssm": os.getenv("LMS_SSM_DB_NAME", "lms_ssm"),
    "odisha_dashboard": os.getenv("ODISHA_DB_NAME", "odisha_dashboard"),
}

SOURCE_TABLES = {
    "thinnai": os.getenv("THINNAI_DB_TABLE", "public.user_table"),
    "lms_ssm": os.getenv("LMS_SSM_DB_TABLE", "public.user_table"),
    "odisha_dashboard": os.getenv("ODISHA_DB_TABLE", "public.user_table"),
}
