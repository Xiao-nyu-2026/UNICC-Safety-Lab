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
        if (n >= TOTAL) { clearInterval(id); return n; }
        return n + 1;
      });
      setTicked(true);
      setTimeout(() => setTicked(false), 300);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((current / TOTAL) * 100);

  return (
    <div
      className="fixed bottom-5 right-5 z-50 select-none"
      style={{
        background: "#fff",
        border: "1px solid #e4e4e7",
        borderRadius: 10,
        boxShadow: "0px 1px 2px -1px #0000001a, 0px 1px 3px #0000001a",
        padding: "10px 14px 11px",
      }}
    >
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: "'Inter', Helvetica",
            fontSize: 11,
            fontWeight: 500,
            color: "#71717b",
            letterSpacing: "0.02em",
          }}
        >
          Audit Cycle
        </span>
        <span
          style={{
            fontFamily: "'Inter', Helvetica",
            fontSize: 15,
            fontWeight: 700,
            color: "#4f39f6",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            transition: "opacity 0.2s",
            opacity: ticked ? 0.6 : 1,
          }}
        >
          {current}
          <span style={{ fontWeight: 500, color: "#a1a1aa", fontSize: 13 }}>/{TOTAL}</span>
        </span>
      </div>

      <div
        className="mt-2 rounded-full overflow-hidden"
        style={{ height: 3, background: "rgba(79,57,246,0.15)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "#4f39f6",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
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
