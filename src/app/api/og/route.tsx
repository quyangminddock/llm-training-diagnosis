import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'LLM Training Diagnosis';
    const type = searchParams.get('type') || 'Engineering Tool';

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundImage: 'linear-gradient(to bottom, #0d1117, #161b22)',
                    fontFamily: 'monospace',
                    border: '20px solid #30363d',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '40px',
                        maxWidth: '1000px',
                    }}
                >
                    <div
                        style={{
                            padding: '10px 20px',
                            borderRadius: '50px',
                            border: '2px solid #58a6ff',
                            color: '#58a6ff',
                            fontSize: '32px',
                            marginBottom: '40px',
                        }}
                    >
                        {type}
                    </div>
                    <div
                        style={{
                            fontSize: '80px',
                            fontWeight: 'bold',
                            color: '#f0f6fc',
                            lineHeight: 1.1,
                            marginBottom: '20px',
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            fontSize: '40px',
                            color: '#8b949e',
                        }}
                    >
                        Verified Solutions Database
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
