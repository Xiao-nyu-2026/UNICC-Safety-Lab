import { useState, useRef } from "react";
import {
  BotIcon,
  ClockIcon,
  FileBarChart2Icon,
  FilterIcon,
  SearchIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  XIcon,
  PlusIcon,
} from "lucide-react";
import { useLocation } from "wouter";
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
import { useToast } from "@/hooks/use-toast";

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
    iconBg: "bg-[#f0f4ff]",
    iconColor: "text-[#4f39f6]",
  },
  {
    title: "Security Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#ff2d78]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#ffe0eb]",
    iconColor: "text-[#ff2d78]",
  },
];

const MODEL_PROVIDERS = ["GPT-4o", "Llama 3.1", "Claude 3.5", "Gemini 1.5"] as const;
const DEPARTMENTS = ["Legal", "HR", "Customer Service", "Finance", "Engineering", "Operations"] as const;

const STATUS_OPTIONS = ["All Agents", "APPROVED", "REJECTED", "Running Eval"] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-[#d1fae5] text-[#065f46]",
  REJECTED: "bg-[#ffe4e6] text-[#9f1239]",
  UNTESTED: "bg-[#f0f4ff] text-[#4f39f6]",
  "Running Eval": "bg-zinc-100 text-zinc-900",
  Inactive: "bg-zinc-100 text-zinc-500",
};

export const AgentsPage = (): JSX.Element => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { agents, addAgent } = useAgents();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusOption>("All Agents");
  const [importOpen, setImportOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    provider: "GPT-4o" as typeof MODEL_PROVIDERS[number],
    department: "Legal" as typeof DEPARTMENTS[number],
    description: "",
  });
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "All Agents" || agent.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddAgent = () => {
    if (!form.name.trim()) return;
    const idx = agents.length + 1;
    const newId = `AGT-${String(idx + 10).padStart(3, "0")}`;
    const newAgent: Agent = {
      name: form.name.trim(),
      id: newId,
      type: form.provider,
      status: "UNTESTED",
      statusColor: statusColorMap["UNTESTED"],
      lastEval: "Never",
      evalCount: 0,
    };
    addAgent(newAgent);
    toast({
      title: "Agent registered",
      description: `Agent ${form.name.trim()} successfully registered to UNICC AI Safety Lab.`,
      className: "border-[#4f39f6] bg-white",
    });
    setImportOpen(false);
    setForm({ name: "", provider: "GPT-4o", department: "Legal", description: "" });
    setFileName(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
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
                <Button
                  onClick={() => setImportOpen(true)}
                  className="h-10 px-4 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm rounded-lg"
                  data-testid="button-import-agent"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Import Agent
                </Button>
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
                              onClick={() => navigate(`/agents/${agent.id}`)}
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

      {/* ── Import Agent Modal ── */}
      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15,10,30,0.60)", backdropFilter: "blur(6px)" }}
          onClick={() => setImportOpen(false)}
          data-testid="modal-import-backdrop"
        >
          <div
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg,#1e1533 0%,#16112a 100%)" }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-import-agent"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="[font-family:'Inter',Helvetica] font-semibold text-white text-lg leading-7">
                  Import Agent
                </h2>
                <p className="[font-family:'Inter',Helvetica] text-xs text-white/50 mt-0.5">
                  Register a new AI agent to UNICC AI Safety Lab.
                </p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                data-testid="button-close-import-modal"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Agent Name */}
              <div className="flex flex-col gap-1.5">
                <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                  Agent Name <span className="text-[#ff2d78]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Legal-Analysis-Bot"
                  className="w-full h-10 rounded-lg border border-white/15 px-3 text-sm text-white placeholder:text-white/30 [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6]"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  data-testid="input-agent-name"
                />
              </div>

              {/* Model Provider + Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                    Model Provider
                  </label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value as typeof MODEL_PROVIDERS[number] })}
                    className="w-full h-10 rounded-lg border border-white/15 px-3 text-sm text-white [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6]"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    data-testid="select-model-provider"
                  >
                    {MODEL_PROVIDERS.map((p) => (
                      <option key={p} value={p} className="bg-[#1e1533]">{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as typeof DEPARTMENTS[number] })}
                    className="w-full h-10 rounded-lg border border-white/15 px-3 text-sm text-white [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6]"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    data-testid="select-department"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-[#1e1533]">{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the agent's purpose..."
                  rows={2}
                  className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/30 [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6] resize-none"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  data-testid="textarea-description"
                />
              </div>

              {/* File Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
                  Configuration File
                </label>
                <div
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 cursor-pointer transition-colors ${
                    dragOver ? "border-[#4f39f6] bg-[#4f39f6]/10" : "border-white/15 hover:border-white/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) setFileName(file.name);
                  }}
                  onClick={() => fileRef.current?.click()}
                  data-testid="dropzone-config-file"
                >
                  <UploadCloudIcon className="w-6 h-6 text-white/40" />
                  <p className="[font-family:'Inter',Helvetica] text-xs text-white/40 text-center">
                    {fileName
                      ? <span className="text-[#c4b5fd] font-medium">{fileName}</span>
                      : <><span className="text-white/60">Drop file here or</span> <span className="text-[#c4b5fd]">browse</span></>
                    }
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFileName(file.name);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setImportOpen(false)}
                className="h-10 px-5 border-white/15 bg-white/5 text-white/70 [font-family:'Inter',Helvetica] font-medium text-sm hover:bg-white/10 hover:text-white hover:border-white/25"
                data-testid="button-cancel-import"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAgent}
                disabled={!form.name.trim()}
                className="h-10 px-5 bg-[#4f39f6] hover:bg-[#3d2bc4] text-white [font-family:'Inter',Helvetica] font-medium text-sm disabled:opacity-50"
                data-testid="button-confirm-import"
              >
                Confirm Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
