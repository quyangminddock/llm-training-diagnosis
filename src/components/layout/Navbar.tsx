import Link from 'next/link';
import { CommandPalette } from '@/components/ui/CommandPalette';

export function Navbar() {
    return (
        <nav className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)] mb-8">
            <div className="container h-16 flex items-center justify-between" style={{ display: 'flex', height: '4rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-lg hover:text-[var(--accent-primary)] transition-colors">
                        LLM Diagnostics <span className="text-sm font-normal text-secondary ml-2 border border-default px-1.5 py-0.5 rounded text-[var(--text-secondary)]">BETA</span>
                    </Link>
                    <CommandPalette />
                </div>
                <div className="flex gap-6" style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link href="/cases" className="text-secondary hover:text-primary transition-colors hover:text-[var(--text-primary)] text-[var(--text-secondary)]">Failure Database</Link>
                    <Link href="/diagnose" className="text-secondary hover:text-primary transition-colors hover:text-[var(--text-primary)] text-[var(--text-secondary)]">AI Diagnosis</Link>
                    <Link href="/calculator" className="text-secondary hover:text-primary transition-colors hover:text-[var(--text-primary)] text-[var(--text-secondary)]">VRAM Calc</Link>
                </div>
            </div>
        </nav>
    );
}
