import pytest
from backend import app
from backend.sites_config import SITES


class DummyCursor:
    def __init__(self):
        self.last_sql = None
        self.last_params = None

    def execute(self, sql, params=None):
        # just capture the call
        self.last_sql = sql
        self.last_params = params

    def fetchone(self):
        # return a minimal structure so the view can proceed
        return {'data': {'stats': {'total_visitors': 1}}}


class DummyConn:
    def cursor(self, cursor_factory=None):
        return DummyCursor()

    def close(self):
        pass


def test_site_filter_overrides_url_filter(monkeypatch, caplog):
    """Ensure the `/api/analytics` handler resolves site_filter correctly."""
    monkeypatch.setattr(app, 'get_db_connection', lambda: DummyConn())
    caplog.set_level('INFO')
    client = app.test_client()

    response = client.get('/api/analytics', query_string={'site_filter': 'tpl'})
    assert response.status_code == 200

    # look for our logging messages
    logs = caplog.text
    assert "Resolved site_filter='tpl' to site_url" in logs
    assert "URL filter: https://rbg.iitm.ac.in/tpl" in logs


def test_manual_url_filter_when_all(monkeypatch, caplog):
    """A custom url_filter should pass through when site_filter is 'all'."""
    monkeypatch.setattr(app, 'get_db_connection', lambda: DummyConn())
    caplog.set_level('INFO')
    client = app.test_client()

    response = client.get('/api/analytics', query_string={'site_filter': 'all', 'url_filter': 'foo'})
    assert response.status_code == 200

    logs = caplog.text
    assert "Resolved site_filter='all' to site_url='None'" in logs
    assert "URL filter: foo" in logs
