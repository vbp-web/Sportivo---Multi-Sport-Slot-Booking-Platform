'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left"
            style={{
                scaleX,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
            }}
        />
    );
}
