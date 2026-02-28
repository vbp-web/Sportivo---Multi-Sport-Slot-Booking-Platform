import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, gradient = false, onClick }: CardProps) {
    const baseStyles = 'bg-gray-900/60 border border-white/[0.06] rounded-2xl shadow-lg overflow-hidden';
    const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer hover:border-white/[0.12]' : '';
    const gradientStyles = gradient ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/50' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-white/[0.06] ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] ${className}`}>
            {children}
        </div>
    );
}
