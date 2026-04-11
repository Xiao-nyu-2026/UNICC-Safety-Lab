import { useState } from "react";
import {
  ArrowLeftIcon,
  FileDownIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from "lucide-react";
import { useParams, useLocation, useSearch } from "wouter";
import { useAgents } from "@/context/AgentsContext";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ─────────────────────────── Static agent records ─────────────────────────── */
const agentData: Record<string, {
  name: string; id: string; type: string; status: string; statusColor: string;
  safetyScore: number | null; scoreColor: string; evalCount: number;
  lastEval: string; description: string;
  recentEvals: { evalId: string; module: string; status: string; statusColor: string; score: number | null; date: string }[];
  securityFlags: { severity: string; module: string; message: string }[];
}> = {
  "AGT-001": {
    name: "GPT-4-Turbo-Prod", id: "AGT-001", type: "Language Model",
    status: "Active", statusColor: "bg-[#d0fae5] text-[#004f3b]",
    safetyScore: 99, scoreColor: "bg-[#00bc7d]", evalCount: 1029, lastEval: "10 mins ago",
    description: "Production language model endpoint. Handles customer-facing queries and internal tooling assistance.",
    recentEvals: [
      { evalId: "EV-1029", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 99, date: "Mar 8, 2026" },
      { evalId: "EV-1026", module: "Data Exfiltration", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 100, date: "Mar 8, 2026" },
      { evalId: "EV-1018", module: "Jailbreak Attempts", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 97, date: "Mar 5, 2026" },
    ],
    securityFlags: [],
  },
  "AGT-002": {
    name: "Llama-3-Custom", id: "AGT-002", type: "Fine-tuned Model",
    status: "Running Eval", statusColor: "bg-zinc-100 text-zinc-900",
    safetyScore: null, scoreColor: "", evalCount: 412, lastEval: "1 hr ago",
    description: "Fine-tuned variant of Llama 3 for internal knowledge-base Q&A. Currently under active evaluation.",
    recentEvals: [
      { evalId: "EV-1028", module: "Toxicity & Bias", status: "Running", statusColor: "bg-zinc-100 text-zinc-900", score: null, date: "Mar 8, 2026" },
      { evalId: "EV-1015", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 91, date: "Mar 3, 2026" },
    ],
    securityFlags: [{ severity: "Medium", module: "Toxicity & Bias", message: "Evaluation has been running for over 2 hours. Possible timeout." }],
  },
  "AGT-003": {
    name: "Customer-Bot-V1", id: "AGT-003", type: "Conversational AI",
    status: "Flagged", statusColor: "bg-[#ffe2e2] text-[#82181a]",
    safetyScore: 45, scoreColor: "bg-[#fb2c36]", evalCount: 887, lastEval: "3 hrs ago",
    description: "Customer-facing conversational agent for support workflows. Multiple security flags require attention before redeployment.",
    recentEvals: [
      { evalId: "EV-1027", module: "Jailbreak Attempts", status: "Failed", statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 45, date: "Mar 8, 2026" },
      { evalId: "EV-1022", module: "Bias Detection", status: "Failed", statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 62, date: "Mar 5, 2026" },
      { evalId: "EV-1011", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 88, date: "Feb 28, 2026" },
    ],
    securityFlags: [
      { severity: "High", module: "Jailbreak Attempts", message: "Score 45 below threshold (80). Manual review required before next deployment." },
      { severity: "High", module: "Bias Detection", message: "Bias score 62 significantly below threshold. Gender and age bias detected." },
    ],
  },
  "AGT-004": {
    name: "Code-Gen-Agent", id: "AGT-004", type: "Code Generation",
    status: "Active", statusColor: "bg-[#d0fae5] text-[#004f3b]",
    safetyScore: 95, scoreColor: "bg-[#00bc7d]", evalCount: 234, lastEval: "1 day ago",
    description: "Code generation agent used in internal developer tooling. Restricted to code-related prompts.",
    recentEvals: [{ evalId: "EV-1025", module: "Malicious Code Gen", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 95, date: "Mar 7, 2026" }],
    securityFlags: [],
  },
  "AGT-005": {
    name: "Data-Pipeline-Bot", id: "AGT-005", type: "Data Processing",
    status: "Active", statusColor: "bg-[#d0fae5] text-[#004f3b]",
    safetyScore: 100, scoreColor: "bg-[#00bc7d]", evalCount: 567, lastEval: "2 days ago",
    description: "Automated data pipeline orchestration agent. Handles ETL tasks and data transformation workflows.",
    recentEvals: [{ evalId: "EV-1023", module: "Data Exfiltration", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 100, date: "Mar 6, 2026" }],
    securityFlags: [],
  },
  "AGT-006": {
    name: "Support-Agent-V2", id: "AGT-006", type: "Conversational AI",
    status: "Inactive", statusColor: "bg-zinc-100 text-zinc-500",
    safetyScore: 88, scoreColor: "bg-[#00bc7d]", evalCount: 103, lastEval: "5 days ago",
    description: "Second-generation support agent. Currently inactive — pending approval for re-evaluation.",
    recentEvals: [{ evalId: "EV-1024", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 88, date: "Mar 7, 2026" }],
    securityFlags: [{ severity: "Low", module: "Bias Detection", message: "Pending manual approval before evaluation can proceed." }],
  },
  "AGT-007": {
    name: "Finance-Advisor-LLM", id: "AGT-007", type: "Domain-Specific Model",
    status: "Flagged", statusColor: "bg-[#ffe2e2] text-[#82181a]",
    safetyScore: 31, scoreColor: "bg-[#fb2c36]", evalCount: 67, lastEval: "2 days ago",
    description: "LLM fine-tuned on financial advisory data. Flagged for adversarial prompt vulnerabilities that bypass financial guardrails.",
    recentEvals: [{ evalId: "EV-1031", module: "Adversarial Prompt", status: "Failed", statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 31, date: "Oct 20, 2023" }],
    securityFlags: [
      { severity: "High", module: "Adversarial Prompt", message: "Guardrails bypassed in 3/4 adversarial prompt test cases. OWASP LLM01 violation." },
      { severity: "High", module: "Regulatory Compliance", message: "Financial advice output not aligned with SEC/FCA safe-harbour requirements." },
    ],
  },
};

/* ─────────────────────── Expert column definitions ─────────────────────── */
const EXPERT_COLS: { key: "expert_a" | "expert_b" | "expert_c"; label: string; sublabel: string; accent: string; headerBg: string }[] = [
  { key: "expert_a", label: "Security & Compliance Probe", sublabel: "AI safety / harmful output risk",          accent: "#4f39f6", headerBg: "bg-[#f5f3ff]" },
  { key: "expert_b", label: "Governance & Risk Workflow",  sublabel: "Governance / policy / institutional",      accent: "#009966", headerBg: "bg-[#f0fdf4]" },
  { key: "expert_c", label: "Contextual Risk Arbiter",     sublabel: "Application security / attack surface",    accent: "#b45309", headerBg: "bg-[#fffbeb]" },
];

/* ─────────────────────── Helpers ─────────────────────── */
function verdictStyle(v: string): string {
  const u = (v ?? "").toUpperCase();
  if (u === "APPROVE" || u === "APPROVED" || u === "PASS" || u === "PASSED") return "bg-[#d1fae5] text-[#065f46]";
  if (u === "REVIEW") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[#ffe4e6] text-[#9f1239]";
}

function verdictBorderColor(v: string): string {
  const u = (v ?? "").toUpperCase();
  if (u === "APPROVE" || u === "APPROVED" || u === "PASS" || u === "PASSED") return "#009966";
  if (u === "REVIEW") return "#f59e0b";
  return "#e7000b";
}

function verdictFooterBg(v: string): string {
  const u = (v ?? "").toUpperCase();
  if (u === "APPROVE" || u === "APPROVED" || u === "PASS" || u === "PASSED") return "bg-[#f0fdf4]";
  if (u === "REVIEW") return "bg-[#fffbeb]";
  return "bg-[#fff1f2]";
}

function verdictFooterText(v: string): string {
  const u = (v ?? "").toUpperCase();
  if (u === "APPROVE" || u === "APPROVED" || u === "PASS" || u === "PASSED") return "No critical risks identified";
  if (u === "REVIEW") return "Moderate risk — review recommended";
  return "High risk — immediate action required";
}

/** Defensive: convert a string bullet into an array if needed */
function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((s) => s.trim().length > 0);
  return val
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 4);
}

/* ─────────────────────── LocalStorage readers ─────────────────────── */
const MODULE_ID_TO_LABEL: Record<string, string> = {
  "prompt-injection":   "Prompt Injection V2",
  "jailbreak-attempts": "Jailbreak Attempts",
  "toxicity":           "Toxicity & Bias",
  "data-exfiltration":  "Data Exfiltration",
  "adversarial-prompt": "Adversarial Prompt",
  "pii-extraction":     "PII Extraction",
};

type ExpertCell = {
  verdict: string;
  findings: string[];
  risks: string[];
};

type LiveRow = {
  moduleId: string;
  moduleName: string;
  moduleVerdict: string;
  confidence: number;
  synthesisText?: string;
  expert_a: ExpertCell;
  expert_b: ExpertCell;
  expert_c: ExpertCell;
};

function parseExpertCell(ex: Record<string, any> | undefined): ExpertCell {
  if (!ex) return { verdict: "REVIEW", findings: ["No data available."], risks: [] };

  const verdict = (ex.verdict ?? ex.recommendation ?? (ex.score != null ? (ex.score >= 70 ? "APPROVE" : ex.score >= 50 ? "REVIEW" : "REJECT") : "REVIEW")).toUpperCase();

  /* Support both new shape (findings/risks arrays) and legacy (rationale string) */
  const findings = toArray(ex.findings ?? ex.rationale);
  const risks    = toArray(ex.risks);

  return {
    verdict,
    findings: findings.length > 0 ? findings : ["No specific findings reported."],
    risks,
  };
}

function loadLiveRows(agentName: string): LiveRow[] {
  try {
    const raw = localStorage.getItem("asl_module_report_v2");
    if (!raw) return [];
    const all: Record<string, Record<string, any>> = JSON.parse(raw);

    return Object.entries(all)
      .filter(([, r]) => r.agentName === agentName)
      .map(([moduleId, r]) => ({
        moduleId,
        moduleName: MODULE_ID_TO_LABEL[moduleId] ?? moduleId.replace(/-/g, " "),
        moduleVerdict: (r.verdict ?? "REVIEW").toUpperCase(),
        confidence: r.confidence ?? 60,
        synthesisText: r.synthesis_text ?? r.summary ?? undefined,
        expert_a: parseExpertCell(r.experts?.["expert_a"]),
        expert_b: parseExpertCell(r.experts?.["expert_b"]),
        expert_c: parseExpertCell(r.experts?.["expert_c"]),
      }));
  } catch { return []; }
}

/* Static fallback rows for known agents */
const STATIC_FINDINGS: string[][] = [
  ["Output guard boundaries enforced; no unsafe payload propagated.", "Injection resistance maintained under adversarial test conditions.", "Classifier threshold met across all safety categories."],
  ["Potential bias in generation detected under adversarial prompts.", "Content filter bypass partially observed in multi-turn sequences."],
  ["Critical violation: OWASP LLM02 — output not sanitised before execution.", "Hardcoded credential exposure detected in instrumentation layer."],
];
const STATIC_RISKS: Record<string, string[][]> = {
  a: [
    [],
    ["Content filter bypass may allow harmful output in edge cases.", "Rate-limiting absent on generation endpoint."],
    ["Unrestricted file upload vector identified in tool interface.", "Unsafe output propagation to downstream services."],
  ],
  b: [
    [],
    ["Audit gap identified in evaluation log.", "Policy override not restricted at API boundary."],
    ["Governance documentation insufficient for production clearance.", "SEC/FCA safe-harbour alignment not verified."],
  ],
  c: [
    [],
    ["Indirect injection vector partially mitigated.", "API key rotation policy not enforced."],
    ["Guardrail bypass confirmed in 3/4 adversarial test scenarios.", "Hardcoded secrets present in deployment artefacts."],
  ],
};

function buildStaticRows(agentId: string): LiveRow[] {
  const ad = agentData[agentId];
  if (!ad) return [];
  return ad.recentEvals.map((ev, i) => {
    const baseVerdict = ev.status === "Passed" ? "APPROVE" : ev.status === "Failed" ? "REJECT" : "REVIEW";
    const set = i % 3;
    return {
      moduleId: ev.evalId,
      moduleName: ev.module,
      moduleVerdict: baseVerdict,
      confidence: ev.score ?? 60,
      expert_a: { verdict: baseVerdict, findings: STATIC_FINDINGS[set], risks: STATIC_RISKS.a[set] },
      expert_b: { verdict: set === 0 ? "APPROVE" : set === 1 ? "REVIEW" : "REJECT", findings: STATIC_FINDINGS[set], risks: STATIC_RISKS.b[set] },
      expert_c: { verdict: set === 0 ? "APPROVE" : set === 2 ? "REJECT" : "REVIEW", findings: STATIC_FINDINGS[set], risks: STATIC_RISKS.c[set] },
    };
  });
}

/* ─────────────────────── Expert cell component ─────────────────────── */
function ExpertCellView({
  cell,
  col,
}: {
  cell: ExpertCell;
  col: typeof EXPERT_COLS[number];
}) {
  const borderColor = verdictBorderColor(cell.verdict);
  const footerBg    = verdictFooterBg(cell.verdict);

  return (
    <div
      className="rounded-xl border border-zinc-100 bg-white flex flex-col overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.06)]"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Header: expert label + verdict badge */}
      <div className={`${col.headerBg} px-4 py-3 flex items-center justify-between border-b border-zinc-100`}>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
          <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-xs leading-tight">{col.label}</span>
          <span className="[font-family:'Inter',Helvetica] text-[10px] text-[#71717b]">{col.sublabel}</span>
        </div>
        <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-[10px] px-2.5 py-0.5 h-auto flex-shrink-0 ${verdictStyle(cell.verdict)}`}>
          {cell.verdict}
        </Badge>
      </div>

      {/* Findings — grey bullet dots */}
      {cell.findings.length > 0 && (
        <div className="px-4 pt-3 pb-2">
          <p className="[font-family:'Inter',Helvetica] text-[9.5px] font-semibold text-[#a1a1aa] uppercase tracking-widest mb-1.5">
            Findings
          </p>
          <ul className="flex flex-col gap-1.5">
            {cell.findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-zinc-300 flex-shrink-0" />
                <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-[11.5px] leading-[1.55] break-words min-w-0">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks — accent-colored bullet dots */}
      {cell.risks.length > 0 && (
        <div className={`px-4 pb-3 ${cell.findings.length > 0 ? "pt-1 border-t border-zinc-50 mt-1" : "pt-3"}`}>
          <p className="[font-family:'Inter',Helvetica] text-[9.5px] font-semibold uppercase tracking-widest mb-1.5"
             style={{ color: borderColor }}>
            Risks
          </p>
          <ul className="flex flex-col gap-1.5">
            {cell.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: borderColor }}
                />
                <span className="[font-family:'Inter',Helvetica] font-normal text-[11.5px] leading-[1.55] break-words min-w-0"
                      style={{ color: borderColor === "#009966" ? "#065f46" : borderColor === "#f59e0b" ? "#92400e" : "#9f1239" }}>
                  {r}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Spacer if no risks */}
      {cell.risks.length === 0 && <div className="flex-1" />}

      {/* Risk summary footer */}
      <div className={`${footerBg} px-4 py-2.5 flex items-center gap-2 border-t border-zinc-100`}>
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: borderColor }}
        />
        <p className="[font-family:'Inter',Helvetica] text-[10px] text-[#71717b]">
          {verdictFooterText(cell.verdict)}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────── Council Matrix ─────────────────────── */
function CouncilMatrix({ rows, agentName }: { rows: LiveRow[]; agentName: string }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 px-8">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center">
          <ShieldIcon className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="text-center max-w-sm">
          <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-1">
            No evaluations have been run for this agent yet
          </p>
          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
            Launch a security audit from the Dashboard to populate this matrix with expert council findings and risk assessments.
          </p>
          <p className="[font-family:'Inter',Helvetica] text-xs text-[#a1a1aa] mt-3">Agent: {agentName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-100">
      {rows.map((row, i) => (
        <div key={`${row.moduleId}-${i}`} className="px-6 py-5" data-testid={`row-council-${i}`}>
          {/* Row header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-col gap-0.5">
              <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-sm">{row.moduleName}</span>
              {row.synthesisText && (
                <span className="[font-family:'Inter',Helvetica] text-[10.5px] text-[#71717b] leading-tight max-w-2xl">
                  {row.synthesisText.slice(0, 160)}{row.synthesisText.length > 160 ? "…" : ""}
                </span>
              )}
            </div>
            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-xs px-2.5 py-0.5 h-auto flex-shrink-0 ${verdictStyle(row.moduleVerdict)}`}>
              {row.moduleVerdict}
            </Badge>
          </div>

          {/* 3-column expert grid */}
          <div className="grid grid-cols-3 gap-4">
            {EXPERT_COLS.map((col) => (
              <ExpertCellView key={col.key} cell={row[col.key]} col={col} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export const AgentDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromEval = new URLSearchParams(search).get("from");

  const { agents: contextAgents } = useAgents();
  const liveAgent = contextAgents.find((a) => a.id === id);
  const liveResult = liveAgent?.lastEvalResult ?? null;

  const agent = agentData[id ?? ""] ?? null;
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = () => {
    setExportingPDF(true);
    setTimeout(() => { setExportingPDF(false); window.print(); }, 1800);
  };

  /* ── Unified display values (works for both static and dynamic agents) ── */
  const displayName       = agent?.name       ?? liveAgent?.name       ?? "Unknown Agent";
  const displayId         = agent?.id         ?? liveAgent?.id         ?? id;
  const displayType       = agent?.type       ?? liveAgent?.type       ?? "AI Agent";
  const displayStatus     = agent?.status     ?? liveAgent?.status     ?? "UNTESTED";
  const displayStatusColor = agent?.statusColor ?? liveAgent?.statusColor ?? "bg-zinc-100 text-zinc-600";
  const displayEvalCount  = agent?.evalCount  ?? liveAgent?.evalCount  ?? 0;
  const displayLastEval   = agent?.lastEval   ?? liveAgent?.lastEval   ?? "Never";
  const displaySafetyScore = agent?.safetyScore
    ?? (liveResult ? liveResult.confidence_score : null);
  const displayScoreColor = displaySafetyScore !== null
    ? (displaySafetyScore >= 80 ? "text-[#009966]" : displaySafetyScore >= 50 ? "text-[#b45309]" : "text-[#e7000b]")
    : "text-zinc-400";
  const displayDescription = agent?.description
    ?? `${displayName} is an imported AI agent registered in the Safety Lab. Run a security audit from the Dashboard to generate a full safety assessment and populate the Council of Experts matrix.`;
  const displayFlags = agent?.securityFlags ?? [];

  /* ── Matrix rows: prefer LS data, fall back to static ── */
  const lsRows     = loadLiveRows(displayName);
  const matrixRows = lsRows.length > 0 ? lsRows : (agent ? buildStaticRows(id ?? "") : []);
  const totalFindings = matrixRows.reduce((acc, r) =>
    acc + [r.expert_a, r.expert_b, r.expert_c].filter((ex) => ex.verdict !== "APPROVE").length, 0);

  /* Not found */
  if (!agent && !liveAgent) {
    return (
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        <SidebarSection />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-start w-full">
            <PageHeader placeholder="Search agents..." />
            <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
              <button
                onClick={() => navigate("/agents")}
                className="flex items-center gap-2 text-[#71717b] hover:text-zinc-950 [font-family:'Inter',Helvetica] text-sm transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Agents
              </button>
              <p className="[font-family:'Inter',Helvetica] text-[#71717b] text-sm">Agent {id} not found.</p>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-start w-full">
          <PageHeader placeholder="Search agents..." />

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Back button */}
            <button
              onClick={() => fromEval ? navigate(`/evaluations/${fromEval}`) : navigate("/agents")}
              className="flex items-center gap-2 text-[#71717b] hover:text-zinc-950 [font-family:'Inter',Helvetica] text-sm transition-colors"
              data-testid="button-back-to-evaluation"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {fromEval ? `Back to Evaluation ${fromEval}` : "Back to Agents"}
            </button>

            {/* ── Title Row ── */}
            <section className="flex items-start justify-between w-full">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                    {displayName}
                  </h1>
                  <Badge
                    className={`${displayStatusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}
                    data-testid="badge-agent-status"
                  >
                    {displayStatus}
                  </Badge>
                </div>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
                  {displayId} · {displayType} · {displayEvalCount.toLocaleString()} evals run · Last evaluated {displayLastEval}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="h-10 px-4 border-[#4f39f6] bg-white [font-family:'Inter',Helvetica] font-medium text-[#4f39f6] text-sm hover:bg-[#f0f4ff] hover:text-[#3d2bc4] hover:border-[#3d2bc4] disabled:opacity-70"
                data-testid="button-export-pdf"
              >
                {exportingPDF ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <>
                    <FileDownIcon className="w-4 h-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </section>

            {/* ── Stats Cards ── */}
            <section className="grid grid-cols-3 gap-4 w-full">
              {/* Safety Score */}
              <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="pt-6 pb-5 px-6">
                  <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Safety Score</p>
                  {liveResult ? (
                    <div className="mt-2">
                      <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-sm px-3 py-1 h-auto ${verdictStyle(liveResult.final_verdict)}`}>
                        {liveResult.final_verdict}
                      </Badge>
                      <div className="mt-2 w-full bg-zinc-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#4f39f6]" style={{ width: `${liveResult.confidence_score}%` }} />
                      </div>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-1.5">
                        {liveResult.confidence_score}% confidence
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${displayScoreColor}`}>
                        {displaySafetyScore !== null ? `${displaySafetyScore}%` : "—"}
                      </p>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-1">
                        {displaySafetyScore !== null
                          ? (displaySafetyScore >= 80 ? "Within safe threshold" : displaySafetyScore >= 50 ? "Borderline — review required" : "Below minimum threshold")
                          : "No evaluations run yet"}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total Evals */}
              <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="pt-6 pb-5 px-6">
                  <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Total Evaluations</p>
                  <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                    {displayEvalCount.toLocaleString()}
                  </p>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-1">Lifetime evaluations</p>
                </CardContent>
              </Card>

              {/* Modules Evaluated */}
              <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="pt-6 pb-5 px-6">
                  <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Modules Evaluated</p>
                  <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${matrixRows.length === 0 ? "text-zinc-400" : "text-zinc-950"}`}>
                    {matrixRows.length}
                  </p>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-1">
                    {matrixRows.length > 0
                      ? `${totalFindings} finding${totalFindings !== 1 ? "s" : ""} across ${matrixRows.length} module${matrixRows.length !== 1 ? "s" : ""}`
                      : "No modules tested yet"}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ── About + Security Flags ── */}
            <section className="flex gap-6 w-full">
              {/* Description */}
              <div className="flex flex-col gap-4 flex-1">
                <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                  <CardContent className="px-6 pt-5 pb-5">
                    <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-2">About this Agent</h3>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-5">{displayDescription}</p>
                  </CardContent>
                </Card>

                {/* Latest audit synthesis (if liveResult) */}
                {liveResult && (liveResult.synthesis_text || liveResult.summary) && (
                  <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                    <CardContent className="px-6 pt-5 pb-5">
                      <p className="[font-family:'Inter',Helvetica] text-xs font-semibold text-[#71717b] uppercase tracking-wider mb-3">
                        Audit Synthesis
                      </p>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-6">
                        {liveResult.synthesis_text ?? liveResult.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Security Flags sidebar */}
              <div className="w-[280px] flex-shrink-0">
                <Card className={`shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] ${displayFlags.length > 0 ? "border-[#ffc0d0]" : "border-zinc-200"}`}>
                  <CardContent className="px-6 pt-5 pb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlertIcon className={`w-4 h-4 ${displayFlags.length > 0 ? "text-[#ff2d78]" : "text-[#71717b]"}`} />
                      <h3 className={`[font-family:'Inter',Helvetica] font-semibold text-sm ${displayFlags.length > 0 ? "text-[#ff2d78]" : "text-zinc-950"}`}>
                        Security Flags
                      </h3>
                      <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-2 py-0.5 h-auto ml-auto ${displayFlags.length > 0 ? "bg-[#ffe0eb] text-[#ff2d78]" : "bg-zinc-100 text-zinc-500"}`}>
                        {displayFlags.length}
                      </Badge>
                    </div>
                    {displayFlags.length === 0 ? (
                      <div className="flex items-center gap-2 py-2">
                        <ShieldCheckIcon className="w-4 h-4 text-[#00bc7d]" />
                        <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">No active security flags</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {displayFlags.map((flag, i) => (
                          <div key={i} className={`p-3 rounded-lg border ${flag.severity === "High" ? "bg-[#fff0f5] border-[#ffc0d0]" : "bg-[#fff8e1] border-[#fde68a]"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto ${flag.severity === "High" ? "bg-[#ffe0eb] text-[#ff2d78]" : flag.severity === "Medium" ? "bg-[#fff8e1] text-[#b45309]" : "bg-zinc-100 text-zinc-700"}`}>
                                {flag.severity}
                              </Badge>
                              <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">{flag.module}</span>
                            </div>
                            <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-xs leading-4">{flag.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ── Council of Experts Assessment — Matrix ── */}
            <section className="w-full">
              <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="p-0">
                  <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                        Council of Experts Assessment
                      </h2>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                        {matrixRows.length > 0
                          ? `${matrixRows.length} evaluation module${matrixRows.length !== 1 ? "s" : ""} · ${totalFindings} finding${totalFindings !== 1 ? "s" : ""} · independent verdicts from 3 expert reviewers`
                          : "Independent expert verdicts per evaluation module — run an audit to populate"}
                      </p>
                    </div>
                    {/* Expert legend */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {EXPERT_COLS.map((col, idx) => {
                        const pills = ["bg-[#ede9fe] text-[#4f39f6]", "bg-[#d1fae5] text-[#065f46]", "bg-[#fef3c7] text-[#92400e]"];
                        return (
                          <span key={col.key} className={`[font-family:'Inter',Helvetica] text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${pills[idx]}`}>
                            {col.label.split(" ")[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <CouncilMatrix rows={matrixRows} agentName={displayName} />
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
