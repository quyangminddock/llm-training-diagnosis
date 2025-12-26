export type FailureType = 'NaN' | 'OOM' | 'Deadlock' | 'NotConverging';
export type Framework = 'PyTorch' | 'DeepSpeed' | 'FSDP' | 'vLLM';
export type Precision = 'fp16' | 'bf16' | 'fp32' | 'nf4';

export interface Environment {
    framework: Framework;
    accelerators: string; // e.g. "8x A100 80GB"
    precision: Precision;
    distributed_strategy?: string; // e.g. "ZeRO-3"
}

export interface Solution {
    id: string;
    title: string;
    description: string; // Markdown supported
    success_rate: number; // 0-100 percentage
    verified_count: number;
}

export interface FailureCase {
    id: string;
    title: string;
    summary: string;
    failure_type: FailureType;
    environment: Environment;
    logs: string; // Selected error logs
    config_snippet?: string; // Relevant config
    analysis: string; // Technical explanation
    solutions: Solution[];
    related_cases?: string[]; // IDs of related cases
    created_at: string;
}
