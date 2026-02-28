'use client';

import React, { useEffect, useRef } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';

interface QRCodeDisplayProps {
    data: string;
    title?: string;
    description?: string;
    size?: number;
}

export default function QRCodeDisplay({
    data,
    title = 'Scan QR Code',
    description,
    size = 256
}: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && typeof window !== 'undefined') {
            // Using a simple QR code generation approach
            // In production, use a library like 'qrcode' or 'qrcode.react'
            generateQRCode(data, canvasRef.current, size);
        }
    }, [data, size]);

    const generateQRCode = async (text: string, canvas: HTMLCanvasElement, size: number) => {
        try {
            // Dynamic import of qrcode library
            const QRCode = (await import('qrcode')).default;
            await QRCode.toCanvas(canvas, text, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            // Fallback: Display text if QR generation fails
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#f3f4f6';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#374151';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('QR Code', size / 2, size / 2 - 10);
                ctx.fillText('Generation Failed', size / 2, size / 2 + 10);
            }
        }
    };

    return (
        <Card>
            {title && (
                <CardHeader>
                    <h3 className="text-lg font-bold text-white text-center">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-400 text-center mt-1">{description}</p>
                    )}
                </CardHeader>
            )}

            <CardBody className="flex flex-col items-center justify-center p-6">
                <div className="p-4 bg-gray-900/60 rounded-xl shadow-inner">
                    <canvas
                        ref={canvasRef}
                        width={size}
                        height={size}
                        className="rounded-lg"
                    />
                </div>

                {data && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg w-full">
                        <p className="text-xs text-gray-400 text-center break-all font-mono">
                            {data}
                        </p>
                    </div>
                )}

                <p className="text-sm text-gray-500 text-center mt-4">
                    Scan this QR code to make payment
                </p>
            </CardBody>
        </Card>
    );
}
