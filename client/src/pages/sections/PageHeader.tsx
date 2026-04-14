import { useRef, useState } from "react";
import { BellIcon, SearchIcon, UploadIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const AUDIT_NOTIFICATIONS = [
  "EV-1029: GPT-4-Turbo-Prod audit completed — Score 99 (Passed)",
  "EV-1027: UNICC-Chatbot-V2 Jailbreak test failed — Score 45",
  "EV-1028: Llama-3-Custom Toxicity & Bias evaluation is running",
  "EV-1026: GPT-4-Turbo-Prod Data Exfiltration test passed — Score 100",
  "EV-1025: Code-Gen-Agent Malicious Code audit completed — Score 95",
];

interface PageHeaderProps {
  placeholder?: string;
}

export const PageHeader = ({ placeholder = "Search evaluations, agents..." }: PageHeaderProps): JSX.Element => {
  const { toast } = useToast();
  const [showDropzone, setShowDropzone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notifIdx, setNotifIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBell = () => {
    toast({
      title: "Audit Notification",
      description: AUDIT_NOTIFICATIONS[notifIdx % AUDIT_NOTIFICATIONS.length],
      duration: 4500,
    });
    setNotifIdx((i) => i + 1);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".json" && ext !== ".py") {
      toast({ title: "Invalid file type", description: "Only .json or .py files are accepted.", variant: "destructive" });
      return;
    }
    toast({ title: "Agent script uploaded", description: `"${file.name}" queued for safety audit.`, duration: 4000 });
    setShowDropzone(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <header className="flex w-full h-16 items-center justify-between px-8 py-0 bg-white border-b border-zinc-200 sticky top-0 z-10 print:hidden">
      <div className="relative flex-1 max-w-[448px]">
        <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
        <Input
          placeholder={placeholder}
          className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
        />
      </div>

      <div className="flex items-center gap-2 ml-4 relative">
        {/* Import button */}
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-import-header"
          onClick={() => setShowDropzone((v) => !v)}
          className="w-9 h-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          title="Import agent script"
        >
          <UploadIcon className="w-4 h-4" />
        </Button>

        {/* Bell */}
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-notifications"
          onClick={handleBell}
          className="w-9 h-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 relative"
          title="View audit notifications"
        >
          <BellIcon className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff2d78] pointer-events-none" />
        </Button>

        {/* User avatar */}
        <Avatar className="w-8 h-8 ml-1 cursor-pointer flex-shrink-0">
          <AvatarFallback className="bg-[linear-gradient(45deg,rgba(97,95,255,1)_0%,rgba(173,70,255,1)_100%)] text-white text-xs font-semibold [font-family:'Inter',Helvetica]">
            AU
          </AvatarFallback>
        </Avatar>

        {/* Upload dropzone */}
        {showDropzone && (
          <div
            className="absolute top-11 right-0 z-50 bg-white border border-zinc-200 rounded-xl p-5 w-[300px]"
            style={{ boxShadow: "0 8px 32px rgba(79,57,246,0.14), 0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="[font-family:'Inter',Helvetica] font-semibold text-zinc-950 text-sm">
                Import Agent Script
              </span>
              <button
                onClick={() => setShowDropzone(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver ? "border-[#4f39f6] bg-[#f0f4ff]" : "border-zinc-200 hover:border-[#4f39f6] hover:bg-[#f0f4ff]"
              }`}
            >
              <UploadIcon className="w-6 h-6 mx-auto mb-2 text-[#4f39f6]" />
              <p className="[font-family:'Inter',Helvetica] text-sm text-zinc-700">
                Drop a <strong>.json</strong> or <strong>.py</strong> file here
              </p>
              <p className="[font-family:'Inter',Helvetica] text-xs text-zinc-400 mt-1">or click to browse</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.py"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}
      </div>
    </header>
  );
};
