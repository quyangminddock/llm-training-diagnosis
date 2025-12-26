export interface DiagnosisRule {
    id: string;
    pattern: RegExp;
    failureType: string;
    confidence: number;
    suggestions: { id: number; text: string }[];
}

export const diagnosisRules: DiagnosisRule[] = [
    {
        id: "nan_overflow",
        pattern: /(loss=nan|grad_norm.*inf|overflow detected|attempted to unscale fp16 gradients)/i,
        failureType: "NaN / FP16 Overflow",
        confidence: 98,
        suggestions: [
            { id: 1, text: "Switch to BF16 (bfloat16) precision if your hardware (Ampere+) supports it." },
            { id: 2, text: "Enable Gradient Clipping (set max_grad_norm=1.0)." },
            { id: 3, text: "Check for dirty data (empty sequences) in your dataset." }
        ]
    },
    {
        id: "cuda_oom",
        pattern: /(cuda out of memory|illegal memory access|tried to allocate.*gib)/i,
        failureType: "CUDA OOM (Out of Memory)",
        confidence: 99,
        suggestions: [
            { id: 1, text: "Enable Gradient Checkpointing `model.gradient_checkpointing_enable()`." },
            { id: 2, text: "Use DeepSpeed ZeRO-2 or ZeRO-3 Offload." },
            { id: 3, text: "Reduce Micro-Batch Size per device." }
        ]
    },
    {
        id: "nccl_timeout",
        pattern: /(nccl.*timeout|watchdog.*timeout|process.*terminated.*signal sigkill)/i,
        failureType: "NCCL Deadlock / Timeout",
        confidence: 90,
        suggestions: [
            { id: 1, text: "Check rank 0 specific logic. Ensure saving happens on all ranks or within a barrier." },
            { id: 2, text: "Increase `NCCL_TIMEOUT` environment variable (e.g. to 6000)." },
            { id: 3, text: "Check for slow disk I/O on specific nodes." }
        ]
    },
    {
        id: "shape_mismatch",
        pattern: /(runtimeerror.*size mismatch|mat1 and mat2 shapes cannot be multiplied)/i,
        failureType: "Shape/Dimension Mismatch",
        confidence: 95,
        suggestions: [
            { id: 1, text: "Check your model config hidden size vs. linear layer definitions." },
            { id: 2, text: "Verify LoRA rank adapters are correctly merged." }
        ]
    },
    {
        id: "device_side_assert",
        pattern: /(device-side assert triggered|cuda error: device-side assert triggered)/i,
        failureType: "Device-Side Assertion",
        confidence: 85,
        suggestions: [
            { id: 1, text: "Rerun with `CUDA_LAUNCH_BLOCKING=1` to get the real error stack trace." },
            { id: 2, text: "Check for out-of-bounds embedding indices (vocab size mismatch)." }
        ]
    }
];

export function analyzeLogs(logText: string): { type: string; confidence: number; suggestions: any[] } | null {
    for (const rule of diagnosisRules) {
        if (rule.pattern.test(logText)) {
            return {
                type: rule.failureType,
                confidence: rule.confidence,
                suggestions: rule.suggestions
            };
        }
    }
    return null;
}
