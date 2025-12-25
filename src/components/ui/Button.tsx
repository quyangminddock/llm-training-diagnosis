import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export function Button({ variant = 'secondary', children, className = '', ...props }: ButtonProps) {
    const variantClass = variant === 'primary' ? 'btn-primary' : '';

    return (
        <button className={`btn ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
}
