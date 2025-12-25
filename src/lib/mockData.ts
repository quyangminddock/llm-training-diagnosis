import { FailureCase } from '../types';

export const mockFailureCases: FailureCase[] = [
    {
        id: "case-001",
        title: "Loss goes to NaN after 100 steps (Mixed Precision)",
        summary: "Training LLaMA-13B with fp16, loss suddenly becomes NaN at step 100. Grad norm spikes before NaN.",
        failure_type: "NaN",
        environment: {
            framework: "DeepSpeed",
            accelerators: "8x A100 80GB",
            precision: "fp16",
            distributed_strategy: "ZeRO-2"
        },
        logs: `Epoch 1: 10%|█         | 100/1000 [02:30<22:30,  1.50s/it, loss=nan]
[Rank 0] Overflow detected. Skipping step.
Attempted to unscale fp16 gradients.
Gradient norm: 65504.0 (Inf/NaN detected)`,
        config_snippet: `{
  "fp16": {
    "enabled": true,
    "loss_scale": 0,
    "loss_scale_window": 1000,
    "initial_scale_power": 16,
    "hysteresis": 2,
    "min_loss_scale": 1
  }
}`,
        analysis: "Classic fp16 primitive overflow. The gradient values exceeded the dynamic range of fp16 (approx 65504). This often happens in LLaMA architecture when attention scores grow large without proper scaling or bf16 usage.",
        solutions: [
            {
                id: "sol-001a",
                title: "Switch to BF16 (BFloat16)",
                description: "BF16 has the same dynamic range as FP32, preventing most overflow issues. If hardware supports it (Ampere+), this is the definitive fix.",
                success_rate: 98,
                verified_count: 342
            },
            {
                id: "sol-001b",
                title: "Enable Gradient Clipping",
                description: "Set `max_grad_norm` to 1.0 or 0.5. This clips exploding gradients before they cause updates that wreck the weights.",
                success_rate: 60,
                verified_count: 45
            }
        ],
        created_at: "2023-10-25"
    },
    {
        id: "case-002",
        title: "CUDA OOM during Backward pass (AdamW states)",
        summary: "OOM error triggered specifically during the backward pass when optimizer states are being updated.",
        failure_type: "OOM",
        environment: {
            framework: "PyTorch",
            accelerators: "4x A10 24GB",
            precision: "fp32",
            distributed_strategy: "DDP"
        },
        logs: `RuntimeError: CUDA out of memory. Tried to allocate 2.00 GiB (GPU 0; 23.69 GiB total capacity; 18.50 GiB already allocated; 1.10 GiB free; 19.80 GiB reserved in total by PyTorch)`,
        config_snippet: `optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)`,
        analysis: "The model fits in forward pass, but AdamW requires maintaining 2 extra copies of the model (momentum and variance) in fp32. On 24GB cards, this easily pushes past the limit.",
        solutions: [
            {
                id: "sol-002a",
                title: "Use DeepSpeed ZeRO-3 (Offload)",
                description: "ZeRO-3 shards optimizer states across GPUs. Adding CPU Offload moves them to system RAM, drastically reducing VRAM usage.",
                success_rate: 95,
                verified_count: 120
            },
            {
                id: "sol-002b",
                title: "Use 8-bit Adam via bitsandbytes",
                description: "Replace `torch.optim.AdamW` with `bitsandbytes.optim.AdamW8bit`. Reduces optimizer state memory by ~75%.",
                success_rate: 85,
                verified_count: 89
            }
        ],
        created_at: "2023-11-12"
    },
    {
        id: "case-003",
        title: "NCCL Watchdog Timeout (Deadlock)",
        summary: "Training hangs indefinitely. GPU utilization drops to 0%. Eventually crashes with Watchdog Timeout.",
        failure_type: "Deadlock",
        environment: {
            framework: "FSDP",
            accelerators: "2x Nodes (16x GPUs)",
            precision: "bf16",
            distributed_strategy: "Full Shard"
        },
        logs: `[wst03:1234] (rank 1) BMS: 42.0GB -> 42.0GB
[Watchdog] Timeout waiting for rank 0 to reach barrier.
Process 256 terminated with signal SIGKILL.`,
        analysis: "A deadlock usually indicates that one rank (often rank 0) is doing something different than others (e.g., saving a checkpoint, logging IO) while others are waiting at a collective communication barrier.",
        solutions: [
            {
                id: "sol-003a",
                title: "Ensure Checkpointing Only on Rank 0",
                description: "Wrap your save code in `if dist.get_rank() == 0:`. However, for FSDP/ZeRO, ensure the *save function itself* handles the collection correctly across ranks before writing.",
                success_rate: 70,
                verified_count: 30
            },
            {
                id: "sol-003b",
                title: "Increase NCCL Timeout",
                description: "Sometimes it's just slow disk I/O. Set `export NCCL_TIMEOUT=1800` (30 mins) to see if it eventually finishes.",
                success_rate: 40,
                verified_count: 15
            }
        ],
        created_at: "2023-12-05"
    },
    {
        id: "case-004",
        title: "Loss not converging (Stuck at high value)",
        summary: "Loss decreases slightly initially then plateaus at a high value. Model predicts gibberish.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "1x A100",
            precision: "bf16",
            distributed_strategy: "None"
        },
        logs: `Epoch 1: loss=10.45
Epoch 2: loss=10.42
Epoch 3: loss=10.41 (Plateau)`,
        analysis: "Common causes: Data preprocessing error (all inputs mapped to UNK), Learning rate too high (bouncing) or too low (stuck), or incorrect Labels (shifted by 1).",
        solutions: [
            {
                id: "sol-004a",
                title: "Check Tokenizer & Templates",
                description: "Visualize one batch of input_ids decoded back to text. Ensure EOS tokens are present and BOS/EOS aren't duplicated.",
                success_rate: 80,
                verified_count: 55
            },
            {
                id: "sol-004b",
                title: "Verify Labels Alignment",
                description: "Ensure `labels` are correctly aligned with `input_ids`. For causal LM, labels are usually input_ids (shifted internally by the loss function).",
                success_rate: 65,
                verified_count: 40
            }
        ],
        created_at: "2024-01-10"
    }
];
