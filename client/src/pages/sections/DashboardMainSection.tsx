import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  CheckIcon,
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

const vulnDistribution = [
  { name: "Prompt Injection (LLM01)", value: 45, color: "#e7000b" },
  { name: "Insecure Output (LLM02)", value: 35, color: "#f97316" },
  { name: "Sensitive Data (LLM06)", value: 20, color: "#f59e0b" },
];

const assessmentTrend = [
  { day: "Mon", fullAlignment: 22, nonCompliant: 4 },
  { day: "Tue", fullAlignment: 18, nonCompliant: 6 },
  { day: "Wed", fullAlignment: 25, nonCompliant: 3 },
  { day: "Thu", fullAlignment: 20, nonCompliant: 7 },
  { day: "Fri", fullAlignment: 24, nonCompliant: 5 },
  { day: "Sat", fullAlignment: 15, nonCompliant: 2 },
  { day: "Sun", fullAlignment: 19, nonCompliant: 8 },
];


const evaluationsData = [
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
    date: "Oct 24, 2023",
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
    date: "Oct 22, 2023",
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
    date: "Oct 20, 2023",
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
    date: "Oct 19, 2023",
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
  { id: "data-exfiltration", label: "Data Exfiltration", tag: "LLM06" },
  { id: "toxicity", label: "Toxicity Detection", tag: "" },
];

const STANDARDS = [
  { id: "owasp", label: "OWASP LLM Top 10" },
  { id: "nist", label: "NIST AI RMF" },
];

export const DashboardMainSection = (): JSX.Element => {
  const { toast } = useToast();
  const uploadRef = useRef<HTMLInputElement>(null);

  const [, setLocation] = useLocation();
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("Customer-Support-Bot-V1");
  const [selectedModules, setSelectedModules] = useState<string[]>(["prompt-injection"]);
  const [selectedStandard, setSelectedStandard] = useState("owasp");
  const [launching, setLaunching] = useState(false);
  const [chartLoading, setChartLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setChartLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleStartAudit = () => {
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      setAuditOpen(false);
      toast({
        title: "Audit queued",
        description: "Audit Task EV-1031 queued successfully.",
        duration: 4000,
      });
    }, 900);
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
            <input
              ref={uploadRef}
              type="file"
              accept=".json,.py"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAgent(f); }}
            />
            <Button
              variant="outline"
              className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm border-zinc-200 hover:bg-zinc-50"
              onClick={() => uploadRef.current?.click()}
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
          {/* System Pass Rate */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                System Pass Rate
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                82%
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          {/* Total Evaluations */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Total Evaluations
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                1,284
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                AI Agents Audited
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Pending Reviews
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-[#f59e0b] text-2xl leading-8 mt-1">
                14
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
                {evaluationsData.filter((e) => e.verdict === "REJECT").length}
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Critical REJECTs pending fix
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Analytics Row */}
        <section className="grid grid-cols-2 gap-6 w-full">
          {/* Donut Chart: Vulnerability Distribution */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="px-6 pt-6 pb-6">
              <div className="mb-4">
                <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.40px]">
                  Vulnerability Distribution
                </h2>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                  Based on OWASP LLM Top 10
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0" style={{ width: 180, height: 180 }}>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={vulnDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
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
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {vulnDistribution.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex flex-col">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-xs leading-4">
                          {item.name}
                        </span>
                        <span
                          className="[font-family:'Inter',Helvetica] font-semibold text-sm"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart: NIST AI RMF Compliance Trend */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="px-6 pt-6 pb-6">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.40px]">
                      NIST AI RMF Compliance Trend
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                      Full Alignment vs. Non-compliant across evaluated agents · Last 7 Days
                    </p>
                  </div>
                  {/* Live data indicator */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${chartLoading ? "animate-ping bg-[#4f39f6]" : "bg-[#009966]"}`} />
                      <span className={`relative inline-flex h-2 w-2 rounded-full ${chartLoading ? "bg-[#4f39f6]" : "bg-[#009966]"}`} />
                    </span>
                    <span className="[font-family:'Inter',Helvetica] text-[11px] text-[#71717b]">
                      {chartLoading ? "Fetching NIST compliance data…" : "Live · NIST AI 100-1"}
                    </span>
                  </div>
                </div>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-[11px] mt-2">
                  Monitoring lifecycle adherence based on NIST AI 100-1 standards.
                </p>
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
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={assessmentTrend} barSize={14} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 30]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e4e4e7",
                        fontFamily: "Inter, Helvetica",
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === "fullAlignment" ? "Full Alignment (GOVERN & MEASURE)" : "Non-compliant",
                      ]}
                    />
                    <Bar dataKey="fullAlignment" fill="#009966" radius={[3, 3, 0, 0]} name="fullAlignment" />
                    <Bar dataKey="nonCompliant" fill="#e7000b" radius={[3, 3, 0, 0]} name="nonCompliant" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Custom NIST legend */}
              <div className="flex items-start gap-6 mt-3 pt-3 border-t border-zinc-100 flex-wrap">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#009966] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs">Full Alignment</span>
                    <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-[11px] leading-4">
                      Compliant with NIST GOVERN &amp; MEASURE core standards
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#e7000b] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs">Non-compliant</span>
                    <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-[11px] leading-4">
                      Unresolved risk management items flagged
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bottom: Evaluations table + Right sidebar */}
        <section className="flex gap-6 w-full">
          {/* Recent Evaluations table */}
          <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] overflow-visible">
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
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[200px]">Verdict</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6 w-[140px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationsData.map((ev, index) => (
                    <TableRow key={index} className="border-[#0000001a] hover:bg-zinc-50/60 transition-colors" data-testid={`row-evaluation-${ev.id}`}>

                      {/* Target Agent — deep link to /agents/:agentId */}
                      <TableCell className="pl-6">
                        <button
                          onClick={() => setLocation(`/agents/${ev.agentId}`)}
                          className="[font-family:'Inter',Helvetica] font-semibold text-[#4f39f6] text-sm hover:underline text-left"
                          data-testid={`link-agent-${ev.id}`}
                        >
                          {ev.target}
                        </button>
                      </TableCell>

                      {/* Module — deep link to /evaluations/:evalId */}
                      <TableCell className="ml-[6px] mr-[6px]">
                        <button
                          onClick={() => setLocation(`/evaluations/${ev.id}`)}
                          className="[font-family:'Inter',Helvetica] font-normal text-[#4f39f6] text-sm hover:underline text-left transition-colors"
                          data-testid={`link-module-${ev.id}`}
                        >
                          {ev.module}
                        </button>
                      </TableCell>

                      {/* Verdict + reason caption + hover tooltip */}
                      <TableCell>
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
                      <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-right pr-6">
                        {ev.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="w-[300px] flex-shrink-0 flex flex-col gap-4">

            {/* Expert Modules Health */}
            <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="px-6 pt-5 pb-5">
                <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-4">
                  Expert Modules Health
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    "Security & Compliance Probe",
                    "Governance & Risk Workflow",
                    "Contextual Risk Arbiter",
                  ].map((name, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009966] opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#009966]" />
                        </span>
                        <span className="[font-family:'Inter',Helvetica] font-medium text-[#009966] text-xs">
                          Online
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Standards Alignment */}
            <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="px-6 pt-5 pb-5">
                <div className="mb-4">
                  <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
                    Standards Alignment
                  </h3>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs mt-0.5">
                    Framework coverage for EV-1029
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {/* OWASP — FAILED */}
                  <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 hover:border-[#f87171] transition-colors cursor-default">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-sm">
                        OWASP LLM Top 10
                      </span>
                      <span className="[font-family:'Inter',Helvetica] font-semibold text-xs px-2.5 py-0.5 rounded-full bg-[#ffe4e6] text-[#9f1239]">
                        FAILED
                      </span>
                    </div>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#b91c1c] text-xs leading-4">
                      Violated: LLM02 (Insecure Output)
                    </p>
                  </div>
                  {/* NIST — PASSED */}
                  <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 hover:border-[#4ade80] transition-colors cursor-default">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-sm">
                        NIST AI RMF
                      </span>
                      <span className="[font-family:'Inter',Helvetica] font-semibold text-xs px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46]">
                        PASSED
                      </span>
                    </div>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs leading-4">
                      Aligned with GOVERN 1.1 &amp; MAP 2.3
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </section>
      </main>

      {/* ── Launch New Security Audit Modal ── */}
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
                    <option value="Customer-Support-Bot-V1" className="bg-[#1e1533]">Customer-Support-Bot-V1</option>
                    <option value="Finance-Advisor-LLM" className="bg-[#1e1533]">Finance-Advisor-LLM</option>
                    <option value="Code-Review-Assistant" className="bg-[#1e1533]">Code-Review-Assistant</option>
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
                  Select Test Modules
                </p>
                <div className="flex flex-col gap-2.5 mt-1">
                  {TEST_MODULES.map((mod) => {
                    const checked = selectedModules.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg border transition-colors text-left ${
                          checked
                            ? "border-[#4f39f6]/60 bg-[#4f39f6]/15"
                            : "border-white/10 bg-white/5 hover:bg-white/8"
                        }`}
                        data-testid={`checkbox-module-${mod.id}`}
                      >
                        <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${checked ? "bg-[#4f39f6] border-[#4f39f6]" : "border-white/25 bg-transparent"}`}>
                          {checked && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
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

              {/* Step 3 — Compliance Mapping */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#4f39f6] flex items-center justify-center text-[10px] font-bold text-white [font-family:'Inter',Helvetica]">3</span>
                  <span className="[font-family:'Inter',Helvetica] font-medium text-white/80 text-xs uppercase tracking-wider">Compliance Mapping</span>
                </div>
                <p className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70 -mb-1">
                  Align with Standards?
                </p>
                <div className="flex gap-3 mt-1">
                  {STANDARDS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStandard(s.id)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium [font-family:'Inter',Helvetica] transition-colors ${
                        selectedStandard === s.id
                          ? "border-[#4f39f6]/60 bg-[#4f39f6]/15 text-[#c4b5fd]"
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/8"
                      }`}
                      data-testid={`radio-standard-${s.id}`}
                    >
                      {s.label}
                    </button>
                  ))}
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
                disabled={launching || selectedModules.length === 0}
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
