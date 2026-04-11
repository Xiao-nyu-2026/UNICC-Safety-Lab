"""
Basic integration tests for the UNICC AI Safety Lab FastAPI application.

These tests exercise the public API routes using FastAPI's built-in TestClient.
The LLM call will fail (no valid key in CI) and the /api/evaluate endpoint
returns the structured fallback response — which is the correct production
behaviour when the upstream LLM is unavailable.
"""

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ── /api/agents ────────────────────────────────────────────────────────────────

def test_get_agents_returns_list():
    """GET /api/agents must return a non-empty JSON array."""
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_agents_schema():
    """Each agent record must contain the required fields with correct types."""
    response = client.get("/api/agents")
    assert response.status_code == 200
    for agent in response.json():
        assert "id" in agent
        assert "name" in agent
        assert "type" in agent
        assert "status" in agent
        assert "evalCount" in agent
        assert isinstance(agent["evalCount"], int)


# ── /api/evaluate ──────────────────────────────────────────────────────────────

def test_evaluate_returns_valid_structure():
    """POST /api/evaluate must return a structured result with required keys."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Test-Agent"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "final_verdict" in data
    assert "confidence_score" in data
    assert "summary" in data
    assert "experts" in data
    assert isinstance(data["experts"], dict)


def test_evaluate_verdict_is_valid_value():
    """The final_verdict must be one of the three allowed values."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "GPT-4-Turbo-Prod"},
    )
    assert response.status_code == 200
    verdict = response.json()["final_verdict"]
    assert verdict in ("APPROVE", "REVIEW", "REJECT")


def test_evaluate_experts_have_required_fields():
    """Each expert block must contain name, verdict, findings, and risks."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Code-Gen-Agent"},
    )
    assert response.status_code == 200
    experts = response.json()["experts"]
    for key in ("expert_a", "expert_b", "expert_c"):
        assert key in experts
        expert = experts[key]
        assert "name" in expert
        assert "verdict" in expert
        assert isinstance(expert["findings"], list)
        assert isinstance(expert["risks"], list)


def test_evaluate_confidence_score_is_integer():
    """confidence_score must be a numeric integer."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Test-Agent"},
    )
    assert response.status_code == 200
    score = response.json()["confidence_score"]
    assert isinstance(score, int)


# ── /api/evaluate — input validation ──────────────────────────────────────────

def test_evaluate_rejects_invalid_repo_url():
    """A non-GitHub repoUrl must be rejected with a 422 validation error."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Test-Agent", "repoUrl": "not-a-github-url"},
    )
    assert response.status_code == 422


def test_evaluate_accepts_empty_repo_url():
    """An empty repoUrl should be treated as absent and not cause a 422."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Test-Agent", "repoUrl": ""},
    )
    assert response.status_code == 200


def test_evaluate_accepts_valid_github_url():
    """A valid GitHub URL should be accepted without a validation error."""
    response = client.post(
        "/api/evaluate",
        json={"agentName": "Test-Agent", "repoUrl": "https://github.com/unicc/safety-lab"},
    )
    assert response.status_code == 200


# ── /api/health ────────────────────────────────────────────────────────────────

def test_health_endpoint():
    """GET /api/health must return status ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
