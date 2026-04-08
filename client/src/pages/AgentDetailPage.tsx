import { Fragment, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  GithubIcon,
  Loader2Icon,
  PlayIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
} from "lucide-react";
import { useParams, useLocation, useSearch } from "wouter";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
};

export const AgentDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const fromEval = new URLSearchParams(search).get("from");

  const agent = agentData[id ?? ""] ?? null;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setTimeout(() => setIsAuditing(false), 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  const councilData = [
    {
      expert_name: "Expert A — Safety & Harm Assessment",
      framework: "AI safety / harmful output risk",
      recommendation: "REVIEW",
      findings_count: 3,
      findings_details: ["Lack of guardrails for prompt injection", "Potential to generate biased text", "No rate limiting implemented"],
      rationale: "Needs manual review to ensure output filters are properly configured to prevent harmful generations.",
    },
    {
      expert_name: "Expert B — Governance & Compliance",
      framework: "Governance / policy / institutional control",
      recommendation: "APPROVE",
      findings_count: 0,
      findings_details: ["No compliance violations detected."],
      rationale: "The repository includes proper AI usage policies and adheres to UNICC governance standards.",
    },
    {
      expert_name: "Expert C — Security & Attack Surface",
      framework: "Application security / attack surface review",
      recommendation: "REJECT",
      findings_count: 2,
      findings_details: ["Hardcoded API keys found in main.py", "Unrestricted file upload vulnerability detected"],
      rationale: "Critical security flaws present. Hardcoded secrets must be migrated to os.getenv() before any deployment.",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
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

            {!agent ? (
              <p className="[font-family:'Inter',Helvetica] text-[#71717b] text-sm">
                Agent {id} not found.
              </p>
            ) : (
              <>
                {/* Title */}
                <section className="flex items-start justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                        {agent.name}
                      </h1>
                      <Badge className={`${agent.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}>
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
                      {agent.id} · {agent.type} · {agent.evalCount.toLocaleString()} evals run
                    </p>
                  </div>
                </section>

                {/* Audit Intake */}
                <section className="w-full">
                  <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                    <CardContent className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-md bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
                          <GithubIcon className="w-4 h-4 text-[#4f39f6]" />
                        </div>
                        <div>
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.3px]">
                            New AI Agent Evaluation
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs leading-4">
                            Submit a repository or upload a codebase to run a full safety audit
                          </p>
                        </div>
                      </div>

                      <div className="flex items-stretch gap-4">
                        {/* GitHub URL input */}
                        <div className="flex-1 flex flex-col gap-1.5">
                          <label className="[font-family:'Inter',Helvetica] font-medium text-zinc-700 text-xs">
                            GitHub Repository URL
                          </label>
                          <Input
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="Enter GitHub Repository URL (e.g., https://github.com/unicc/ai-agent)"
                            className="h-10 [font-family:'Inter',Helvetica] text-sm border-zinc-200 focus-visible:ring-[#4f39f6] focus-visible:ring-offset-0"
                            data-testid="input-github-url"
                          />
                        </div>

                        {/* OR divider */}
                        <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 pt-5">
                          <div className="w-px h-3 bg-zinc-200" />
                          <span className="[font-family:'Inter',Helvetica] font-medium text-[#a1a1aa] text-xs tracking-wide">
                            OR
                          </span>
                          <div className="w-px h-3 bg-zinc-200" />
                        </div>

                        {/* File upload dropzone */}
                        <div className="flex flex-col gap-1.5 w-[260px] flex-shrink-0">
                          <label className="[font-family:'Inter',Helvetica] font-medium text-zinc-700 text-xs">
                            Upload Codebase
                          </label>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("audit-file-input")?.click()}
                            className={`h-10 rounded-md border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs [font-family:'Inter',Helvetica] ${
                              dragOver
                                ? "border-[#4f39f6] bg-[#f5f3ff] text-[#4f39f6]"
                                : uploadedFile
                                ? "border-[#00bc7d] bg-[#f0fdf9] text-[#004f3b]"
                                : "border-zinc-200 hover:border-[#4f39f6] hover:bg-[#f5f3ff] text-[#71717b] hover:text-[#4f39f6]"
                            }`}
                            data-testid="dropzone-upload"
                          >
                            <UploadCloudIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[170px]">
                              {uploadedFile ?? "Upload local codebase (.zip)"}
                            </span>
                          </div>
                          <input
                            id="audit-file-input"
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setUploadedFile(f.name);
                            }}
                          />
                        </div>

                        {/* Run button */}
                        <div className="flex flex-col justify-end flex-shrink-0 pt-5">
                          <Button
                            onClick={handleRunAudit}
                            disabled={isAuditing}
                            className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm gap-2 px-5 disabled:opacity-80"
                            data-testid="button-run-audit"
                          >
                            {isAuditing ? (
                              <>
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                Analyzing (Mocking)...
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-4 h-4" />
                                Run Safety Audit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-4 gap-4 w-full">
                  {/* Overall Assessment card */}
                  <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                    <CardContent className="pt-6 pb-5 px-6">
                      <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                        Overall Assessment
                      </p>
                      <div className="mt-2">
                        <Badge className="border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-sm px-3 py-1 h-auto bg-[#fff7ed] text-[#c2410c] ring-1 ring-inset ring-[#fed7aa]">
                          REVIEW REQUIRED
                        </Badge>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#a1a1aa] text-xs leading-4 mt-2">
                          Triggered by 1 Critical Failure (Expert C)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Remaining stat cards */}
                  {[
                    { label: "Evals Run", value: agent.evalCount.toLocaleString(), sub: "", color: "text-zinc-950" },
                    { label: "Security Flags", value: String(agent.securityFlags.length), sub: "", color: agent.securityFlags.length > 0 ? "text-[#ff2d78]" : "text-zinc-950" },
                    { label: "Last Evaluation", value: agent.lastEval, sub: "", color: "text-zinc-950" },
                  ].map((item, i) => (
                    <Card key={i} className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="pt-6 pb-5 px-6">
                        <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                          {item.label}
                        </p>
                        <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${item.color}`}>
                          {item.value}
                          {item.sub && <span className="[font-family:'Inter',Helvetica] font-medium text-[#a1a1aa] text-base ml-0.5">{item.sub}</span>}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </section>

                <section className="flex gap-6 w-full">
                  {/* Description */}
                  <div className="flex flex-col gap-4 flex-1">
                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 pt-5 pb-5">
                        <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-2">
                          About this Agent
                        </h3>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-5">
                          {agent.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security flags sidebar */}
                  <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
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
                            <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                              No active security flags
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {agent.securityFlags.map((flag, i) => (
                              <div key={i} className={`p-3 rounded-lg border ${
                                flag.severity === "High" ? "bg-[#fff0f5] border-[#ffc0d0]" : "bg-[#fff8e1] border-[#fde68a]"
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto ${
                                    flag.severity === "High" ? "bg-[#ffe0eb] text-[#ff2d78]" :
                                    flag.severity === "Medium" ? "bg-[#fff8e1] text-[#b45309]" :
                                    "bg-zinc-100 text-zinc-700"
                                  }`}>
                                    {flag.severity}
                                  </Badge>
                                  <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                                    {flag.module}
                                  </span>
                                </div>
                                <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-xs leading-4">
                                  {flag.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Council of Experts Assessment — full width */}
                <section className="w-full">
                  <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="p-0">
                        <div className="px-6 py-5 border-b border-zinc-100">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                            Council of Experts Assessment
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                            Independent expert verdicts for this agent
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                                <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs uppercase tracking-wide px-6 py-3 w-[260px]">
                                  Expert Role
                                </TableHead>
                                <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs uppercase tracking-wide px-6 py-3">
                                  Evaluation Framework
                                </TableHead>
                                <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs uppercase tracking-wide px-6 py-3 text-center w-[100px]">
                                  Findings
                                </TableHead>
                                <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs uppercase tracking-wide px-6 py-3 w-[120px]">
                                  Verdict
                                </TableHead>
                                <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs uppercase tracking-wide px-6 py-3 w-[60px]">
                                  Details
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {councilData.map((row, i) => {
                                const isOpen = expandedRow === i;
                                return (
                                  <Fragment key={i}>
                                    <TableRow
                                      className={`transition-colors border-zinc-100 cursor-pointer select-none ${isOpen ? "bg-zinc-50" : "hover:bg-zinc-50"}`}
                                      onClick={() => setExpandedRow(isOpen ? null : i)}
                                      data-testid={`row-expert-council-${i}`}
                                    >
                                      <TableCell className="px-6 py-4">
                                        <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                                          {row.expert_name}
                                        </span>
                                      </TableCell>
                                      <TableCell className="px-6 py-4">
                                        <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                                          {row.framework}
                                        </span>
                                      </TableCell>
                                      <TableCell className="px-6 py-4 text-center">
                                        <span className={`[font-family:'Inter',Helvetica] font-semibold text-sm ${
                                          row.findings_count === 0 ? "text-[#009966]" : row.recommendation === "REJECT" ? "text-[#e7000b]" : "text-[#b45309]"
                                        }`}>
                                          {row.findings_count}
                                        </span>
                                      </TableCell>
                                      <TableCell className="px-6 py-4">
                                        <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-3 py-1 h-auto ${
                                          row.recommendation === "APPROVE"
                                            ? "bg-[#009966] text-white"
                                            : row.recommendation === "REVIEW"
                                            ? "bg-[#f59e0b] text-white"
                                            : "bg-[#e7000b] text-white"
                                        }`} data-testid={`badge-verdict-${i}`}>
                                          {row.recommendation}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="px-6 py-4">
                                        <button
                                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-zinc-200 transition-colors text-[#71717b] hover:text-zinc-900"
                                          data-testid={`button-toggle-row-${i}`}
                                          onClick={(e) => { e.stopPropagation(); setExpandedRow(isOpen ? null : i); }}
                                          aria-label={isOpen ? "Collapse" : "Expand"}
                                        >
                                          {isOpen
                                            ? <ChevronUpIcon className="w-4 h-4" />
                                            : <ChevronDownIcon className="w-4 h-4" />
                                          }
                                        </button>
                                      </TableCell>
                                    </TableRow>

                                    {isOpen && (
                                      <TableRow key={`detail-${i}`} className="bg-zinc-50 border-zinc-100">
                                        <TableCell colSpan={5} className="px-0 py-0">
                                          <div
                                            className="mx-6 my-4 rounded-lg border border-zinc-200 bg-white overflow-hidden"
                                            style={{ borderLeft: `3px solid ${
                                              row.recommendation === "APPROVE" ? "#009966"
                                              : row.recommendation === "REVIEW" ? "#f59e0b"
                                              : "#e7000b"
                                            }` }}
                                          >
                                            <div className="px-5 py-4 flex flex-col gap-4">
                                              <div>
                                                <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs uppercase tracking-wide mb-2">
                                                  Specific Findings
                                                </p>
                                                <ul className="flex flex-col gap-1.5 pl-1">
                                                  {row.findings_details.map((f, fi) => (
                                                    <li key={fi} className="flex items-start gap-2">
                                                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                        row.findings_count === 0 ? "bg-[#009966]"
                                                        : row.recommendation === "REJECT" ? "bg-[#e7000b]"
                                                        : "bg-[#f59e0b]"
                                                      }`} />
                                                      <span className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-5">
                                                        {f}
                                                      </span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                              <div className="pt-3 border-t border-zinc-100">
                                                <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-800 text-xs uppercase tracking-wide mb-2">
                                                  Expert Rationale
                                                </p>
                                                <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm leading-5 italic">
                                                  "{row.rationale}"
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
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
