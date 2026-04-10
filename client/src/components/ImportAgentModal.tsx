import { useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgents, Agent } from "@/context/AgentsContext";
import { useToast } from "@/hooks/use-toast";

const MODEL_PROVIDERS = ["GPT-4o", "Llama 3.1", "Claude 3.5", "Gemini 1.5"] as const;

const statusColorMap: Record<string, string> = {
  UNTESTED: "bg-[#f0f4ff] text-[#4f39f6]",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ImportAgentModal = ({ open, onClose }: Props) => {
  const { agents, addAgent } = useAgents();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    provider: "GPT-4o" as typeof MODEL_PROVIDERS[number],
    repoUrl: "",
  });

  const handleClose = () => {
    onClose();
    setForm({ name: "", provider: "GPT-4o", repoUrl: "" });
  };

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
    handleClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,10,30,0.60)", backdropFilter: "blur(6px)" }}
      onClick={handleClose}
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
            onClick={handleClose}
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

          {/* Model Provider — full width */}
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

          {/* GitHub Repository URL */}
          <div className="flex flex-col gap-1.5">
            <label className="[font-family:'Inter',Helvetica] text-sm font-medium text-white/70">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              placeholder="e.g. https://github.com/FlashCarrot/VeriMedia"
              className="w-full h-10 rounded-lg border border-white/15 px-3 text-sm text-white placeholder:text-white/30 [font-family:'Inter',Helvetica] focus:outline-none focus:ring-1 focus:ring-[#4f39f6]"
              style={{ background: "rgba(255,255,255,0.06)" }}
              data-testid="input-repo-url"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleClose}
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
  );
};
