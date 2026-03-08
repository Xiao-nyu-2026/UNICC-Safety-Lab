import {
  ClipboardCheckIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    icon: LayoutDashboardIcon,
    label: "Dashboard",
    isActive: true,
  },
  {
    icon: UsersIcon,
    label: "Agents",
    isActive: false,
  },
  {
    icon: ClipboardCheckIcon,
    label: "Evaluations",
    isActive: false,
  },
  {
    icon: FileTextIcon,
    label: "Results",
    isActive: false,
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    isActive: false,
  },
];

export const SidebarSection = (): JSX.Element => {
  return (
    <aside className="flex flex-col w-64 min-h-screen items-start bg-[#3c0366]">
      <header className="flex w-full h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-white" />
          <h1 className="[font-family:'Inter',Helvetica] font-bold text-white text-base tracking-[-0.40px] leading-6 whitespace-nowrap">
            SafeAI Eval
          </h1>
        </div>
      </header>

      <nav className="flex flex-col w-full items-start pt-4 flex-1">
        <div className="flex flex-col items-start gap-1 px-2 w-full">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full h-10 justify-start gap-3 px-3 rounded-[10px] hover:bg-[#59168b] ${
                  item.isActive
                    ? "bg-[#59168b] text-white"
                    : "bg-transparent text-[#e9d4ff] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="[font-family:'Inter',Helvetica] font-normal text-base tracking-[0] leading-6">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>

      <footer className="flex flex-col w-full items-start pt-4 pb-4 px-4 border-t border-[#59168b80]">
        <div className="flex items-center gap-3 w-full">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-[linear-gradient(45deg,rgba(97,95,255,1)_0%,rgba(173,70,255,1)_100%)] text-white">
              AU
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <p className="[font-family:'Inter',Helvetica] font-medium text-white text-sm tracking-[0] leading-5 whitespace-nowrap">
              Admin User
            </p>
            <p className="[font-family:'Inter',Helvetica] font-normal text-[#e9d4ff] text-xs tracking-[0] leading-4">
              admin@safeai.dev
            </p>
          </div>
        </div>
      </footer>
    </aside>
  );
};
