'use client';

import {usePathname} from 'next/navigation';

/**
 * Footer component displaying Qdrant branding.
 * Fixed position at bottom of screen.
 * Hidden on the main page (/) which has its own footer in the performance bar.
 */
export default function Footer(): React.ReactElement | null {
    const pathname = usePathname();

    // Don't render on the main page - it has its own footer in the performance bar
    if (pathname === '/') {
        return null;
    }

    return (
        <footer className="fixed bottom-0 left-0 right-0 p-4 text-center pointer-events-none z-40">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                Powered by <span className="text-slate-400 font-bold">Qdrant Cloud</span>
            </div>
        </footer>
    );
}
