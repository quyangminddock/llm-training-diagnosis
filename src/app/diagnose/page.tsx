"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { analyzeLogs } from '@/lib/diagnosisRules';

export default function DiagnosePage() {
    const [logs, setLogs] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = () => {
        if (!logs.trim()) return;

        setIsAnalyzing(true);
        setResult(null);

        // Simulate "Processing" feel, but use real logic
        setTimeout(() => {
            setIsAnalyzing(false);
            const analysis = analyzeLogs(logs);

            if (analysis) {
                setResult(analysis);
            } else {
                setResult({
                    type: 'Unknown / Generic Error',
                    confidence: 20,
                    suggestions: [
                        { id: 1, text: "We couldn't match a specific signature in our database." },
                        { id: 2, text: "Try searching the Failure Database manually." }
                    ]
                });
            }
        }, 600);
    };

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-[var(--text-inverse)]">AI Log Diagnosis</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                Paste your training logs (stdout/stderr) below. Our expert system will detect signature failure patterns.
            </p>

            <div className="mb-8">
                <textarea
                    value={logs}
                    onChange={(e) => setLogs(e.target.value)}
                    placeholder="Paste error logs here... (e.g. CUDA out of memory, loss=nan, etc.)"
                    className="w-full h-64 p-4 rounded bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--code-font)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none resize-y"
                />
                <div className="mt-4 flex justify-end">
                    <Button
                        variant="primary"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !logs.trim()}
                        className="w-full md:w-auto min-w-[150px]"
                    >
                        {isAnalyzing ? 'Analyzing Patterns...' : 'Diagnose Failure'}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className={`border-l-4 ${result.type.includes('NaN') ? 'border-l-[var(--status-warning)]' : result.type.includes('OOM') ? 'border-l-[var(--status-error)]' : 'border-l-[var(--accent-primary)]'}`}>
                        <div className="flex justify-between items-start mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-inverse)] mb-1">Diagnosis Result</h2>
                                <div className="text-sm text-[var(--text-secondary)]">Based on pattern matching logic</div>
                            </div>
                            <Badge
                                label={`${result.confidence}% Confidence`}
                                variant={result.confidence > 90 ? 'success' : 'warning'}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Detected Issue</h3>
                                <div className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                    {result.type}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    The logs contain specific signatures typically associated with this failure mode in distributed training.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Recommended Actions</h3>
                                <ul className="space-y-3">
                                    {result.suggestions.map((rec: any) => (
                                        <li key={rec.id} className="flex gap-3 items-start p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                            <span className="text-[var(--accent-primary)] font-bold">#{rec.id}</span>
                                            <span className="text-sm text-[var(--text-primary)]">{rec.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--text-secondary)]">Does this match your experience?</span>
                                <div className="flex gap-2">
                                    <Link href="/cases">
                                        <Button>Search Related Cases</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
