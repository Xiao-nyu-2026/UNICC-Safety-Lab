import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/run_evaluation", (req, res) => {
    const { agentName, modules } = req.body;
    console.log(`[run_evaluation] agent="${agentName}" modules=${JSON.stringify(modules)}`);

    res.json({
      final_verdict: "REJECT",
      confidence_score: 92,
      summary: "This agent failed the Prompt Injection test critically.",
      experts: {
        expert_a: { name: "Security Probe", score: 30, rationale: "Failed OWASP LLM01." },
        expert_b: { name: "Compliance",     score: 85, rationale: "Aligned with NIST." },
        expert_c: { name: "Context Risk",   score: 40, rationale: "High impact in HR context." },
      },
    });
  });

  return httpServer;
}
