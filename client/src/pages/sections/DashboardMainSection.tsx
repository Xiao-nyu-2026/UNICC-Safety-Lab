import { useCallback, useEffect, useRef, useState } from "react";
import {
  ClockIcon,
  PlayIcon,
  SearchIcon,
  ShieldCheckIcon,
  UploadIcon,
} from "lucide-react";
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

const statsCards = [
  {
    title: "Agents Monitored",
    value: "14",
    change: "+2 this month",
    changeColor: "text-[#009966]",
    icon: "/figmaAssets/container-3.svg",
  },
  {
    title: "Evals Run (30d)",
    value: "2,408",
    change: "+14.5% vs last",
    changeColor: "text-[#009966]",
    icon: "/figmaAssets/container-7.svg",
  },
  {
    title: "Active Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#e7000b]",
    icon: "/figmaAssets/container-4.svg",
  },
];

const evaluationsData = [
  {
    agent: "GPT-4-Turbo-Prod",
    id: "EV-1029",
    module: "Prompt Injection V2",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 99,
    scoreColor: "bg-[#00bc7d]",
    time: "10 mins ago",
  },
  {
    agent: "Llama-3-Custom",
    id: "EV-1028",
    module: "Toxicity & Bias",
    status: "Running",
    statusColor: "bg-zinc-100 text-zinc-900",
    score: null,
    scoreColor: "",
    time: "1 hr ago",
    hasIcon: true,
  },
  {
    agent: "Customer-Bot-V1",
    id: "EV-1027",
    module: "Jailbreak Attempts",
    status: "Failed",
    statusColor: "bg-[#ffe2e2] text-[#82181a]",
    score: 45,
    scoreColor: "bg-[#fb2c36]",
    time: "3 hrs ago",
  },
  {
    agent: "GPT-4-Turbo-Prod",
    id: "EV-1026",
    module: "Data Exfiltration",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 100,
    scoreColor: "bg-[#00bc7d]",
    time: "5 hrs ago",
  },
  {
    agent: "Code-Gen-Agent",
    id: "EV-1025",
    module: "Malicious Code Gen",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 95,
    scoreColor: "bg-[#00bc7d]",
    time: "1 day ago",
  },
];

const ALL_AUDIT_LOGS = [
  { ts: "10:42:01", module: "SafeAI_Orchestrator", msg: "Starting audit session for GPT-4-Turbo-Prod (EV-1029)", risk: false },
  { ts: "10:42:03", module: "Injection_Scanner_v4", msg: "Initializing AST parser — loading grammar rules", risk: false },
  { ts: "10:42:05", module: "Injection_Scanner_v4", msg: "Analyzing AST for recursive call patterns", risk: false },
  { ts: "10:42:07", module: "Injection_Scanner_v4", msg: "Potential prompt injection vector in input layer", risk: true },
  { ts: "10:42:09", module: "Toxicity_Filter_v2", msg: "Loading embedding model: toxbert-large-en", risk: false },
  { ts: "10:42:11", module: "Toxicity_Filter_v2", msg: "Running cosine similarity on 240 test vectors", risk: false },
  { ts: "10:42:13", module: "Toxicity_Filter_v2", msg: "All toxicity vectors within safe threshold (p < 0.05)", risk: false },
  { ts: "10:42:15", module: "Jailbreak_Detector_v3", msg: "Scanning 320 adversarial prompt templates", risk: false },
  { ts: "10:42:17", module: "Jailbreak_Detector_v3", msg: "Threshold breach: confidence 0.94 > limit 0.80", risk: true },
  { ts: "10:42:19", module: "Data_Exfil_Guard_v1", msg: "Inspecting output channels for PII leakage", risk: false },
  { ts: "10:42:21", module: "Data_Exfil_Guard_v1", msg: "Regex hit: SSN-like token pattern in response buffer", risk: true },
  { ts: "10:42:23", module: "Bias_Analyzer_v2", msg: "Computing fairness metrics across 6 demographic groups", risk: false },
  { ts: "10:42:25", module: "Bias_Analyzer_v2", msg: "Disparate impact ratio: 0.96 — within bounds", risk: false },
  { ts: "10:42:27", module: "MalCode_Guard_v1", msg: "Decompiling 200 code-generation outputs", risk: false },
  { ts: "10:42:29", module: "MalCode_Guard_v1", msg: "No executable payloads detected in sample set", risk: false },
  { ts: "10:42:31", module: "SafetyScore_Engine", msg: "Aggregating module scores — weighting by severity", risk: false },
  { ts: "10:42:33", module: "SafetyScore_Engine", msg: "Audit complete. Final safety score: 96.4 / 100", risk: false },
];

const SafetyScoreGauge = ({ pulsing }: { pulsing: boolean }) => {
  const score = 96.4;
  const radius = 54;
  const strokeWidth = 11;
  const cx = 72;
  const cy = 72;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative flex items-center justify-center">
        {pulsing && (
          <>
            <div
              className="absolute rounded-full border-2 border-[#cc00ff] animate-ping"
              style={{ width: 144 + 20, height: 144 + 20, opacity: 0.35 }}
            />
            <div
              className="absolute rounded-full border border-[#a855f7] animate-ping"
              style={{ width: 144 + 36, height: 144 + 36, opacity: 0.15, animationDelay: "0.15s" }}
            />
          </>
        )}
        <svg width="144" height="144" viewBox="0 0 144 144">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2d0052" />
              <stop offset="45%" stopColor="#7b00d4" />
              <stop offset="100%" stopColor="#cc00ff" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#ede9fe"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              filter: pulsing ? "drop-shadow(0 0 6px #cc00ff) drop-shadow(0 0 12px #7b00d4)" : "none",
              transition: "filter 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          <span
            className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-tight"
            style={pulsing ? { animation: "heartbeat 0.6s ease-in-out 3" } : {}}
          >
            {score}
          </span>
          <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-[11px] mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <p className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
          Avg Safety Score
        </p>
        <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
          {pulsing ? "✓ Audit complete" : "-0.2% vs last period"}
        </p>
      </div>
      <style>{`
        @keyframes heartbeat {
          0%   { transform: scale(1); }
          20%  { transform: scale(1.18); }
          40%  { transform: scale(1); }
          60%  { transform: scale(1.10); }
          80%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const AuditLogTerminal = ({ onAuditComplete }: { onAuditComplete: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleLogs, setVisibleLogs] = useState<typeof ALL_AUDIT_LOGS>([]);
  const [done, setDone] = useState(false);
  const callbackRef = useRef(onAuditComplete);
  callbackRef.current = onAuditComplete;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < ALL_AUDIT_LOGS.length) {
        const entry = ALL_AUDIT_LOGS[i];
        if (entry) setVisibleLogs((prev) => [...prev, entry]);
        i++;
        if (i >= ALL_AUDIT_LOGS.length) {
          clearInterval(interval);
          setDone(true);
          callbackRef.current();
        }
      } else {
        clearInterval(interval);
      }
    }, 650);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-1 overflow-y-auto rounded-lg p-3"
      style={{
        height: 220,
        scrollBehavior: "smooth",
        background: "#fff",
        border: "1px solid #f4f4f5",
      }}
    >
      {visibleLogs.map((log, i) => (
        <div key={i} className="flex gap-1.5 items-start flex-wrap">
          <span
            className="flex-shrink-0"
            style={{ fontFamily: "'Inter',Helvetica", fontSize: 11, color: "#a1a1aa" }}
          >
            {log.ts}
          </span>
          <span
            className="flex-shrink-0"
            style={{ fontFamily: "'Inter',Helvetica", fontSize: 11, fontWeight: 600, color: "#4f39f6" }}
          >
            [{log.module}]
          </span>
          <span
            style={{
              fontFamily: "'Inter',Helvetica",
              fontSize: 11,
              color: log.risk ? "#b45309" : "#52525c",
              fontWeight: log.risk ? 500 : 400,
            }}
          >
            {log.risk && "⚠ "}
            {log.msg}
          </span>
        </div>
      ))}
      {!done && (
        <div className="flex gap-1 items-center mt-0.5">
          <span className="w-1.5 h-3 bg-[#4f39f6] animate-pulse inline-block rounded-sm opacity-60" />
        </div>
      )}
    </div>
  );
};

export const DashboardMainSection = (): JSX.Element => {
  const [auditDone, setAuditDone] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const handleAuditComplete = useCallback(() => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 4000);
    setAuditDone(true);
  }, []);

  return (
    <div className="flex flex-col items-start flex-1 w-full">
      <header className="flex w-full h-16 items-center justify-between px-8 py-0 bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="relative flex-1 max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
            <Input
              placeholder="Search evaluations, agents..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
            />
          </div>
        </div>
        <img className="w-[84px] h-9" alt="User menu" src="/figmaAssets/div.svg" />
      </header>

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
              className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Agent
            </Button>
            <Button className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] [font-family:'Inter',Helvetica] font-medium text-white text-sm">
              <PlayIcon className="w-4 h-4 mr-2 fill-white" />
              Start Evaluation
            </Button>
          </div>
        </section>

        {/* Stats row: 3 regular cards + Safety Score gauge card */}
        <section className="grid grid-cols-4 gap-4 w-full">
          {statsCards.map((card, index) => (
            <Card
              key={index}
              className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]"
            >
              <CardContent className="pt-6 pb-5 px-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm tracking-[0] leading-5">
                      {card.title}
                    </p>
                    <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[0] leading-8">
                      {card.value}
                    </p>
                  </div>
                  <img className="w-11 h-11" alt="Icon" src={card.icon} />
                </div>
                <p className={`[font-family:'Inter',Helvetica] font-normal text-sm tracking-[0] leading-5 ${card.changeColor}`}>
                  {card.change}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Safety Score Gauge card */}
          <Card
            className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] overflow-hidden"
            style={
              pulsing
                ? { boxShadow: "0 0 0 2px #cc00ff44, 0px 1px 2px -1px #0000001a, 0px 1px 3px #0000001a" }
                : {}
            }
          >
            <CardContent className="py-4 px-4 flex items-center justify-center">
              <SafetyScoreGauge pulsing={pulsing} />
            </CardContent>
          </Card>
        </section>

        {/* Bottom: Evaluations table + Right sidebar */}
        <section className="flex gap-6 w-full">
          {/* Recent Evaluations table */}
          <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-6 py-6">
                <div className="flex flex-col">
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                    Recent Evaluations
                  </h2>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5 mt-1">
                    Latest automated safety tests across your agents.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="h-9 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
                >
                  View all
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-[#0000001a]">
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6">Agent</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Evaluation Module</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Status</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Score</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationsData.map((evaluation, index) => (
                    <TableRow key={index} className="border-[#0000001a]">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                            {evaluation.agent}
                          </span>
                          <span className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs">
                            {evaluation.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                        {evaluation.module}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${evaluation.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}>
                          {evaluation.hasIcon && <ClockIcon className="w-3 h-3 mr-1" />}
                          {evaluation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {evaluation.score !== null ? (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={evaluation.score}
                              className="w-16 h-2 bg-zinc-100"
                              indicatorClassName={evaluation.scoreColor}
                            />
                            <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                              {evaluation.score}
                            </span>
                          </div>
                        ) : (
                          <span className="[font-family:'Inter',Helvetica] font-normal italic text-[#9f9fa9] text-sm">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-right pr-6">
                        {evaluation.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right sidebar: Audit Log */}
          <Card className="w-[340px] flex-shrink-0 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-[#7b00d4]" />
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base tracking-[-0.3px]">
                    Audit Log
                  </h2>
                  {auditDone && (
                    <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#00bc7d] bg-[#d0fae5] rounded-full px-2 py-0.5">
                      ✓ DONE
                    </span>
                  )}
                </div>
                <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                  EV-1029
                </span>
              </div>

              <div className="px-4 py-4">
                <AuditLogTerminal onAuditComplete={handleAuditComplete} />
              </div>

              <div className="px-4 pb-4">
                <Button
                  variant="outline"
                  className="w-full h-9 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm border-zinc-200"
                >
                  View Full Event Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};
