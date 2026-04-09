import type { Express } from "express";
import { createServer, type Server } from "http";
import { exec } from "child_process";
import { storage } from "./storage";

// Extract the RECOMMENDATION line from a markdown expert block
function extractRecommendation(text: string): string {
  const match = text.match(/###\s*Recommendation\s*\n+([A-Z]+)/i);
  return match ? match[1].toUpperCase().trim() : "REVIEW";
}

// Extract the CONFIDENCE line and map to a numeric score
function extractConfidence(text: string): number {
  const match = text.match(/###\s*Confidence\s*\n+(\w+)/i);
  const level = match ? match[1].toLowerCase() : "medium";
  return level === "high" ? 85 : level === "low" ? 35 : 60;
}

// Pull a short rationale from the Findings or Summary block
function extractRationale(text: string): string {
  const findingsMatch = text.match(/###\s*Findings\s*\n+([\s\S]*?)(?=\n###|$)/i);
  if (findingsMatch) {
    const firstBullet = findingsMatch[1].trim().split("\n")[0].replace(/^[-*]\s*/, "");
    if (firstBullet) return firstBullet;
  }
  const summaryMatch = text.match(/###\s*Summary\s*\n+([\s\S]*?)(?=\n###|$)/i);
  if (summaryMatch) {
    return summaryMatch[1].trim().split("\n")[0];
  }
  return text.slice(0, 120).replace(/#+/g, "").trim();
}

// Map raw Python output → the shape the React frontend expects
function transformPythonOutput(raw: Record<string, any>) {
  const synth = raw.synthesis_text ?? raw.expert_c_text ?? "";
  const verdict = extractRecommendation(synth) || "REVIEW";

  const confidence = extractConfidence(synth);

  // Derive a one-sentence summary from synthesis
  const summaryMatch = (synth as string).match(/###\s*Summary\s*\n+([\s\S]*?)(?=\n###|$)/i);
  const summary = summaryMatch
    ? summaryMatch[1].trim().split("\n")[0]
    : "Evaluation complete. See expert breakdown below.";

  return {
    final_verdict: verdict,
    confidence_score: confidence,
    summary,
    experts: {
      expert_a: {
        name: "Security Probe",
        score: extractConfidence(raw.expert_a_text ?? ""),
        rationale: extractRationale(raw.expert_a_text ?? ""),
      },
      expert_b: {
        name: "Compliance",
        score: extractConfidence(raw.expert_b_text ?? ""),
        rationale: extractRationale(raw.expert_b_text ?? ""),
      },
      expert_c: {
        name: "Context Risk",
        score: extractConfidence(raw.expert_c_text ?? ""),
        rationale: extractRationale(raw.expert_c_text ?? ""),
      },
    },
    // also pass through the full raw data for future use
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

    const safeAgent = String(agentName).replace(/"/g, '\\"');
    const cmd = `python3 python_engine/council_eval.py "${safeAgent}"`;

    console.log(`[run_evaluation] executing: ${cmd}`);

    exec(cmd, { env: process.env }, (error, stdout, stderr) => {
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
