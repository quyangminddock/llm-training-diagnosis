"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CalculatorPage() {
    const [params, setParams] = useState(7); // Billions
    const [seqLen, setSeqLen] = useState(4096);
    const [batchSize, setBatchSize] = useState(1); // Micro batch size
    const [precision, setPrecision] = useState('bf16'); // bf16/fp16 = 2 bytes, fp32 = 4 bytes
    const [optimizer, setOptimizer] = useState('adamw'); // adamw = 8 bytes state (if fp32 master), sgd = 0?

    // Simple Estimation Logic
    // Model Weights: P * 2 bytes (bf16)
    // Gradients: P * 2 bytes
    // Optimizer States: P * 12 bytes (AdamW: fp32 param copy (4) + fp32 momentum (4) + fp32 variance (4)) -> usually 16 bytes total overhead if not optimized?
    // Let's use the standard "16 bytes per param" rule of thumb for Training in Mixed Precision with Adam.
    // Activations: B * S * H * L ... simplified to generic mult.

    const calculateVRAM = () => {
        // Constants
        const P = params * 1e9;
        const bytesPerParam = precision === 'fp32' ? 4 : 2;

        // Model Weights
        const weightMem = P * bytesPerParam;

        // Gradients
        const gradMem = P * bytesPerParam;

        // Optimizer (AdamW usually keeps fp32 states)
        // 3 states: fp32 copy of weights, momentum, variance
        const optMem = optimizer === 'adamw' ? P * 12 : 0;

        // Static Memory (Weights + Grads + Opt)
        const staticMem = weightMem + gradMem + optMem;

        // Activations (Rough Approximation)
        // A simplified heuristics: ~ factor * B * S * HiddenDim * Layers
        // Let's just use a linear approximation for MVP based on Params size (assuming standard Transformer scaling)
        // Activation memory is highly dependent on implementation (FlashAttn, Checkpointing).
        // Let's assume standard gradient checkpointing is OFF for worst case.
        const actMem = seqLen * batchSize * Math.sqrt(P) * 100; // Total heuristic hack for MVP

        const totalBytes = staticMem + actMem;
        const totalGB = totalBytes / 1e9;

        return {
            total: totalGB.toFixed(1),
            weights: (weightMem / 1e9).toFixed(1),
            grads: (gradMem / 1e9).toFixed(1),
            opt: (optMem / 1e9).toFixed(1),
            act: (actMem / 1e9).toFixed(1)
        };
    };

    const results = calculateVRAM();

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-[var(--text-inverse)]">VRAM Estimator</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                Estimate the memory requirements for training Transformer models. <br />
                <span className="text-xs text-[var(--status-warning)]">Note: These are theoretical peak estimates for a single GPU without sharding (ZeRO/FSDP).</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Input Form */}
                <Card>
                    <h2 className="text-xl font-bold mb-6 text-[var(--text-inverse)]">Configuration</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Model Size (Billions)</label>
                            <input
                                type="number"
                                value={params}
                                onChange={e => setParams(Number(e.target.value))}
                                className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]"
                            />
                            <div className="flex gap-2 mt-2">
                                {[7, 13, 70, 175].map(v => (
                                    <button key={v} onClick={() => setParams(v)} className="text-xs px-2 py-1 border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)]">
                                        {v}B
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Sequence Length</label>
                            <select
                                value={seqLen}
                                onChange={e => setSeqLen(Number(e.target.value))}
                                className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]"
                            >
                                {[2048, 4096, 8192, 16384, 32768].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Micro Batch Size</label>
                            <input
                                type="number"
                                value={batchSize}
                                onChange={e => setBatchSize(Number(e.target.value))}
                                className="w-full p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Precision</label>
                            <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
                                {['bf16', 'fp32'].map(p => (
                                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="precision"
                                            checked={precision === p}
                                            onChange={() => setPrecision(p)}
                                        />
                                        <span className="uppercase">{p}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Results Panel */}
                <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card className="flex-1 bg-[rgba(22,27,34,0.8)] border border-[var(--border-default)]">
                        <h2 className="text-xl font-bold mb-6 text-[var(--text-inverse)]">Estimated VRAM</h2>

                        <div className="text-5xl font-bold text-[var(--accent-primary)] mb-2">
                            {results.total} <span className="text-2xl text-[var(--text-secondary)]">GB</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-8">Per Replica (No Sharding)</p>

                        <div className="space-y-8">
                            {/* Visual Stacked Bar Chart */}
                            <div>
                                <div className="flex w-full h-12 rounded-lg overflow-hidden mb-3 bg-[var(--bg-secondary)] ring-1 ring-[var(--border-default)] shadow-inner">
                                    <div
                                        style={{ width: `${(Number(results.weights) / Number(results.total)) * 100}%` }}
                                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-full flex items-center justify-center transition-all duration-500 ease-out group relative cursor-help"
                                    >
                                        <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Weights</span>
                                    </div>
                                    <div
                                        style={{ width: `${(Number(results.grads) / Number(results.total)) * 100}%` }}
                                        className="bg-gradient-to-r from-purple-600 to-purple-500 h-full flex items-center justify-center transition-all duration-500 ease-out group relative cursor-help"
                                    >
                                        <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Grads</span>
                                    </div>
                                    <div
                                        style={{ width: `${(Number(results.opt) / Number(results.total)) * 100}%` }}
                                        className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-full flex items-center justify-center transition-all duration-500 ease-out group relative cursor-help"
                                    >
                                        <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Opt</span>
                                    </div>
                                    <div
                                        style={{ width: `${(Number(results.act) / Number(results.total)) * 100}%` }}
                                        className="bg-gradient-to-r from-teal-600 to-teal-500 h-full flex items-center justify-center transition-all duration-500 ease-out group relative cursor-help"
                                    >
                                        <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Act</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider px-1">
                                    <span>Usage Composition</span>
                                    <span>Total: {results.total} GB</span>
                                </div>
                            </div>

                            {/* Legend / Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">Weights</span>
                                    </div>
                                    <div className="text-lg font-mono font-medium text-[var(--text-primary)]">{results.weights} GB</div>
                                </div>
                                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">Gradients</span>
                                    </div>
                                    <div className="text-lg font-mono font-medium text-[var(--text-primary)]">{results.grads} GB</div>
                                </div>
                                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">Optimizer</span>
                                    </div>
                                    <div className="text-lg font-mono font-medium text-[var(--text-primary)]">{results.opt} GB</div>
                                </div>
                                <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">Activations</span>
                                    </div>
                                    <div className="text-lg font-mono font-medium text-[var(--text-primary)]">~{results.act} GB</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-[#0d1117] p-4 rounded border border-[var(--border-default)]">
                        <h3 className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-2">Compatibility Check</h3>
                        <ul className="text-sm space-y-2">
                            <li className="flex justify-between">
                                <span>A100 (80GB)</span>
                                <span className={Number(results.total) <= 80 ? "text-[var(--status-success)]" : "text-[var(--status-error)]"}>
                                    {Number(results.total) <= 80 ? "✅ Fits" : "❌ OOM"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>A10 (24GB)</span>
                                <span className={Number(results.total) <= 24 ? "text-[var(--status-success)]" : "text-[var(--status-error)]"}>
                                    {Number(results.total) <= 24 ? "✅ Fits" : "❌ OOM"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span>RTX 4090 (24GB)</span>
                                <span className={Number(results.total) <= 24 ? "text-[var(--status-success)]" : "text-[var(--status-error)]"}>
                                    {Number(results.total) <= 24 ? "✅ Fits" : "❌ OOM"}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
