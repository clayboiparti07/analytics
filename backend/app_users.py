"""Read the dashboard-safe user fields from the configured source databases."""

import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

from config import (
    SOURCE_DATABASES,
    SOURCE_DB_HOST,
    SOURCE_DB_PASSWORD,
    SOURCE_DB_PORT,
    SOURCE_DB_USER,
    SOURCE_TABLES,
)


APP_QUERIES = {
    "thinnai": """
        SELECT user_id, user_name AS name, user_type AS role,
               state, district, user_type AS designation,
               login_time AS last_login, login_status AS account_status,
               enrolled_date AS created_on
        FROM {table}
    """,
    "lms_ssm": """
        SELECT userid AS user_id, name, role, state, district,
               role AS designation,
               last_logged_in AS last_login, login_status AS account_status,
               created_on
        FROM {table}
    """,
    "odisha_dashboard": """
        SELECT userid AS user_id, first_name AS name, role, state, district,
               designation,
               last_logged_in AS last_login, login_status AS account_status,
               created_on
        FROM {table}
    """,
}


def _qualified_table(table_name):
    parts = table_name.split(".")
    if len(parts) != 2 or not all(parts):
        raise ValueError("Source table must be a qualified name such as public.user_table")
    return sql.Identifier(*parts)


def fetch_app_users(app_id):
    """Fetch only fields required by the dashboard for one configured app."""
    if app_id not in APP_QUERIES:
        raise KeyError(f"Unknown app: {app_id}")

    conn = psycopg2.connect(
        host=SOURCE_DB_HOST,
        port=SOURCE_DB_PORT,
        user=SOURCE_DB_USER,
        password=SOURCE_DB_PASSWORD,
        dbname=SOURCE_DATABASES[app_id],
        connect_timeout=10,
    )
    try:
        query = sql.SQL(APP_QUERIES[app_id]).format(
            table=_qualified_table(SOURCE_TABLES[app_id])
        )
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            return cursor.fetchall()
    finally:
        conn.close()
