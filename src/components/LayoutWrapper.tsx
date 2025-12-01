'use client';

import { usePathname } from 'next/navigation';
import FCMHandler from '@/components/FCMHandler';
import FCMDebugger from '@/components/FCMDebugger';
import BottomNav from '@/components/BottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admim');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            <FCMHandler />
            <FCMDebugger />
            <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
                <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col">
                    <div className="flex-1 pb-16 overflow-hidden">{children}</div>
                    <BottomNav />
                </div>
            </div>
        </>
    );
}

