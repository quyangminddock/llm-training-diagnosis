"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  Calculator, 
  Search, 
  FileText, 
  Home, 
  Laptop, 
  Github,
  Moon,
  Sun
} from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden z-[9999]"
    >
      <div className="flex items-center border-b border-[var(--border-default)] px-3" cmdk-input-wrapper="">
        <Search className="w-5 h-5 text-[var(--text-secondary)] mr-2" />
        <Command.Input 
          placeholder="Type a command or search..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-secondary)] text-[var(--text-primary)]"
        />
        <div className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border-default)] bg-[var(--bg-secondary)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] opacity-100">
                <span className="text-xs">Esc</span>
            </kbd>
        </div>
      </div>
      
      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scroll-py-2">
        <Command.Empty className="py-6 text-center text-sm text-[var(--text-secondary)]">
          No results found.
        </Command.Empty>

        <Command.Group heading="Navigation" className="text-xs font-medium text-[var(--text-secondary)] mb-2 px-2">
          <Command.Item
            onSelect={() => runCommand(() => router.push("/"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--bg-hover)] aria-selected:bg-[var(--bg-hover)]"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/diagnose"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--bg-hover)] aria-selected:bg-[var(--bg-hover)]"
          >
            <Laptop className="w-4 h-4" />
            <span>Analyze Logs</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/cases"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--bg-hover)] aria-selected:bg-[var(--bg-hover)]"
          >
            <Search className="w-4 h-4" />
            <span>Browse Failures</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => router.push("/calculator"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--bg-hover)] aria-selected:bg-[var(--bg-hover)]"
          >
            <Calculator className="w-4 h-4" />
            <span>VRAM Estimator</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Resources" className="text-xs font-medium text-[var(--text-secondary)] mb-2 px-2 mt-2">
           <Command.Item
            onSelect={() => runCommand(() => window.open("https://github.com", "_blank"))}
            className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)] rounded-md cursor-pointer hover:bg-[var(--bg-hover)] aria-selected:bg-[var(--bg-hover)]"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
