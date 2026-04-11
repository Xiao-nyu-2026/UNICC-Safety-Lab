import type { Express } from "express";
import { createServer, type Server } from "http";
import { exec } from "child_process";
import { storage } from "./storage";

// Extract bullet-list items from a named markdown section
function extractBullets(text: string, section: string): string[] {
  const re = new RegExp(`###\\s*${section}\\s*\\n+([\\s\\S]*?)(?=\\n###|$)`, "i");
  const match = text.match(re);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 3);
}

// Extract full text of a named markdown section (for synthesis display)
function extractSection(text: string, section: string): string {
  const re = new RegExp(`###\\s*${section}\\s*\\n+([\\s\\S]*?)(?=\\n###|$)`, "i");
  const match = text.match(re);
  return match ? match[1].trim() : "";
}

// Extract the RECOMMENDATION line from a markdown expert block
function extractRecommendation(text: string): string {
  const match = text.match(/###\s*Recommendation\s*\n+([A-Z]+)/i);
  return match ? match[1].toUpperCase().trim() : "REVIEW";
}

// Extract the CONFIDENCE level and map to a numeric score
function extractConfidence(text: string): number {
  const match = text.match(/###\s*Confidence\s*\n+(\w+)/i);
  const level = match ? match[1].toLowerCase() : "medium";
  return level === "high" ? 85 : level === "low" ? 35 : 60;
}

// Map raw Python output → the shape the React frontend expects
function transformPythonOutput(raw: Record<string, any>) {
  const synth: string = raw.synthesis_text ?? raw.expert_c_text ?? "";

  // Derive overall verdict: prefer synthesis recommendation, fallback REVIEW
  const verdict = extractRecommendation(synth) || "REVIEW";
  const confidence = extractConfidence(synth);

  // One-sentence summary from the synthesis Summary block
  const summaryLines = extractBullets(synth, "Summary");
  const summary =
    summaryLines[0] ??
    extractSection(synth, "Summary").split("\n")[0] ??
    "Evaluation complete. See expert breakdown below.";

  // Full synthesis text for the Audit Synthesis card
  const synthesisText =
    extractSection(synth, "Summary") ||
    extractSection(synth, "Recommendation") ||
    synth.replace(/###.*\n/g, "").trim().slice(0, 600) ||
    "Synthesis not available.";

  function buildExpert(text: string, fallbackName: string) {
    const findings = extractBullets(text, "Findings");
    const risks    = extractBullets(text, "Risks");
    const rec      = extractRecommendation(text);
    // Defensive: if no Findings/Risks blocks, fall back to first line of Summary
    const fallbackFinding = extractSection(text, "Summary").split("\n")[0] ?? text.slice(0, 80);
    return {
      name: fallbackName,
      verdict: rec,
      findings: findings.length > 0 ? findings : (fallbackFinding ? [fallbackFinding] : ["No specific findings reported."]),
      risks:    risks,
    };
  }

  return {
    final_verdict: verdict,
    confidence_score: confidence,
    summary,
    synthesis_text: synthesisText,
    experts: {
      expert_a: buildExpert(raw.expert_a_text ?? "", "Security & Compliance Probe"),
      expert_b: buildExpert(raw.expert_b_text ?? "", "Governance & Risk Workflow"),
      expert_c: buildExpert(raw.expert_c_text ?? "", "Contextual Risk Arbiter"),
    },
    _raw: raw,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/run_evaluation", (req, res) => {
    const { agentName, modules } = req.body;

    if (!agentName) {
      return res.status(400).json({ error: "agentName is required" });
    }

    // Auto-detect LLM provider from Replit Secrets
    const provider = process.env.OPENAI_API_KEY
      ? "openai"
      : process.env.ANTHROPIC_API_KEY
        ? "anthropic"
        : "mock";

    const safeAgent = String(agentName).replace(/"/g, '\\"');
    const cmd = `python3 python_engine/council_eval.py "${safeAgent}" --provider ${provider}`;

    console.log(`[run_evaluation] provider=${provider} executing: ${cmd}`);

    // 90-second timeout — real LLM calls (3 experts + critique + synthesis) take time
    exec(cmd, { env: process.env, timeout: 90_000 }, (error, stdout, stderr) => {
      if (stderr) {
        console.warn(`[run_evaluation] stderr: ${stderr}`);
      }

      if (error) {
        console.error(`[run_evaluation] exec error: ${error.message}`);
        return res.status(500).json({ error: error.message, stderr });
      }

      try {
        const raw = JSON.parse(stdout);
        const result = transformPythonOutput(raw);
        console.log(`[run_evaluation] verdict=${result.final_verdict} confidence=${result.confidence_score}`);
        return res.json(result);
      } catch (parseErr) {
        console.error(`[run_evaluation] JSON parse error. stdout was:\n${stdout}`);
        return res.status(500).json({
          error: "Failed to parse Python output as JSON",
          stdout,
          stderr,
        });
      }
    });
  });

  return httpServer;
}
