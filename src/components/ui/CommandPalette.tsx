"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { mockFailureCases } from "@/lib/mockData";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-default)] rounded cursor-pointer hover:border-[var(--text-secondary)] transition-colors ml-4 bg-[var(--bg-secondary)]"
            >
                <span>Search...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-default)] font-mono text-[10px]">⌘K</kbd>
            </div>

            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Command Menu"
                className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm p-4"
                onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            >
                <div className="w-full max-w-lg rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <Command.Input
                        placeholder="Search cases or jump to..."
                        className="w-full px-4 py-3 bg-[var(--bg-card)] text-[var(--text-primary)] border-b border-[var(--border-default)] focus:outline-none placeholder:text-[var(--text-secondary)]"
                    />

                    <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                        <Command.Empty className="py-6 text-center text-sm text-[var(--text-secondary)]">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="mb-2">
                            <div className="px-2 py-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">Navigation</div>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/"))}
                                className="flex items-center gap-2 px-2 py-2 rounded text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white cursor-pointer"
                            >
                                🏠 Home
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/cases"))}
                                className="flex items-center gap-2 px-2 py-2 rounded text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white cursor-pointer"
                            >
                                🔍 Browse Failures
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/diagnose"))}
                                className="flex items-center gap-2 px-2 py-2 rounded text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white cursor-pointer"
                            >
                                🩺 AI Diagnosis
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/calculator"))}
                                className="flex items-center gap-2 px-2 py-2 rounded text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white cursor-pointer"
                            >
                                🧮 VRAM Calculator
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="h-px bg-[var(--border-default)] my-2" />

                        <Command.Group heading="Failure Cases">
                            <div className="px-2 py-1.5 text-xs font-bold text-[var(--text-secondary)] uppercase">Database</div>
                            {mockFailureCases.map((c) => (
                                <Command.Item
                                    key={c.id}
                                    value={`${c.title} ${c.failure_type}`}
                                    onSelect={() => runCommand(() => router.push(`/cases/${c.id}`))}
                                    className="flex items-center justify-between px-2 py-2 rounded text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white cursor-pointer group"
                                >
                                    <span className="truncate mr-2">{c.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-default)] group-aria-selected:border-white/20 group-aria-selected:text-white/80 text-[var(--text-secondary)]">
                                        {c.failure_type}
                                    </span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>
                </div>
            </Command.Dialog>
        </>
    );
}
