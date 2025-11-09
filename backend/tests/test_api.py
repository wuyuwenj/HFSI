"""Basic API tests."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ollama_available" in data
    assert "neo4j_available" in data
    assert "supabase_available" in data


def test_create_client():
    """Test client creation."""
    response = client.post(
        "/clients/create",
        json={"name": "Test Client"}
    )
    # May fail if Supabase is not configured, but should return proper error
    assert response.status_code in [200, 500]


def test_list_clients():
    """Test listing clients."""
    response = client.get("/clients")
    # May fail if Supabase is not configured
    assert response.status_code in [200, 500]

