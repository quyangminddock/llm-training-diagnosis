import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function Home() {
  return (
    <main className="container pb-12">
      <section className="py-20 text-center">
        <Badge label="For AI Infrastructure Engineers" variant="outline" className="mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-inverse)]">
          LLM Training Failure <span className="text-[var(--accent-primary)]">Diagnosis</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10">
          A definitive database of NaN, OOM, and Deadlock scenarios. <br />
          Stop guessing. Start fixing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          maxWidth: '64rem',
          margin: '0 auto'
        }}>
          {/* Card 1: Search / Diagnose */}
          <Link href="/diagnose" className="block h-full">
            <Card hoverable className="h-full flex flex-col items-center text-center py-10" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="w-12 h-12 rounded-full bg-[rgba(35,134,54,0.1)] flex items-center justify-center mb-4 text-[var(--status-success)] text-2xl">
                🩺
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text-inverse)]">Analyze Logs</h3>
              <p className="text-[var(--text-secondary)]">
                Paste your training logs. AI will detect patterns (NaN, Timeout, OOM) and suggest fixes.
              </p>
            </Card>
          </Link>

          {/* Card 2: Browse Cases */}
          <Link href="/cases" className="block h-full">
            <Card hoverable className="h-full flex flex-col items-center text-center py-10" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="w-12 h-12 rounded-full bg-[rgba(88,166,255,0.1)] flex items-center justify-center mb-4 text-[var(--accent-primary)] text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text-inverse)]">Browse Failures</h3>
              <p className="text-[var(--text-secondary)]">
                Search the database of verified crash scenarios by Framework, Precision, or Error type.
              </p>
            </Card>
          </Link>

          {/* Card 3: Calculator */}
          <Link href="/calculator" className="block h-full">
            <Card hoverable className="h-full flex flex-col items-center text-center py-10" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div className="w-12 h-12 rounded-full bg-[rgba(210,153,34,0.1)] flex items-center justify-center mb-4 text-[var(--status-warning)] text-2xl">
                🧮
              </div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text-inverse)]">VRAM Estimator</h3>
              <p className="text-[var(--text-secondary)]">
                Calculate theoretical memory usage for LLaMA/Mixtral before you launch the pod.
              </p>
            </Card>
          </Link>
        </div>
      </section>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-8 px-8 py-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
          <div className="text-left">
            <div className="text-2xl font-bold text-[var(--text-inverse)]">400+</div>
            <div className="text-sm text-[var(--text-secondary)]">Verified Fixes</div>
          </div>
          <div className="h-10 w-px bg-[var(--border-default)]"></div>
          <div className="text-left">
            <div className="text-2xl font-bold text-[var(--text-inverse)]">DeepSpeed</div>
            <div className="text-sm text-[var(--text-secondary)]">Optimizer Support</div>
          </div>
          <div className="h-10 w-px bg-[var(--border-default)]"></div>
          <div className="text-left">
            <div className="text-2xl font-bold text-[var(--text-inverse)]">FSDP</div>
            <div className="text-sm text-[var(--text-secondary)]">Ready</div>
          </div>
        </div>
      </div>
    </main>
  );
}
