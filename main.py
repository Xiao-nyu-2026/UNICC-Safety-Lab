import os
import re
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, List

from ai_engine_core import evaluate_agent, ExpertAssessment, FinalVerdict

logger = logging.getLogger("main")

GITHUB_URL_RE = re.compile(r"^https?://github\.com/[\w\-\.]+/[\w\-\.]+/?$")

app = FastAPI(
    title="UNICC AI Safety Lab API",
    description="Backend API for AI agent safety evaluation using a Council of Experts model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

MOCK_AGENTS = [
    {
        "id": "AGT-001",
        "name": "GPT-4-Turbo-Prod",
        "type": "Language Model",
        "status": "APPROVED",
        "statusColor": "bg-[#d1fae5] text-[#065f46]",
        "lastEval": "10 mins ago",
        "evalCount": 1029
    },
    {
        "id": "AGT-002",
        "name": "Llama-3-Custom",
        "type": "Fine-tuned Model",
        "status": "Running Eval",
        "statusColor": "bg-zinc-100 text-zinc-900",
        "lastEval": "1 hr ago",
        "evalCount": 412,
        "hasIcon": True
    },
    {
        "id": "AGT-003",
        "name": "Customer-Bot-V1",
        "type": "Conversational AI",
        "status": "REJECTED",
        "statusColor": "bg-[#ffe4e6] text-[#9f1239]",
        "lastEval": "3 hrs ago",
        "evalCount": 887
    },
    {
        "id": "AGT-004",
        "name": "Code-Gen-Agent",
        "type": "Code Generation",
        "status": "APPROVED",
        "statusColor": "bg-[#d1fae5] text-[#065f46]",
        "lastEval": "1 day ago",
        "evalCount": 234
    },
    {
        "id": "AGT-005",
        "name": "Data-Pipeline-Bot",
        "type": "Data Processing",
        "status": "APPROVED",
        "statusColor": "bg-[#d1fae5] text-[#065f46]",
        "lastEval": "2 days ago",
        "evalCount": 567
    },
    {
        "id": "AGT-006",
        "name": "Support-Agent-V2",
        "type": "Conversational AI",
        "status": "Inactive",
        "statusColor": "bg-zinc-100 text-zinc-500",
        "lastEval": "5 days ago",
        "evalCount": 103
    }
]


class EvaluateRequest(BaseModel):
    agentName: str
    repoUrl: Optional[str] = None
    modules: Optional[List[str]] = None

    @field_validator("repoUrl")
    @classmethod
    def validate_repo_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        cleaned = v.strip()
        if not GITHUB_URL_RE.match(cleaned):
            raise ValueError("repoUrl must be a valid GitHub repository URL")
        return cleaned


class AgentResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    statusColor: str
    lastEval: str
    evalCount: int
    hasIcon: Optional[bool] = None


def extract_bullets(text: str, section: str) -> List[str]:
    pattern = rf"###\s*{section}\s*\n+([\s\S]*?)(?=\n###|$)"
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return []
    return [
        line.replace("-", "", 1).strip()
        for line in match.group(1).split("\n")
        if line.strip().startswith("-") and len(line.strip()) > 3
    ]


def extract_recommendation(text: str) -> str:
    for section in ["Final Verdict", "Recommendation"]:
        match = re.search(rf"###\s*{section}\s*\n+([A-Z]+)", text, re.IGNORECASE)
        if match:
            return match.group(1).upper().strip()
    return "REVIEW"


def extract_confidence(text: str) -> int:
    match = re.search(r"###\s*Confidence\s*\n+(\w+)", text, re.IGNORECASE)
    level = match.group(1).lower() if match else "medium"
    return 85 if level == "high" else 35 if level == "low" else 60


def extract_section(text: str, section: str) -> str:
    pattern = rf"###\s*{section}\s*\n+([\s\S]*?)(?=\n###|$)"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else ""


def build_expert(text: str, fallback_name: str) -> dict:
    findings = extract_bullets(text, "Findings")
    risks = extract_bullets(text, "Risks")
    rec = extract_recommendation(text)
    fallback_finding = extract_section(text, "Summary").split("\n")[0] if extract_section(text, "Summary") else text[:80]
    return {
        "name": fallback_name,
        "verdict": rec,
        "findings": findings if findings else ([fallback_finding] if fallback_finding else ["No specific findings reported."]),
        "risks": risks,
    }


def transform_output(raw: dict) -> dict:
    synth = raw.get("synthesis_text", raw.get("expert_c_text", ""))
    verdict = extract_recommendation(synth) or "REVIEW"
    confidence = extract_confidence(synth)
    summary_lines = extract_bullets(synth, "Summary")
    summary = (
        summary_lines[0]
        if summary_lines
        else extract_section(synth, "Summary").split("\n")[0]
        if extract_section(synth, "Summary")
        else "Evaluation complete. See expert breakdown below."
    )
    synthesis_text = (
        extract_section(synth, "Summary")
        or extract_section(synth, "Recommendation")
        or re.sub(r"###.*\n", "", synth).strip()[:600]
        or "Synthesis not available."
    )
    return {
        "final_verdict": verdict,
        "confidence_score": confidence,
        "summary": summary,
        "synthesis_text": synthesis_text,
        "experts": {
            "expert_a": build_expert(raw.get("expert_a_text", ""), "Security & Compliance Probe"),
            "expert_b": build_expert(raw.get("expert_b_text", ""), "Governance & Risk Workflow"),
            "expert_c": build_expert(raw.get("expert_c_text", ""), "Contextual Risk Arbiter"),
        }
    }


@app.get("/api/agents", response_model=List[AgentResponse])
async def get_agents():
    return MOCK_AGENTS


@app.post("/api/evaluate")
async def run_evaluate(req: EvaluateRequest):
    try:
        user_input = req.repoUrl if req.repoUrl else req.agentName
        raw = evaluate_agent(user_input)
        result = transform_output(raw)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Evaluation failed. Check server logs.")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "UNICC AI Safety Lab FastAPI"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("FASTAPI_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
