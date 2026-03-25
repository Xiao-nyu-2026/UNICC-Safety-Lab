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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
