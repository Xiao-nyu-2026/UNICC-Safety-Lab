import {
  CalendarIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FilterIcon,
  PlayCircleIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  XCircleIcon,
} from "lucide-react";
import { SidebarSection } from "./sections/SidebarSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    title: "Failed (30d)",
    value: "87",
    change: "3.6% failure rate",
    changeColor: "text-[#e7000b]",
    Icon: XCircleIcon,
    iconBg: "bg-[#ffe2e2]",
    iconColor: "text-[#82181a]",
  },
];

const modules = [
  { name: "Prompt Injection V2", category: "Security", tests: 240, avgDuration: "8 min", lastRun: "10 mins ago" },
  { name: "Toxicity & Bias", category: "Safety", tests: 180, avgDuration: "12 min", lastRun: "1 hr ago" },
  { name: "Jailbreak Attempts", category: "Security", tests: 320, avgDuration: "15 min", lastRun: "3 hrs ago" },
  { name: "Data Exfiltration", category: "Security", tests: 160, avgDuration: "6 min", lastRun: "5 hrs ago" },
  { name: "Malicious Code Gen", category: "Security", tests: 200, avgDuration: "10 min", lastRun: "1 day ago" },
  { name: "Bias Detection", category: "Fairness", tests: 140, avgDuration: "9 min", lastRun: "1 day ago" },
  { name: "PII Leakage", category: "Privacy", tests: 120, avgDuration: "7 min", lastRun: "2 days ago" },
];

const scheduled = [
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1029",
    module: "Prompt Injection V2",
    status: "Running",
    statusColor: "bg-zinc-100 text-zinc-900",
    scheduledAt: "Now",
    triggeredBy: "Automated",
  },
  {
    agent: "Llama-3-Custom",
    agentId: "AGT-002",
    evalId: "EV-1028",
    module: "Toxicity & Bias",
    status: "Running",
    statusColor: "bg-zinc-100 text-zinc-900",
    scheduledAt: "Now",
    triggeredBy: "Manual",
  },
  {
    agent: "Customer-Bot-V1",
    agentId: "AGT-003",
    evalId: "EV-1027",
    module: "Jailbreak Attempts",
    status: "Scheduled",
    statusColor: "bg-[#f0f4ff] text-[#4f39f6]",
    scheduledAt: "In 2 hrs",
    triggeredBy: "Automated",
  },
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1026",
    module: "Data Exfiltration",
    status: "Scheduled",
    statusColor: "bg-[#f0f4ff] text-[#4f39f6]",
    scheduledAt: "Today 6pm",
    triggeredBy: "Automated",
  },
  {
    agent: "Code-Gen-Agent",
    agentId: "AGT-004",
    evalId: "EV-1025",
    module: "Malicious Code Gen",
    status: "Scheduled",
    statusColor: "bg-[#f0f4ff] text-[#4f39f6]",
    scheduledAt: "Tomorrow",
    triggeredBy: "Manual",
  },
  {
    agent: "Support-Agent-V2",
    agentId: "AGT-006",
    evalId: "EV-1024",
    module: "Bias Detection",
    status: "Pending Review",
    statusColor: "bg-[#fff8e1] text-[#b45309]",
    scheduledAt: "On approval",
    triggeredBy: "Manual",
  },
];

const categoryColors: Record<string, string> = {
  Security: "bg-[#f0f4ff] text-[#4f39f6]",
  Safety: "bg-[#d0fae5] text-[#004f3b]",
  Fairness: "bg-[#fff8e1] text-[#b45309]",
  Privacy: "bg-zinc-100 text-zinc-700",
};

export const EvaluationsPage = (): JSX.Element => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          {/* Top header bar */}
          <header className="flex w-full h-16 items-center justify-between px-8 bg-white border-b border-zinc-200 sticky top-0 z-10">
            <div className="relative flex-1 max-w-[448px]">
              <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
              <Input
                data-testid="input-search-evaluations"
                placeholder="Search evaluations, modules..."
                className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
              />
            </div>
            <img className="w-[84px] h-9" alt="User menu" src="/figmaAssets/div.svg" />
          </header>

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Page title + actions */}
            <section className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                  Evaluations
                </h1>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                  Manage and schedule automated safety evaluations for your AI agents.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  data-testid="button-filter-evaluations"
                  className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button
                  data-testid="button-run-evaluation"
                  className="h-10 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Run New Evaluation
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
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6">Module</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Category</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Tests</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Avg Duration</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6">Action</TableHead>
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
                          <TableCell className="text-right pr-6">
                            <Button
                              data-testid={`button-run-module-${i}`}
                              size="sm"
                              variant="ghost"
                              className="h-8 text-[#4f39f6] hover:text-[#4f39f6] hover:bg-[#f0f4ff] [font-family:'Inter',Helvetica] font-medium text-sm"
                            >
                              <PlayCircleIcon className="w-3.5 h-3.5 mr-1" />
                              Run
                            </Button>
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
                      <div key={i} className="flex items-start justify-between px-6 py-4 gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm truncate">
                              {item.agent}
                            </span>
                            <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto flex-shrink-0 ${item.statusColor}`}>
                              {item.status}
                            </Badge>
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
                        <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                          <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                            {item.evalId}
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
                  <ShieldAlertIcon className="w-5 h-5 text-[#b45309]" />
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                    Active Security Flags Requiring Attention
                  </h2>
                  <Badge className="bg-[#fff8e1] text-[#b45309] border-transparent rounded-full [font-family:'Inter',Helvetica] font-medium text-xs px-3 py-1 h-auto">
                    3 security flags
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { agent: "Customer-Bot-V1", module: "Jailbreak Attempts", score: 45, message: "Score below threshold (80). Manual review required before next deployment.", severity: "High" },
                    { agent: "Llama-3-Custom", module: "Toxicity & Bias", score: null, message: "Evaluation has been running for over 2 hours. Possible timeout.", severity: "Medium" },
                    { agent: "Support-Agent-V2", module: "Bias Detection", score: null, message: "Pending manual approval before evaluation can proceed.", severity: "Low" },
                  ].map((flag, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-[#fff8e1] rounded-lg border border-[#fde68a]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">{flag.agent}</span>
                          <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">· {flag.module}</span>
                          {flag.score !== null && (
                            <Badge className="bg-[#ffe2e2] text-[#82181a] border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-2 py-0.5 h-auto">
                              Score: {flag.score}
                            </Badge>
                          )}
                        </div>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-xs leading-4">
                          {flag.message}
                        </p>
                      </div>
                      <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto flex-shrink-0 ml-4 ${
                        flag.severity === "High" ? "bg-[#ffe2e2] text-[#82181a]" :
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
