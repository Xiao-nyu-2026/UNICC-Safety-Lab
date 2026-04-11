"""
Automated tests for the UNICC AI Safety Lab FastAPI server (main.py)
and the core evaluation engine (ai_engine_core.py).

Run with:  pytest tests/test_main.py -v
"""
import pytest
from fastapi.testclient import TestClient

from main import app, transform_output, extract_recommendation, FALLBACK_RESPONSE
from ai_engine_core import accept_input, extract_repo_features

client = TestClient(app)


# ---------------------------------------------------------------------------
# Endpoint tests
# ---------------------------------------------------------------------------

class TestEvaluateEndpoint:
    """Tests for POST /api/evaluate"""

    def test_evaluate_returns_200_with_valid_agent_name(self):
        """Endpoint must return HTTP 200 for any valid agentName."""
        response = client.post(
            "/api/evaluate",
            json={"agentName": "Test-Agent"},
        )
        assert response.status_code == 200

    def test_evaluate_response_has_required_fields(self):
        """Response payload must contain all fields the frontend expects."""
        response = client.post(
            "/api/evaluate",
            json={"agentName": "GPT-4-Turbo-Prod"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "final_verdict" in data
        assert "confidence_score" in data
        assert "summary" in data
        assert "experts" in data
        assert isinstance(data["experts"], dict)

    def test_evaluate_verdict_is_valid_value(self):
        """final_verdict must be one of the three accepted strings."""
        response = client.post(
            "/api/evaluate",
            json={"agentName": "Any-Agent"},
        )
        data = response.json()
        assert data["final_verdict"] in {"APPROVE", "REVIEW", "REJECT"}

    def test_evaluate_confidence_score_in_range(self):
        """confidence_score must be an integer between 0 and 100."""
        response = client.post(
            "/api/evaluate",
            json={"agentName": "Any-Agent"},
        )
        data = response.json()
        assert isinstance(data["confidence_score"], (int, float))
        assert 0 <= data["confidence_score"] <= 100

    def test_evaluate_with_valid_repo_url(self):
        """Passing a valid GitHub URL should be accepted (HTTP 200)."""
        response = client.post(
            "/api/evaluate",
            json={
                "agentName": "VeriMedia-Agent",
                "repoUrl": "https://github.com/example/repo",
            },
        )
        assert response.status_code == 200

    def test_evaluate_with_invalid_repo_url_returns_422(self):
        """Passing a non-GitHub URL for repoUrl must be rejected with 422."""
        response = client.post(
            "/api/evaluate",
            json={
                "agentName": "BadAgent",
                "repoUrl": "http://evil.com/script",
            },
        )
        assert response.status_code == 422

    def test_evaluate_empty_repo_url_treated_as_none(self):
        """An empty repoUrl string should be normalised to None and accepted."""
        response = client.post(
            "/api/evaluate",
            json={"agentName": "Agent", "repoUrl": ""},
        )
        assert response.status_code == 200

    def test_evaluate_experts_have_correct_keys(self):
        """Each expert entry in the response must contain name, verdict, findings, risks."""
        response = client.post("/api/evaluate", json={"agentName": "Test"})
        data = response.json()
        for key in ("expert_a", "expert_b", "expert_c"):
            assert key in data["experts"], f"Missing {key} in experts"
            ex = data["experts"][key]
            assert "name" in ex
            assert "verdict" in ex
            assert "findings" in ex
            assert isinstance(ex["findings"], list)


class TestAgentsEndpoint:
    """Tests for GET /api/agents"""

    def test_agents_returns_200(self):
        response = client.get("/api/agents")
        assert response.status_code == 200

    def test_agents_returns_list(self):
        response = client.get("/api/agents")
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_agents_have_required_fields(self):
        response = client.get("/api/agents")
        for agent in response.json():
            assert "id" in agent
            assert "name" in agent
            assert "status" in agent


class TestHealthEndpoint:
    """Tests for GET /api/health"""

    def test_health_returns_ok(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Core engine unit tests (ai_engine_core.py)
# ---------------------------------------------------------------------------

class TestAcceptInput:
    """Tests for ai_engine_core.accept_input()"""

    def test_detects_github_url(self):
        result = accept_input("https://github.com/unicc/ai-safety-lab")
        assert result["input_type"] == "github_url"

    def test_detects_github_url_with_trailing_slash(self):
        result = accept_input("https://github.com/unicc/ai-safety-lab/")
        assert result["input_type"] == "github_url"

    def test_treats_plain_text_as_description(self):
        result = accept_input("GPT-4 Turbo production model")
        assert result["input_type"] == "text_description"

    def test_value_is_stripped(self):
        result = accept_input("  GPT-4-Test  ")
        assert result["value"] == "GPT-4-Test"

    def test_http_github_url_detected(self):
        result = accept_input("http://github.com/org/repo")
        assert result["input_type"] == "github_url"


class TestExtractRepoFeatures:
    """Tests for ai_engine_core.extract_repo_features()"""

    def test_detects_flask_framework(self):
        features = extract_repo_features("https://github.com/x/y", "Uses Flask for the API layer.")
        assert "Flask" in features["framework"]

    def test_detects_openai_backend(self):
        features = extract_repo_features("https://github.com/x/y", "Powered by OpenAI GPT-4o.")
        assert "OpenAI API" in features["llm_backend"]

    def test_no_auth_flag(self):
        features = extract_repo_features("https://github.com/x/y", "This app does things.")
        assert any("authentication" in f.lower() for f in features["security_flags"])

    def test_file_upload_surface(self):
        features = extract_repo_features("https://github.com/x/y", "Users can upload files.")
        assert "File upload surface" in features["surface_area"]

    def test_empty_readme_returns_notes(self):
        features = extract_repo_features("https://github.com/x/y", "")
        assert len(features["notes"]) > 0

    def test_repo_url_preserved(self):
        url = "https://github.com/unicc/test-repo"
        features = extract_repo_features(url, "")
        assert features["repo_url"] == url


class TestExtractRecommendation:
    """Tests for main.extract_recommendation()"""

    def test_parses_final_verdict_section(self):
        text = "### Final Verdict\nAPPROVE\n### Rationale\nSomething."
        assert extract_recommendation(text) == "APPROVE"

    def test_parses_recommendation_section(self):
        text = "### Recommendation\nREJECT"
        assert extract_recommendation(text) == "REJECT"

    def test_defaults_to_review(self):
        assert extract_recommendation("No sections here.") == "REVIEW"

    def test_case_insensitive(self):
        text = "### Recommendation\napprove"
        assert extract_recommendation(text) == "APPROVE"


class TestTransformOutput:
    """Tests for main.transform_output()"""

    SAMPLE_RAW = {
        "expert_a_text": "### Summary\nGood.\n### Findings\n- Finding A\n### Risks\n- Risk A\n### Recommendation\nAPPROVE\n### Confidence\nHigh",
        "expert_b_text": "### Summary\nGood.\n### Findings\n- Finding B\n### Risks\n- Risk B\n### Recommendation\nAPPROVE\n### Confidence\nHigh",
        "expert_c_text": "### Summary\nGood.\n### Findings\n- Finding C\n### Risks\n- Risk C\n### Recommendation\nAPPROVE\n### Confidence\nHigh",
        "synthesis_text": "### Final Verdict\nAPPROVE\n### Rationale\n- All clear.\n### Required Actions\n- None.",
        "critique_text": "### Critiques\n- None.\n### Disagreements\n- None.\n### Consensus Points\n- Approved.",
    }

    def test_transforms_without_error(self):
        result = transform_output(self.SAMPLE_RAW)
        assert result is not None

    def test_final_verdict_parsed_correctly(self):
        result = transform_output(self.SAMPLE_RAW)
        assert result["final_verdict"] == "APPROVE"

    def test_confidence_score_medium_when_synthesis_has_no_confidence_section(self):
        # synthesis_text has no ### Confidence block → defaults to "medium" → 60
        result = transform_output(self.SAMPLE_RAW)
        assert result["confidence_score"] == 60

    def test_experts_all_present(self):
        result = transform_output(self.SAMPLE_RAW)
        assert "expert_a" in result["experts"]
        assert "expert_b" in result["experts"]
        assert "expert_c" in result["experts"]

    def test_expert_findings_are_list(self):
        result = transform_output(self.SAMPLE_RAW)
        for ex in result["experts"].values():
            assert isinstance(ex["findings"], list)


class TestFallbackResponse:
    """Ensures the fallback response is well-formed."""

    def test_fallback_has_required_fields(self):
        for field in ("final_verdict", "confidence_score", "summary", "synthesis_text", "experts"):
            assert field in FALLBACK_RESPONSE

    def test_fallback_experts_are_complete(self):
        for key in ("expert_a", "expert_b", "expert_c"):
            assert key in FALLBACK_RESPONSE["experts"]
            ex = FALLBACK_RESPONSE["experts"][key]
            assert "name" in ex
            assert "verdict" in ex
            assert isinstance(ex["findings"], list)
            assert len(ex["findings"]) > 0
