'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypeWriterProps {
    texts: {
        content: string;
        className?: string;
    }[];
    speed?: number;
    delayBetweenLines?: number;
    cursorColor?: string;
}

export default function TypeWriter({
    texts,
    speed = 60,
    delayBetweenLines = 400,
    cursorColor = '#818cf8',
}: TypeWriterProps) {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [completedLines, setCompletedLines] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (currentLineIndex >= texts.length) {
            setIsTyping(false);
            return;
        }

        const currentText = texts[currentLineIndex].content;

        if (currentCharIndex < currentText.length) {
            const timeout = setTimeout(() => {
                setCurrentCharIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            // Line complete — move to next
            const timeout = setTimeout(() => {
                setCompletedLines((prev) => [...prev, currentLineIndex]);
                setCurrentLineIndex((prev) => prev + 1);
                setCurrentCharIndex(0);
            }, delayBetweenLines);
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, currentCharIndex, texts, speed, delayBetweenLines]);

    return (
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {texts.map((line, lineIndex) => {
                const isCompleted = completedLines.includes(lineIndex);
                const isCurrent = lineIndex === currentLineIndex;
                const displayText = isCompleted
                    ? line.content
                    : isCurrent
                        ? line.content.substring(0, currentCharIndex)
                        : '';

                if (!isCompleted && !isCurrent) return null;

                return (
                    <React.Fragment key={lineIndex}>
                        {lineIndex > 0 && <br />}
                        <motion.span
                            className={line.className || 'text-white'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1 }}
                        >
                            {displayText.split('').map((char, charIndex) => (
                                <motion.span
                                    key={`${lineIndex}-${charIndex}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.15,
                                        ease: 'easeOut',
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.span>
                        {/* Blinking cursor */}
                        {isCurrent && !isCompleted && (
                            <motion.span
                                className="inline-block w-[3px] h-[1em] ml-1 rounded-full align-middle"
                                style={{ backgroundColor: cursorColor }}
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
            {/* Final cursor blinks then fades */}
            {!isTyping && (
                <motion.span
                    className="inline-block w-[3px] h-[1em] ml-1 rounded-full align-middle"
                    style={{ backgroundColor: cursorColor }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.5, delay: 1 }}
                />
            )}
        </h1>
    );
}
