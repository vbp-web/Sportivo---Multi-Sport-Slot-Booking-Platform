'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface OwnerApprovalCardProps {
    owner: {
        id: string;
        ownerName: string;
        venueName: string;
        city: string;
        phone: string;
        email?: string;
        sportsOffered: string[];
        createdAt: string;
    };
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
}

export default function OwnerApprovalCard({ owner, onApprove, onReject }: OwnerApprovalCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await onApprove(owner.id);
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
            await onReject(owner.id, rejectionReason);
            setShowRejectForm(false);
            setRejectionReason('');
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <Card className="border-l-4 border-yellow-400">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{owner.venueName}</h3>
                        <p className="text-sm text-gray-600">Owner: {owner.ownerName}</p>
                    </div>
                    <Badge variant="warning">Pending Approval</Badge>
                </div>
            </CardHeader>

            <CardBody className="space-y-4">
                {/* Owner Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">City</div>
                        <div className="font-semibold text-gray-900">{owner.city}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Phone</div>
                        <div className="font-semibold text-gray-900">{owner.phone}</div>
                    </div>
                    {owner.email && (
                        <div className="col-span-2">
                            <div className="text-sm text-gray-600 mb-1">Email</div>
                            <div className="font-semibold text-gray-900">{owner.email}</div>
                        </div>
                    )}
                </div>

                {/* Sports Offered */}
                <div>
                    <div className="text-sm text-gray-600 mb-2">Sports Offered</div>
                    <div className="flex flex-wrap gap-2">
                        {owner.sportsOffered.map((sport, index) => (
                            <Badge key={index} variant="info">
                                {sport}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Registration Date */}
                <div className="text-xs text-gray-500">
                    Registered on {new Date(owner.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}
                </div>

                {/* Action Buttons */}
                {!showRejectForm ? (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleApprove}
                            isLoading={isApproving}
                        >
                            ✅ Approve Owner
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
