import {
  ArrowLeftIcon,
  ClockIcon,
  PlayIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useParams, useLocation, useSearch } from "wouter";
import { SidebarSection } from "./sections/SidebarSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <header className="flex w-full h-16 items-center justify-between px-8 bg-white border-b border-zinc-200 sticky top-0 z-10">
            <div className="relative flex-1 max-w-[448px]">
              <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
              <Input
                placeholder="Search agents..."
                className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
              />
            </div>
            <img className="w-[84px] h-9" alt="User menu" src="/figmaAssets/div.svg" />
          </header>

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
                  <Button
                    className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm gap-2"
                    data-testid="button-run-eval-agent"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Run Evaluation
                  </Button>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-4 gap-4 w-full">
                  {[
                    { label: "Safety Score", value: agent.safetyScore !== null ? `${agent.safetyScore}` : "—", sub: "/100", color: "text-[#4f39f6]" },
                    { label: "Evals Run", value: agent.evalCount.toLocaleString(), sub: "", color: "text-zinc-950" },
                    { label: "Security Flags", value: String(agent.securityFlags.length), sub: "", color: agent.securityFlags.length > 0 ? "text-[#b45309]" : "text-zinc-950" },
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
                  {/* Description + eval history */}
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

                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="p-0">
                        <div className="px-6 py-5 border-b border-zinc-100">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                            Recent Evaluations
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                            Latest evaluation runs for this agent
                          </p>
                        </div>
                        <div className="flex flex-col divide-y divide-zinc-100">
                          {agent.recentEvals.map((ev, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                                    {ev.evalId}
                                  </span>
                                  <Badge className={`${ev.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-2 py-0.5`}>
                                    {ev.status}
                                  </Badge>
                                </div>
                                <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {ev.module} · {ev.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {ev.score !== null && (
                                  <div className="flex items-center gap-2">
                                    <Progress value={ev.score} className="w-16 h-2 bg-zinc-100" indicatorClassName="bg-[#00bc7d]" />
                                    <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm w-6 text-right">{ev.score}</span>
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-[#4f39f6] hover:bg-[#f0f4ff] [font-family:'Inter',Helvetica] font-medium text-xs"
                                  onClick={() => navigate(`/evaluations/${ev.evalId}`)}
                                  data-testid={`button-view-eval-${ev.evalId}`}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security flags sidebar */}
                  <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 pt-5 pb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldAlertIcon className="w-4 h-4 text-[#b45309]" />
                          <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
                            Security Flags
                          </h3>
                          <Badge className="bg-[#fff8e1] text-[#b45309] border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-2 py-0.5 h-auto ml-auto">
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
                              <div key={i} className="p-3 bg-[#fff8e1] rounded-lg border border-[#fde68a]">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto ${
                                    flag.severity === "High" ? "bg-[#ffe2e2] text-[#82181a]" :
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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
