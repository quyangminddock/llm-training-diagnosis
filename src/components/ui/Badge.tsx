import React from 'react';

interface BadgeProps {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
    className?: string;
}

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
    let variantStyle = '';

    switch (variant) {
        case 'success':
            variantStyle = 'border-green-800 text-green-400 bg-green-900/20'; // Fallback usage usually, but we use CSS vars
            break;
        case 'warning':
            variantStyle = 'border-yellow-800 text-yellow-400 bg-yellow-900/20';
            break;
        case 'error':
            variantStyle = 'border-red-800 text-red-400 bg-red-900/20';
            break;
        case 'info':
            variantStyle = 'border-blue-800 text-blue-400 bg-blue-900/20';
            break;
        case 'outline':
            variantStyle = 'border-secondary text-secondary bg-transparent';
            break;
        default:
            variantStyle = 'bg-hover text-primary border-default';
    }

    // We'll use inline styles for the specific colors mapped to our CSS vars if complexity grows, 
    // but for now relying on globals or simple utility classes is cleaner if we had them. 
    // Since we don't have utility classes for colors in globals.css yet, let's use style prop or just hardcode classes and define them in Badge.module.css?
    // Actually, let's keep it simple and use style objects or extend globals.

    // Re-approach: using style directly for dynamic variant mapping to globals
    const getStyle = () => {
        switch (variant) {
            case 'success': return { borderColor: 'rgba(35, 134, 54, 0.4)', color: '#7ee787', backgroundColor: 'rgba(35, 134, 54, 0.1)' };
            case 'warning': return { borderColor: 'rgba(210, 153, 34, 0.4)', color: '#d29922', backgroundColor: 'rgba(210, 153, 34, 0.1)' };
            case 'error': return { borderColor: 'rgba(218, 54, 51, 0.4)', color: '#f85149', backgroundColor: 'rgba(218, 54, 51, 0.1)' };
            case 'info': return { borderColor: 'rgba(56, 139, 253, 0.4)', color: '#58a6ff', backgroundColor: 'rgba(56, 139, 253, 0.1)' };
            case 'outline': return { borderColor: 'var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'transparent' };
            default: return { borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' };
        }
    };

    return (
        <span className={`badge ${className}`} style={getStyle()}>
            {label}
        </span>
    );
}
