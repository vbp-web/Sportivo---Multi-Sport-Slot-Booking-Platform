'use client';

import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

interface CountUpNumberProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    className?: string;
    decimals?: number;
}

export default function CountUpNumber({
    end,
    suffix = '',
    prefix = '',
    duration = 2.5,
    className = '',
    decimals = 0,
}: CountUpNumberProps) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    return (
        <span ref={ref} className={className}>
            {inView ? (
                <CountUp
                    start={0}
                    end={end}
                    duration={duration}
                    suffix={suffix}
                    prefix={prefix}
                    decimals={decimals}
                    separator=","
                />
            ) : (
                `${prefix}0${suffix}`
            )}
        </span>
    );
}
