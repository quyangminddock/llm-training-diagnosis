
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'LLM Training Failure Diagnosis';

        return new ImageResponse(
            (
                <div
                    style={{
                        backgroundColor: '#0d1117',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '40px 80px',
                        color: '#c9d1d9',
                        fontFamily: 'monospace',
                    }}
                >
                    {/* Terminal Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '40px',
                            borderBottom: '1px solid #30363d',
                            paddingBottom: '20px',
                            width: '100%',
                        }}
                    >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                        <div style={{ marginLeft: '20px', color: '#8b949e', fontSize: '24px' }}>
                            ~/llm-diagnostics
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '32px', color: '#58a6ff' }}>
                            $ cat diagnosis_report.md
                        </div>
                        <div
                            style={{
                                fontSize: '64px',
                                fontWeight: 'bold',
                                color: '#f0f6fc',
                                lineHeight: 1.2,
                                marginTop: '10px',
                            }}
                        >
                            {title}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '24px',
                            color: '#8b949e',
                            borderTop: '1px solid #30363d',
                            paddingTop: '30px',
                            width: '100%',
                        }}
                    >
                        <div>Diagnose NaN, OOM, and Deadlocks</div>
                        <div style={{ color: '#238636' }}>⬤ System Ready</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
