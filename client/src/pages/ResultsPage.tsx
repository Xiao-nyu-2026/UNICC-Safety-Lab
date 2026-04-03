import { useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DownloadIcon,
  FilterIcon,
  ShieldAlertIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const resultStats = [
  {
    title: "Passed",
    value: "2,301",
    change: "95.6% pass rate",
    changeColor: "text-[#009966]",
    Icon: CheckCircleIcon,
    iconBg: "bg-[#d0fae5]",
    iconColor: "text-[#004f3b]",
  },
  {
    title: "Failed",
    value: "87",
    change: "3.6% failure rate",
    changeColor: "text-[#e7000b]",
    Icon: XCircleIcon,
    iconBg: "bg-[#ffe2e2]",
    iconColor: "text-[#82181a]",
  },
  {
    title: "Security Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#ff2d78]",
    Icon: ShieldAlertIcon,
    iconBg: "bg-[#ffe0eb]",
    iconColor: "text-[#ff2d78]",
  },
  {
    title: "Avg Score",
    value: "96.4",
    change: "+2.1 vs last period",
    changeColor: "text-[#009966]",
    Icon: CheckCircleIcon,
    iconBg: "bg-[#f0f4ff]",
    iconColor: "text-[#4f39f6]",
  },
];

const scoreByModule = [
  { module: "Prompt Inj.", score: 97 },
  { module: "Toxicity", score: 91 },
  { module: "Jailbreak", score: 72 },
  { module: "Data Exfil.", score: 99 },
  { module: "Malicious Code", score: 94 },
  { module: "Bias", score: 85 },
  { module: "PII Leakage", score: 96 },
];

const BAR_COLORS = ["#4f39f6", "#4f39f6", "#fb2c36", "#4f39f6", "#4f39f6", "#f59e0b", "#4f39f6"];

const trendData = [
  { day: "Mar 1", passed: 94, failed: 6 },
  { day: "Mar 5", passed: 96, failed: 4 },
  { day: "Mar 8", passed: 93, failed: 7 },
  { day: "Mar 12", passed: 97, failed: 3 },
  { day: "Mar 15", passed: 95, failed: 5 },
  { day: "Mar 19", passed: 98, failed: 2 },
  { day: "Mar 22", passed: 96, failed: 4 },
];

const results = [
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1029",
    module: "Prompt Injection V2",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 99,
    scoreColor: "bg-[#00bc7d]",
    date: "Mar 8, 2026",
    time: "10 mins ago",
  },
  {
    agent: "Llama-3-Custom",
    agentId: "AGT-002",
    evalId: "EV-1028",
    module: "Toxicity & Bias",
    status: "Running",
    statusColor: "bg-zinc-100 text-zinc-900",
    score: null,
    scoreColor: "",
    date: "Mar 8, 2026",
    time: "1 hr ago",
    hasIcon: true,
  },
  {
    agent: "Customer-Bot-V1",
    agentId: "AGT-003",
    evalId: "EV-1027",
    module: "Jailbreak Attempts",
    status: "Failed",
    statusColor: "bg-[#ffe2e2] text-[#82181a]",
    score: 45,
    scoreColor: "bg-[#fb2c36]",
    date: "Mar 8, 2026",
    time: "3 hrs ago",
  },
  {
    agent: "GPT-4-Turbo-Prod",
    agentId: "AGT-001",
    evalId: "EV-1026",
    module: "Data Exfiltration",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 100,
    scoreColor: "bg-[#00bc7d]",
    date: "Mar 8, 2026",
    time: "5 hrs ago",
  },
  {
    agent: "Code-Gen-Agent",
    agentId: "AGT-004",
    evalId: "EV-1025",
    module: "Malicious Code Gen",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 95,
    scoreColor: "bg-[#00bc7d]",
    date: "Mar 7, 2026",
    time: "1 day ago",
  },
  {
    agent: "Support-Agent-V2",
    agentId: "AGT-006",
    evalId: "EV-1024",
    module: "Prompt Injection V2",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 88,
    scoreColor: "bg-[#00bc7d]",
    date: "Mar 7, 2026",
    time: "1 day ago",
  },
  {
    agent: "Data-Pipeline-Bot",
    agentId: "AGT-005",
    evalId: "EV-1023",
    module: "Data Exfiltration",
    status: "Passed",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    score: 100,
    scoreColor: "bg-[#00bc7d]",
    date: "Mar 6, 2026",
    time: "2 days ago",
  },
  {
    agent: "Customer-Bot-V1",
    agentId: "AGT-003",
    evalId: "EV-1022",
    module: "Bias Detection",
    status: "Failed",
    statusColor: "bg-[#ffe2e2] text-[#82181a]",
    score: 62,
    scoreColor: "bg-[#fb2c36]",
    date: "Mar 5, 2026",
    time: "3 days ago",
  },
];

const STATUS_OPTIONS = ["Passed", "Failed", "Running"] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

const SCORE_RANGES = [
  { label: "All scores", min: 0, max: 100 },
  { label: "90 – 100 (Excellent)", min: 90, max: 100 },
  { label: "70 – 89 (Good)", min: 70, max: 89 },
  { label: "Below 70 (At risk)", min: 0, max: 69 },
] as const;

const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: Infinity },
] as const;

const parseResultDate = (dateStr: string): Date => {
  return new Date(dateStr + ", 2026");
};

export const ResultsPage = (): JSX.Element => {
  const [, navigate] = useLocation();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([]);
  const [scoreRangeIdx, setScoreRangeIdx] = useState(0);
  const [dateRangeIdx, setDateRangeIdx] = useState(4);

  const toggleStatus = (s: StatusOption) =>
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const activeRange = SCORE_RANGES[scoreRangeIdx];
  const activeDateRange = DATE_RANGES[dateRangeIdx];
  const now = new Date("2026-04-03");
  const dateFiltered = dateRangeIdx !== 4;
  const isFiltered = selectedStatuses.length > 0 || scoreRangeIdx !== 0 || dateFiltered;
  const filterCount = selectedStatuses.length + (scoreRangeIdx !== 0 ? 1 : 0) + (dateFiltered ? 1 : 0);

  const filteredResults = results.filter((r) => {
    const statusOk = selectedStatuses.length === 0 || selectedStatuses.includes(r.status as StatusOption);
    const scoreOk = r.score === null || (r.score >= activeRange.min && r.score <= activeRange.max);
    const dateOk = activeDateRange.days === Infinity || (() => {
      const d = parseResultDate(r.date);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= activeDateRange.days;
    })();
    return statusOk && scoreOk && dateOk;
  });

  const handleExport = () => {
    const data = filteredResults.map((r) => ({
      evalId: r.evalId,
      agent: r.agent,
      agentId: r.agentId,
      module: r.module,
      status: r.status,
      score: r.score,
      date: r.date,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-safety-lab-results-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <PageHeader placeholder="Search results, agents..." />

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Page title + actions */}
            <section className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                  Results
                </h1>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                  Detailed analysis of all safety evaluation outcomes across your agents.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  data-testid="button-filter-results"
                  onClick={() => setShowFilter((v) => !v)}
                  className={`h-10 [font-family:'Inter',Helvetica] font-medium text-sm ${
                    isFiltered
                      ? "border-[#4f39f6] text-[#4f39f6] bg-[#f0f4ff]"
                      : "text-zinc-950"
                  }`}
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Filter
                  {isFiltered && (
                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#4f39f6] text-white text-[10px] font-bold">
                      {filterCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  data-testid="button-export-results"
                  onClick={handleExport}
                  className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </section>

            {/* Filter panel */}
            {showFilter && (
              <section className="w-full bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
                    Filter Results
                  </span>
                  <button
                    onClick={() => { setSelectedStatuses([]); setScoreRangeIdx(0); setDateRangeIdx(4); }}
                    className="[font-family:'Inter',Helvetica] text-xs text-[#4f39f6] hover:underline font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex gap-8 flex-wrap">
                  {/* Status filter */}
                  <div className="flex flex-col gap-2">
                    <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-500 text-xs uppercase tracking-wider">
                      Status
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleStatus(s)}
                          className={`h-7 px-3 rounded-full text-xs font-medium [font-family:'Inter',Helvetica] border transition-colors ${
                            selectedStatuses.includes(s)
                              ? s === "Passed"
                                ? "bg-[#d0fae5] text-[#004f3b] border-[#00bc7d]"
                                : s === "Failed"
                                ? "bg-[#ffe2e2] text-[#82181a] border-[#fb2c36]"
                                : "bg-zinc-100 text-zinc-900 border-zinc-400"
                              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          {selectedStatuses.includes(s) && <XIcon className="w-2.5 h-2.5 inline mr-1" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Score range filter */}
                  <div className="flex flex-col gap-2">
                    <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-500 text-xs uppercase tracking-wider">
                      Score Range
                    </p>
                    <div className="relative">
                      <select
                        value={scoreRangeIdx}
                        onChange={(e) => setScoreRangeIdx(Number(e.target.value))}
                        className="h-7 pl-3 pr-8 rounded-full text-xs font-medium [font-family:'Inter',Helvetica] border border-zinc-200 bg-white text-zinc-700 appearance-none cursor-pointer focus:outline-none focus:border-[#4f39f6]"
                      >
                        {SCORE_RANGES.map((r, i) => (
                          <option key={i} value={i}>{r.label}</option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-2 top-1.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date range filter */}
                  <div className="flex flex-col gap-2">
                    <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-500 text-xs uppercase tracking-wider">
                      Time Period
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {DATE_RANGES.map((range, i) => (
                        <button
                          key={i}
                          onClick={() => setDateRangeIdx(i)}
                          className={`h-7 px-3 rounded-full text-xs font-medium [font-family:'Inter',Helvetica] border transition-colors ${
                            dateRangeIdx === i
                              ? "bg-[#f0f4ff] text-[#4f39f6] border-[#4f39f6]"
                              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {isFiltered && (
                  <p className="[font-family:'Inter',Helvetica] text-xs text-zinc-500">
                    Showing <strong className="text-zinc-900">{filteredResults.length}</strong> of {results.length} results
                  </p>
                )}
              </section>
            )}

            {/* Stats cards */}
            <section className="grid grid-cols-4 gap-4 w-full">
              {resultStats.map((stat, i) => (
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

            {/* Charts row */}
            <section className="flex gap-6 w-full">
              {/* Avg Score by Module bar chart */}
              <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="px-6 pt-6 pb-6">
                  <div className="flex flex-col mb-6">
                    <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                      Avg Score by Evaluation Module
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                      Average safety score per module over the last 30 days.
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreByModule} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis
                        dataKey="module"
                        tick={{ fontSize: 12, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[60, 100]}
                        tick={{ fontSize: 12, fill: "#71717b", fontFamily: "Inter, Helvetica" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e4e4e7",
                          fontFamily: "Inter, Helvetica",
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [`${value}`, "Avg Score"]}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {scoreByModule.map((_, index) => (
                          <Cell key={index} fill={BAR_COLORS[index] ?? "#4f39f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pass/Fail trend line chart */}
              <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="px-6 pt-6 pb-6">
                  <div className="flex flex-col mb-6">
                    <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                      Pass / Fail Trend
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                      Daily pass and fail rates over the last 30 days.
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
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
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e4e4e7",
                          fontFamily: "Inter, Helvetica",
                          fontSize: 12,
                        }}
                        formatter={(value: number, name: string) => [`${value}%`, name === "passed" ? "Passed" : "Failed"]}
                      />
                      <Legend
                        formatter={(value) => value === "passed" ? "Passed" : "Failed"}
                        wrapperStyle={{ fontFamily: "Inter, Helvetica", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="passed" stroke="#00bc7d" strokeWidth={2} dot={{ fill: "#00bc7d", r: 3 }} />
                      <Line type="monotone" dataKey="failed" stroke="#fb2c36" strokeWidth={2} dot={{ fill: "#fb2c36", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            {/* Result Breakdown + Table row */}
            <section className="flex gap-6 w-full">
              {/* Breakdown card */}
              <Card className="w-[260px] flex-shrink-0 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="px-6 pt-6 pb-6">
                  <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px] mb-1">
                    Result Breakdown
                  </h2>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mb-6">
                    Current period summary
                  </p>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">Passed</span>
                        <span className="[font-family:'Inter',Helvetica] font-semibold text-[#009966] text-sm">95.6%</span>
                      </div>
                      <Progress value={95.6} className="h-2 bg-zinc-100" indicatorClassName="bg-[#00bc7d]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">Failed</span>
                        <span className="[font-family:'Inter',Helvetica] font-semibold text-[#e7000b] text-sm">3.6%</span>
                      </div>
                      <Progress value={3.6} className="h-2 bg-zinc-100" indicatorClassName="bg-[#fb2c36]" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">Running</span>
                        <span className="[font-family:'Inter',Helvetica] font-semibold text-[#71717b] text-sm">0.8%</span>
                      </div>
                      <Progress value={0.8} className="h-2 bg-zinc-100" indicatorClassName="bg-zinc-400" />
                    </div>
                    <div className="mt-2 pt-4 border-t border-zinc-100 flex flex-col gap-3">
                      {[
                        { label: "Highest Score", value: "100 / Data Exfil.", color: "text-[#009966]" },
                        { label: "Lowest Score", value: "45 / Jailbreak", color: "text-[#e7000b]" },
                        { label: "Avg Score", value: "96.4", color: "text-zinc-950" },
                        { label: "Total Evals", value: "2,408", color: "text-zinc-950" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="[font-family:'Inter',Helvetica] text-[#71717b] text-xs">{item.label}</span>
                          <span className={`[font-family:'Inter',Helvetica] font-semibold text-xs ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results table */}
              <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex flex-col">
                      <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                        All Results
                      </h2>
                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                        Complete history of safety test outcomes.
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
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Module</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Status</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Score</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Date</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">Time</TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center [font-family:'Inter',Helvetica] text-sm text-zinc-400 italic">
                            No results match the current filters.
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredResults.map((result, index) => (
                        <TableRow key={index} className="border-[#0000001a]" data-testid={`row-result-${index}`}>
                          <TableCell className="pl-6">
                            <div className="flex flex-col">
                              <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                                {result.agent}
                              </span>
                              <span className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs">
                                {result.evalId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                            {result.module}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${result.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}>
                              {result.hasIcon && <ClockIcon className="w-3 h-3 mr-1" />}
                              {result.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.score !== null ? (
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={result.score}
                                  className="w-16 h-2 bg-zinc-100"
                                  indicatorClassName={result.scoreColor}
                                />
                                <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                                  {result.score}
                                </span>
                              </div>
                            ) : (
                              <span className="[font-family:'Inter',Helvetica] font-normal italic text-[#9f9fa9] text-sm">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                            {result.date}
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                            {result.time}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-view-result-${index}`}
                              onClick={() => navigate(`/evaluations/${result.evalId}`)}
                              className="h-8 px-3 text-[#4f39f6] hover:text-[#4f39f6] hover:bg-[#f0f4ff] [font-family:'Inter',Helvetica] font-medium text-xs"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
