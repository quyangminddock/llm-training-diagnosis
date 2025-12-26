import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockFailureCases } from '@/lib/mockData';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import type { Metadata } from 'next';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const failureCase = mockFailureCases.find(c => c.id === params.id);
    if (!failureCase) return { title: 'Case Not Found' };

    return {
        title: `${failureCase.title} - LLM Training Fix`,
        description: `How to fix ${failureCase.failure_type} in ${failureCase.environment.framework} with ${failureCase.environment.precision}. Verified solution for: ${failureCase.summary}`,
        openGraph: {
            title: failureCase.title,
            description: failureCase.summary,
            type: 'article',
            authors: ['AI Infra Engineers']
        }
    };
}

export default function CaseDetailPage({ params }: PageProps) {
    const failureCase = mockFailureCases.find(c => c.id === params.id);

    if (!failureCase) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": failureCase.title,
        "description": failureCase.summary,
        "articleSection": "Engineering",
        "keywords": `${failureCase.failure_type}, ${failureCase.environment.framework}, LLM Training`,
        "author": {
            "@type": "Organization",
            "name": "LLM Diagnosis DB"
        }
    };

    return (
        <div className="container py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Link href="/cases" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 inline-block text-sm">
                ← Back to Database
            </Link>

            <div className="flex flex-col lg:flex-row gap-8" style={{ display: 'flex', gap: '2rem' }}>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge
                                label={failureCase.failure_type}
                                variant={failureCase.failure_type === 'NaN' ? 'warning' : failureCase.failure_type === 'OOM' ? 'error' : 'info'}
                                className="text-lg px-3 py-1"
                            />
                            <h1 className="text-3xl font-bold text-[var(--text-inverse)]">{failureCase.title}</h1>
                        </div>
                        <p className="text-lg text-[var(--text-primary)] leading-relaxed p-4 bg-[var(--bg-card)] rounded border border-[var(--border-default)]">
                            {failureCase.summary}
                        </p>
                    </div>

                    {/* Logs Section */}
                    <section className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[var(--text-inverse)] flex items-center gap-2">
                                📄 Error Logs
                            </h2>
                            <CopyButton text={failureCase.logs} />
                        </div>
                        <div className="relative group">
                            <pre className="overflow-x-auto p-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] font-mono whitespace-pre-wrap">
                                {failureCase.logs}
                            </pre>
                        </div>
                    </section>

                    {/* Config Section */}
                    {failureCase.config_snippet && (
                        <section className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[var(--text-inverse)] flex items-center gap-2">
                                    ⚙️ Relevant Config
                                </h2>
                                <CopyButton text={failureCase.config_snippet} />
                            </div>
                            <pre className="overflow-x-auto p-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] font-mono">
                                {failureCase.config_snippet}
                            </pre>
                        </section>
                    )}

                    {/* Root Cause Analysis */}
                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-[var(--text-inverse)] flex items-center gap-2">
                            🔍 Root Cause Analysis
                        </h2>
                        <div className="p-5 rounded bg-[rgba(88,166,255,0.05)] border border-[var(--border-active)] text-[var(--text-primary)]">
                            {failureCase.analysis}
                        </div>
                    </section>

                    {/* Solutions */}
                    <section className="mb-12">
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-inverse)] flex items-center gap-2">
                            🛠 Verified Solutions
                        </h2>
                        <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {failureCase.solutions.map((sol, idx) => (
                                <div key={sol.id} className="border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-card)]">
                                    <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-hover)]">
                                        <div className="font-bold text-[var(--text-inverse)] flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)]">#{idx + 1}</span>
                                            {sol.title}
                                        </div>
                                        <Badge variant="success" label={`${sol.success_rate}% Success Rate`} />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-[var(--text-primary)] mb-4">{sol.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                                                👥 {sol.verified_count} engineers confirmed this fix
                                            </span>
                                            <Button variant="secondary" className="text-xs">
                                                Is this helpful?
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Metadata */}
                <aside className="w-full lg:w-80 flex-shrink-0" style={{ width: '20rem', flexShrink: 0 }}>
                    <div className="sticky top-4">
                        <div className="border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] p-5 mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 border-b border-[var(--border-default)] pb-2">
                                Environment
                            </h3>
                            <dl className="grid grid-cols-1 gap-4">
                                <div>
                                    <dt className="text-xs text-[var(--text-secondary)] mb-1">Framework</dt>
                                    <dd className="font-mono text-sm text-[var(--text-primary)]">{failureCase.environment.framework}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-[var(--text-secondary)] mb-1">Precision</dt>
                                    <dd className="font-mono text-sm text-[var(--text-primary)]">{failureCase.environment.precision}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-[var(--text-secondary)] mb-1">Hardware</dt>
                                    <dd className="font-mono text-sm text-[var(--text-primary)]">{failureCase.environment.accelerators}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-[var(--text-secondary)] mb-1">Strategy</dt>
                                    <dd className="font-mono text-sm text-[var(--text-primary)]">{failureCase.environment.distributed_strategy || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] p-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 border-b border-[var(--border-default)] pb-2">
                                Similar Cases
                            </h3>
                            <ul className="space-y-3">
                                {/* Mock functionality for related cases */}
                                <li className="text-sm">
                                    <Link href="#" className="hover:text-[var(--accent-primary)] text-[var(--text-primary)] block truncate">
                                        Gradient Explosion in LLaMA-65B
                                    </Link>
                                </li>
                                <li className="text-sm">
                                    <Link href="#" className="hover:text-[var(--accent-primary)] text-[var(--text-primary)] block truncate">
                                        Torch.save timeout on rank 0
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
