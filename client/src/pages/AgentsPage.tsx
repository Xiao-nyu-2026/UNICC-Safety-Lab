import { useState } from "react";
import {
  BotIcon,
  ClockIcon,
  FileBarChart2Icon,
  FilterIcon,
  SearchIcon,
  ShieldCheckIcon,
  XIcon,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAgents, Agent } from "@/context/AgentsContext";
import { ImportAgentModal } from "@/components/ImportAgentModal";

const agentStats = [
  {
    title: "Total Agents",
    value: "14",
    change: "+2 this month",
    changeColor: "text-[#009966]",
    Icon: BotIcon,
    iconBg: "bg-[#f0f4ff]",
    iconColor: "text-[#4f39f6]",
  },
  {
    title: "System Compliance Rate",
    value: "82%",
    change: "Fully aligned with NIST RMF",
    changeColor: "text-[#009966]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#f0fdf4]",
    iconColor: "text-[#009966]",
  },
  {
    title: "Requires Attention",
    value: "3",
    change: "Critical REJECTs pending fix",
    changeColor: "text-[#e7000b]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#ffe0eb]",
    iconColor: "text-[#ff2d78]",
  },
];

const STATUS_OPTIONS = ["All Agents", "APPROVED", "REJECTED", "Running Eval"] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

export const AgentsPage = (): JSX.Element => {
  const { agents } = useAgents();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusOption>("All Agents");
  const [importOpen, setImportOpen] = useState(false);
  const [reportAgent, setReportAgent] = useState<Agent | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All Agents" || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-start w-full">
          <PageHeader placeholder="Search agents..." />

          <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
            {/* Page title + actions */}
            <section className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                  Agents
                </h1>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                  Manage and monitor all AI agents connected to AI Safety Lab.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717b] pointer-events-none" />
                  <Input
                    placeholder="Search by Agent Name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 w-64 border-zinc-200 bg-white/80 backdrop-blur-sm [font-family:'Inter',Helvetica] text-sm text-zinc-950 placeholder:text-[#a1a1aa] focus-visible:ring-[#4f39f6] focus-visible:ring-1 focus-visible:ring-offset-0 rounded-lg"
                    data-testid="input-search-agents"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-zinc-200 bg-white/80 backdrop-blur-sm [font-family:'Inter',Helvetica] font-medium text-zinc-700 text-sm hover:bg-zinc-50 hover:text-zinc-950 rounded-lg"
                      data-testid="button-filter-agents"
                    >
                      <FilterIcon className="w-4 h-4 mr-2 text-[#71717b]" />
                      {filterStatus === "All Agents" ? "Filter by Status" : `Status: ${filterStatus}`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {STATUS_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt}
                        onClick={() => setFilterStatus(opt)}
                        className={`[font-family:'Inter',Helvetica] text-sm cursor-pointer ${filterStatus === opt ? "font-semibold text-[#4f39f6]" : "text-zinc-700"}`}
                      >
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </section>

            {/* Stats cards */}
            <section className="grid grid-cols-3 gap-4 w-full">
              {agentStats.map((stat, i) => (
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

            {/* Agents table */}
            <Card className="w-full border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-6 py-6">
                  <div className="flex flex-col">
                    <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-lg tracking-[-0.45px]">
                      All Agents
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                      A complete list of agents registered in your environment.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-9 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
                  >
                    Export
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-[#0000001a]">
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6">
                        Agent
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Type
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Status
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Last Evaluation
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-center pr-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 [font-family:'Inter',Helvetica] text-sm text-[#71717b]">
                          No agents match the selected filter.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAgents.map((agent, index) => (
                      <TableRow key={index} className="border-[#0000001a]">
                        <TableCell className="pl-6">
                          <div className="flex flex-col text-left">
                            <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                              {agent.name}
                            </span>
                            <span className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs">
                              {agent.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                          {agent.type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${agent.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}
                          >
                            {agent.hasIcon && <ClockIcon className="w-3 h-3 mr-1" />}
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                          {agent.lastEval}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-[#4f39f6] hover:text-[#4f39f6] hover:bg-[#f0f4ff] text-xs font-medium"
                              onClick={() => setReportAgent(agent)}
                              data-testid={`button-view-report-${agent.id}`}
                            >
                              <FileBarChart2Icon className="w-3 h-3 mr-1" />
                              View Report
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <ImportAgentModal open={importOpen} onClose={() => setImportOpen(false)} />

      {/* View Report Modal */}
      {reportAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,10,30,0.60)", backdropFilter: "blur(6px)" }}
          onClick={() => setReportAgent(null)}
          data-testid="modal-report-backdrop"
        >
          <div
            className="relative w-full max-w-xl mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg,#1e1533 0%,#16112a 100%)" }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-view-report"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="[font-family:'Inter',Helvetica] font-semibold text-white text-lg leading-7">
                  Evaluation Report
                </h2>
                <p className="[font-family:'Inter',Helvetica] text-xs text-white/50 mt-0.5">
                  {reportAgent.name} · {reportAgent.id}
                </p>
              </div>
              <button
                onClick={() => setReportAgent(null)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                data-testid="button-close-report-modal"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {reportAgent.lastEvalResult ? (
                <>
                  {/* Verdict + confidence */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reportAgent.lastEvalResult.final_verdict.toUpperCase().includes("APPROVE")
                          ? "bg-[#d1fae5] text-[#065f46]"
                          : reportAgent.lastEvalResult.final_verdict.toUpperCase().includes("REJECT")
                          ? "bg-[#ffe4e6] text-[#9f1239]"
                          : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {reportAgent.lastEvalResult.final_verdict}
                    </span>
                    <span className="[font-family:'Inter',Helvetica] text-xs text-white/50">
                      Confidence: <span className="text-white/80 font-semibold">{reportAgent.lastEvalResult.confidence_score}%</span>
                    </span>
                    <span className="[font-family:'Inter',Helvetica] text-xs text-white/40 ml-auto">
                      {reportAgent.lastEval}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="rounded-lg border border-white/10 px-4 py-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="[font-family:'Inter',Helvetica] text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Summary
                    </p>
                    <p className="[font-family:'Inter',Helvetica] text-sm text-white/80 leading-5">
                      {reportAgent.lastEvalResult.summary}
                    </p>
                  </div>

                  {/* Expert breakdown */}
                  <div className="flex flex-col gap-2">
                    <p className="[font-family:'Inter',Helvetica] text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Expert Panel
                    </p>
                    {Object.values(reportAgent.lastEvalResult.experts).map((ex) => (
                      <div key={ex.name} className="rounded-lg border border-white/10 px-4 py-3 flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center justify-between">
                          <span className="[font-family:'Inter',Helvetica] font-semibold text-white text-sm">{ex.name}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ex.score >= 70 ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#ffe4e6] text-[#9f1239]"}`}>
                            {ex.score}/100
                          </span>
                        </div>
                        <p className="[font-family:'Inter',Helvetica] text-xs text-white/55 leading-4">{ex.rationale}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <FileBarChart2Icon className="w-8 h-8 text-white/20" />
                  <p className="[font-family:'Inter',Helvetica] text-sm text-white/40 text-center">
                    No evaluation has been run for this agent yet.<br />
                    Run an evaluation from the Dashboard to see results here.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-white/10">
              <Button
                onClick={() => setReportAgent(null)}
                className="h-9 px-5 bg-white/10 hover:bg-white/15 text-white [font-family:'Inter',Helvetica] font-medium text-sm border border-white/15"
                data-testid="button-close-report-footer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
