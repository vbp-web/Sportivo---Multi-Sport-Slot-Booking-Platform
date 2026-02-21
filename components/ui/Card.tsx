import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, gradient = false, onClick }: CardProps) {
    const baseStyles = 'bg-white rounded-2xl shadow-lg overflow-hidden';
    const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';
    const gradientStyles = gradient ? 'bg-gradient-to-br from-white to-blue-50' : '';

    return (
        <div className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
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
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>
            {children}
        </div>
    );
}
