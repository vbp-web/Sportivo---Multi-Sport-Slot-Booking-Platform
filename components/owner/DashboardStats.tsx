import React from 'react';
import Card, { CardBody } from '../ui/Card';

interface DashboardStatsProps {
    stats: {
        totalBookings: number;
        pendingBookings: number;
        todayRevenue: number;
        monthlyRevenue: number;
        activeSlots: number;
        totalCourts: number;
        subscription?: {
            planName: string;
            bookingsUsage: number;
            bookingsLimit: string | number;
            messagesUsage: number;
            messagesLimit: string | number;
            daysRemaining: number;
        } | null;
    };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        ...(stats.subscription ? [
            {
                title: 'Plan Usage (Bookings)',
                value: `${stats.subscription.bookingsUsage} / ${stats.subscription.bookingsLimit}`,
                icon: '🎫',
                color: 'from-cyan-500 to-blue-500',
                details: `${stats.subscription.planName} Plan`,
            },
            {
                title: 'Plan Usage (Messages)',
                value: `${stats.subscription.messagesUsage} / ${stats.subscription.messagesLimit}`,
                icon: '✉️',
                color: 'from-orange-400 to-red-500',
                details: `${stats.subscription.daysRemaining} days left`,
            }
        ] : []),
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: '📊',
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingBookings,
            icon: '⏳',
            color: 'from-yellow-500 to-yellow-600',
            urgent: stats.pendingBookings > 0,
        },
        {
            title: "Today's Revenue",
            value: `₹${stats.todayRevenue.toLocaleString()}`,
            icon: '💰',
            color: 'from-green-500 to-green-600',
            change: '+8%',
        },
        {
            title: 'Monthly Revenue',
            value: `₹${stats.monthlyRevenue.toLocaleString()}`,
            icon: '📈',
            color: 'from-purple-500 to-purple-600',
            change: '+15%',
        },
        {
            title: 'Active Slots',
            value: stats.activeSlots,
            icon: '🎯',
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            title: 'Total Courts',
            value: stats.totalCourts,
            icon: '🏟️',
            color: 'from-pink-500 to-pink-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
                <Card
                    key={index}
                    className={`${stat.urgent ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                >
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                                {stat.icon}
                            </div>
                            {stat.change && (
                                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    {stat.change}
                                </span>
                            )}
                        </div>

                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {stat.value}
                        </div>

                        <div className="text-sm text-gray-600">
                            {stat.title}
                        </div>

                        {stat.details && (
                            <div className="mt-2 text-xs font-medium text-gray-400">
                                {stat.details}
                            </div>
                        )}
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
