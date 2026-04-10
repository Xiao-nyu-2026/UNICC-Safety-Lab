import { useState } from "react";
import { useLocation } from "wouter";
import {
  ClipboardCheckIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilterIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    title: "Most Targeted Risk",
    value: "LLM01",
    change: "Injection — 42% of failures",
    changeColor: "text-[#9f1239]",
    Icon: TrendingUpIcon,
    iconBg: "bg-[#ffe2e2]",
    iconColor: "text-[#9f1239]",
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

const verdictStyles: Record<string, string> = {
  REJECT: "bg-[#ffe4e6] text-[#9f1239]",
  APPROVE: "bg-[#d1fae5] text-[#065f46]",
  REVIEW: "bg-[#fef3c7] text-[#92400e]",
};

const modules = [
  { name: "Prompt Injection V2", evalId: "EV-1030", category: "Security", tests: 240, avgDuration: "8 min", lastRun: "10 mins ago", framework: "OWASP LLM01", lastVerdict: "REJECT" },
  { name: "Toxicity & Bias", evalId: "EV-1028", category: "Safety", tests: 180, avgDuration: "12 min", lastRun: "1 hr ago", framework: "NIST AI RMF", lastVerdict: "APPROVE" },
  { name: "Jailbreak Attempts", evalId: "EV-1029", category: "Security", tests: 320, avgDuration: "15 min", lastRun: "3 hrs ago", framework: "OWASP LLM01", lastVerdict: "REJECT" },
  { name: "Data Exfiltration", evalId: "EV-1027", category: "Security", tests: 160, avgDuration: "6 min", lastRun: "5 hrs ago", framework: "OWASP LLM06", lastVerdict: "APPROVE" },
  { name: "Malicious Code Gen", evalId: "EV-1030", category: "Security", tests: 200, avgDuration: "10 min", lastRun: "1 day ago", framework: "OWASP LLM04", lastVerdict: "REVIEW" },
  { name: "Bias Detection", evalId: "EV-1028", category: "Fairness", tests: 140, avgDuration: "9 min", lastRun: "1 day ago", framework: "NIST AI RMF", lastVerdict: "APPROVE" },
  { name: "PII Leakage", evalId: "EV-1032", category: "Privacy", tests: 120, avgDuration: "7 min", lastRun: "2 days ago", framework: "OWASP LLM06", lastVerdict: "REJECT" },
];

const categoryColors: Record<string, string> = {
  Security: "bg-[#f0f4ff] text-[#4f39f6]",
  Safety: "bg-[#d0fae5] text-[#004f3b]",
  Fairness: "bg-[#fff8e1] text-[#b45309]",
  Privacy: "bg-zinc-100 text-zinc-700",
};

const FRAMEWORK_OPTIONS = ["All Frameworks", "OWASP", "NIST"] as const;
type FrameworkOption = typeof FRAMEWORK_OPTIONS[number];

/* Module name → module ID slug (must match DashboardMainSection TEST_MODULES ids) */
const MODULE_NAME_TO_ID: Record<string, string> = {
  "Prompt Injection V2": "prompt-injection",
  "Jailbreak Attempts": "jailbreak-attempts",
  "Toxicity & Bias": "toxicity",
  "Data Exfiltration": "data-exfiltration",
  "Malicious Code Gen": "adversarial-prompt",
  "Bias Detection": "toxicity",
  "PII Leakage": "pii-extraction",
};

function loadModuleMeta(): Record<string, { lastVerdict: string; lastRun: string; lastRunAgent: string }> {
  try {
    const raw = localStorage.getItem("asl_module_meta_v1");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export const EvaluationsPage = (): JSX.Element => {
  const [, navigate] = useLocation();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [filterFramework, setFilterFramework] = useState<FrameworkOption>("All Frameworks");
  const [moduleMeta] = useState<Record<string, { lastVerdict: string; lastRun: string; lastRunAgent: string }>>(loadModuleMeta);

  const filteredModules = modules.filter((mod) => {
    if (filterFramework === "All Frameworks") return true;
    return mod.framework.includes(filterFramework);
  });

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
      <div className="flex-1 overflow-y-auto no-scrollbar">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      data-testid="button-filter-framework"
                      className="h-10 px-4 border-zinc-200 bg-white [font-family:'Inter',Helvetica] font-medium text-zinc-700 text-sm hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      <FilterIcon className="w-4 h-4 mr-2 text-[#71717b]" />
                      {filterFramework === "All Frameworks" ? "Filter by Framework" : `Framework: ${filterFramework}`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {FRAMEWORK_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt}
                        onClick={() => setFilterFramework(opt)}
                        className={`[font-family:'Inter',Helvetica] text-sm cursor-pointer ${filterFramework === opt ? "font-semibold text-[#4f39f6]" : "text-zinc-700"}`}
                      >
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <section className="grid grid-cols-3 gap-4 w-full">
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

            {/* Evaluation Modules — full width */}
            <Card className="w-full border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
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
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="border-[#0000001a]">
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6 w-[35%]">Module Name</TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[15%]">Category</TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[20%]">Framework</TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[15%]">Last Verdict</TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[15%] text-center pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 [font-family:'Inter',Helvetica] text-sm text-[#71717b]">
                            No modules match the selected framework.
                          </TableCell>
                        </TableRow>
                      )}
                    {filteredModules.map((mod, i) => (
                      <TableRow key={i} className="border-[#0000001a] hover:bg-zinc-50/60 transition-colors">
                        <TableCell className="pl-6 py-3">
                          {(() => {
                            const mid = MODULE_NAME_TO_ID[mod.name];
                            const meta = mid ? moduleMeta[mid] : null;
                            return (
                              <div className="flex flex-col gap-0.5">
                                <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-900 text-sm">
                                  {mod.name}
                                </span>
                                <span className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                                  {meta ? `Last run ${meta.lastRun} on ${meta.lastRunAgent}` : `Last run ${mod.lastRun}`}
                                </span>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`[font-family:'Inter',Helvetica] font-medium text-xs px-2.5 py-1 rounded-md ${categoryColors[mod.category]}`}>
                            {mod.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`[font-family:'Inter',Helvetica] font-medium text-sm ${
                            mod.framework.startsWith("OWASP")
                              ? "text-[#9f1239]"
                              : "text-[#4f39f6]"
                          }`}>
                            {mod.framework}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {(() => {
                            const mid = MODULE_NAME_TO_ID[mod.name];
                            const meta = mid ? moduleMeta[mid] : null;
                            const liveVerdict = meta?.lastVerdict ?? mod.lastVerdict;
                            return (
                              <Badge className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-xs px-3 py-1 h-auto ${verdictStyles[liveVerdict] ?? verdictStyles[mod.lastVerdict]}`}>
                                {liveVerdict}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="pr-6 py-3 text-center">
                          <button
                            onClick={() => navigate(`/evaluations/${mod.evalId}`)}
                            className="inline-flex items-center gap-1.5 [font-family:'Inter',Helvetica] font-medium text-sm text-[#4f39f6] hover:text-[#3d2bc4] hover:underline transition-colors"
                            data-testid={`button-view-report-${i}`}
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                            View Report
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

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
                    { agent: "UNICC-Chatbot-V2", module: "Prompt Injection V2", evalId: "EV-1030", badge: "OWASP Violated", message: "Critical vulnerability (LLM02: Insecure Output) detected by Security Probe. Human Arbiter intervention required before deployment.", severity: "High" },
                    { agent: "Llama-3-Custom", module: "Toxicity & Bias", evalId: "EV-1028", badge: null, message: "Evaluation pipeline has been running for over 2 hours. Possible LLM API timeout from Project 2 backend.", severity: "Medium" },
                    { agent: "Support-Agent-V2", module: "Bias Detection", evalId: "EV-1028", badge: null, message: "Pending human arbiter sign-off for NIST GOVERN 1.1 compliance checklist.", severity: "Low" },
                  ].map((flag, i) => (
                    <div key={i} className={`flex items-start justify-between p-4 rounded-lg border ${
                      flag.severity === "High" ? "bg-[#fff0f5] border-[#ffc0d0]" : flag.severity === "Medium" ? "bg-[#fff8e1] border-[#fde68a]" : "bg-zinc-50 border-zinc-200"
                    }`}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">{flag.agent}</span>
                          <button
                            onClick={() => navigate(`/evaluations/${flag.evalId}`)}
                            className="[font-family:'Inter',Helvetica] font-normal text-[#4f39f6] text-xs hover:underline"
                          >
                            · {flag.module}
                          </button>
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
