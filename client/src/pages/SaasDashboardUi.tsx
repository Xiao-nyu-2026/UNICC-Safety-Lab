import { DashboardMainSection } from "./sections/DashboardMainSection";
import { SidebarSection } from "./sections/SidebarSection";

export const SaasDashboardUi = (): JSX.Element => {
  return (
    <div className="bg-white overflow-x-hidden w-full flex">
      <div className="flex w-full relative flex-col items-start bg-white">
        <div className="flex items-start relative self-stretch w-full bg-neutral-50">
          <SidebarSection />
          <DashboardMainSection />
        </div>
      </div>
    </div>
  );
};
