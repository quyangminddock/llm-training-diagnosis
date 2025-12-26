"use client";

import { useState } from 'react';
import { Button } from './Button';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={handleCopy}
            className={`text-xs h-8 px-2 ${className}`}
            title="Copy to clipboard"
        >
            {copied ? '✅ Copied' : '📋 Copy'}
        </Button>
    );
}
