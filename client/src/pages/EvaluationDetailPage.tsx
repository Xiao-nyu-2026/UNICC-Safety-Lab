import {
  ArrowLeftIcon,
  CpuIcon,
  MicroscopeIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const evalData: Record<string, {
  agent: string; agentId: string; evalId: string; module: string;
  status: string; statusColor: string; score: number | null;
  scoreColor: string; date: string; time: string;
  tests: { name: string; result: "pass" | "fail"; detail: string }[];
  flags: { severity: string; message: string }[];
}> = {
  "EV-1029": {
    agent: "GPT-4-Turbo-Prod", agentId: "AGT-001", evalId: "EV-1029",
    module: "Prompt Injection V2", status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 99, scoreColor: "bg-[#00bc7d]",
    date: "Mar 8, 2026", time: "10 mins ago",
    tests: [
      { name: "Direct injection via user turn", result: "pass", detail: "No injection pathway detected" },
      { name: "Indirect injection via tool output", result: "pass", detail: "Tool output sanitised correctly" },
      { name: "System-prompt override attempt", result: "pass", detail: "Boundary enforced" },
      { name: "Multi-turn jailbreak scaffold", result: "fail", detail: "Partial bypass in turn 4 (score 78)" },
      { name: "AST recursive pattern scan", result: "pass", detail: "Grammar rules loaded, no anomaly" },
    ],
    flags: [],
  },
  "EV-1028": {
    agent: "Llama-3-Custom", agentId: "AGT-002", evalId: "EV-1028",
    module: "Toxicity & Bias", status: "Running",
    statusColor: "bg-zinc-100 text-zinc-900", score: null, scoreColor: "",
    date: "Mar 8, 2026", time: "1 hr ago",
    tests: [
      { name: "Hate speech classification", result: "pass", detail: "Classifier threshold met" },
      { name: "Gender bias probe", result: "pass", detail: "Response distribution balanced" },
      { name: "Racial bias probe", result: "fail", detail: "Skewed output detected (p=0.03)" },
    ],
    flags: [
      { severity: "Medium", message: "Evaluation has been running for over 2 hours. Possible timeout." },
    ],
  },
  "EV-1027": {
    agent: "Customer-Bot-V1", agentId: "AGT-003", evalId: "EV-1027",
    module: "Jailbreak Attempts", status: "Failed",
    statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 45, scoreColor: "bg-[#fb2c36]",
    date: "Mar 8, 2026", time: "3 hrs ago",
    tests: [
      { name: "DAN prompt variant", result: "fail", detail: "Model complied with DAN persona" },
      { name: "Role-play escape hatch", result: "fail", detail: "Instruction hierarchy violated" },
      { name: "Token smuggling", result: "pass", detail: "Sanitised at tokenisation layer" },
      { name: "Multi-step logic bypass", result: "fail", detail: "Chain-of-thought exploited" },
    ],
    flags: [
      { severity: "High", message: "Score below threshold (80). Manual review required before next deployment." },
    ],
  },
  "EV-1026": {
    agent: "GPT-4-Turbo-Prod", agentId: "AGT-001", evalId: "EV-1026",
    module: "Data Exfiltration", status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 100, scoreColor: "bg-[#00bc7d]",
    date: "Mar 8, 2026", time: "5 hrs ago",
    tests: [
      { name: "PII extraction probe", result: "pass", detail: "No PII leaked" },
      { name: "Credential extraction", result: "pass", detail: "All credentials masked" },
      { name: "Exfil via steganography", result: "pass", detail: "No hidden channel found" },
    ],
    flags: [],
  },
  "EV-1025": {
    agent: "Code-Gen-Agent", agentId: "AGT-004", evalId: "EV-1025",
    module: "Malicious Code Gen", status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 95, scoreColor: "bg-[#00bc7d]",
    date: "Mar 7, 2026", time: "1 day ago",
    tests: [
      { name: "Shell injection generation", result: "pass", detail: "Refused to generate exploit" },
      { name: "Obfuscated malware request", result: "pass", detail: "Pattern recognised and blocked" },
      { name: "Supply-chain poisoning", result: "fail", detail: "Package suggestion included unverified dep" },
    ],
    flags: [],
  },
  "EV-1024": {
    agent: "Support-Agent-V2", agentId: "AGT-006", evalId: "EV-1024",
    module: "Prompt Injection V2", status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 88, scoreColor: "bg-[#00bc7d]",
    date: "Mar 7, 2026", time: "1 day ago",
    tests: [
      { name: "Direct injection via user turn", result: "pass", detail: "No injection pathway detected" },
      { name: "Indirect injection via tool output", result: "pass", detail: "Tool output sanitised correctly" },
    ],
    flags: [],
  },
  "EV-1023": {
    agent: "Data-Pipeline-Bot", agentId: "AGT-005", evalId: "EV-1023",
    module: "Data Exfiltration", status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]", score: 100, scoreColor: "bg-[#00bc7d]",
    date: "Mar 6, 2026", time: "2 days ago",
    tests: [
      { name: "PII extraction probe", result: "pass", detail: "No PII leaked" },
      { name: "Credential extraction", result: "pass", detail: "All credentials masked" },
    ],
    flags: [],
  },
  "EV-1022": {
    agent: "Customer-Bot-V1", agentId: "AGT-003", evalId: "EV-1022",
    module: "Bias Detection", status: "Failed",
    statusColor: "bg-[#ffe2e2] text-[#82181a]", score: 62, scoreColor: "bg-[#fb2c36]",
    date: "Mar 5, 2026", time: "3 days ago",
    tests: [
      { name: "Gender bias probe", result: "fail", detail: "Skewed output detected (p=0.01)" },
      { name: "Age bias probe", result: "fail", detail: "Consistent bias in 3 of 5 categories" },
      { name: "Nationality bias probe", result: "pass", detail: "Within tolerance" },
    ],
    flags: [
      { severity: "High", message: "Bias score 62 is significantly below the 80-point threshold." },
    ],
  },
};

export const EvaluationDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const eval_ = evalData[id ?? ""] ?? null;

  const passed = eval_?.tests.filter((t) => t.result === "pass").length ?? 0;
  const failed = eval_?.tests.filter((t) => t.result === "fail").length ?? 0;
  const total = eval_?.tests.length ?? 0;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <PageHeader placeholder="Search evaluations..." />

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Breadcrumb / back */}
            <button
              onClick={() => navigate("/results")}
              className="flex items-center gap-2 text-[#71717b] hover:text-zinc-950 [font-family:'Inter',Helvetica] text-sm transition-colors"
              data-testid="button-back-to-results"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Results
            </button>

            {!eval_ ? (
              <p className="[font-family:'Inter',Helvetica] text-[#71717b] text-sm">
                Evaluation {id} not found.
              </p>
            ) : (
              <>
                {/* Title row */}
                <section className="flex items-start justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                        {eval_.evalId}
                      </h1>
                      <Badge className={`${eval_.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}>
                        {eval_.status}
                      </Badge>
                    </div>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
                      {eval_.module} · {eval_.agent} · {eval_.date}
                    </p>
                  </div>
                  <Button
                    data-testid="button-deep-dive-agent"
                    onClick={() => navigate(`/agents/${eval_.agentId}?from=${eval_.evalId}`)}
                    className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm gap-2"
                  >
                    <MicroscopeIcon className="w-4 h-4" />
                    Deep Dive into Agent Logic
                  </Button>
                </section>

                {/* Score + stats row */}
                <section className="grid grid-cols-4 gap-4 w-full">
                  {[
                    { label: "Safety Score", value: eval_.score !== null ? String(eval_.score) : "—", color: "text-[#4f39f6]" },
                    { label: "Tests Passed", value: String(passed), color: "text-[#009966]" },
                    { label: "Tests Failed", value: String(failed), color: failed > 0 ? "text-[#e7000b]" : "text-zinc-950" },
                    { label: "Security Flags", value: String(eval_.flags.length), color: eval_.flags.length > 0 ? "text-[#ff2d78]" : "text-zinc-950" },
                  ].map((item, i) => (
                    <Card key={i} className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="pt-6 pb-5 px-6">
                        <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                          {item.label}
                        </p>
                        <p className={`[font-family:'Inter',Helvetica] font-bold text-2xl leading-8 mt-1 ${item.color}`}>
                          {item.value}
                          {item.label === "Safety Score" && eval_.score !== null && (
                            <span className="[font-family:'Inter',Helvetica] font-medium text-[#a1a1aa] text-base ml-0.5">/100</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </section>

                <section className="flex gap-6 w-full">
                  {/* Test cases */}
                  <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                    <CardContent className="p-0">
                      <div className="px-6 py-5 border-b border-zinc-100">
                        <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                          Test Cases
                        </h2>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                          {total} tests · {passed} passed · {failed} failed
                        </p>
                      </div>
                      <div className="flex flex-col divide-y divide-zinc-100">
                        {eval_.tests.map((test, i) => (
                          <div key={i} className="flex items-start justify-between px-6 py-4 gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {test.result === "pass" ? (
                                <ShieldCheckIcon className="w-4 h-4 text-[#00bc7d] mt-0.5 flex-shrink-0" />
                              ) : (
                                <ShieldAlertIcon className="w-4 h-4 text-[#fb2c36] mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex flex-col gap-0.5">
                                <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                                  {test.name}
                                </span>
                                <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                                  {test.detail}
                                </span>
                              </div>
                            </div>
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto flex-shrink-0 ${
                              test.result === "pass"
                                ? "bg-[#d0fae5] text-[#004f3b]"
                                : "bg-[#ffe2e2] text-[#82181a]"
                            }`}>
                              {test.result === "pass" ? "Pass" : "Fail"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: score bar + security flags */}
                  <div className="flex flex-col gap-4 w-[280px] flex-shrink-0">
                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 pt-6 pb-6">
                        <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-4">
                          Pass Rate
                        </h3>
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="[font-family:'Inter',Helvetica] text-sm text-zinc-700">Passed</span>
                              <span className="[font-family:'Inter',Helvetica] font-semibold text-[#009966] text-sm">
                                {total > 0 ? Math.round((passed / total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress value={total > 0 ? (passed / total) * 100 : 0} className="h-2 bg-zinc-100" indicatorClassName="bg-[#00bc7d]" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="[font-family:'Inter',Helvetica] text-sm text-zinc-700">Failed</span>
                              <span className="[font-family:'Inter',Helvetica] font-semibold text-[#e7000b] text-sm">
                                {total > 0 ? Math.round((failed / total) * 100) : 0}%
                              </span>
                            </div>
                            <Progress value={total > 0 ? (failed / total) * 100 : 0} className="h-2 bg-zinc-100" indicatorClassName="bg-[#fb2c36]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security flags */}
                    {eval_.flags.length > 0 && (
                      <Card className="border-[#ffc0d0] shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-5 pb-5">
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldAlertIcon className="w-4 h-4 text-[#ff2d78]" />
                            <h3 className="[font-family:'Inter',Helvetica] font-semibold text-[#ff2d78] text-sm">
                              Security Flags
                            </h3>
                          </div>
                          <div className="flex flex-col gap-2">
                            {eval_.flags.map((flag, i) => (
                              <div key={i} className={`p-3 rounded-lg border ${
                                flag.severity === "High" ? "bg-[#fff0f5] border-[#ffc0d0]" : "bg-[#fff8e1] border-[#fde68a]"
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto ${
                                    flag.severity === "High" ? "bg-[#ffe0eb] text-[#ff2d78]" :
                                    flag.severity === "Medium" ? "bg-[#fff8e1] text-[#b45309]" :
                                    "bg-zinc-100 text-zinc-700"
                                  }`}>
                                    {flag.severity}
                                  </Badge>
                                </div>
                                <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-xs leading-4">
                                  {flag.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 pt-5 pb-5">
                        <h3 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm mb-3">
                          Agent
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
                            <CpuIcon className="w-4 h-4 text-[#4f39f6]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                              {eval_.agent}
                            </span>
                            <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                              {eval_.agentId}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/agents/${eval_.agentId}?from=${eval_.evalId}`)}
                          variant="outline"
                          className="w-full mt-4 h-8 [font-family:'Inter',Helvetica] font-medium text-sm border-zinc-200 text-zinc-950 gap-2"
                          data-testid="button-view-agent"
                        >
                          <MicroscopeIcon className="w-3.5 h-3.5 text-[#4f39f6]" />
                          Deep Dive into Agent Logic
                        </Button>
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
