import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AgentsProvider } from "@/context/AgentsContext";

import { SaasDashboardUi } from "@/pages/SaasDashboardUi";
import { AgentsPage } from "@/pages/AgentsPage";
import { AgentDetailPage } from "@/pages/AgentDetailPage";
import { EvaluationsPage } from "@/pages/EvaluationsPage";
import { EvaluationDetailPage } from "@/pages/EvaluationDetailPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SettingsPage } from "@/pages/SettingsPage";


function Router() {
  return (
    <Switch>
      <Route path="/" component={SaasDashboardUi} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/agents/:id" component={AgentDetailPage} />
      <Route path="/evaluations" component={EvaluationsPage} />
      <Route path="/evaluations/:id" component={EvaluationDetailPage} />
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
        <AgentsProvider>
          <Toaster />
          <Router />
        </AgentsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
