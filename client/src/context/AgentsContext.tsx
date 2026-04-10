import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Agent = {
  name: string;
  id: string;
  type: string;
  status: string;
  statusColor: string;
  lastEval: string;
  evalCount: number;
  hasIcon?: boolean;
  lastEvalResult?: EvalResult | null;
};

export type ExpertData = {
  name: string;
  verdict: string;
  findings: string[];
  risks: string[];
  /* legacy compat — may be present in older localStorage snapshots */
  score?: number;
  rationale?: string;
};

export type EvalResult = {
  final_verdict: string;
  confidence_score: number;
  summary: string;
  synthesis_text?: string;
  experts: Record<string, ExpertData>;
};

const verdictColorMap: Record<string, string> = {
  APPROVE: "bg-[#d1fae5] text-[#065f46]",
  APPROVED: "bg-[#d1fae5] text-[#065f46]",
  REJECT: "bg-[#ffe4e6] text-[#9f1239]",
  REJECTED: "bg-[#ffe4e6] text-[#9f1239]",
  REVIEW: "bg-[#fef3c7] text-[#92400e]",
};

const INITIAL_AGENTS: Agent[] = [
  { name: "GPT-4-Turbo-Prod", id: "AGT-001", type: "Language Model", status: "APPROVED", statusColor: "bg-[#d1fae5] text-[#065f46]", lastEval: "10 mins ago", evalCount: 1029 },
  { name: "Llama-3-Custom", id: "AGT-002", type: "Fine-tuned Model", status: "Running Eval", statusColor: "bg-zinc-100 text-zinc-900", lastEval: "1 hr ago", evalCount: 412, hasIcon: true },
  { name: "Customer-Bot-V1", id: "AGT-003", type: "Conversational AI", status: "REJECTED", statusColor: "bg-[#ffe4e6] text-[#9f1239]", lastEval: "3 hrs ago", evalCount: 887 },
  { name: "Code-Gen-Agent", id: "AGT-004", type: "Code Generation", status: "APPROVED", statusColor: "bg-[#d1fae5] text-[#065f46]", lastEval: "1 day ago", evalCount: 234 },
  { name: "Data-Pipeline-Bot", id: "AGT-005", type: "Data Processing", status: "APPROVED", statusColor: "bg-[#d1fae5] text-[#065f46]", lastEval: "2 days ago", evalCount: 567 },
  { name: "Support-Agent-V2", id: "AGT-006", type: "Conversational AI", status: "Inactive", statusColor: "bg-zinc-100 text-zinc-500", lastEval: "5 days ago", evalCount: 103 },
];

const LS_AGENTS_KEY = "asl_agents_v1";

function loadAgents(): Agent[] {
  try {
    const raw = localStorage.getItem(LS_AGENTS_KEY);
    if (raw) return JSON.parse(raw) as Agent[];
  } catch {}
  return INITIAL_AGENTS;
}

function saveAgents(agents: Agent[]) {
  try {
    localStorage.setItem(LS_AGENTS_KEY, JSON.stringify(agents));
  } catch {}
}

type AgentsContextType = {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgentAfterEval: (agentName: string, verdict: string, result: EvalResult) => void;
};

const AgentsContext = createContext<AgentsContextType>({
  agents: INITIAL_AGENTS,
  addAgent: () => {},
  updateAgentAfterEval: () => {},
});

export const AgentsProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<Agent[]>(() => loadAgents());

  useEffect(() => {
    saveAgents(agents);
  }, [agents]);

  const addAgent = (agent: Agent) =>
    setAgents((prev) => [...prev, agent]);

  const updateAgentAfterEval = (agentName: string, verdict: string, result: EvalResult) => {
    const normalized = verdict.toUpperCase();
    const color = verdictColorMap[normalized] ?? "bg-zinc-100 text-zinc-700";
    setAgents((prev) =>
      prev.map((a) =>
        a.name === agentName
          ? { ...a, status: normalized, statusColor: color, lastEval: "Just now", hasIcon: false, lastEvalResult: result }
          : a
      )
    );
  };

  return (
    <AgentsContext.Provider value={{ agents, addAgent, updateAgentAfterEval }}>
      {children}
    </AgentsContext.Provider>
  );
};

export const useAgents = () => useContext(AgentsContext);
