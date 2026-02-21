import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold text-blue-600 opacity-20">404</div>
                <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
                <p className="text-lg text-gray-600">
                    Oops! The page you are looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/">
                        <Button>Go Home</Button>
                    </Link>
                    <Link href="/cities">
                        <Button variant="outline">Browse Venues</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
