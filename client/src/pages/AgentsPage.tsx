import {
  BotIcon,
  ClockIcon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  UploadIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { SidebarSection } from "./sections/SidebarSection";
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
    title: "Active Agents",
    value: "11",
    change: "78.5% of total",
    changeColor: "text-[#71717b]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#d0fae5]",
    iconColor: "text-[#004f3b]",
  },
  {
    title: "Avg Safety Score",
    value: "96.4%",
    change: "-0.2% vs last period",
    changeColor: "text-[#71717b]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#f0f4ff]",
    iconColor: "text-[#4f39f6]",
  },
  {
    title: "Security Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#e7000b]",
    Icon: ShieldCheckIcon,
    iconBg: "bg-[#ffe2e2]",
    iconColor: "text-[#82181a]",
  },
];

const agents = [
  {
    name: "GPT-4-Turbo-Prod",
    id: "AGT-001",
    type: "Language Model",
    status: "Active",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    lastEval: "10 mins ago",
    safetyScore: 99,
    scoreColor: "bg-[#00bc7d]",
    evalCount: 1029,
  },
  {
    name: "Llama-3-Custom",
    id: "AGT-002",
    type: "Fine-tuned Model",
    status: "Running Eval",
    statusColor: "bg-zinc-100 text-zinc-900",
    lastEval: "1 hr ago",
    safetyScore: null,
    scoreColor: "",
    evalCount: 412,
    hasIcon: true,
  },
  {
    name: "Customer-Bot-V1",
    id: "AGT-003",
    type: "Conversational AI",
    status: "Flagged",
    statusColor: "bg-[#ffe2e2] text-[#82181a]",
    lastEval: "3 hrs ago",
    safetyScore: 45,
    scoreColor: "bg-[#fb2c36]",
    evalCount: 887,
  },
  {
    name: "Code-Gen-Agent",
    id: "AGT-004",
    type: "Code Generation",
    status: "Active",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    lastEval: "1 day ago",
    safetyScore: 95,
    scoreColor: "bg-[#00bc7d]",
    evalCount: 234,
  },
  {
    name: "Data-Pipeline-Bot",
    id: "AGT-005",
    type: "Data Processing",
    status: "Active",
    statusColor: "bg-[#d0fae5] text-[#004f3b]",
    lastEval: "2 days ago",
    safetyScore: 100,
    scoreColor: "bg-[#00bc7d]",
    evalCount: 567,
  },
  {
    name: "Support-Agent-V2",
    id: "AGT-006",
    type: "Conversational AI",
    status: "Inactive",
    statusColor: "bg-zinc-100 text-zinc-500",
    lastEval: "5 days ago",
    safetyScore: 88,
    scoreColor: "bg-[#00bc7d]",
    evalCount: 103,
  },
];

export const AgentsPage = (): JSX.Element => {
  const [, navigate] = useLocation();
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-start w-full">
            {/* Top header bar */}
            <header className="flex w-full h-16 items-center justify-between px-8 bg-white border-b border-zinc-200">
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
              {/* Page title + actions */}
              <section className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                    Agents
                  </h1>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                    Manage and monitor all AI agents connected to SafeAI Eval.
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
                  <Button className="h-10 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                </div>
              </section>

              {/* Stats cards */}
              <section className="grid grid-cols-4 gap-4 w-full">
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
                          Safety Score
                        </TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                          Evals Run
                        </TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                          Last Evaluation
                        </TableHead>
                        <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent, index) => (
                        <TableRow key={index} className="border-[#0000001a]">
                          <TableCell className="pl-6">
                            <button
                              onClick={() => navigate(`/agents/${agent.id}`)}
                              className="flex flex-col text-left hover:opacity-70 transition-opacity"
                              data-testid={`button-agent-detail-${agent.id}`}
                            >
                              <span className="[font-family:'Inter',Helvetica] font-medium text-[#4f39f6] text-sm underline-offset-2 hover:underline">
                                {agent.name}
                              </span>
                              <span className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs">
                                {agent.id}
                              </span>
                            </button>
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
                          <TableCell>
                            {agent.safetyScore !== null ? (
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={agent.safetyScore}
                                  className="w-16 h-2 bg-zinc-100"
                                  indicatorClassName={agent.scoreColor}
                                />
                                <span className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                                  {agent.safetyScore}
                                </span>
                              </div>
                            ) : (
                              <span className="[font-family:'Inter',Helvetica] font-normal italic text-[#9f9fa9] text-sm">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#52525c] text-sm">
                            {agent.evalCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                            {agent.lastEval}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[#4f39f6] hover:text-[#4f39f6] hover:bg-[#f0f4ff] text-xs font-medium"
                              >
                                <PlayIcon className="w-3 h-3 mr-1" />
                                Run Eval
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontalIcon className="w-4 h-4 text-[#71717b]" />
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
      </div>
  );
};
