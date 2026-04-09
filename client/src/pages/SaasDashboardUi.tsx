import { DashboardMainSection } from "./sections/DashboardMainSection";
import { SidebarSection } from "./sections/SidebarSection";

export const SaasDashboardUi = (): JSX.Element => {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <DashboardMainSection />
      </div>
    </div>
  );
};
