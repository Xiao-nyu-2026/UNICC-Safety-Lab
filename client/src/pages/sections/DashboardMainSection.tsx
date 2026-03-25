import {
  ActivityIcon,
  ClockIcon,
  PlayIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react";
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
    title: "Avg Safety Score",
    value: "96.4%",
    change: "-0.2% vs last",
    changeColor: "text-[#71717b]",
    icon: "/figmaAssets/container-2.svg",
  },
  {
    title: "Active Flags",
    value: "3",
    change: "Requires attention",
    changeColor: "text-[#e7000b]",
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

const activityFeedData = [
  {
    text: "Evaluation EV-1029 completed successfully.",
    time: "10 mins ago",
    icon: "/figmaAssets/container-6.svg",
    hasLine: true,
  },
  {
    text: "Critical failure detected in Customer-Bot-V1 (Jailbreak Attempts).",
    time: "3 hrs ago",
    icon: "/figmaAssets/container-5.svg",
    hasLine: true,
  },
  {
    text: "New agent 'Llama-3-Custom' was uploaded by Admin User.",
    time: "5 hrs ago",
    icon: "/figmaAssets/container-1.svg",
    hasLine: true,
  },
  {
    text: "Safety evaluation module 'Prompt Injection V2' updated.",
    time: "1 day ago",
    icon: "/figmaAssets/container.svg",
    hasLine: false,
  },
];

export const DashboardMainSection = (): JSX.Element => {
  return (
    <div className="flex flex-col items-start flex-1 w-full">
      <header className="flex w-full h-16 items-center justify-between px-8 py-0 bg-white border-b border-zinc-200">
        <div className="relative flex-1 max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
            <Input
              placeholder="Search evaluations, agents..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
            />
          </div>
        </div>

        <img
          className="w-[84px] h-9"
          alt="User menu"
          src="/figmaAssets/div.svg"
        />
      </header>

      <main className="flex flex-col w-full items-start px-8 pt-8 pb-0 flex-1 overflow-hidden">
        <div className="flex flex-col items-start gap-6 w-full">
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
              <Button
                variant="outline"
                className="h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Agent
              </Button>

              <Button className="h-10 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                <PlayIcon className="w-4 h-4 mr-2 fill-white" />
                Start Evaluation
              </Button>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4 w-full">
            {statsCards.map((card, index) => (
              <Card
                key={index}
                className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]"
              >
                <CardContent className="pt-6 pb-0 px-6">
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
                  <p
                    className={`[font-family:'Inter',Helvetica] font-normal text-sm tracking-[0] leading-5 ${card.changeColor}`}
                  >
                    {card.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="flex gap-6 w-full">
            <Card className="flex-1 border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-6 py-6">
                  <div className="flex flex-col">
                    <h2 className="[font-family:'Inter',Helvetica] font-normal text-zinc-950 text-lg tracking-[-0.45px] leading-[18px]">
                      Recent Evaluations
                    </h2>
                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5 mt-1">
                      Review the latest automated safety tests across your
                      agents.
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
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Agent
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Evaluation Module
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Status
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm">
                        Score
                      </TableHead>
                      <TableHead className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-sm text-right">
                        Time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationsData.map((evaluation, index) => (
                      <TableRow key={index} className="border-[#0000001a]">
                        <TableCell>
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
                          <Badge
                            className={`${evaluation.statusColor} border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs h-auto px-3 py-1`}
                          >
                            {evaluation.hasIcon && (
                              <ClockIcon className="w-3 h-3 mr-1" />
                            )}
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
                        <TableCell className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm text-right">
                          {evaluation.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="w-[328px] border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
              <CardContent className="p-0">
                <div className="flex flex-col gap-1.5 px-6 py-6">
                  <div className="flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5" />
                    <h2 className="[font-family:'Inter',Helvetica] font-normal text-zinc-950 text-lg tracking-[-0.45px] leading-[18px]">
                      Activity Feed
                    </h2>
                  </div>
                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5">
                    Latest system and evaluation events.
                  </p>
                </div>

                <div className="flex flex-col gap-6 px-6 pb-6">
                  <div className="flex flex-col gap-6">
                    {activityFeedData.map((activity, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              className="w-8 h-8"
                              alt="ActivityIcon icon"
                              src={activity.icon}
                            />
                            {activity.hasLine && (
                              <div className="absolute top-8 left-[15px] w-0.5 h-[50px] bg-zinc-100" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <p className="[font-family:'Inter',Helvetica] font-normal text-zinc-800 text-sm tracking-[0] leading-[19.2px]">
                              {activity.text}
                            </p>
                            <p className="[font-family:'Inter',Helvetica] font-medium text-[#71717b] text-xs tracking-[0] leading-4">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-10 [font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm"
                  >
                    View Event Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};
