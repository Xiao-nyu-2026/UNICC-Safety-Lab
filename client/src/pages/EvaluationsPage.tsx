import { useState } from "react";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FileTextIcon,
  FilterIcon,
  ShieldAlertIcon,
  XCircleIcon,
} from "lucide-react";
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

const stats = [
  {
    title: "Total Evals (30d)",
    value: "2,408",
    change: "+14.5% vs last period",
    changeColor: "text-[#009966]",
    Icon: ClipboardCheckIcon,
    iconBg: "bg-[#f0f4ff]",
    iconColor: "text-[#4f39f6]",
  },
  {
    title: "Currently Running",
    value: "3",
    change: "In progress now",
    changeColor: "text-[#71717b]",
    Icon: ClockIcon,
    iconBg: "bg-zinc-100",
    iconColor: "text-zinc-700",
  },
  {
    title: "Scheduled",
    value: "12",
    change: "Next: in 2 hours",
    changeColor: "text-[#71717b]",
    Icon: CalendarIcon,
    iconBg: "bg-[#fff8e1]",
    iconColor: "text-[#b45309]",
  },
  {
    title: "Rejected Audits (30d)",
    value: "87",
    change: "3.6% rejection rate",
    changeColor: "text-[#e7000b]",
    Icon: XCircleIcon,
    iconBg: "bg-[#ffe2e2]",
    iconColor: "text-[#82181a]",
  },
];

const modules = [
  { name: "Prompt Injection V2", category: "Security", tests: 240, avgDuration: "8 min", lastRun: "10 mins ago", framework: "OWASP LLM01" },
  { name: "Toxicity & Bias", category: "Safety", tests: 180, avgDuration: "12 min", lastRun: "1 hr ago", framework: "NIST AI RMF" },
  { name: "Jailbreak Attempts", category: "Security", tests: 320, avgDuration: "15 min", lastRun: "3 hrs ago", framework: "OWASP LLM01" },
  { name: "Data Exfiltration", category: "Security", tests: 160, avgDuration: "6 min", lastRun: "5 hrs ago", framework: "OWASP LLM06" },
  { name: "Malicious Code Gen", category: "Security", tests: 200, avgDuration: "10 min", lastRun: "1 day ago", framework: "OWASP LLM04" },
  { name: "Bias Detection", category: "Fairness", tests: 140, avgDuration: "9 min", lastRun: "1 day ago", framework: "NIST AI RMF" },
  { name: "PII Leakage", category: "Privacy", tests: 120, avgDuration: "7 min", lastRun: "2 days ago", framework: "OWASP LLM06" },
];

const scheduled = [
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1029",
    module: "Prompt Injection V2",
    status: "Security Probe Testing...",
    statusKind: "probe",
    scheduledAt: "Now",
    triggeredBy: "Automated",
    eta: "ETA: 2m 30s",
  },
  {
    agent: "UNICC-Chatbot-V2",
    agentId: "AGT-003",
    evalId: "EV-1030",
    module: "Prompt Injection V2",
    status: "Arbiter Finalizing...",
    statusKind: "arbiter",
    scheduledAt: "Now",
    triggeredBy: "Manual",
    eta: "ETA: 45s",
  },
  {
    agent: "Llama-3-Custom",
    agentId: "AGT-002",
    evalId: "EV-1028",
    module: "Toxicity & Bias",
    status: "Scheduled",
    statusKind: "scheduled",
    scheduledAt: "In 2 hrs",
    triggeredBy: "Automated",
    eta: "ETA: ~2h 00m",
  },
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1026",
    module: "Data Exfiltration",
    status: "Scheduled",
    statusKind: "scheduled",
    scheduledAt: "Today 6pm",
    triggeredBy: "Automated",
    eta: "ETA: ~4h",
  },
];

const categoryColors: Record<string, string> = {
  Security: "bg-[#f0f4ff] text-[#4f39f6]",
  Safety: "bg-[#d0fae5] text-[#004f3b]",
  Fairness: "bg-[#fff8e1] text-[#b45309]",
  Privacy: "bg-zinc-100 text-zinc-700",
};

export const EvaluationsPage = (): JSX.Element => {
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = () => {
    setExportingPDF(true);
    setTimeout(() => {
      setExportingPDF(false);
      window.print();
    }, 1800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <PageHeader placeholder="Search evaluations, modules..." />

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Page title + actions */}
            <section className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                  Evaluation Frameworks & Modules
                </h1>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                  Standardized security benchmarks based on international frameworks.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  data-testid="button-filter-framework"
                  className="h-10 px-4 border-zinc-200 bg-white [font-family:'Inter',Helvetica] font-medium text-zinc-700 text-sm hover:bg-zinc-50 hover:text-zinc-950"
                >
                  <FilterIcon className="w-4 h-4 mr-2 text-[#71717b]" />
                  Filter by Framework
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  data-testid="button-export-standards-pdf"
                  className="h-10 px-4 border-[#4f39f6] bg-white [font-family:'Inter',Helvetica] font-medium text-[#4f39f6] text-sm hover:bg-[#f0f4ff] hover:text-[#3d2bc4] hover:border-[#3d2bc4] disabled:opacity-70"
                >
                  {exportingPDF ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generating PDF…
                    </>
                  ) : (
                    <>
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      Export Standards PDF
                    </>
                  )}
                </Button>
              </div>
            </section>

            {/* Stats cards */}
            <section className="grid grid-cols-4 gap-4 w-full">
              {stats.map((stat, i) => (
                <Card key={i} className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col gap-1">
                        <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                          {stat.title}
                        </p>
                        <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                        <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <p className={`[font-family:'Inter',Helvetica] font-normal text-sm leading-5 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Two-column layout: Evaluation Modules + Queue */}
            <section className="flex gap-6 w-full">
              {/* Evaluation Modules */}
              <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
                    <div className="flex flex-col">
                      <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                        Evaluation Modules
                      </h2>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                        Available safety test suites
                      </p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#0000001a]">
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6">Module Name</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Category</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Tests</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Avg Duration</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pr-6">Framework</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((mod, i) => (
                        <TableRow key={i} className="border-[#0000001a]">
                          <TableCell className="pl-6">
                            <div className="flex flex-col">
                              <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">{mod.name}</span>
                              <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">{mod.lastRun}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto ${categoryColors[mod.category]}`}>
                              {mod.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                            {mod.tests}
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                            {mod.avgDuration}
                          </TableCell>
                          <TableCell className="pr-6">
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-3 py-1 h-auto ${
                              mod.framework.startsWith("OWASP")
                                ? "bg-[#fff0f5] text-[#9f1239]"
                                : "bg-[#f0f4ff] text-[#4f39f6]"
                            }`}>
                              {mod.framework}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Eval Queue */}
              <Card className="w-[360px] border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
                    <div className="flex flex-col">
                      <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                        Eval Queue
                      </h2>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-0.5">
                        Running &amp; scheduled
                      </p>
                    </div>
                    <Badge className="bg-[#f0f4ff] text-[#4f39f6] border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-3 py-1 h-auto">
                      {scheduled.length} queued
                    </Badge>
                  </div>
                  <div className="flex flex-col divide-y divide-zinc-100">
                    {scheduled.map((item, i) => (
                      <div key={i} className="flex items-start justify-between px-6 py-3 gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm truncate">
                              {item.agent}
                            </span>
                            {/* Status badge — probe / arbiter get pulsing dot + pill */}
                            {item.statusKind === "probe" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dbeafe] px-2 py-0.5 flex-shrink-0">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3b82f6]" />
                                </span>
                                <span className="[font-family:'Inter',Helvetica] font-normal text-[#1e40af] text-xs whitespace-nowrap">
                                  {item.status}
                                </span>
                              </span>
                            )}
                            {item.statusKind === "arbiter" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ede9fe] px-2 py-0.5 flex-shrink-0">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8b5cf6]" />
                                </span>
                                <span className="[font-family:'Inter',Helvetica] font-normal text-[#4c1d95] text-xs whitespace-nowrap">
                                  {item.status}
                                </span>
                              </span>
                            )}
                            {item.statusKind === "scheduled" && (
                              <Badge className="border-transparent rounded-full bg-[#f0f4ff] text-[#4f39f6] [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto flex-shrink-0">
                                {item.status}
                              </Badge>
                            )}
                            {item.statusKind === "pending" && (
                              <Badge className="border-transparent rounded-full bg-[#fff8e1] text-[#b45309] [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto flex-shrink-0">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                          <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                            {item.module}
                          </span>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {item.scheduledAt}
                            </span>
                            <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                              {item.triggeredBy}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5">
                          <span className={`[font-family:'ui-monospace',SFMono-Regular,monospace] text-[11px] font-medium ${
                            item.statusKind === "probe"
                              ? "text-[#2563eb]"
                              : item.statusKind === "arbiter"
                              ? "text-[#7c3aed]"
                              : item.statusKind === "pending"
                              ? "text-[#b45309]"
                              : "text-[#71717b]"
                          }`}>
                            {item.eta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Alerts */}
            <Card className="w-full border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlertIcon className="w-5 h-5 text-[#ff2d78]" />
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                    Security Flags Requiring Attention
                  </h2>
                  <Badge className="bg-[#ffe0eb] text-[#ff2d78] border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-3 py-1 h-auto">
                    3 security flags
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { agent: "UNICC-Chatbot-V2", module: "Prompt Injection V2", badge: "OWASP Violated", message: "Critical vulnerability (LLM02: Insecure Output) detected by Security Probe. Human Arbiter intervention required before deployment.", severity: "High" },
                    { agent: "Llama-3-Custom", module: "Toxicity & Bias", badge: null, message: "Evaluation pipeline has been running for over 2 hours. Possible LLM API timeout from Project 2 backend.", severity: "Medium" },
                    { agent: "Support-Agent-V2", module: "Bias Detection", badge: null, message: "Pending human arbiter sign-off for NIST GOVERN 1.1 compliance checklist.", severity: "Low" },
                  ].map((flag, i) => (
                    <div key={i} className={`flex items-start justify-between p-4 rounded-lg border ${
                      flag.severity === "High" ? "bg-[#fff0f5] border-[#ffc0d0]" : flag.severity === "Medium" ? "bg-[#fff8e1] border-[#fde68a]" : "bg-zinc-50 border-zinc-200"
                    }`}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">{flag.agent}</span>
                          <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">· {flag.module}</span>
                          {flag.badge !== null && (
                            <Badge className="bg-[#ffe0eb] text-[#ff2d78] border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-xs px-2 py-0.5 h-auto">
                              {flag.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-xs leading-4">
                          {flag.message}
                        </p>
                      </div>
                      <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto flex-shrink-0 ml-4 ${
                        flag.severity === "High" ? "bg-[#ffe0eb] text-[#ff2d78]" :
                        flag.severity === "Medium" ? "bg-[#fff8e1] text-[#b45309]" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {flag.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};
