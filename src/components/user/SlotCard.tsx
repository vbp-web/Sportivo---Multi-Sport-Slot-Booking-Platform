import React from 'react';
import Card, { CardBody } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface SlotCardProps {
    slot: {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        price: number;
        status: 'available' | 'booked' | 'blocked';
        courtName?: string;
        sportName?: string;
    };
    onBook?: () => void;
    onSelect?: (slotId: string) => void;
    isSelected?: boolean;
    multiSelectMode?: boolean;
}

export default function SlotCard({ slot, onBook, onSelect, isSelected, multiSelectMode }: SlotCardProps) {
    const isAvailable = slot.status === 'available';

    const statusConfig = {
        available: { variant: 'success' as const, label: 'Available' },
        booked: { variant: 'danger' as const, label: 'Booked' },
        blocked: { variant: 'default' as const, label: 'Blocked' },
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

    const handleClick = () => {
        if (multiSelectMode && onSelect && isAvailable) {
            onSelect(slot.id);
        }
    };

    return (
        <div
            className={multiSelectMode && isAvailable ? 'cursor-pointer' : ''}
            onClick={handleClick}
        >
            <Card
                className={`${!isAvailable ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${multiSelectMode && isAvailable ? 'hover:shadow-lg transition-shadow' : ''}`}
            >
                <CardBody className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">
                                {formatDate(slot.date)}
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={statusConfig[slot.status].variant}>
                                {statusConfig[slot.status].label}
                            </Badge>
                            {isSelected && (
                                <Badge variant="info">
                                    ✓ Selected
                                </Badge>
                            )}
                        </div>
                    </div>

                    {(slot.courtName || slot.sportName) && (
                        <div className="space-y-2 mb-4">
                            {slot.sportName && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{slot.sportName}</span>
                                </div>
                            )}
                            {slot.courtName && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{slot.courtName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                        <div>
                            <div className="text-sm text-gray-400">Price</div>
                            <div className="text-2xl font-bold text-blue-600">
                                ₹{slot.price}
                            </div>
                        </div>

                        {!multiSelectMode && isAvailable && onBook && (
                            <Button onClick={onBook} size="sm">
                                Book Now
                            </Button>
                        )}

                        {multiSelectMode && isAvailable && (
                            <div className="text-sm text-gray-500">
                                {isSelected ? 'Click to deselect' : 'Click to select'}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
