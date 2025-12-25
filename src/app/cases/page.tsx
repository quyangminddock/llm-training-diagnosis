"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockFailureCases } from '@/lib/mockData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FailureType, Framework, Precision } from '@/types';

export default function CasesPage() {
    const [selectedType, setSelectedType] = useState<FailureType | 'All'>('All');
    const [selectedFramework, setSelectedFramework] = useState<Framework | 'All'>('All');

    const filteredCases = useMemo(() => {
        return mockFailureCases.filter(c => {
            if (selectedType !== 'All' && c.failure_type !== selectedType) return false;
            if (selectedFramework !== 'All' && c.environment.framework !== selectedFramework) return false;
            return true;
        });
    }, [selectedType, selectedFramework]);

    return (
        <div className="container py-8 flex flex-col md:flex-row gap-8" style={{ display: 'flex', gap: '2rem' }}>

            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 flex-shrink-0" style={{ width: '16rem', flexShrink: 0 }}>
                <div className="sticky top-4">
                    <h2 className="text-lg font-bold mb-4 text-[var(--text-inverse)]">Filters</h2>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">Failure Type</h3>
                        <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['All', 'NaN', 'OOM', 'Deadlock', 'NotConverging'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type as any)}
                                    className={`text-left px-3 py-2 rounded text-sm transition-colors ${selectedType === type ? 'bg-[var(--bg-hover)] text-[var(--accent-primary)] font-medium border-l-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-l-2 border-transparent'}`}
                                >
                                    {type === 'All' ? 'All Types' : type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">Framework</h3>
                        <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['All', 'PyTorch', 'DeepSpeed', 'FSDP'].map(fw => (
                                <button
                                    key={fw}
                                    onClick={() => setSelectedFramework(fw as any)}
                                    className={`text-left px-3 py-2 rounded text-sm transition-colors ${selectedFramework === fw ? 'bg-[var(--bg-hover)] text-[var(--accent-primary)] font-medium border-l-2 border-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-l-2 border-transparent'}`}
                                >
                                    {fw === 'All' ? 'All Frameworks' : fw}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <h1 className="text-2xl font-bold mb-6 text-[var(--text-inverse)]">
                    Failure Database
                    <span className="ml-3 text-sm font-normal text-[var(--text-secondary)]">
                        {filteredCases.length} result{filteredCases.length !== 1 && 's'}
                    </span>
                </h1>

                <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredCases.map(c => (
                        <Link key={c.id} href={`/cases/${c.id}`}>
                            <Card hoverable className="group">
                                <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            label={c.failure_type}
                                            variant={c.failure_type === 'NaN' ? 'warning' : c.failure_type === 'OOM' ? 'error' : 'info'}
                                        />
                                        <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                            {c.title}
                                        </h3>
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)] font-mono">{c.created_at}</span>
                                </div>

                                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                                    {c.summary}
                                </p>

                                <div className="flex gap-2 items-center text-xs text-[var(--text-secondary)] font-mono" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                        {c.environment.framework}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                        {c.environment.precision}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                        {c.environment.accelerators}
                                    </span>
                                    <div style={{ flex: 1 }}></div>
                                    <span className="text-[var(--status-success)] flex items-center gap-1">
                                        ✓ {c.solutions.reduce((acc, s) => acc + s.verified_count, 0)} Verified
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))}

                    {filteredCases.length === 0 && (
                        <div className="py-20 text-center text-[var(--text-secondary)]">
                            <div className="text-4xl mb-4">🔍</div>
                            <p>No verified failure cases found for these filters.</p>
                            <button
                                onClick={() => { setSelectedType('All'); setSelectedFramework('All'); }}
                                className="text-[var(--accent-primary)] hover:underline mt-2"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
