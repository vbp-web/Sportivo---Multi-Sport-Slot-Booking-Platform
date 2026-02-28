'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    tiltAmount?: number;
    glareEnabled?: boolean;
}

export default function TiltCard({
    children,
    className = '',
    tiltAmount = 10,
    glareEnabled = true,
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const percentX = mouseX / (rect.width / 2);
        const percentY = mouseY / (rect.height / 2);

        setRotateX(-percentY * tiltAmount);
        setRotateY(percentX * tiltAmount);
        setGlarePosition({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlarePosition({ x: 50, y: 50 });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`${className} relative overflow-hidden`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
            animate={{
                rotateX,
                rotateY,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
        >
            {children}
            {glareEnabled && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                        opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0,
                    }}
                />
            )}
        </motion.div>
    );
}
