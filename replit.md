# UNICC AI Safety Lab

SaaS dashboard for monitoring AI agents and running automated safety evaluations using a Council of Experts model.

## Architecture

- **Frontend**: React + TypeScript + Wouter + Tailwind + shadcn/ui
- **Backend**: Node.js/Express (port 5000) proxying to Python FastAPI (port 8000)
- **Python Engine**: `ai_engine_core.py` + `main.py` (FastAPI) + `python_engine/council_eval.py` (legacy child_process)
- **Evaluation**: Trigger-based audit (NOT real-time). All detail views use routing, no modals.

## Key Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI server with `/api/agents`, `/api/evaluate`, `/api/health` |
| `ai_engine_core.py` | Core evaluation engine: expert prompts, LLM calls, synthesis |
| `server/routes.ts` | Express routes + FastAPI proxy + legacy `run_evaluation` |
| `client/src/context/AgentsContext.tsx` | Agent state, fetches from `/api/agents` with static fallback |
| `client/src/pages/sections/DashboardMainSection.tsx` | Main dashboard with Expert Council Status card |
| `client/src/pages/AgentDetailPage.tsx` | Agent detail with Compliance Status badge |
| `python_engine/council_eval.py` | Legacy CLI-based council evaluation |
| `shared/schema.ts` | Drizzle schema + Zod types |

## API Endpoints

- `GET /api/agents` — List all agents (proxied to FastAPI)
- `POST /api/evaluate` — Run council evaluation `{ agentName, repoUrl? }` (proxied to FastAPI)
- `GET /api/health` — Health check (proxied to FastAPI)
- `POST /api/run_evaluation` — Legacy Express-based evaluation via child_process

## LLM Provider Detection

`ai_engine_core.py` auto-detects provider from environment variables:
- `OPENAI_API_KEY` → OpenAI (gpt-4o-mini)
- `ANTHROPIC_API_KEY` → Anthropic (claude-3-5-sonnet)
- Neither / invalid → Mock mode (returns simulated expert assessments)

## localStorage Keys (v2)

- `asl_agents_v2`, `asl_evaluations_v2`, `asl_module_meta_v2`, `asl_module_report_v2`

## Expert Panel

- `expert_a` = Security & Compliance Probe (Safety & Harm)
- `expert_b` = Governance & Risk Workflow (Governance & Compliance)
- `expert_c` = Contextual Risk Arbiter (Security & Attack Surface)

## Routing

- `/agents/:id` → AgentDetailPage
- `/evaluations/:id` → EvaluationDetailPage (slug-based)

## Conventions

- Never use modals for detail views
- Never show "Live" labels
- Trigger-based audit system, not real-time monitoring
- `@media print` rules in `index.css`; sidebar/header have `print:hidden`
