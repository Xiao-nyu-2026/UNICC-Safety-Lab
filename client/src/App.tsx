import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { SaasDashboardUi } from "@/pages/SaasDashboardUi";
import { AgentsPage } from "@/pages/AgentsPage";
import { EvaluationsPage } from "@/pages/EvaluationsPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SettingsPage } from "@/pages/SettingsPage";

const TOTAL = 50;
const START = 23;

function AuditCycleWidget() {
  const [current, setCurrent] = useState(START);
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    if (current >= TOTAL) return;
    const id = setInterval(() => {
      setCurrent((n) => {
        if (n >= TOTAL) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
      setTicked(true);
      setTimeout(() => setTicked(false), 300);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((current / TOTAL) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .digital-font {
          font-family: 'Share Tech Mono', 'Courier New', monospace;
        }
        .neon-violet {
          color: #cc00ff;
          text-shadow:
            0 0 6px #cc00ff,
            0 0 14px #9b00cc,
            0 0 28px #6600aa;
        }
        .neon-violet-dim {
          color: #9b5fc0;
          text-shadow: 0 0 4px #7b00d440;
        }
        @keyframes digit-tick {
          0%   { opacity: 0.4; transform: translateY(-3px); }
          100% { opacity: 1;   transform: translateY(0);    }
        }
        .digit-tick {
          animation: digit-tick 0.25s ease-out;
        }
      `}</style>

      <div
        className="fixed bottom-5 right-5 z-50 select-none"
        style={{
          background: "#0e0012dd",
          border: "1px solid #7b00d440",
          borderRadius: 10,
          boxShadow: "0 4px 20px #00000044, inset 0 1px 0 #cc00ff12",
          padding: "9px 14px 10px",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Single line: label + counter */}
        <div className="flex items-baseline gap-2">
          <span
            className="digital-font neon-violet-dim"
            style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Audit Cycle
          </span>
          <span
            className={`digital-font neon-violet leading-none ${ticked ? "digit-tick" : ""}`}
            style={{ fontSize: 18, letterSpacing: "0.06em" }}
          >
            {String(current).padStart(2, "0")}
            <span className="neon-violet-dim" style={{ fontSize: 13 }}>/{TOTAL}</span>
          </span>
        </div>

        {/* Progress track only, no text */}
        <div
          className="mt-2 rounded-full overflow-hidden"
          style={{ height: 2, background: "#cc00ff18" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #6600aa, #cc00ff)",
              boxShadow: "0 0 5px #cc00ff77",
              transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
      </div>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SaasDashboardUi} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/evaluations" component={EvaluationsPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AuditCycleWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
