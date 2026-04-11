import os
import re
import json
import requests
from pydantic import BaseModel
from typing import List, Optional


LLM_PROVIDER = "mock"
MODEL_NAME = ""
MOCK_MODE = True


def _is_real_key(key: str | None) -> bool:
    if not key or len(key) < 20:
        return False
    placeholders = ["your_key", "sk-xxx", "placeholder", "test", "dummy", "your-api"]
    return not any(p in key.lower() for p in placeholders)


_openai_key = os.environ.get("OPENAI_API_KEY")
_anthropic_key = os.environ.get("ANTHROPIC_API_KEY")

if _is_real_key(_openai_key):
    LLM_PROVIDER = "openai"
    MODEL_NAME = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    MOCK_MODE = False
elif _is_real_key(_anthropic_key):
    LLM_PROVIDER = "anthropic"
    MODEL_NAME = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
    MOCK_MODE = False


class ExpertAssessment(BaseModel):
    expert_name: str
    framework: str
    summary: str
    findings: List[str]
    risks: List[str]
    strengths: List[str]
    recommendation: str
    confidence: str


class CritiqueRound(BaseModel):
    critiques: List[str]
    disagreements: List[str]
    consensus_points: List[str]


class FinalVerdict(BaseModel):
    verdict: str
    rationale: List[str]
    required_actions: List[str]


def call_llm(system_prompt: str, user_prompt: str) -> str:
    if MOCK_MODE or LLM_PROVIDER == "mock":
        return """
### Summary
Mock response generated for testing.

### Findings
- This is a simulated expert assessment.
- The repository appears to include AI-related risk surfaces.
- Further review is recommended.

### Risks
- Simulated risk 1
- Simulated risk 2

### Strengths
- Structured pipeline exists

### Recommendation
REVIEW

### Confidence
Medium
""".strip()

    if LLM_PROVIDER == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("Missing OPENAI_API_KEY")
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        model = MODEL_NAME or "gpt-4o-mini"
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2
        )
        return resp.choices[0].message.content

    if LLM_PROVIDER == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Missing ANTHROPIC_API_KEY")
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        model = MODEL_NAME or "claude-3-5-sonnet-latest"
        resp = client.messages.create(
            model=model,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.2,
            max_tokens=1200
        )
        return resp.content[0].text

    raise ValueError(f"Unsupported LLM_PROVIDER: {LLM_PROVIDER}")


def accept_input(user_input: str) -> dict:
    github_pattern = r"https?://github\.com/[\w\-\.]+/[\w\-\.]+"
    if re.match(github_pattern, user_input.strip()):
        return {"input_type": "github_url", "value": user_input.strip()}
    else:
        return {"input_type": "text_description", "value": user_input.strip()}


def fetch_github_readme(repo_url: str) -> str:
    repo_url = repo_url.rstrip("/")
    parts = repo_url.split("/")
    owner = parts[-2]
    repo = parts[-1]
    raw_urls = [
        f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md",
        f"https://raw.githubusercontent.com/{owner}/{repo}/master/README.md"
    ]
    for raw_url in raw_urls:
        try:
            r = requests.get(raw_url, timeout=15)
            if r.status_code == 200 and len(r.text.strip()) > 0:
                return r.text
        except Exception:
            continue
    return ""


def extract_repo_features(repo_url: str, readme_text: str) -> dict:
    text = readme_text.lower()
    features = {
        "repo_url": repo_url,
        "framework": [],
        "llm_backend": [],
        "security_flags": [],
        "surface_area": [],
        "notes": []
    }
    if "flask" in text:
        features["framework"].append("Flask")
    if "streamlit" in text:
        features["framework"].append("Streamlit")
    if "fastapi" in text:
        features["framework"].append("FastAPI")
    if "gpt-4o" in text:
        features["llm_backend"].append("GPT-4o")
    if "whisper" in text:
        features["llm_backend"].append("Whisper API")
    if "openai" in text:
        features["llm_backend"].append("OpenAI API")
    if "upload" in text or "file upload" in text:
        features["surface_area"].append("File upload surface")
    if "audio" in text:
        features["surface_area"].append("Audio input surface")
    if "video" in text:
        features["surface_area"].append("Video input surface")
    if "auth" not in text and "authentication" not in text:
        features["security_flags"].append("No obvious authentication layer mentioned")
    if not features["framework"]:
        features["notes"].append("Framework not clearly detected from README")
    if not features["llm_backend"]:
        features["notes"].append("LLM backend not clearly detected from README")
    return features


def expert_a_prompt(features: dict):
    system_prompt = """
You are Expert A: Safety and Harm Assessment.
Focus on harmful outputs, content risk, multimodal moderation blind spots, unsafe behavior, and end-user harm.
Be concrete and specific to the repository under review.
Use distinct language and do not sound like a governance or security auditor.

Output in markdown with these sections:
### Summary
### Findings
### Risks
### Strengths
### Recommendation
### Confidence
"""
    user_prompt = f"Evaluate the following repository features:\n{features}"
    return system_prompt, user_prompt


def expert_b_prompt(features: dict):
    system_prompt = """
You are Expert B: Governance and Compliance Assessment.
Focus on accountability, traceability, auditability, access control, external dependency, institutional deployment readiness, and compliance concerns.
Be concrete and specific to the repository under review.
Use a governance-oriented tone distinct from safety and security experts.

Output in markdown with these sections:
### Summary
### Findings
### Risks
### Strengths
### Recommendation
### Confidence
"""
    user_prompt = f"Evaluate the following repository features:\n{features}"
    return system_prompt, user_prompt


def expert_c_prompt(features: dict):
    system_prompt = """
You are Expert C: Security and Attack Surface Assessment.
Focus on file upload risks, authentication, external API exposure, misuse paths, input validation, and operational security weakness.
Be concrete and specific to the repository under review.
Use a technical security-review style distinct from governance and safety experts.

Output in markdown with these sections:
### Summary
### Findings
### Risks
### Strengths
### Recommendation
### Confidence
"""
    user_prompt = f"Evaluate the following repository features:\n{features}"
    return system_prompt, user_prompt


def critique_prompt(a_text: str, b_text: str, c_text: str):
    system_prompt = """
You are the cross-expert critique layer of an AI Safety Lab council.
Compare the three expert outputs.
Identify:
1. agreements
2. disagreements
3. what one expert may have overlooked
4. the strongest shared concerns

Output in markdown with:
### Critiques
### Disagreements
### Consensus Points
"""
    user_prompt = f"""
Expert A:
{a_text}

Expert B:
{b_text}

Expert C:
{c_text}
"""
    return system_prompt, user_prompt


def synthesis_prompt(features: dict, a_text: str, b_text: str, c_text: str, critique_text: str):
    system_prompt = """
You are the final arbitration layer of an AI Safety Lab council.
Your task is to synthesize the three expert assessments and the critique round.

Rules:
- Final verdict must be exactly one of: APPROVE, REVIEW, REJECT
- Be specific to the target repository
- Mention the strongest reasons
- Include actionable required actions
- Avoid generic boilerplate

Output in markdown with:
### Final Verdict
### Rationale
### Required Actions
"""
    user_prompt = f"""
Repository features:
{features}

Expert A:
{a_text}

Expert B:
{b_text}

Expert C:
{c_text}

Critique Round:
{critique_text}
"""
    return system_prompt, user_prompt


def run_expert_a(features: dict) -> str:
    system_prompt, user_prompt = expert_a_prompt(features)
    return call_llm(system_prompt, user_prompt)


def run_expert_b(features: dict) -> str:
    system_prompt, user_prompt = expert_b_prompt(features)
    return call_llm(system_prompt, user_prompt)


def run_expert_c(features: dict) -> str:
    system_prompt, user_prompt = expert_c_prompt(features)
    return call_llm(system_prompt, user_prompt)


def run_critique(a_text: str, b_text: str, c_text: str) -> str:
    system_prompt, user_prompt = critique_prompt(a_text, b_text, c_text)
    return call_llm(system_prompt, user_prompt)


def run_synthesis(features: dict, a_text: str, b_text: str, c_text: str, critique_text: str) -> str:
    system_prompt, user_prompt = synthesis_prompt(features, a_text, b_text, c_text, critique_text)
    return call_llm(system_prompt, user_prompt)


def evaluate_agent(user_input: str) -> dict:
    accepted = accept_input(user_input)

    if accepted["input_type"] == "github_url":
        repo_url = accepted["value"]
        readme = fetch_github_readme(repo_url)
        features = extract_repo_features(repo_url, readme)
    else:
        features = {
            "repo_url": "N/A",
            "framework": [],
            "llm_backend": [],
            "security_flags": [],
            "surface_area": [],
            "notes": [accepted["value"]]
        }

    a_text = run_expert_a(features)
    b_text = run_expert_b(features)
    c_text = run_expert_c(features)
    critique_text = run_critique(a_text, b_text, c_text)
    synthesis_text = run_synthesis(features, a_text, b_text, c_text, critique_text)

    return {
        "features": features,
        "expert_a_text": a_text,
        "expert_b_text": b_text,
        "expert_c_text": c_text,
        "critique_text": critique_text,
        "synthesis_text": synthesis_text
    }
