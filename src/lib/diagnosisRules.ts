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
    },
    {
        id: "fsdp_hang",
        pattern: /(fsdp.*hang|fsdp.*stuck|waiting for.*fsdp)/i,
        failureType: "FSDP Deadlock",
        confidence: 88,
        suggestions: [
            { id: 1, text: "Ensure all ranks execute FSDP wrapping simultaneously." },
            { id: 2, text: "Add `dist.barrier()` after any rank-specific code paths." }
        ]
    },
    {
        id: "memory_leak",
        pattern: /(memory.*leak|memory.*increasing|memory.*grow)/i,
        failureType: "Memory Leak",
        confidence: 75,
        suggestions: [
            { id: 1, text: "Use `.detach().item()` when logging loss values." },
            { id: 2, text: "Clear CUDA cache periodically with `torch.cuda.empty_cache()`." },
            { id: 3, text: "Check for tensors being appended to lists without detaching." }
        ]
    },
    {
        id: "tokenizer_mismatch",
        pattern: /(vocab.*mismatch|embedding.*mismatch|unknown.*token)/i,
        failureType: "Tokenizer/Model Mismatch",
        confidence: 90,
        suggestions: [
            { id: 1, text: "Ensure tokenizer is loaded from the same checkpoint as the model." },
            { id: 2, text: "Check if special tokens (BOS, EOS, PAD) are correctly configured." }
        ]
    },
    {
        id: "gradient_underflow",
        pattern: /(underflow|grad.*zero|gradient.*vanish)/i,
        failureType: "Gradient Underflow",
        confidence: 80,
        suggestions: [
            { id: 1, text: "Increase learning rate or use gradient scaling." },
            { id: 2, text: "Check for dead ReLU neurons or layer norm issues." }
        ]
    },
    {
        id: "checkpoint_corrupted",
        pattern: /(checkpoint.*corrupt|load.*failed|unpickl)/i,
        failureType: "Corrupted Checkpoint",
        confidence: 92,
        suggestions: [
            { id: 1, text: "Re-download or re-save the checkpoint file." },
            { id: 2, text: "Use `torch.load(..., weights_only=True)` for safer loading." }
        ]
    },
    {
        id: "distributed_mismatch",
        pattern: /(rank.*mismatch|world.*size|process.*group)/i,
        failureType: "Distributed Setup Error",
        confidence: 85,
        suggestions: [
            { id: 1, text: "Verify `WORLD_SIZE` and `RANK` environment variables." },
            { id: 2, text: "Ensure all nodes can communicate via the master address." }
        ]
    },
    {
        id: "learning_rate_issue",
        pattern: /(lr.*too|learning.*rate.*high|learning.*rate.*low)/i,
        failureType: "Learning Rate Issue",
        confidence: 70,
        suggestions: [
            { id: 1, text: "Try learning rate finder to identify optimal LR range." },
            { id: 2, text: "Use warmup with cosine decay schedule." }
        ]
    },
    {
        id: "batch_size_issue",
        pattern: /(batch.*too.*large|batch.*size.*memory)/i,
        failureType: "Batch Size Issue",
        confidence: 88,
        suggestions: [
            { id: 1, text: "Reduce per-device batch size and increase gradient accumulation steps." },
            { id: 2, text: "Enable mixed precision training to fit larger batches." }
        ]
    },
    {
        id: "infiniband_error",
        pattern: /(ibv_|infiniband|rdma.*fail)/i,
        failureType: "InfiniBand/Network Error",
        confidence: 82,
        suggestions: [
            { id: 1, text: "Disable InfiniBand with `export NCCL_IB_DISABLE=1`." },
            { id: 2, text: "Check IB driver compatibility and NCCL version." }
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
