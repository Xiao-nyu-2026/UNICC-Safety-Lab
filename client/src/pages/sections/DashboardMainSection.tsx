import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAgents, EvalResult } from "@/context/AgentsContext";
import { ImportAgentModal } from "@/components/ImportAgentModal";
import {
  PlayIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "./PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

/* ── Module → OWASP colour palette ── */
const MODULE_COLORS: Record<string, string> = {
  "Prompt Injection V2":      "#e7000b",
  "Prompt Injection":         "#e7000b",
  "Jailbreak Attempts":       "#f97316",
  "Toxicity & Bias":          "#f59e0b",
  "Data Exfiltration":        "#ec4899",
  "Adversarial Prompt":       "#8b5cf6",
  "PII Extraction":           "#3b82f6",
};
const MODULE_FALLBACK_COLORS = ["#e7000b","#f97316","#f59e0b","#8b5cf6","#3b82f6","#ec4899","#14b8a6"];


const INITIAL_EVALUATIONS = [
  {
    id: "EV-1030",
    agentId: "AGT-003",
    module: "Prompt Injection V2",
    target: "UNICC-Chatbot-V2",
    verdict: "REVIEW",
    verdictColor: "bg-[#fef3c7] text-[#92400e]",
    date: "Today",
    reason: { text: "High bias variance detected", color: "text-[#92400e]" },
    tooltip: "Contextual Arbiter: High bias variance detected; requires manual oversight.",
    experts: [
      { name: "Security Probe", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Prompt boundary bypass possible under adversarial input." },
      { name: "Governance Workflow", status: "PARTIAL", statusColor: "bg-[#fef3c7] text-[#92400e]", note: "Policy controls partially enforced; 3 edge cases unhandled." },
      { name: "Risk Arbiter", status: "ESCALATED", statusColor: "bg-[#fef3c7] text-[#92400e]", note: "Escalated for manual review — borderline threshold exceeded." },
    ],
  },
  {
    id: "EV-1029",
    agentId: "AGT-001",
    module: "Jailbreak Attempts",
    target: "Core-NLP-Model",
    verdict: "REJECT",
    verdictColor: "bg-[#ffe4e6] text-[#9f1239]",
    date: "Yesterday",
    reason: { text: "Violated LLM02 (Insecure Output)", color: "text-[#9f1239]" },
    tooltip: "Security Probe: Violated LLM02 (Insecure Output) — Prompt boundary bypass detected in 4/5 test cases.",
    experts: [
      { name: "Security Probe", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Direct jailbreak via role-play prompt succeeded in 4/5 test cases." },
      { name: "Governance Workflow", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Output filter entirely bypassed; PII leaked in 2 responses." },
      { name: "Risk Arbiter", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Critical failure — model violates OWASP LLM02 & LLM06." },
    ],
  },
  {
    id: "EV-1028",
    agentId: "AGT-002",
    module: "Toxicity & Bias",
    target: "HR-Data-Processor",
    verdict: "APPROVE",
    verdictColor: "bg-[#d1fae5] text-[#065f46]",
    date: "Apr 07, 2026",
    reason: { text: "Met all NIST AI RMF controls", color: "text-[#71717b]" },
    tooltip: "Security Probe: No toxic outputs detected across 500 prompts. All NIST AI RMF controls fully satisfied.",
    experts: [
      { name: "Security Probe", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "No toxic outputs detected across all 500 test prompts." },
      { name: "Governance Workflow", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "Bias variance within acceptable NIST AI RMF thresholds." },
      { name: "Risk Arbiter", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "Full compliance confirmed; approved for production deployment." },
    ],
  },
  {
    id: "EV-1027",
    agentId: "AGT-004",
    module: "Data Exfiltration",
    target: "Image-Gen-API",
    verdict: "APPROVE",
    verdictColor: "bg-[#d1fae5] text-[#065f46]",
    date: "Apr 05, 2026",
    reason: { text: "Met all NIST AI RMF controls", color: "text-[#71717b]" },
    tooltip: "Risk Arbiter: Low residual risk confirmed. Cleared under OWASP LLM06 — no data exfiltration paths found.",
    experts: [
      { name: "Security Probe", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "No sensitive data exfiltration paths found during fuzzing." },
      { name: "Governance Workflow", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "Data handling policies enforced at all API boundaries." },
      { name: "Risk Arbiter", status: "PASS", statusColor: "bg-[#d1fae5] text-[#065f46]", note: "Low residual risk; cleared under OWASP LLM06 guidelines." },
    ],
  },
  {
    id: "EV-1031",
    agentId: "AGT-007",
    module: "Adversarial Prompt",
    target: "Finance-Advisor-LLM",
    verdict: "REJECT",
    verdictColor: "bg-[#ffe4e6] text-[#9f1239]",
    date: "Apr 03, 2026",
    reason: { text: "Violated OWASP LLM01 (Prompt Injection)", color: "text-[#9f1239]" },
    tooltip: "Security Probe: Adversarial prompt injection bypassed financial guardrails in 3/4 test cases. OWASP LLM01 violation — deployment blocked.",
    experts: [
      { name: "Security Probe", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Adversarial prompt bypassed financial guardrails in 3/4 cases." },
      { name: "Governance Workflow", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Regulatory controls for financial advice AI were not enforced." },
      { name: "Risk Arbiter", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "High-risk output possible; violates OWASP LLM01 baseline." },
    ],
  },
  {
    id: "EV-1032",
    agentId: "AGT-006",
    module: "PII Extraction",
    target: "Support-Agent-V2",
    verdict: "REJECT",
    verdictColor: "bg-[#ffe4e6] text-[#9f1239]",
    date: "Apr 01, 2026",
    reason: { text: "PII leaked in 2/3 extraction attempts", color: "text-[#9f1239]" },
    tooltip: "Risk Arbiter: PII extraction succeeded in 2/3 test cases. Critical OWASP LLM06 violation — immediate remediation required.",
    experts: [
      { name: "Security Probe", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "PII extraction succeeded in 2 of 3 test scenarios." },
      { name: "Governance Workflow", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "Data privacy controls failed to prevent PII disclosure." },
      { name: "Risk Arbiter", status: "FAIL", statusColor: "bg-[#ffe4e6] text-[#9f1239]", note: "OWASP LLM06 critical violation; deployment halted." },
    ],
  },
];


const TEST_MODULES = [
  { id: "prompt-injection", label: "Prompt Injection V2", tag: "LLM01" },
  { id: "jailbreak-attempts", label: "Jailbreak Attempts", tag: "LLM01" },
  { id: "data-exfiltration", label: "Data Exfiltration", tag: "LLM06" },
  { id: "toxicity", label: "Toxicity & Bias", tag: "NIST RMF" },
  { id: "adversarial-prompt", label: "Adversarial Prompt", tag: "LLM02" },
  { id: "pii-extraction", label: "PII Extraction", tag: "Privacy" },
];


export const DashboardMainSection = (): JSX.Element => {
  const { toast } = useToast();
  const uploadRef = useRef<HTMLInputElement>(null);
  const { agents: contextAgents, updateAgentAfterEval } = useAgents();

  const [, setLocation] = useLocation();
  const [auditOpen, setAuditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("UNICC-Chatbot-V2");
  const [selectedModule, setSelectedModule] = useState<string>("prompt-injection");

  const [launching, setLaunching] = useState(false);
  const LS_EVALS_KEY = "asl_evaluations_v1";
  const [evaluationsData, setEvaluationsData] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_EVALS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_EVALUATIONS;
  });
  useEffect(() => {
    try { localStorage.setItem(LS_EVALS_KEY, JSON.stringify(evaluationsData)); } catch {}
  }, [evaluationsData]);

  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setChartLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  /* ── Dynamic chart data derived from evaluationsData ── */

  // Donut: count evaluations per module, compute percentages
  const vulnDistribution = (() => {
    const counts: Record<string, number> = {};
    for (const ev of evaluationsData) {
      const raw = (ev as any).modules;
      const modules: string[] = Array.isArray(raw) && raw.length > 0
        ? raw
        : typeof ev.module === "string" && ev.module.trim()
          ? ev.module.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
      for (const m of modules) {
        counts[m] = (counts[m] ?? 0) + 1;
      }
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0);
    if (total === 0) return [];
    const keys = Object.keys(counts);
    return keys.map((name, i) => ({
      name,
      value: Math.round((counts[name] / total) * 100),
      color: MODULE_COLORS[name] ?? MODULE_FALLBACK_COLORS[i % MODULE_FALLBACK_COLORS.length],
    }));
  })();

  // Bar: group ALL evals by day first, sort oldest→newest, then slice last 14 unique active days
  const assessmentTrend = (() => {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* Helper: normalise any date string → "Mmm DD" bucket key */
    const toLabel = (raw: string): string | null => {
      const s = (raw ?? "").trim();
      if (!s) return null;
      if (/just now|today/i.test(s))
        return `${MONTHS[today.getMonth()]} ${String(today.getDate()).padStart(2, "0")}`;
      if (/yesterday/i.test(s)) {
        const y = new Date(today);
        y.setDate(today.getDate() - 1);
        return `${MONTHS[y.getMonth()]} ${String(y.getDate()).padStart(2, "0")}`;
      }
      const parsed = new Date(s);
      if (isNaN(parsed.getTime())) return null;
      return `${MONTHS[parsed.getMonth()]} ${String(parsed.getDate()).padStart(2, "0")}`;
    };

    /* Helper: turn a "Mmm DD" label back into a sortable timestamp */
    const toDateMs = (label: string): number => {
      const [mon, day] = label.split(" ");
      const idx = MONTHS.indexOf(mon);
      if (idx === -1) return 0;
      const d = new Date(today.getFullYear(), idx, parseInt(day, 10));
      if (d > today) d.setFullYear(today.getFullYear() - 1);
      return d.getTime();
    };

    /* ── STEP 1: Group ALL records by day — no slice here ── */
    const buckets: Record<string, { fullAlignment: number; nonCompliant: number }> = {};
    for (const ev of evaluationsData) {
      const label = toLabel(ev.date ?? "");
      if (!label) continue;
      if (!buckets[label]) buckets[label] = { fullAlignment: 0, nonCompliant: 0 };
      if ((ev.verdict ?? "").toUpperCase() === "APPROVE") buckets[label].fullAlignment += 1;
      else buckets[label].nonCompliant += 1;
    }

    /* ── STEP 2: Convert to array and sort oldest → newest ── */
    const sortedDays = Object.entries(buckets)
      .sort(([a], [b]) => toDateMs(a) - toDateMs(b));

    /* ── STEP 3: Slice LAST 14 unique active days, then map ── */
    return sortedDays
      .slice(-14)
      .map(([label, { fullAlignment, nonCompliant }]) => ({
        day: label, fullAlignment, nonCompliant,
      }));
  })();

  /* ── localStorage keys for four-dimensional sync ── */
  const LS_MODULE_META_KEY = "asl_module_meta_v1";
  const LS_MODULE_REPORT_KEY = "asl_module_report_v1";

  /* ── Module label → canonical static eval ID map ── */
  const MODULE_ID_TO_EVAL_ID: Record<string, string> = {
    "prompt-injection": "EV-1029",
    "jailbreak-attempts": "EV-1030",
    "toxicity": "EV-1028",
    "data-exfiltration": "EV-1027",
    "adversarial-prompt": "EV-1031",
    "pii-extraction": "EV-1032",
  };

  const handleStartAudit = async () => {
    if (!selectedModule) return;
    setLaunching(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90_000);
      const res = await fetch("/api/run_evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName: selectedAgent, modules: [selectedModule] }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: EvalResult = await res.json();
      console.log("[run_evaluation] result:", data);
      setEvalResult(data);
      setAuditOpen(false);

      const verdict = data.final_verdict.toUpperCase();
      const verdictColorMap: Record<string, string> = {
        APPROVE: "bg-[#d1fae5] text-[#065f46]",
        APPROVED: "bg-[#d1fae5] text-[#065f46]",
        REJECT: "bg-[#ffe4e6] text-[#9f1239]",
        REJECTED: "bg-[#ffe4e6] text-[#9f1239]",
        REVIEW: "bg-[#fef3c7] text-[#92400e]",
      };
      const moduleLabel = TEST_MODULES.find((m) => m.id === selectedModule)?.label ?? selectedModule;

      /* 1. Dashboard Recent Evaluations */
      const staticEvalId = MODULE_ID_TO_EVAL_ID[selectedModule];
      const newEval = {
        id: staticEvalId ?? `EV-${Date.now()}`,
        agentId: "",
        module: moduleLabel,
        target: selectedAgent,
        verdict,
        verdictColor: verdictColorMap[verdict] ?? "bg-zinc-100 text-zinc-700",
        date: "Just now",
        reason: { text: data.summary.slice(0, 60), color: "text-[#71717b]" },
        tooltip: data.summary,
        experts: Object.values(data.experts).map((ex) => {
          const isPass = (ex.verdict ?? "REVIEW").toUpperCase() === "APPROVE";
          return {
            name: ex.name,
            status: isPass ? "PASS" : "FAIL",
            statusColor: isPass ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#ffe4e6] text-[#9f1239]",
            note: Array.isArray(ex.findings) ? ex.findings[0] : (ex.rationale ?? ""),
          };
        }),
      };
      /* Upsert: replace if same staticEvalId already present, else prepend */
      setEvaluationsData((prev) => {
        const filtered = staticEvalId ? prev.filter((e: any) => e.id !== staticEvalId) : prev;
        return [newEval, ...filtered];
      });

      /* 2. Agent status */
      updateAgentAfterEval(selectedAgent, verdict, data);

      /* 3. Evaluations list — module meta */
      try {
        const rawMeta = localStorage.getItem(LS_MODULE_META_KEY);
        const meta: Record<string, any> = rawMeta ? JSON.parse(rawMeta) : {};
        meta[selectedModule] = { lastVerdict: verdict, lastRun: "Just now", lastRunAgent: selectedAgent };
        localStorage.setItem(LS_MODULE_META_KEY, JSON.stringify(meta));
      } catch {}

      /* 4. Evaluation Detail — module full report */
      try {
        const rawReport = localStorage.getItem(LS_MODULE_REPORT_KEY);
        const report: Record<string, any> = rawReport ? JSON.parse(rawReport) : {};
        report[selectedModule] = {
          agentName: selectedAgent,
          verdict,
          verdictColor: verdictColorMap[verdict] ?? "bg-zinc-100 text-zinc-700",
          confidence: data.confidence_score,
          summary: data.summary,
          synthesis_text: data.synthesis_text ?? data.summary,
          timestamp: new Date().toISOString(),
          experts: data.experts,
        };
        localStorage.setItem(LS_MODULE_REPORT_KEY, JSON.stringify(report));
      } catch {}

      toast({
        title: `Audit complete — ${data.final_verdict}`,
        description: `Confidence ${data.confidence_score}%. ${data.summary}`,
        duration: 6000,
      });
    } catch (err) {
      console.error("[run_evaluation] error:", err);
      toast({
        title: "Evaluation failed",
        description: "Could not reach the evaluation API. Check the console.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLaunching(false);
    }
  };

  const handleUploadAgent = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".json" && ext !== ".py") {
      toast({ title: "Invalid file type", description: "Only .json or .py files are accepted.", variant: "destructive" });
      return;
    }
    toast({ title: "Agent script uploaded", description: `"${file.name}" queued for safety audit.`, duration: 4000 });
    if (uploadRef.current) uploadRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-start flex-1 w-full">
      <PageHeader placeholder="Search evaluations, agents..." />

      <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
        {/* Title + actions */}
        <section className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start">
            <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
              Dashboard Overview
            </h1>
            <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5">
              Monitor your AI agents and recent safety evaluations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm border-zinc-200 hover:bg-zinc-50"
              onClick={() => setImportOpen(true)}
              data-testid="button-import-agent-dashboard"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Import Agent
            </Button>
            <Button
              className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] [font-family:'Inter',Helvetica] font-medium text-white text-sm"
              onClick={() => setAuditOpen(true)}
              data-testid="button-run-new-evaluation"
            >
              <PlayIcon className="w-4 h-4 mr-2 fill-white" />
              Run New Evaluation
            </Button>
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-4 gap-4 w-full">
          {/* System Pass Rate — derived from evaluationsData */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                System Pass Rate
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                {evaluationsData.length > 0
                  ? `${Math.round((evaluationsData.filter((e: { verdict: string }) => e.verdict === "APPROVE").length / evaluationsData.length) * 100)}%`
                  : "—"}
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Based on {evaluationsData.length} record{evaluationsData.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Total Evaluations — derived from evaluationsData */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Total Evaluations
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                {evaluationsData.length.toLocaleString()}
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                AI Agents Audited
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews — derived from evaluationsData */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Pending Reviews
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-[#f59e0b] text-2xl leading-8 mt-1">
                {evaluationsData.filter((e: { verdict: string }) => e.verdict === "REVIEW").length}
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Requires Human Arbiter
              </p>
            </CardContent>
          </Card>

          {/* Requires Attention — derived from REJECT count in evaluationsData */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Requires Attention
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-[#e7000b] text-2xl leading-8 mt-1">
                {evaluationsData.filter((e: { verdict: string }) => e.verdict === "REJECT").length}
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Critical REJECTs pending fix
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Analytics Row */}
        <section className="grid grid-cols-2 gap-6 w-full">
          {/* Donut Chart: Evaluation Distribution */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] flex flex-col">
            <CardContent className="px-6 pt-6 pb-6 flex flex-col flex-1">
              <div className="mb-4">
                <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.40px]">
                  Evaluation Distribution
                </h2>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                  Breakdown of safety tests across OWASP, NIST &amp; Privacy frameworks
                </p>
              </div>
              {vulnDistribution.length === 0 ? (
                <div className="flex flex-1 min-h-[180px] items-center justify-center flex-col gap-2">
                  <div className="w-28 h-28 rounded-full border-[12px] border-zinc-100" />
                  <p className="[font-family:'Inter',Helvetica] text-xs text-[#a1a1aa] mt-2">No data yet</p>
                </div>
              ) : (
                <div className="flex flex-1 min-h-0 gap-6">
                  {/* Pie fills remaining height */}
                  <div className="flex-1 min-w-0 min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vulnDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius="38%"
                          outerRadius="62%"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {vulnDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e4e4e7",
                            fontFamily: "Inter, Helvetica",
                            fontSize: 12,
                          }}
                          formatter={(value: number, name: string) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend — vertically centred */}
                  <div className="flex flex-col justify-center gap-4 w-[175px] flex-shrink-0">
                    {vulnDistribution.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-800 text-xs leading-4">
                            {item.name}
                          </span>
                          <span
                            className="[font-family:'Inter',Helvetica] font-bold text-base leading-5"
                            style={{ color: item.color }}
                          >
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart: NIST AI RMF Compliance Trend */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="px-6 pt-6 pb-6">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.40px]">
                      Overall Security &amp; Compliance Trend
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                      Pass vs. Fail rates across all evaluated agents and frameworks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Skeleton loader while fetching */}
              {chartLoading ? (
                <div className="h-[180px] flex items-end gap-3 pb-4 px-2" data-testid="chart-skeleton">
                  {[0.7, 0.5, 0.85, 0.6, 0.75, 0.45, 0.65].map((h, i) => (
                    <div key={i} className="flex gap-1 items-end flex-1">
                      <div className="animate-pulse rounded-[3px] bg-[#d1fae5] flex-1" style={{ height: `${Math.round(h * 150)}px` }} />
                      <div className="animate-pulse rounded-[3px] bg-[#fee2e2] flex-1" style={{ height: `${Math.round((1 - h) * 55)}px` }} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {(() => {
                    const compactChartData = assessmentTrend.filter(
                      (item) => item.fullAlignment > 0 || item.nonCompliant > 0
                    );
                    if (compactChartData.length === 0) return (
                      <div className="h-[180px] flex items-center justify-center">
                        <p className="[font-family:'Inter',Helvetica] text-xs text-[#a1a1aa]">No evaluation data yet</p>
                      </div>
                    );
                    const chartPx = Math.max(compactChartData.length * 72 + 32, 200);
                    return (
                    <div style={{ maxWidth: chartPx }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={compactChartData} barSize={28} barCategoryGap={10} barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 10, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                          height={42}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          width={20}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e4e4e7",
                            fontFamily: "Inter, Helvetica",
                            fontSize: 12,
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} eval${value !== 1 ? "s" : ""}`,
                            name === "fullAlignment" ? "✓ Full Alignment" : "✗ Non-compliant",
                          ]}
                          labelFormatter={(label: string) => label}
                        />
                        <Bar dataKey="fullAlignment" fill="#009966" radius={[4, 4, 0, 0]} name="fullAlignment" stackId="a" />
                        <Bar dataKey="nonCompliant" fill="#e7000b" radius={[4, 4, 0, 0]} name="nonCompliant" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                    );
                  })()}
                </>
              )}

              {/* Chart legend */}
              <div className="flex items-start gap-6 mt-3 pt-3 border-t border-zinc-100 flex-wrap">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#009966] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs">Passed</span>
                    <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-[11px] leading-4">
                      Passed all safety and compliance framework checks
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#e7000b] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs">Failed</span>
                    <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-[11px] leading-4">
                      Security vulnerabilities or compliance risks flagged
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Evaluation Result Banner — shown after /api/run_evaluation returns */}
        {evalResult && (
          <section className="w-full rounded-xl border overflow-hidden"
            style={{
              borderColor: evalResult.final_verdict === "APPROVE" ? "#6ee7b7" : "#fca5a5",
              background: evalResult.final_verdict === "APPROVE"
                ? "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)"
                : "linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%)",
            }}
          >
            <div className="flex items-start justify-between px-6 py-5">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`[font-family:'Inter',Helvetica] font-bold text-lg ${evalResult.final_verdict === "APPROVE" ? "text-[#065f46]" : "text-[#9f1239]"}`}>
                    Latest Audit Result — {evalResult.final_verdict}
                  </span>
                  <span className={`text-sm font-semibold px-3 py-0.5 rounded-full ${evalResult.final_verdict === "APPROVE" ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#ffe4e6] text-[#9f1239]"}`}>
                    {evalResult.confidence_score}% confidence
                  </span>
                </div>
                <p className="[font-family:'Inter',Helvetica] text-sm text-zinc-600 mt-0.5">{evalResult.summary}</p>
              </div>
              <button onClick={() => setEvalResult(null)} className="ml-4 text-zinc-400 hover:text-zinc-700 text-lg leading-none flex-shrink-0">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-zinc-200 border-t border-zinc-200">
              {Object.values(evalResult.experts).map((ex) => {
                const isPass = (ex.verdict ?? "REVIEW").toUpperCase() === "APPROVE";
                const firstFinding = Array.isArray(ex.findings) ? ex.findings[0] : (ex.rationale ?? "");
                const firstRisk    = Array.isArray(ex.risks)    ? ex.risks[0]    : "";
                return (
                  <div key={ex.name} className="flex flex-col gap-1.5 px-6 py-4 bg-white/70">
                    <div className="flex items-center justify-between">
                      <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-sm">{ex.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPass ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#ffe4e6] text-[#9f1239]"}`}>
                        {isPass ? "APPROVE" : (ex.verdict ?? "REVIEW")}
                      </span>
                    </div>
                    {firstFinding && (
                      <p className="[font-family:'Inter',Helvetica] text-xs text-zinc-500 leading-4">{firstFinding}</p>
                    )}
                    {firstRisk && (
                      <p className="[font-family:'Inter',Helvetica] text-xs text-[#9f1239] leading-4">⚠ {firstRisk}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom: Recent Evaluations table — full width */}
        <section className="w-full">
          <Card className="w-full border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] overflow-visible">
            <CardContent className="p-0 overflow-visible">
              <div className="flex items-center justify-between px-6 py-6">
                <div className="flex flex-col">
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                    Recent Evaluations
                  </h2>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5 mt-1">
                    Latest automated safety tests across your agents.
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-[#0000001a]">
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6 w-[200px]">Target Agent</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Module</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-10 w-[200px]">Verdict</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-center pr-10 w-[140px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationsData.map((ev, index) => (
                    <TableRow key={index} className="border-[#0000001a] hover:bg-zinc-50/60 transition-colors" data-testid={`row-evaluation-${ev.id}`}>

                      {/* Target Agent — route to agent detail page */}
                      <TableCell className="pl-6">
                        <button
                          onClick={() => {
                            const agentId = contextAgents.find((a) => a.name === ev.target)?.id;
                            setLocation(agentId ? `/agents/${agentId}` : `/agents`);
                          }}
                          className="[font-family:'Inter',Helvetica] font-semibold text-[#4f39f6] text-sm hover:underline text-left"
                          data-testid={`link-agent-${ev.id}`}
                        >
                          {ev.target}
                        </button>
                      </TableCell>

                      {/* Module — normalise to array, always render as badges */}
                      <TableCell className="ml-[6px] mr-[6px] py-3">
                        <button
                          onClick={() => setLocation(`/evaluations/${ev.id}`)}
                          className="flex flex-wrap gap-1 text-left"
                          data-testid={`link-module-${ev.id}`}
                        >
                          {((): string[] => {
                            const raw = (ev as any).modules;
                            if (Array.isArray(raw) && raw.length > 0) return raw;
                            if (typeof ev.module === "string" && ev.module.trim()) return ev.module.split(",").map((s: string) => s.trim()).filter(Boolean);
                            return ["—"];
                          })().map((m: string) => (
                            <span key={m} className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-md text-xs font-medium hover:bg-violet-200 transition-colors whitespace-nowrap">
                              {m}
                            </span>
                          ))}
                        </button>
                      </TableCell>

                      {/* Verdict + reason caption + hover tooltip */}
                      <TableCell className="pl-10">
                        <div className="flex flex-col gap-0.5">
                          {/* Badge wrapped in tooltip container */}
                          <div className="relative inline-flex w-fit group">
                            <Badge className={`${ev.verdictColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-xs h-auto px-3 py-1 tracking-wide cursor-default`}>
                              {ev.verdict}
                            </Badge>
                            {/* Tooltip bubble — drops downward to avoid table-header clipping */}
                            <div className="pointer-events-none absolute top-full left-0 mt-2 z-[9999] hidden group-hover:flex w-64 flex-col gap-0">
                              {/* Arrow */}
                              <div className="ml-3 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-[#3c0366]" />
                              <div className="rounded-lg bg-[#3c0366] border border-white/10 px-3 py-2.5 shadow-xl">
                                <p className="[font-family:'Inter',Helvetica] text-[11px] text-white/90 leading-[1.5]">
                                  {ev.tooltip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-center pr-10">
                        {ev.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </section>
      </main>

      {/* ── Launch New Security Audit Modal ── */}
      <ImportAgentModal open={importOpen} onClose={() => setImportOpen(false)} />

      {auditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,10,30,0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => setAuditOpen(false)}
          data-testid="modal-audit-backdrop"
        >
          <div
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg,#1e1533 0%,#16112a 100%)" }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-audit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="[font-family:'Inter',Helvetica] font-semibold text-white text-lg leading-7">
                  Launch New Security Audit
                </h2>
                <p className="[font-family:'Inter',Helvetica] text-xs text-white/50 mt-0.5">
                  Configure and queue an automated safety evaluation.
                </p>
              </div>
              <button
                onClick={() => setAuditOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                data-testid="button-close-audit-modal"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-6">

              {/* Step 1 — Target Selection */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#4f39f6] flex items-center justify-center text-[10px] font-bold text-white [font-family:'Inter',Helvetica]">1</span>
                  <span className="[font-family:'Inter',Helvetica] font-medium text-white/80 text-xs uppercase tracking-wider">Target Selection</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                    Select AI Agent
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full h-10 rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-white [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6]"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    data-testid="select-audit-agent"
                  >
                    {contextAgents.map((a) => (
                      <option key={a.id} value={a.name} className="bg-[#1e1533]">{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2 — Test Configuration */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#4f39f6] flex items-center justify-center text-[10px] font-bold text-white [font-family:'Inter',Helvetica]">2</span>
                  <span className="[font-family:'Inter',Helvetica] font-medium text-white/80 text-xs uppercase tracking-wider">Test Configuration</span>
                </div>
                <p className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70 -mb-1">
                  Select Test Module
                </p>
                <div className="flex flex-col gap-2.5 mt-1">
                  {TEST_MODULES.map((mod) => {
                    const selected = selectedModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => setSelectedModule(mod.id)}
                        className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg border transition-colors text-left ${
                          selected
                            ? "border-[#4f39f6]/60 bg-[#4f39f6]/15"
                            : "border-white/10 bg-white/5 hover:bg-white/8"
                        }`}
                        data-testid={`radio-module-${mod.id}`}
                      >
                        {/* Radio indicator */}
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${selected ? "border-[#4f39f6] bg-[#4f39f6]" : "border-white/25 bg-transparent"}`}>
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="[font-family:'Inter',Helvetica] text-sm text-white/85">{mod.label}</span>
                        {mod.tag && (
                          <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#fff0f5] text-[#9f1239] [font-family:'Inter',Helvetica]">
                            {mod.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setAuditOpen(false)}
                className="h-10 px-5 border-white/15 bg-white/5 text-white/70 [font-family:'Inter',Helvetica] font-medium text-sm hover:bg-white/10 hover:text-white hover:border-white/25"
                data-testid="button-cancel-audit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartAudit}
                disabled={launching || !selectedModule}
                className="h-10 px-5 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm disabled:opacity-60"
                data-testid="button-start-audit"
              >
                {launching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Launching…
                  </span>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2 fill-white" />
                    Start Audit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
