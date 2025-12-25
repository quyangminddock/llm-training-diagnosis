import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false, ...props }: CardProps) {
    const baseStyle = "card";
    const hoverStyle = hoverable ? "cursor-pointer hover:border-active transition-colors" : "";

    return (
        <div
            className={`${baseStyle} ${hoverStyle} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}
