import React from 'react';
import Link from 'next/link';
import Card, { CardBody } from '../ui/Card';
import Badge from '../ui/Badge';

interface CityCardProps {
    city: {
        id: string;
        name: string;
        state: string;
        venueCount: number;
        isActive: boolean;
    };
}

export default function CityCard({ city }: CityCardProps) {
    return (
        <Link href={`/cities/${city.id}/venues`}>
            <Card hover className="h-full">
                <CardBody className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                            🏙️
                        </div>
                        {city.isActive && (
                            <Badge variant="success" size="sm">Active</Badge>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {city.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                        {city.state}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{city.venueCount} Venues</span>
                        </div>

                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </CardBody>
            </Card>
        </Link>
    );
}
