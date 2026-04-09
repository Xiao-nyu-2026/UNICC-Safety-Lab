import { useRef, useState } from "react";
import {
  PlayIcon,
  UploadIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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


const evaluationsData = [
  {
    id: "EV-1030",
    target: "UNICC-Chatbot-V2",
    verdict: "REVIEW",
    verdictColor: "bg-[#f59e0b] text-white",
    date: "Today",
  },
  {
    id: "EV-1029",
    target: "Core-NLP-Model",
    verdict: "REJECT",
    verdictColor: "bg-[#e7000b] text-white",
    date: "Yesterday",
  },
  {
    id: "EV-1028",
    target: "HR-Data-Processor",
    verdict: "APPROVE",
    verdictColor: "bg-[#009966] text-white",
    date: "Oct 24, 2023",
  },
  {
    id: "EV-1027",
    target: "Image-Gen-API",
    verdict: "APPROVE",
    verdictColor: "bg-[#009966] text-white",
    date: "Oct 22, 2023",
  },
];


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

        {/* Stats row */}
        <section className="grid grid-cols-4 gap-4 w-full">
          {/* System Pass Rate */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                System Pass Rate
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                82%
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          {/* Total Evaluations */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Total Evaluations
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                1,284
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                AI Agents Audited
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Pending Reviews
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-[#f59e0b] text-2xl leading-8 mt-1">
                14
              </p>
              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-2">
                Requires Human Arbiter
              </p>
            </CardContent>
          </Card>

          {/* Expert Council Status */}
          <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
            <CardContent className="pt-6 pb-5 px-6">
              <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm leading-5">
                Expert Council Status
              </p>
              <p className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl leading-8 mt-1">
                3 / 3
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#009966] flex-shrink-0" />
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5">
                  All LLM Modules Online
                </p>
              </div>
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
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm pl-6 w-[120px]">ID</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">AI Agent Repository</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm w-[160px]">Verdict</TableHead>
                    <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right pr-6 w-[140px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluationsData.map((evaluation, index) => (
                    <TableRow key={index} className="border-[#0000001a]">
                      <TableCell className="pl-6">
                        <span className="[font-family:'Inter',Helvetica] font-medium text-[#4f39f6] text-sm">
                          {evaluation.id}
                        </span>
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-medium text-zinc-900 text-sm">
                        {evaluation.target}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${evaluation.verdictColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-semibold text-xs h-auto px-3 py-1 tracking-wide`}>
                          {evaluation.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-right pr-6">
                        {evaluation.date}
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
