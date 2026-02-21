import Link from 'next/link';
import Image from 'next/image';
import Card, { CardBody, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';

interface VenueCardProps {
    venue: {
        id: string;
        name: string;
        city: string;
        address: string;
        sports: string[];
        rating?: number;
        images?: string[];
        isActive: boolean;
    };
}

export default function VenueCard({ venue }: VenueCardProps) {
    return (
        <Card hover className="h-full">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400">
                {venue.images && venue.images.length > 0 ? (
                    <Image
                        src={venue.images[0]}
                        alt={venue.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                        🏟️
                    </div>
                )}

                {venue.isActive && (
                    <div className="absolute top-4 right-4">
                        <Badge variant="success">Open</Badge>
                    </div>
                )}
            </div>

            <CardBody className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {venue.name}
                </h3>

                <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{venue.address}, {venue.city}</span>
                </div>

                {venue.rating && (
                    <div className="flex items-center gap-1 mb-3">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-900">{venue.rating.toFixed(1)}</span>
                    </div>
                )}

                {/* Sports Tags */}
                <div className="flex flex-wrap gap-2">
                    {venue.sports.slice(0, 3).map((sport) => (
                        <Badge key={sport} variant="info" size="sm">
                            {sport}
                        </Badge>
                    ))}
                    {venue.sports.length > 3 && (
                        <Badge variant="default" size="sm">
                            +{venue.sports.length - 3} more
                        </Badge>
                    )}
                </div>
            </CardBody>

            <CardFooter className="p-5">
                <Link href={`/venues/${venue.id}`} className="w-full">
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30">
                        View Details
                    </button>
                </Link>
            </CardFooter>
        </Card>
    );
}
