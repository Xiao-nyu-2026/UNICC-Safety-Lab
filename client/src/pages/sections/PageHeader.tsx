import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps): JSX.Element => {
  return (
    <>
      <header className="flex w-full h-16 items-center justify-between px-8 py-0 bg-white border-b border-zinc-200">
        <div className="relative flex-1 max-w-[448px]">
          <div className="relative">
            <SearchIcon className="absolute top-2.5 left-3 w-4 h-4 text-[#09090b80]" />
            <Input
              placeholder="Search evaluations, agents..."
              className="w-full h-9 pl-9 pr-4 bg-zinc-100 border-0 [font-family:'Inter',Helvetica] font-normal text-sm"
            />
          </div>
        </div>
        <img className="w-[84px] h-9" alt="User menu" src="/figmaAssets/div.svg" />
      </header>

      <div className="flex items-center justify-between px-8 pt-8 pb-6 w-full">
        <div className="flex flex-col items-start">
          <h1 className="[font-family:'Inter',Helvetica] font-bold text-zinc-950 text-2xl tracking-[-0.60px] leading-8">
            {title}
          </h1>
          <p className="[font-family:'Inter',Helvetica] font-normal text-[#71717b] text-sm tracking-[0] leading-5 mt-1">
            {description}
          </p>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </>
  );
};
