import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="container min-h-[60vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-9xl font-bold text-[var(--accent-primary)] mb-4">404</h1>
            <h2 className="text-2xl font-bold text-[var(--text-inverse)] mb-6">Module Not Found</h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-8">
                The requested resource could not be located on this device. <br />
                Possible causes: File path unavailable, or node disconnected.
            </p>

            <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded mb-8 font-mono text-sm text-[var(--status-error)]">
                RuntimeError: Route matching failed.
            </div>

            <Link href="/">
                <Button variant="primary">Return Home</Button>
            </Link>
        </div>
    );
}
