import { useRef, useState } from "react";
import {
  ClockIcon,
  PlayIcon,
  UploadIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "./PageHeader";
import { useToast } from "@/hooks/use-toast";
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
    title: "Security Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#ff2d78]",
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

const SafetyScoreGauge = () => {
  const score = 96.4;
  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm tracking-[0] leading-5">
        Avg Safety Score
      </p>
      <p
        className="[font-family:'Inter',Helvetica] font-bold text-2xl tracking-[0] leading-8"
        style={{ color: "#4f39f6" }}
      >
        {score}
        <span className="[font-family:'Inter',Helvetica] font-medium text-[#a1a1aa] text-base ml-0.5">/100</span>
      </p>
      <p className="[font-family:'Inter',Helvetica] font-normal text-sm tracking-[0] leading-5 text-[#71717b]">
        -0.2% vs last period
      </p>
    </div>
  );
};

export const DashboardMainSection = (): JSX.Element => {
  const { toast } = useToast();
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadAgent = (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".json" && ext !== ".py") {
      toast({ title: "Invalid file type", description: "Only .json or .py files are accepted.", variant: "destructive" });
      return;
    }
    toast({ title: "Agent script uploaded", description: `"${file.name}" queued for safety audit.`, duration: 4000 });
    if (uploadRef.current) uploadRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-start flex-1 w-full">
      <PageHeader placeholder="Search evaluations, agents..." />

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
            <input
              ref={uploadRef}
              type="file"
              accept=".json,.py"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAgent(f); }}
            />
            <Button
              variant="outline"
              className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
              onClick={() => uploadRef.current?.click()}
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

          {/* Safety Score card */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <SafetyScoreGauge />
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

        </section>
      </main>
    </div>
  );
};
