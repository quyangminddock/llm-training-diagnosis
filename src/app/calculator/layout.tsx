
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'VRAM Estimator | LLM Diagnostics',
    description: 'Estimate memory requirements for training Transformer models.',
    openGraph: {
        images: [
            {
                url: '/api/og?title=VRAM Estimator',
                width: 1200,
                height: 630,
            },
        ],
    },
};

export default function CalculatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
