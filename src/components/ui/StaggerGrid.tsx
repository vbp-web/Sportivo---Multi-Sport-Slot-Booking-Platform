'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StaggerGridProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

export default function StaggerGrid({
    children,
    className = '',
    staggerDelay = 0.1,
}: StaggerGridProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut' as const,
            },
        },
    } as const;

    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}
