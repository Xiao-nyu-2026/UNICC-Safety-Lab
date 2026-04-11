import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import http from "http";
import { storage } from "./storage";

const FASTAPI_PORT = 8000;
let fastapiReady = false;

function startFastAPI() {
  const py = spawn("python3", ["main.py"], {
    env: { ...process.env, FASTAPI_PORT: String(FASTAPI_PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  py.stdout?.on("data", (d: Buffer) => {
    const msg = d.toString();
    console.log(`[fastapi] ${msg.trim()}`);
    if (msg.includes("Uvicorn running") || msg.includes("Started server")) {
      fastapiReady = true;
    }
  });
  py.stderr?.on("data", (d: Buffer) => {
    const msg = d.toString();
    console.log(`[fastapi] ${msg.trim()}`);
    if (msg.includes("Uvicorn running") || msg.includes("Application startup complete")) {
      fastapiReady = true;
    }
  });
  py.on("exit", (code) => {
    console.warn(`[fastapi] process exited with code ${code}`);
    fastapiReady = false;
    setTimeout(startFastAPI, 3000);
  });
  console.log(`[fastapi] spawned on port ${FASTAPI_PORT}`);
}

function proxyToFastAPI(
  method: string,
  path: string,
  body: string | null,
  res: any
) {
  const opts: http.RequestOptions = {
    hostname: "127.0.0.1",
    port: FASTAPI_PORT,
    path,
    method,
    headers: { "Content-Type": "application/json" },
    timeout: 90_000,
  };
  const proxyReq = http.request(opts, (proxyRes) => {
    let data = "";
    proxyRes.on("data", (chunk: Buffer) => (data += chunk.toString()));
    proxyRes.on("end", () => {
      res.status(proxyRes.statusCode ?? 200);
      res.setHeader("Content-Type", "application/json");
      res.end(data);
    });
  });
  proxyReq.on("error", (err: Error) => {
    console.error(`[proxy] error: ${err.message}`);
    res.status(502).json({ error: "FastAPI backend unavailable", detail: err.message });
  });
  if (body) proxyReq.write(body);
  proxyReq.end();
}

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

function extractRecommendation(text: string): string {
  for (const section of ["Final Verdict", "Recommendation"]) {
    const re = new RegExp(`###\\s*${section}\\s*\\n+([A-Z]+)`, "i");
    const match = text.match(re);
    if (match) return match[1].toUpperCase().trim();
  }
  return "REVIEW";
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

  startFastAPI();

  app.get("/api/agents", (_req, res) => {
    proxyToFastAPI("GET", "/api/agents", null, res);
  });

  app.post("/api/evaluate", (req, res) => {
    proxyToFastAPI("POST", "/api/evaluate", JSON.stringify(req.body), res);
  });

  app.get("/api/health", (_req, res) => {
    proxyToFastAPI("GET", "/api/health", null, res);
  });

  app.post("/api/run_evaluation", (req, res) => {
    const { agentName, modules } = req.body;

    if (!agentName || typeof agentName !== "string") {
      return res.status(400).json({ error: "agentName is required" });
    }

    const sanitized = agentName.replace(/[^a-zA-Z0-9\-_.\s]/g, "");
    if (!sanitized || sanitized.length > 100) {
      return res.status(400).json({ error: "Invalid agentName" });
    }

    const provider = process.env.OPENAI_API_KEY
      ? "openai"
      : process.env.ANTHROPIC_API_KEY
        ? "anthropic"
        : "mock";

    const args = ["python_engine/council_eval.py", sanitized, "--provider", provider];
    console.log(`[run_evaluation] provider=${provider} spawn: python3 ${args.join(" ")}`);

    const child = spawn("python3", args, { env: process.env, timeout: 90_000 });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr?.on("data", (d: Buffer) => (stderr += d.toString()));

    child.on("close", (code) => {
      if (stderr) {
        console.warn(`[run_evaluation] stderr: ${stderr}`);
      }
      if (code !== 0) {
        console.error(`[run_evaluation] exited with code ${code}`);
        return res.status(500).json({ error: "Evaluation process failed" });
      }
      try {
        const raw = JSON.parse(stdout);
        const result = transformPythonOutput(raw);
        console.log(`[run_evaluation] verdict=${result.final_verdict} confidence=${result.confidence_score}`);
        return res.json(result);
      } catch (parseErr) {
        console.error(`[run_evaluation] JSON parse error. stdout was:\n${stdout}`);
        return res.status(500).json({ error: "Failed to parse evaluation output" });
      }
    });
  });

  return httpServer;
}
