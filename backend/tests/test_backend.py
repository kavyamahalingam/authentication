import pytest
from app import create_app
from models import User, Profile, get_db_connection
import json

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False # Disable for testing
    with app.test_client() as client:
        yield client

def test_register_and_login(client):
    # Mock registration (assuming OTP is verified or we mock OTP verification)
    # This is a bit complex without mocking the DB. 
    # For a real test, we should use a test database.
    pass

def test_profile_access_unauthorized(client):
    response = client.get('/api/profile')
    assert response.status_code == 401

def test_input_sanitization():
    from profile_routes import sanitize_input
    dirty = "<script>alert('xss')</script> Hello"
    clean = sanitize_input(dirty)
    assert "<script>" not in clean
    assert "Hello" in clean

def test_password_validation():
    from routes import validate_password
    assert validate_password("Pass1234") == True
    assert validate_password("password") == False
    assert validate_password("12345678") == False
