'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface BookingRequestCardProps {
    booking: {
        id: string;
        bookingCode: string;
        userName: string;
        userPhone: string;
        sportName: string;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
        amount: number;
        paymentProof?: string;
        utr?: string;
        createdAt: string;
    };
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
}

export default function BookingRequestCard({ booking, onApprove, onReject }: BookingRequestCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await onApprove(booking.id);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setIsRejecting(true);
        try {
            await onReject(booking.id, rejectionReason);
            setShowRejectForm(false);
            setRejectionReason('');
        } finally {
            setIsRejecting(false);
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Card className="border-l-4 border-yellow-400">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-600">Booking Request</div>
                        <div className="font-mono font-bold text-gray-900">
                            {booking.bookingCode}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatDate(booking.createdAt)}
                    </div>
                </div>
            </CardHeader>

            <CardBody className="space-y-4">
                {/* User Info */}
                <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">Customer Details</div>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-900">{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-900">{booking.userPhone}</span>
                        </div>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Sport & Court</div>
                        <div className="font-semibold text-gray-900">
                            {booking.sportName} - {booking.courtName}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Date</div>
                        <div className="font-semibold text-gray-900">
                            {formatDate(booking.date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Time</div>
                        <div className="font-semibold text-gray-900">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Amount</div>
                        <div className="text-xl font-bold text-blue-600">
                            ₹{booking.amount}
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                {(booking.paymentProof || booking.utr) && (
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2">Payment Details</div>
                        {booking.utr && (
                            <div className="text-sm mb-2">
                                <span className="text-gray-600">UTR: </span>
                                <span className="font-mono font-semibold">{booking.utr}</span>
                            </div>
                        )}
                        {booking.paymentProof && (
                            <a
                                href={booking.paymentProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                                View Payment Proof →
                            </a>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {!showRejectForm ? (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleApprove}
                            isLoading={isApproving}
                        >
                            ✅ Approve
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={() => setShowRejectForm(true)}
                        >
                            ❌ Reject
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <Input
                            label="Rejection Reason"
                            placeholder="Enter reason for rejection"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={handleReject}
                                isLoading={isRejecting}
                            >
                                Confirm Rejection
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
