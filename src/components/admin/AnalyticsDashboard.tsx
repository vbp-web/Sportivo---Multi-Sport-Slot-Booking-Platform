'use client';

import React from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';

interface AnalyticsDashboardProps {
    data: {
        overview: {
            totalRevenue: number;
            totalBookings: number;
            totalVenues: number;
            totalOwners: number;
            activeUsers: number;
            pendingApprovals: number;
        };
        recentActivity: Array<{
            id: string;
            type: 'booking' | 'owner' | 'payment' | 'venue';
            message: string;
            timestamp: string;
        }>;
        topVenues: Array<{
            id: string;
            name: string;
            city: string;
            bookings: number;
            revenue: number;
        }>;
        monthlyStats: Array<{
            month: string;
            revenue: number;
            bookings: number;
        }>;
    };
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const stats = [
        {
            title: 'Total Revenue',
            value: `₹${data.overview.totalRevenue.toLocaleString()}`,
            icon: '💰',
            color: 'from-green-500 to-green-600',
            change: '+12.5%',
        },
        {
            title: 'Total Bookings',
            value: data.overview.totalBookings.toLocaleString(),
            icon: '📅',
            color: 'from-blue-500 to-blue-600',
            change: '+8.3%',
        },
        {
            title: 'Active Venues',
            value: data.overview.totalVenues,
            icon: '🏟️',
            color: 'from-purple-500 to-purple-600',
            change: '+5.2%',
        },
        {
            title: 'Venue Owners',
            value: data.overview.totalOwners,
            icon: '🏢',
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            title: 'Active Users',
            value: data.overview.activeUsers.toLocaleString(),
            icon: '👥',
            color: 'from-pink-500 to-pink-600',
            change: '+15.7%',
        },
        {
            title: 'Pending Approvals',
            value: data.overview.pendingApprovals,
            icon: '⏳',
            color: 'from-yellow-500 to-yellow-600',
            urgent: data.overview.pendingApprovals > 0,
        },
    ];

    const activityIcons = {
        booking: '📅',
        owner: '🏢',
        payment: '💳',
        venue: '🏟️',
    };

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
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

                                <div className="text-3xl font-bold text-white mb-1">
                                    {stat.value}
                                </div>

                                <div className="text-sm text-gray-400">
                                    {stat.title}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Revenue Chart */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-bold text-white">Monthly Revenue</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {data.monthlyStats.map((month, index) => {
                                const maxRevenue = Math.max(...data.monthlyStats.map(m => m.revenue));
                                const percentage = (month.revenue / maxRevenue) * 100;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-300">{month.month}</span>
                                            <span className="text-sm font-bold text-white">
                                                ₹{month.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardBody>
                </Card>

                {/* Top Venues */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-bold text-white">Top Performing Venues</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {data.topVenues.map((venue, index) => (
                                <div key={venue.id} className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-white">{venue.name}</div>
                                        <div className="text-sm text-gray-400">{venue.city}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-blue-600">
                                            ₹{venue.revenue.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {venue.bookings} bookings
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        {data.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-900 rounded-lg transition-colors">
                                <div className="text-2xl">{activityIcons[activity.type]}</div>
                                <div className="flex-1">
                                    <p className="text-sm text-white">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.timestamp).toLocaleString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
