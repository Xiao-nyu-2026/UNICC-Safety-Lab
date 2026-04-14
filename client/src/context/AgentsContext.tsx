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
  { name: "UNICC-Chatbot-V2", id: "AGT-003", type: "Conversational AI", status: "REJECTED", statusColor: "bg-[#ffe4e6] text-[#9f1239]", lastEval: "3 hrs ago", evalCount: 887 },
  { name: "GPT-4-Turbo-Prod", id: "AGT-001", type: "Language Model", status: "REJECTED", statusColor: "bg-[#ffe4e6] text-[#9f1239]", lastEval: "Yesterday", evalCount: 1029 },
  { name: "Llama-3-Custom", id: "AGT-002", type: "Fine-tuned Model", status: "APPROVED", statusColor: "bg-[#d1fae5] text-[#065f46]", lastEval: "Apr 07, 2026", evalCount: 412 },
  { name: "Code-Gen-Agent", id: "AGT-004", type: "Code Generation", status: "APPROVED", statusColor: "bg-[#d1fae5] text-[#065f46]", lastEval: "Apr 05, 2026", evalCount: 234 },
  { name: "Finance-Advisor-LLM", id: "AGT-007", type: "Domain-Specific Model", status: "REJECTED", statusColor: "bg-[#ffe4e6] text-[#9f1239]", lastEval: "Apr 03, 2026", evalCount: 67 },
  { name: "Support-Agent-V2", id: "AGT-006", type: "Conversational AI", status: "REJECTED", statusColor: "bg-[#ffe4e6] text-[#9f1239]", lastEval: "Apr 01, 2026", evalCount: 103 },
];

const LS_AGENTS_KEY = "asl_agents_v6";
const EXPECTED_IDS = new Set(INITIAL_AGENTS.map((a) => a.id));

// Evict any stale version keys left over from previous sessions
["asl_agents_v3","asl_agents_v4","asl_agents_v5"].forEach((k) => {
  try { localStorage.removeItem(k); } catch {}
});

function loadAgents(): Agent[] {
  try {
    const raw = localStorage.getItem(LS_AGENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Agent[];
      // Validate: stored set must exactly match expected agent IDs
      const storedIds = new Set(parsed.map((a) => a.id));
      const valid =
        storedIds.size === EXPECTED_IDS.size &&
        [...EXPECTED_IDS].every((id) => storedIds.has(id));
      if (valid) return parsed;
      localStorage.removeItem(LS_AGENTS_KEY);
    }
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
    fetch("/api/agents")
      .then((r) => {
        if (!r.ok) throw new Error("API unavailable");
        return r.json();
      })
      .then((data: Agent[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((apiAgent) => {
            const local = agents.find((a) => a.id === apiAgent.id);
            return local ? { ...apiAgent, lastEvalResult: local.lastEvalResult, status: local.status, statusColor: local.statusColor, lastEval: local.lastEval } : apiAgent;
          });
          setAgents(merged);
        }
      })
      .catch(() => {});
  }, []);

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
