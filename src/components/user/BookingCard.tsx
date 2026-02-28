import React from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';

interface BookingCardProps {
    booking: {
        id: string;
        bookingCode: string;
        venueName: string;
        sportName: string;
        courtName?: string;
        date: string;
        startTime: string;
        endTime: string;
        amount: number;
        status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
        createdAt: string;
    };
}

export default function BookingCard({ booking }: BookingCardProps) {
    const statusConfig = {
        pending: { variant: 'warning' as const, label: 'Pending', icon: '⏳' },
        confirmed: { variant: 'success' as const, label: 'Confirmed', icon: '✅' },
        rejected: { variant: 'danger' as const, label: 'Rejected', icon: '❌' },
        cancelled: { variant: 'default' as const, label: 'Cancelled', icon: '🚫' },
        completed: { variant: 'info' as const, label: 'Completed', icon: '🎉' },
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
        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-400">Booking ID</div>
                    <div className="font-mono font-bold text-white">
                        {booking.bookingCode}
                    </div>
                </div>
                <Badge variant={statusConfig[booking.status].variant} size="lg">
                    {statusConfig[booking.status].icon} {statusConfig[booking.status].label}
                </Badge>
            </CardHeader>

            <CardBody className="space-y-4">
                {/* Venue Info */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        {booking.venueName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{booking.sportName}</span>
                        {booking.courtName && (
                            <>
                                <span>•</span>
                                <span>{booking.courtName}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Date</div>
                        <div className="font-semibold text-white flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Time</div>
                        <div className="font-semibold text-white flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                    <div className="text-gray-400">Total Amount</div>
                    <div className="text-2xl font-bold text-blue-600">
                        ₹{booking.amount}
                    </div>
                </div>

                {/* Booked On */}
                <div className="text-xs text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                </div>
            </CardBody>
        </Card>
    );
}
