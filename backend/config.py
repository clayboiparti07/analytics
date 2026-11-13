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
    "rcam": os.getenv("RCAM_DB_NAME", "rcam"),
    "rsa": os.getenv("RSA_DB_NAME", "rsa"),
}

SOURCE_TABLES = {
    "thinnai": os.getenv("THINNAI_DB_TABLE", "public.user_table"),
    "lms_ssm": os.getenv("LMS_SSM_DB_TABLE", "public.user_table"),
    "odisha_dashboard": os.getenv("ODISHA_DB_TABLE", "public.user_table"),
    "rcam": os.getenv("RCAM_DB_TABLE", "public.sci_user_table"),
    "rsa": os.getenv("RSA_DB_TABLE", "public.users"),
}

# A deployment may provide backend/config.local.py outside version control.
# Values in that file take precedence over these safe defaults.
try:
    from config_local import (  # type: ignore
        SOURCE_DATABASES as LOCAL_DATABASES,
        SOURCE_DB_HOST as LOCAL_HOST,
        SOURCE_DB_PASSWORD as LOCAL_PASSWORD,
        SOURCE_DB_PORT as LOCAL_PORT,
        SOURCE_DB_USER as LOCAL_USER,
        SOURCE_TABLES as LOCAL_TABLES,
    )
except ModuleNotFoundError:
    pass
else:
    SOURCE_DB_HOST = LOCAL_HOST
    SOURCE_DB_PORT = LOCAL_PORT
    SOURCE_DB_USER = LOCAL_USER
    SOURCE_DB_PASSWORD = LOCAL_PASSWORD
    SOURCE_DATABASES = LOCAL_DATABASES
    SOURCE_TABLES = LOCAL_TABLES
