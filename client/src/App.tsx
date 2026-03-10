import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { SaasDashboardUi } from "@/pages/SaasDashboardUi";
import { AgentsPage } from "@/pages/AgentsPage";
import { EvaluationsResultsPage } from "@/pages/EvaluationsResultsPage";
import { SettingsPage } from "@/pages/SettingsPage";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={SaasDashboardUi} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/evaluations" component={EvaluationsResultsPage} />
      <Route path="/results" component={EvaluationsResultsPage} />
      <Route path="/settings" component={SettingsPage} />
      {/* Fallback to 404 */}
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
