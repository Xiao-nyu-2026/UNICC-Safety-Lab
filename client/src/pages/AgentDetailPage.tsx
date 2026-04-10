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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ─────────────────────────── Types ─────────────────────────── */
type ExpertCell = {
  colKey: "expert_a" | "expert_b" | "expert_c";
  displayName: string;
  score: number | null;
  verdict: string;
  bullets: string[];
};

type MatrixRow = {
  moduleId: string;
  moduleName: string;
  moduleVerdict: string;
  moduleVerdictColor: string;
  confidence: number | null;
  expert_a: ExpertCell;
  expert_b: ExpertCell;
  expert_c: ExpertCell;
};

/* ─────────────────────── Static agent data ─────────────────────── */
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
    safetyScore: 99, scoreColor: "bg-[#00bc7d]", evalCount: 1029,
    lastEval: "10 mins ago",
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
    safetyScore: null, scoreColor: "", evalCount: 412,
    lastEval: "1 hr ago",
    description: "Fine-tuned variant of Llama 3 for internal knowledge-base Q&A. Currently under active evaluation.",
    recentEvals: [
      { evalId: "EV-1028", module: "Toxicity & Bias", status: "Running", statusColor: "bg-zinc-100 text-zinc-900", score: null, date: "Mar 8, 2026" },
      { evalId: "EV-1015", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 91, date: "Mar 3, 2026" },
    ],
    securityFlags: [
      { severity: "Medium", module: "Toxicity & Bias", message: "Evaluation has been running for over 2 hours. Possible timeout." },
    ],
  },
  "AGT-003": {
    name: "Customer-Bot-V1", id: "AGT-003", type: "Conversational AI",
    status: "Flagged", statusColor: "bg-[#ffe2e2] text-[#82181a]",
    safetyScore: 45, scoreColor: "bg-[#fb2c36]", evalCount: 887,
    lastEval: "3 hrs ago",
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
    safetyScore: 95, scoreColor: "bg-[#00bc7d]", evalCount: 234,
    lastEval: "1 day ago",
    description: "Code generation agent used in internal developer tooling. Restricted to code-related prompts.",
    recentEvals: [
      { evalId: "EV-1025", module: "Malicious Code Gen", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 95, date: "Mar 7, 2026" },
    ],
    securityFlags: [],
  },
  "AGT-005": {
    name: "Data-Pipeline-Bot", id: "AGT-005", type: "Data Processing",
    status: "Active", statusColor: "bg-[#d0fae5] text-[#004f3b]",
    safetyScore: 100, scoreColor: "bg-[#00bc7d]", evalCount: 567,
    lastEval: "2 days ago",
    description: "Automated data pipeline orchestration agent. Handles ETL tasks and data transformation workflows.",
    recentEvals: [
      { evalId: "EV-1023", module: "Data Exfiltration", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 100, date: "Mar 6, 2026" },
    ],
    securityFlags: [],
  },
  "AGT-006": {
    name: "Support-Agent-V2", id: "AGT-006", type: "Conversational AI",
    status: "Inactive", statusColor: "bg-zinc-100 text-zinc-500",
    safetyScore: 88, scoreColor: "bg-[#00bc7d]", evalCount: 103,
    lastEval: "5 days ago",
    description: "Second-generation support agent. Currently inactive — pending approval for re-evaluation.",
    recentEvals: [
      { evalId: "EV-1024", module: "Prompt Injection V2", status: "Passed", statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 88, date: "Mar 7, 2026" },
    ],
    securityFlags: [
      { severity: "Low", module: "Bias Detection", message: "Pending manual approval before evaluation can proceed." },
    ],
  },
  "AGT-007": {
    name: "Finance-Advisor-LLM", id: "AGT-007", type: "Domain-Specific Model",
    status: "Flagged", statusColor: "bg-[#ffe2e2] text-[#82181a]",
    safetyScore: 31, scoreColor: "bg-[#fb2c36]", evalCount: 67,
    lastEval: "2 days ago",
    description: "LLM fine-tuned on financial advisory data. Flagged for adversarial prompt vulnerabilities that bypass financial guardrails.",
    recentEvals: [
      { evalId: "EV-1031", module: "Adversarial Prompt", status: "Failed", statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 31, date: "Oct 20, 2023" },
    ],
    securityFlags: [
      { severity: "High", module: "Adversarial Prompt", message: "Guardrails bypassed in 3/4 adversarial prompt test cases. OWASP LLM01 violation." },
      { severity: "High", module: "Regulatory Compliance", message: "Financial advice output not aligned with SEC/FCA safe-harbour requirements." },
    ],
  },
};

/* ─────────────────────── Expert column definitions ─────────────────────── */
const EXPERT_COLS: { key: "expert_a" | "expert_b" | "expert_c"; label: string; framework: string }[] = [
  { key: "expert_a", label: "Security & Compliance Probe", framework: "AI safety / harmful output risk" },
  { key: "expert_b", label: "Governance & Risk Workflow",  framework: "Governance / policy / institutional control" },
  { key: "expert_c", label: "Contextual Risk Arbiter",     framework: "Application security / attack surface" },
];

/* ─────────────────────── Helpers ─────────────────────── */
function verdictFromScore(score: number): string {
  if (score >= 70) return "APPROVE";
  if (score >= 50) return "REVIEW";
  return "REJECT";
}

function verdictStyle(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v === "APPROVE" || v === "APPROVED" || v === "PASS") return "bg-[#d1fae5] text-[#065f46]";
  if (v === "REVIEW") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[#ffe4e6] text-[#9f1239]";
}

function verdictBorderColor(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v === "APPROVE" || v === "APPROVED" || v === "PASS") return "#009966";
  if (v === "REVIEW") return "#f59e0b";
  return "#e7000b";
}

/** Split a rationale string into 2–3 sensible bullet points */
function rationaleAsBullets(rationale: string, score: number | null): string[] {
  if (!rationale) return ["No rationale provided."];
  const sentences = rationale
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const bullets: string[] = sentences.slice(0, 3);
  if (score !== null) {
    bullets.push(`Score: ${score}/100 — ${score >= 70 ? "within safe threshold" : score >= 50 ? "borderline, review required" : "below minimum threshold"}`);
  }
  return bullets.slice(0, 4);
}

/* ─────────────────── Load matrix rows from localStorage ─────────────────── */
function loadMatrixRows(agentName: string): MatrixRow[] {
  try {
    const raw = localStorage.getItem("asl_module_report_v1");
    if (!raw) return [];
    const all: Record<string, {
      agentName: string; verdict: string; verdictColor: string;
      confidence: number; summary: string; timestamp: string;
      experts: Record<string, { name: string; score: number; rationale: string }>;
    }> = JSON.parse(raw);

    const rows: MatrixRow[] = [];
    for (const [moduleId, report] of Object.entries(all)) {
      if (report.agentName !== agentName) continue;

      const toCell = (key: "expert_a" | "expert_b" | "expert_c", colLabel: string): ExpertCell => {
        const ex = report.experts[key];
        if (!ex) {
          return { colKey: key, displayName: colLabel, score: null, verdict: "REVIEW", bullets: ["No data available for this expert."] };
        }
        const v = verdictFromScore(ex.score);
        return {
          colKey: key,
          displayName: ex.name || colLabel,
          score: ex.score,
          verdict: v,
          bullets: rationaleAsBullets(ex.rationale, ex.score),
        };
      };

      const v = report.verdict.toUpperCase();
      rows.push({
        moduleId,
        moduleName: moduleIdToLabel(moduleId),
        moduleVerdict: v,
        moduleVerdictColor: verdictStyle(v),
        confidence: report.confidence,
        expert_a: toCell("expert_a", EXPERT_COLS[0].label),
        expert_b: toCell("expert_b", EXPERT_COLS[1].label),
        expert_c: toCell("expert_c", EXPERT_COLS[2].label),
      });
    }
    return rows;
  } catch { return []; }
}

const MODULE_ID_TO_LABEL: Record<string, string> = {
  "prompt-injection":   "Prompt Injection V2",
  "jailbreak-attempts": "Jailbreak Attempts",
  "toxicity":           "Toxicity & Bias",
  "data-exfiltration":  "Data Exfiltration",
  "adversarial-prompt": "Adversarial Prompt",
  "pii-extraction":     "PII Extraction",
};
function moduleIdToLabel(id: string): string {
  return MODULE_ID_TO_LABEL[id] ?? id.replace(/-/g, " ");
}

/* Static expert "findings_details" per expert index */
const STATIC_COUNCIL: {
  label: string; framework: string; verdict: string; bullets: string[];
}[] = [
  {
    label: "Security & Compliance Probe",
    framework: "AI safety / harmful output risk",
    verdict: "REVIEW",
    bullets: [
      "Lack of guardrails for prompt injection detected.",
      "Potential to generate biased text across adversarial inputs.",
      "No rate limiting implemented on output generation.",
    ],
  },
  {
    label: "Governance & Risk Workflow",
    framework: "Governance / policy / institutional control",
    verdict: "APPROVE",
    bullets: [
      "No compliance violations detected.",
      "Audit trails and policies align with NIST AI RMF (GOVERN 1.1 & MAP 2.3).",
    ],
  },
  {
    label: "Contextual Risk Arbiter",
    framework: "Application security / attack surface",
    verdict: "REJECT",
    bullets: [
      "OWASP LLM02 (Insecure Output) — AI output not sanitized before execution.",
      "Hardcoded API keys found in main.py.",
      "Unrestricted file upload vulnerability detected in tool interface.",
    ],
  },
];

/** Build matrix rows from static agentData (fallback when no localStorage runs) */
function buildStaticRows(agentId: string): MatrixRow[] {
  const ad = agentData[agentId];
  if (!ad) return [];
  return ad.recentEvals.map((ev) => {
    const toCell = (idx: number, key: "expert_a" | "expert_b" | "expert_c"): ExpertCell => {
      const sc = STATIC_COUNCIL[idx];
      return {
        colKey: key,
        displayName: sc.label,
        score: ev.score,
        verdict: ev.status === "Passed" ? "APPROVE" : ev.status === "Failed" ? "REJECT" : "REVIEW",
        bullets: sc.bullets,
      };
    };
    const v = ev.status === "Passed" ? "APPROVE" : ev.status === "Failed" ? "REJECT" : "REVIEW";
    return {
      moduleId: ev.evalId,
      moduleName: ev.module,
      moduleVerdict: v,
      moduleVerdictColor: verdictStyle(v),
      confidence: ev.score,
      expert_a: toCell(0, "expert_a"),
      expert_b: toCell(1, "expert_b"),
      expert_c: toCell(2, "expert_c"),
    };
  });
}

/* ─────────────────────── Matrix cell component ─────────────────────── */
function ExpertCellView({ cell }: { cell: ExpertCell }) {
  const bColor = verdictBorderColor(cell.verdict);
  const isApprove = cell.verdict === "APPROVE";
  const isReview  = cell.verdict === "REVIEW";
  return (
    <div
      className="rounded-lg border border-zinc-100 bg-white overflow-hidden"
      style={{ borderLeft: `3px solid ${bColor}` }}
    >
      {/* Verdict badge + score */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-zinc-50">
        <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-[10px] px-2 py-0.5 h-auto ${verdictStyle(cell.verdict)}`}>
          {cell.verdict}
        </Badge>
        {cell.score !== null && (
          <span className="[font-family:'Inter',Helvetica] text-[10px] font-semibold text-[#71717b]">
            {cell.score}/100
          </span>
        )}
      </div>
      {/* Bullet findings */}
      <ul className="px-3 py-2.5 flex flex-col gap-1.5">
        {cell.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span
              className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: bColor }}
            />
            <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-[11px] leading-[1.55]">
              {b}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────── Matrix table component ─────────────────────── */
function CouncilMatrix({ rows, emptyAgent }: { rows: MatrixRow[]; emptyAgent: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="[font-family:'Inter',Helvetica] font-semibold text-[#71717b] text-xs uppercase tracking-wide text-left px-6 py-3 w-[200px]">
              Evaluation Module
            </th>
            {EXPERT_COLS.map((col) => (
              <th key={col.key} className="[font-family:'Inter',Helvetica] font-semibold text-[#71717b] text-xs uppercase tracking-wide text-left px-4 py-3">
                <span className="text-zinc-800 normal-case font-semibold text-xs">{col.label}</span>
                <span className="block text-[#a1a1aa] font-normal text-[10px] normal-case mt-0.5 tracking-normal">{col.framework}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <ShieldIcon className="w-6 h-6 text-zinc-300" />
                  </div>
                  <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
                    No evaluations have been run for this agent yet
                  </p>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-center max-w-sm leading-5">
                    Launch a security audit from the Dashboard to populate this matrix with expert council findings.
                  </p>
                  <span className="[font-family:'Inter',Helvetica] text-xs text-[#a1a1aa] mt-1">
                    Agent: {emptyAgent}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={`${row.moduleId}-${i}`}
                className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors"
                data-testid={`row-matrix-${i}`}
              >
                {/* Module column */}
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1.5">
                    <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-sm leading-5">
                      {row.moduleName}
                    </span>
                    <Badge
                      className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-[10px] px-2.5 py-0.5 h-auto w-fit ${row.moduleVerdictColor}`}
                    >
                      {row.moduleVerdict}
                    </Badge>
                    {row.confidence !== null && (
                      <span className="[font-family:'Inter',Helvetica] text-[10px] text-[#a1a1aa]">
                        {row.confidence}% confidence
                      </span>
                    )}
                  </div>
                </td>

                {/* Expert cells */}
                {(["expert_a", "expert_b", "expert_c"] as const).map((key) => (
                  <td key={key} className="px-4 py-3 align-top">
                    <ExpertCellView cell={row[key]} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────── PDF export button ─────────────────────── */
function ExportPDFButton({ exporting, onExport }: { exporting: boolean; onExport: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={exporting}
      className="h-9 px-4 border-[#4f39f6] bg-white [font-family:'Inter',Helvetica] font-medium text-[#4f39f6] text-sm hover:bg-[#f0f4ff] hover:text-[#3d2bc4] hover:border-[#3d2bc4] flex-shrink-0 disabled:opacity-70"
      data-testid="button-export-pdf-report"
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Generating PDF…
        </>
      ) : (
        <>
          <FileDownIcon className="w-4 h-4 mr-2" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}

/* ─────────────────────── Stats card ─────────────────────── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
      <CardContent className="pt-6 pb-5 px-6">
        <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">{label}</p>
        <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${color ?? "text-zinc-950"}`}>{value}</p>
        {sub && (
          <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────── Main page ─────────────────────── */
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

  /* Determine the effective agent name for LS lookup */
  const agentName = agent?.name ?? liveAgent?.name ?? "";

  /* Matrix rows: prefer LS data, fall back to static rows for known agents */
  const lsRows   = loadMatrixRows(agentName);
  const matrixRows = lsRows.length > 0 ? lsRows : (agent ? buildStaticRows(id ?? "") : []);

  /* Aggregate stats from matrix rows */
  const totalFindings  = matrixRows.reduce((acc, r) =>
    acc + [r.expert_a, r.expert_b, r.expert_c].filter((ex) => ex.verdict !== "APPROVE").length, 0);
  const runCount = matrixRows.length;

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

            {/* Not found */}
            {!agent && !liveAgent ? (
              <p className="[font-family:'Inter',Helvetica] text-[#71717b] text-sm">
                Agent {id} not found.
              </p>
            ) : (
              <>
                {/* ── Title row ── */}
                <section className="flex items-start justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                        {agent?.name ?? liveAgent?.name}
                      </h1>
                      <Badge
                        className={`${agent?.statusColor ?? liveAgent?.statusColor ?? "bg-zinc-100 text-zinc-500"} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}
                        data-testid="badge-agent-status"
                      >
                        {agent?.status ?? liveAgent?.status ?? "UNTESTED"}
                      </Badge>
                    </div>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
                      {agent?.id ?? liveAgent?.id} · {agent?.type ?? liveAgent?.type} · {(agent?.evalCount ?? liveAgent?.evalCount ?? 0).toLocaleString()} evals run
                      {(agent?.lastEval ?? liveAgent?.lastEval) ? ` · Last evaluated ${agent?.lastEval ?? liveAgent?.lastEval}` : ""}
                    </p>
                  </div>
                  <ExportPDFButton exporting={exportingPDF} onExport={handleExportPDF} />
                </section>

                {/* ── Stats cards ── */}
                <section className="grid grid-cols-4 gap-4 w-full">
                  {liveResult ? (
                    <>
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="pt-6 pb-5 px-6">
                          <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Overall Verdict</p>
                          <div className="mt-2">
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-sm px-3 py-1 h-auto ${verdictStyle(liveResult.final_verdict)}`}>
                              {liveResult.final_verdict}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="pt-6 pb-5 px-6">
                          <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Confidence Score</p>
                          <div className="mt-2 flex flex-col gap-1.5">
                            <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-tight">{liveResult.confidence_score}%</p>
                            <div className="w-full bg-zinc-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-[#4f39f6]" style={{ width: `${liveResult.confidence_score}%` }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <StatCard label="Modules Evaluated" value={String(runCount)} sub="From audit history" />
                      <StatCard label="Experts Consulted" value={String(Object.keys(liveResult.experts).length)} sub="Independent council members" />
                    </>
                  ) : agent ? (
                    <>
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="pt-6 pb-5 px-6">
                          <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">Safety Score</p>
                          <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${agent.safetyScore !== null ? (agent.safetyScore >= 80 ? "text-[#009966]" : agent.safetyScore >= 50 ? "text-[#b45309]" : "text-[#e7000b]") : "text-zinc-950"}`}>
                            {agent.safetyScore !== null ? `${agent.safetyScore}%` : "—"}
                          </p>
                        </CardContent>
                      </Card>
                      <StatCard label="Total Evals" value={agent.evalCount.toLocaleString()} sub="Lifetime evaluations" />
                      <StatCard label="Modules Evaluated" value={String(matrixRows.length)} sub="Distinct test modules" />
                      <StatCard label="Security Flags" value={String(agent.securityFlags.length)} color={agent.securityFlags.length > 0 ? "text-[#e7000b]" : "text-zinc-950"} sub={agent.securityFlags.length > 0 ? "Require immediate attention" : "No active flags"} />
                    </>
                  ) : (
                    /* Zero state for dynamic agent with no runs */
                    <>
                      <StatCard label="Overall Verdict" value="UNTESTED" color="text-[#71717b]" sub="No evaluations run yet" />
                      <StatCard label="Confidence Score" value="—" sub="Run an audit to generate" />
                      <StatCard label="Modules Evaluated" value="0" sub="No modules tested" />
                      <StatCard label="Experts Consulted" value="3" sub="Council standing by" />
                    </>
                  )}
                </section>

                {/* ── Description + flags (static agents) OR Summary (dynamic agents with liveResult) ── */}
                {agent ? (
                  <section className="flex gap-6 w-full">
                    <div className="flex flex-col gap-4 flex-1">
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-5 pb-5">
                          <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-2">About this Agent</h3>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-5">{agent.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="w-[280px] flex-shrink-0">
                      <Card className={`shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] ${agent.securityFlags.length > 0 ? "border-[#ffc0d0]" : "border-zinc-200"}`}>
                        <CardContent className="px-6 pt-5 pb-5">
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldAlertIcon className={`w-4 h-4 ${agent.securityFlags.length > 0 ? "text-[#ff2d78]" : "text-[#71717b]"}`} />
                            <h3 className={`[font-family:'Inter',Helvetica] font-semibold text-sm ${agent.securityFlags.length > 0 ? "text-[#ff2d78]" : "text-zinc-950"}`}>
                              Security Flags
                            </h3>
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-2 py-0.5 h-auto ml-auto ${agent.securityFlags.length > 0 ? "bg-[#ffe0eb] text-[#ff2d78]" : "bg-zinc-100 text-zinc-500"}`}>
                              {agent.securityFlags.length}
                            </Badge>
                          </div>
                          {agent.securityFlags.length === 0 ? (
                            <div className="flex items-center gap-2 py-2">
                              <ShieldCheckIcon className="w-4 h-4 text-[#00bc7d]" />
                              <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">No active security flags</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {agent.securityFlags.map((flag, i) => (
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
                ) : liveResult ? (
                  <section className="w-full">
                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 py-5">
                        <p className="[font-family:'Inter',Helvetica] text-xs font-semibold text-[#71717b] uppercase tracking-wider mb-3">Audit Synthesis</p>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-6">{liveResult.summary}</p>
                      </CardContent>
                    </Card>
                  </section>
                ) : (
                  /* Zero state: imported agent, no run yet — show a gentle onboarding card */
                  <section className="w-full">
                    <Card className="border-zinc-200 border-dashed shadow-none">
                      <CardContent className="px-6 py-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#ede9fe] border border-[#c4b5fd]/50 flex items-center justify-center flex-shrink-0">
                          <ShieldIcon className="w-5 h-5 text-[#4f39f6]" />
                        </div>
                        <div>
                          <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-1">
                            This agent has not been evaluated yet
                          </p>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 max-w-lg">
                            Once you launch a security audit from the Dashboard and select this agent, the Council of Experts Assessment matrix below will populate with findings, risk ratings, and recommendations from each council member.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                )}

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
                              ? `${matrixRows.length} evaluation module${matrixRows.length > 1 ? "s" : ""} · ${totalFindings} finding${totalFindings !== 1 ? "s" : ""} across ${EXPERT_COLS.length} expert reviewers`
                              : "Independent expert verdicts per evaluation module · run an audit to populate"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {matrixRows.length > 0 && (
                            <div className="flex gap-2 mr-1">
                              {EXPERT_COLS.map((col, idx) => {
                                const colors = [
                                  "bg-[#ede9fe] text-[#4f39f6]",
                                  "bg-[#d1fae5] text-[#065f46]",
                                  "bg-[#fff7ed] text-[#c2410c]",
                                ];
                                return (
                                  <span key={col.key} className={`[font-family:'Inter',Helvetica] text-[10px] font-semibold px-2 py-1 rounded-full ${colors[idx]}`}>
                                    {col.label.split(" ")[0]}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <ExportPDFButton exporting={exportingPDF} onExport={handleExportPDF} />
                        </div>
                      </div>

                      <CouncilMatrix rows={matrixRows} emptyAgent={agentName} />
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
