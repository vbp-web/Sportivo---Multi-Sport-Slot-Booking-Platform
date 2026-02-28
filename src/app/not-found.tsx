import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent opacity-40">404</div>
                <h1 className="text-4xl font-bold text-white">Page Not Found</h1>
                <p className="text-lg text-gray-400">
                    Oops! The page you are looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/">
                        <Button>Go Home</Button>
                    </Link>
                    <Link href="/cities">
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/5">Browse Venues</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
