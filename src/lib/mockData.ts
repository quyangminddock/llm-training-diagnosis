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
    },
    {
        id: "case-005",
        title: "Gradient Explosion during Warmup Phase",
        summary: "Gradient norms spike to infinity during the first 50 warmup steps, causing immediate NaN loss.",
        failure_type: "NaN",
        environment: {
            framework: "PyTorch",
            accelerators: "4x A100 40GB",
            precision: "bf16",
            distributed_strategy: "DDP"
        },
        logs: `Step 10: loss=2.43, grad_norm=1.2e+08
Step 11: loss=nan, grad_norm=inf`,
        config_snippet: `lr=1e-3, warmup_steps=100`,
        analysis: "Learning rate is too high for warmup phase. The initial gradient updates are too aggressive, causing numerical instability.",
        solutions: [
            {
                id: "sol-005a",
                title: "Reduce Initial Learning Rate",
                description: "Use a smaller base LR (e.g., 1e-5) and let warmup schedule gradually increase it.",
                success_rate: 92,
                verified_count: 128
            }
        ],
        created_at: "2024-02-01"
    },
    {
        id: "case-006",
        title: "OOM when loading model checkpoint",
        summary: "CUDA OOM occurs when calling model.load_state_dict() even though the model fits during training.",
        failure_type: "OOM",
        environment: {
            framework: "PyTorch",
            accelerators: "1x RTX 4090 24GB",
            precision: "fp16",
            distributed_strategy: "None"
        },
        logs: `RuntimeError: CUDA out of memory during load_state_dict`,
        config_snippet: `model.load_state_dict(torch.load('checkpoint.pt'))`,
        analysis: "Loading a checkpoint creates a temporary copy of all weights. Solution is to load to CPU first, then move.",
        solutions: [
            {
                id: "sol-006a",
                title: "Load checkpoint to CPU first",
                description: "Use `torch.load(..., map_location='cpu')` then call `model.to(device)` after loading.",
                success_rate: 99,
                verified_count: 256
            }
        ],
        created_at: "2024-02-15"
    },
    {
        id: "case-007",
        title: "FSDP hang at model initialization",
        summary: "Training hangs indefinitely when wrapping model with FSDP. No error message, just frozen.",
        failure_type: "Deadlock",
        environment: {
            framework: "FSDP",
            accelerators: "8x H100 80GB",
            precision: "bf16",
            distributed_strategy: "Full Shard"
        },
        logs: `[No output - process hangs at FSDP wrapper]`,
        config_snippet: `model = FSDP(model, auto_wrap_policy=...`,
        analysis: "FSDP requires all ranks to execute initialization in lockstep. If any rank has different code paths (e.g., logging only on rank 0), it causes a hang.",
        solutions: [
            {
                id: "sol-007a",
                title: "Use dist.barrier() after conditional code",
                description: "Place `torch.distributed.barrier()` after any rank-specific logic before FSDP wrapping.",
                success_rate: 88,
                verified_count: 45
            }
        ],
        created_at: "2024-03-01"
    },
    {
        id: "case-008",
        title: "Loss stuck at log(vocab_size)",
        summary: "Loss remains at ~10.8 (log(50000)) for entire training. Model outputs random tokens.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "2x A100 80GB",
            precision: "bf16",
            distributed_strategy: "FSDP"
        },
        logs: `Epoch 1-10: loss=10.82 (no change)`,
        config_snippet: `labels = input_ids.clone()`,
        analysis: "The loss = log(vocab_size) means the model is outputting uniform distribution. Usually indicates labels are not properly aligned or loss is not being computed correctly.",
        solutions: [
            {
                id: "sol-008a",
                title: "Check label shifting",
                description: "For causal LM, ensure labels are `input_ids[1:]` aligned with predictions `logits[:-1]`, or use HuggingFace's built-in shifting.",
                success_rate: 85,
                verified_count: 78
            }
        ],
        created_at: "2024-03-10"
    },
    {
        id: "case-009",
        title: "NaN in attention scores (Mistral model)",
        summary: "Mistral-7B produces NaN specifically in attention softmax during inference with long sequences.",
        failure_type: "NaN",
        environment: {
            framework: "PyTorch",
            accelerators: "1x A100 80GB",
            precision: "fp16",
            distributed_strategy: "None"
        },
        logs: `RuntimeWarning: invalid value in softmax
Output: tensor([nan, nan, nan...])`,
        config_snippet: `max_length=32768`,
        analysis: "Long sequences in fp16 cause attention scores to overflow before softmax. Mistral's sliding window helps but still vulnerable at fp16.",
        solutions: [
            {
                id: "sol-009a",
                title: "Use FlashAttention-2",
                description: "FlashAttention computes softmax in a numerically stable chunked manner, preventing overflow.",
                success_rate: 96,
                verified_count: 189
            },
            {
                id: "sol-009b",
                title: "Switch to BF16",
                description: "BFloat16 has much larger dynamic range and handles long-context attention better.",
                success_rate: 90,
                verified_count: 122
            }
        ],
        created_at: "2024-03-20"
    },
    {
        id: "case-010",
        title: "DeepSpeed ZeRO-3 OOM on single parameter",
        summary: "OOM error on a single gather operation even with ZeRO-3 offload enabled.",
        failure_type: "OOM",
        environment: {
            framework: "DeepSpeed",
            accelerators: "4x A10 24GB",
            precision: "bf16",
            distributed_strategy: "ZeRO-3 Offload"
        },
        logs: `RuntimeError: CUDA out of memory during gather of parameter with shape [65536, 8192]`,
        config_snippet: `zero_optimization.stage=3, offload_param.device=cpu`,
        analysis: "Even with ZeRO-3, individual parameters must fit in GPU memory during forward/backward. Embedding or LM head layers are often the culprit.",
        solutions: [
            {
                id: "sol-010a",
                title: "Use LoRA for large embeddings",
                description: "Apply LoRA to embedding layers to reduce the parameter size that needs to be gathered.",
                success_rate: 80,
                verified_count: 56
            }
        ],
        created_at: "2024-04-01"
    },
    {
        id: "case-011",
        title: "Tokenizer mismatch causing gibberish output",
        summary: "Model generates complete gibberish. Loss is low but outputs make no sense.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "1x A100 80GB",
            precision: "bf16",
            distributed_strategy: "None"
        },
        logs: `Generated: "ĠĠĊĊĊthe ĠĠĊcar Ċdrove"`,
        config_snippet: `tokenizer = AutoTokenizer.from_pretrained('gpt2')
model = AutoModel.from_pretrained('llama-7b')`,
        analysis: "Using a tokenizer from a different model family causes complete vocabulary mismatch. The model's embeddings don't align with the tokenizer's indices.",
        solutions: [
            {
                id: "sol-011a",
                title: "Use matching tokenizer",
                description: "Always load tokenizer from the same checkpoint as the model: `AutoTokenizer.from_pretrained('llama-7b')`",
                success_rate: 100,
                verified_count: 312
            }
        ],
        created_at: "2024-04-15"
    },
    {
        id: "case-012",
        title: "Gradient checkpointing causes slower training than expected",
        summary: "Enabling gradient checkpointing reduced memory but training is 3x slower than expected.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "2x A100 80GB",
            precision: "bf16",
            distributed_strategy: "DDP"
        },
        logs: `Training speed: 0.5 samples/sec (expected: 1.5 samples/sec)`,
        config_snippet: `model.gradient_checkpointing_enable()`,
        analysis: "Gradient checkpointing trades compute for memory. If you're not actually memory constrained, it just adds overhead. Also check for inefficient checkpointing granularity.",
        solutions: [
            {
                id: "sol-012a",
                title: "Only checkpoint if needed",
                description: "Measure memory first. If not OOMing, disable checkpointing for faster training.",
                success_rate: 75,
                verified_count: 34
            }
        ],
        created_at: "2024-05-01"
    },
    {
        id: "case-013",
        title: "NCCL error: unhandled system error",
        summary: "Multi-node training fails with cryptic NCCL system error on node 2.",
        failure_type: "Deadlock",
        environment: {
            framework: "PyTorch",
            accelerators: "2x Nodes (16x A100)",
            precision: "bf16",
            distributed_strategy: "DDP"
        },
        logs: `NCCL WARN Call to ibv_create_qp failed
RuntimeError: NCCL error: unhandled system error`,
        config_snippet: `export NCCL_IB_DISABLE=0`,
        analysis: "InfiniBand configuration issue between nodes. Often caused by mismatched NCCL versions or IB driver problems.",
        solutions: [
            {
                id: "sol-013a",
                title: "Disable InfiniBand",
                description: "Set `export NCCL_IB_DISABLE=1` to fall back to TCP. Slower but more reliable.",
                success_rate: 85,
                verified_count: 67
            }
        ],
        created_at: "2024-05-15"
    },
    {
        id: "case-014",
        title: "QLoRA training produces worse results than full finetune",
        summary: "QLoRA finetuned model performs significantly worse than a full finetune on same data.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "1x RTX 4090 24GB",
            precision: "nf4",
            distributed_strategy: "None"
        },
        logs: `Eval loss: 2.8 (expected: 1.5 based on full finetune)`,
        config_snippet: `bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4')`,
        analysis: "QLoRA introduces quantization error. Small LoRA ranks may not have enough capacity. Also, learning rate needs adjustment for LoRA.",
        solutions: [
            {
                id: "sol-014a",
                title: "Increase LoRA rank",
                description: "Use r=64 or r=128 instead of default r=8. More parameters = more capacity.",
                success_rate: 70,
                verified_count: 89
            },
            {
                id: "sol-014b",
                title: "Train longer with lower LR",
                description: "LoRA often needs 2-3x more steps with lower learning rate (1e-5 instead of 2e-4).",
                success_rate: 65,
                verified_count: 45
            }
        ],
        created_at: "2024-06-01"
    },
    {
        id: "case-015",
        title: "Validation loss increasing while train loss decreasing",
        summary: "Classic overfitting pattern: training loss drops but validation loss climbs after epoch 2.",
        failure_type: "NotConverging",
        environment: {
            framework: "PyTorch",
            accelerators: "4x A100 80GB",
            precision: "bf16",
            distributed_strategy: "DDP"
        },
        logs: `Epoch 1: train_loss=2.1, val_loss=2.2
Epoch 5: train_loss=0.8, val_loss=3.5`,
        config_snippet: `epochs=10, lr=5e-5`,
        analysis: "Overfitting to training data. Common with small datasets or high capacity models. Need regularization or early stopping.",
        solutions: [
            {
                id: "sol-015a",
                title: "Implement early stopping",
                description: "Stop training when val_loss hasn't improved for N epochs. Save best checkpoint.",
                success_rate: 90,
                verified_count: 156
            },
            {
                id: "sol-015b",
                title: "Add dropout or weight decay",
                description: "Increase `weight_decay` parameter in optimizer (e.g., 0.01) or add dropout layers.",
                success_rate: 75,
                verified_count: 98
            }
        ],
        created_at: "2024-06-15"
    },
    {
        id: "case-016",
        title: "Dataloader workers causing memory leak",
        summary: "Training memory slowly increases over time until OOM after ~1000 batches.",
        failure_type: "OOM",
        environment: {
            framework: "PyTorch",
            accelerators: "1x A100 80GB",
            precision: "bf16",
            distributed_strategy: "None"
        },
        logs: `Batch 1: GPU memory 40GB
Batch 500: GPU memory 65GB
Batch 1000: CUDA OOM`,
        config_snippet: `DataLoader(..., num_workers=8, pin_memory=True)`,
        analysis: "Memory leak often caused by not properly releasing tensors, or by accumulating history in lists. Also check for tensor graphs not being detached.",
        solutions: [
            {
                id: "sol-016a",
                title: "Use .detach() for logging",
                description: "When logging metrics, use `loss.detach().item()` instead of storing the loss tensor.",
                success_rate: 88,
                verified_count: 134
            }
        ],
        created_at: "2024-07-01"
    },
    {
        id: "case-017",
        title: "Flash Attention installation fails on CUDA 12.x",
        summary: "pip install flash-attn fails with CUDA version mismatch error on new drivers.",
        failure_type: "OOM",
        environment: {
            framework: "PyTorch",
            accelerators: "1x H100 80GB",
            precision: "bf16",
            distributed_strategy: "None"
        },
        logs: `error: CUDA 12.3 detected but flash-attn was compiled for CUDA 11.8`,
        config_snippet: `pip install flash-attn`,
        analysis: "Pre-built flash-attn wheels are compiled for specific CUDA versions. Need to build from source for CUDA 12+.",
        solutions: [
            {
                id: "sol-017a",
                title: "Build from source",
                description: "Run `pip install flash-attn --no-build-isolation` to compile for your CUDA version.",
                success_rate: 95,
                verified_count: 78
            }
        ],
        created_at: "2024-07-15"
    },
    {
        id: "case-018",
        title: "Distributed training stuck at random batch",
        summary: "Training randomly freezes at unpredictable batches. Different batch each time.",
        failure_type: "Deadlock",
        environment: {
            framework: "PyTorch",
            accelerators: "8x A100 80GB",
            precision: "bf16",
            distributed_strategy: "DDP"
        },
        logs: `Batch 234: [hangs indefinitely]
(next run) Batch 567: [hangs indefinitely]`,
        config_snippet: `sampler = DistributedSampler(dataset, shuffle=True)`,
        analysis: "Random freezing often indicates some batches have different tensor shapes across ranks, causing collective ops to wait forever.",
        solutions: [
            {
                id: "sol-018a",
                title: "Pad sequences to same length",
                description: "Ensure all ranks process the same sequence lengths within a batch using padding.",
                success_rate: 82,
                verified_count: 56
            }
        ],
        created_at: "2024-08-01"
    },
    {
        id: "case-019",
        title: "vLLM serving OOM with concurrent requests",
        summary: "vLLM server OOMs when handling more than 10 concurrent inference requests.",
        failure_type: "OOM",
        environment: {
            framework: "vLLM",
            accelerators: "1x A100 40GB",
            precision: "fp16",
            distributed_strategy: "None"
        },
        logs: `RuntimeError: CUDA out of memory during PagedAttention`,
        config_snippet: `vllm serve --model llama-70b --tensor-parallel-size 1`,
        analysis: "vLLM allocates KV cache upfront. 70B model on single 40GB GPU leaves no room for concurrent requests.",
        solutions: [
            {
                id: "sol-019a",
                title: "Use tensor parallelism",
                description: "Spread model across multiple GPUs: `--tensor-parallel-size 2` or more.",
                success_rate: 95,
                verified_count: 112
            },
            {
                id: "sol-019b",
                title: "Reduce gpu_memory_utilization",
                description: "Set `--gpu-memory-utilization 0.8` to reserve memory for request overhead.",
                success_rate: 70,
                verified_count: 45
            }
        ],
        created_at: "2024-08-15"
    },
    {
        id: "case-020",
        title: "Embeddings become all zeros after training",
        summary: "After finetuning, model embeddings for many tokens are exactly [0, 0, 0, ...]",
        failure_type: "NaN",
        environment: {
            framework: "PyTorch",
            accelerators: "2x A100 80GB",
            precision: "fp16",
            distributed_strategy: "DDP"
        },
        logs: `embedding_layer.weight[1000:2000] = tensor([[0., 0., ...], ...])`,
        config_snippet: `optimizer = AdamW(model.parameters(), lr=5e-4)`,
        analysis: "Embeddings collapsed to zero due to gradient updates pushing unused token embeddings to zero. Learning rate may be too high for embeddings.",
        solutions: [
            {
                id: "sol-020a",
                title: "Freeze embeddings or use lower LR",
                description: "Either freeze embedding layer or use separate learning rate groups with lower LR for embeddings.",
                success_rate: 85,
                verified_count: 67
            }
        ],
        created_at: "2024-09-01"
    }
];
