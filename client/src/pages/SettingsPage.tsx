import { useState } from "react";
import {
  BellIcon,
  KeyIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
} from "lucide-react";
import { SidebarSection } from "./sections/SidebarSection";
import { PageHeader } from "./sections/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type SettingsTab = "account" | "notifications" | "api" | "team" | "security";

const tabs: { id: SettingsTab; label: string; Icon: React.ElementType }[] = [
  { id: "account", label: "Account", Icon: UserIcon },
  { id: "notifications", label: "Notifications", Icon: BellIcon },
  { id: "api", label: "API Keys", Icon: KeyIcon },
  { id: "team", label: "Team", Icon: UsersIcon },
  { id: "security", label: "Security", Icon: ShieldIcon },
];

const teamMembers = [
  { name: "Admin User", email: "admin@safeai.dev", role: "Owner", initials: "AU", color: "from-[#615fff] to-[#ad46ff]" },
  { name: "Sarah Chen", email: "sarah@safeai.dev", role: "Admin", initials: "SC", color: "from-[#00bc7d] to-[#009966]" },
  { name: "James Park", email: "james@safeai.dev", role: "Member", initials: "JP", color: "from-[#4f39f6] to-[#7c3aed]" },
  { name: "Maria Lopez", email: "maria@safeai.dev", role: "Member", initials: "ML", color: "from-[#fb2c36] to-[#e7000b]" },
];

export const SettingsPage = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = "sk_live_SafeAI_4f39f6aK8OQXy4xAK2Iys085n";
  const maskedKey = "sk_live_SafeAI_" + "•".repeat(24);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarSection />
      <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-start w-full">
            <PageHeader placeholder="Search settings..." />

            <main className="flex flex-col w-full items-start px-8 pt-8 pb-8 gap-6">
              {/* Page title */}
              <section className="flex flex-col items-start w-full">
                <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
                  Settings
                </h1>
                <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm leading-5 mt-1">
                  Manage your account, team, and preferences.
                </p>
              </section>

              <div className="flex gap-8 w-full">
                {/* Sidebar tabs */}
                <nav className="flex flex-col gap-1 w-[200px] flex-shrink-0">
                  {tabs.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-3 px-3 h-10 rounded-[10px] text-sm font-medium transition-colors [font-family:'Inter',Helvetica] ${
                        activeTab === id
                          ? "bg-white text-zinc-950 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]"
                          : "text-[#71717b] hover:bg-white hover:text-zinc-950"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>

                {/* Tab content */}
                <div className="flex-1">
                  {/* Account tab */}
                  {activeTab === "account" && (
                    <div className="flex flex-col gap-6">
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            Profile
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-6">
                            Update your personal information.
                          </p>
                          <div className="flex items-center gap-4 mb-6">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-[linear-gradient(45deg,rgba(97,95,255,1)_0%,rgba(173,70,255,1)_100%)] text-white text-xl font-semibold">
                                AU
                              </AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm" className="[font-family:'Inter',Helvetica]">
                              Change photo
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="firstName" className="[font-family:'Inter',Helvetica] text-sm font-medium text-zinc-950">
                                First name
                              </Label>
                              <Input
                                id="firstName"
                                defaultValue="Admin"
                                className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="lastName" className="[font-family:'Inter',Helvetica] text-sm font-medium text-zinc-950">
                                Last name
                              </Label>
                              <Input
                                id="lastName"
                                defaultValue="User"
                                className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mb-6">
                            <Label htmlFor="email" className="[font-family:'Inter',Helvetica] text-sm font-medium text-zinc-950">
                              Email address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              defaultValue="admin@safeai.dev"
                              className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                            />
                          </div>
                          <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                            Save changes
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#82181a] text-base mb-1">
                            Danger Zone
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-4">
                            Permanently delete your account and all associated data. This cannot be undone.
                          </p>
                          <Button
                            variant="outline"
                            className="h-9 border-red-300 text-[#82181a] hover:bg-[#ffe2e2] [font-family:'Inter',Helvetica] font-medium text-sm"
                          >
                            Delete account
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Notifications tab */}
                  {activeTab === "notifications" && (
                    <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                      <CardContent className="px-6 pt-6 pb-6">
                        <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                          Notification Preferences
                        </h2>
                        <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-6">
                          Choose what you get notified about.
                        </p>
                        <div className="flex flex-col gap-0">
                          {[
                            { label: "Evaluation completed", desc: "Get notified when any evaluation finishes running.", defaultChecked: true },
                            { label: "Evaluation failed", desc: "Alert when an agent evaluation fails or flags a critical issue.", defaultChecked: true },
                            { label: "New agent uploaded", desc: "Notification when a new agent is registered in your environment.", defaultChecked: false },
                            { label: "Weekly summary report", desc: "A weekly digest of all evaluation results and agent performance.", defaultChecked: true },
                            { label: "Safety score drops below threshold", desc: "Alert when an agent's safety score drops below 80%.", defaultChecked: true },
                            { label: "Team member added", desc: "Notification when someone new joins your team.", defaultChecked: false },
                          ].map((item, i, arr) => (
                            <div key={i}>
                              <div className="flex items-center justify-between py-4">
                                <div className="flex flex-col gap-0.5">
                                  <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                                    {item.label}
                                  </p>
                                  <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                                    {item.desc}
                                  </p>
                                </div>
                                <Switch defaultChecked={item.defaultChecked} />
                              </div>
                              {i < arr.length - 1 && <Separator className="bg-zinc-100" />}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                            Save preferences
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* API Keys tab */}
                  {activeTab === "api" && (
                    <div className="flex flex-col gap-6">
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            API Keys
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-6">
                            Use these keys to authenticate your agents with the SafeAI Eval API.
                          </p>

                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <Label className="[font-family:'Inter',Helvetica] text-sm font-medium text-zinc-950">
                                Production API Key
                              </Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    readOnly
                                    value={showApiKey ? apiKey : maskedKey}
                                    className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200 pr-20 font-mono"
                                  />
                                  <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-2 text-[#71717b] hover:text-zinc-950"
                                  >
                                    {showApiKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                  </button>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 [font-family:'Inter',Helvetica] text-sm"
                                  onClick={handleCopy}
                                >
                                  <CopyIcon className="w-4 h-4 mr-2" />
                                  {copied ? "Copied!" : "Copy"}
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <Button
                                variant="outline"
                                className="h-9 [font-family:'Inter',Helvetica] font-medium text-sm border-zinc-200"
                              >
                                Regenerate key
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-9 [font-family:'Inter',Helvetica] font-medium text-sm text-[#71717b]"
                              >
                                View API docs
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            Webhook URL
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-4">
                            Receive real-time evaluation results at your endpoint.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://your-server.com/webhooks/safeai"
                              className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                            />
                            <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                              Save
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Team tab */}
                  {activeTab === "team" && (
                    <div className="flex flex-col gap-6">
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                                Team Members
                              </h2>
                              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                                {teamMembers.length} members in your workspace.
                              </p>
                            </div>
                            <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                              Invite member
                            </Button>
                          </div>

                          <div className="flex flex-col gap-0">
                            {teamMembers.map((member, i, arr) => (
                              <div key={i}>
                                <div className="flex items-center justify-between py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9">
                                      <AvatarFallback
                                        className={`bg-[linear-gradient(45deg,var(--tw-gradient-from),var(--tw-gradient-to))] text-white text-sm font-semibold bg-gradient-to-br ${member.color}`}
                                      >
                                        {member.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5">
                                      <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                                        {member.name}
                                      </p>
                                      <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      className={`border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto ${
                                        member.role === "Owner"
                                          ? "bg-[#f0f4ff] text-[#4f39f6]"
                                          : member.role === "Admin"
                                          ? "bg-[#d0fae5] text-[#004f3b]"
                                          : "bg-zinc-100 text-zinc-700"
                                      }`}
                                    >
                                      {member.role}
                                    </Badge>
                                    {member.role !== "Owner" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[#71717b] hover:text-[#82181a] text-xs [font-family:'Inter',Helvetica]"
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {i < arr.length - 1 && <Separator className="bg-zinc-100" />}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            Invite by email
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-4">
                            Send an invite link to add a new team member.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="colleague@example.com"
                              className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                            />
                            <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                              Send invite
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Security tab */}
                  {activeTab === "security" && (
                    <div className="flex flex-col gap-6">
                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            Change Password
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-6">
                            Update your password to keep your account secure.
                          </p>
                          <div className="flex flex-col gap-4">
                            {[
                              { id: "current", label: "Current password" },
                              { id: "new", label: "New password" },
                              { id: "confirm", label: "Confirm new password" },
                            ].map((field) => (
                              <div key={field.id} className="flex flex-col gap-1.5">
                                <Label htmlFor={field.id} className="[font-family:'Inter',Helvetica] text-sm font-medium text-zinc-950">
                                  {field.label}
                                </Label>
                                <Input
                                  id={field.id}
                                  type="password"
                                  placeholder="••••••••"
                                  className="h-9 [font-family:'Inter',Helvetica] text-sm border-zinc-200"
                                />
                              </div>
                            ))}
                            <div className="pt-2">
                              <Button className="h-9 bg-[#4f39f6] hover:bg-[#4f39f6]/90 [font-family:'Inter',Helvetica] font-medium text-white text-sm">
                                Update password
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                                Two-Factor Authentication
                              </h2>
                              <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm">
                                Add an extra layer of security to your account.
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-zinc-200 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]">
                        <CardContent className="px-6 pt-6 pb-6">
                          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-base mb-1">
                            Active Sessions
                          </h2>
                          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm mb-6">
                            Manage devices where you're logged in.
                          </p>
                          <div className="flex flex-col gap-0">
                            {[
                              { device: "MacBook Pro — Chrome", location: "San Francisco, CA", time: "Current session", current: true },
                              { device: "iPhone 15 — Safari", location: "San Francisco, CA", time: "2 hours ago", current: false },
                            ].map((session, i, arr) => (
                              <div key={i}>
                                <div className="flex items-center justify-between py-4">
                                  <div className="flex flex-col gap-0.5">
                                    <p className="[font-family:'Inter',Helvetica] font-medium text-zinc-950 text-sm">
                                      {session.device}
                                    </p>
                                    <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-xs">
                                      {session.location} · {session.time}
                                    </p>
                                  </div>
                                  {session.current ? (
                                    <Badge className="bg-[#d0fae5] text-[#004f3b] border-transparent rounded-full [font-family:'Inter',Helvetica] font-normal text-xs px-3 py-1 h-auto">
                                      Current
                                    </Badge>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-[#71717b] hover:text-[#82181a] text-xs [font-family:'Inter',Helvetica]"
                                    >
                                      Revoke
                                    </Button>
                                  )}
                                </div>
                                {i < arr.length - 1 && <Separator className="bg-zinc-100" />}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
  );
};
