'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timeout);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-indigo-600 animate-pulse">
            <div className="h-full bg-indigo-400 animate-slide" style={{
                animation: 'slide 1s ease-in-out infinite'
            }} />
            <style jsx>{`
                @keyframes slide {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}
