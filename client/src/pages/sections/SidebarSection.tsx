import {
  LayoutDashboardIcon,
  ListChecksIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

const navigationItems = [
  {
    icon: LayoutDashboardIcon,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: UsersIcon,
    label: "Agents",
    href: "/agents",
  },
  {
    icon: ListChecksIcon,
    label: "Evaluations",
    href: "/evaluations",
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    href: "/settings",
  },
];

export const SidebarSection = (): JSX.Element => {
  const [location] = useLocation();

  return (
    <aside className="flex flex-col w-64 h-full items-start bg-[#3c0366] flex-shrink-0">
      <header className="flex w-full flex-col items-start px-4 pt-4 pb-3 border-b border-[#59168b80]">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer mb-2">
            <ShieldCheckIcon className="w-5 h-5 text-[#d0aaff] flex-shrink-0" />
            <h1 className="[font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[-0.30px] leading-5 whitespace-nowrap">
              AI Safety Lab
            </h1>
          </div>
        </Link>
        <p className="[font-family:'Inter',Helvetica] font-normal text-[#c4a0e8] text-[10px] leading-[14px] tracking-[0.01em]">
          UNICC AI Safety Lab: An automated governance platform for AI script auditing and agentic observability.
        </p>
      </header>

      <nav className="flex flex-col w-full items-start pt-4 flex-1">
        <div className="flex flex-col items-start gap-1 px-2 w-full">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={index} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full h-10 justify-start gap-3 px-3 rounded-[10px] hover:bg-[#59168b] ${
                    isActive
                      ? "bg-[#59168b] text-white"
                      : "bg-transparent text-[#e9d4ff] hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="[font-family:'Inter',Helvetica] font-normal text-base tracking-[0] leading-6">
                    {item.label}
                  </span>
                </Button>
              </Link>
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
