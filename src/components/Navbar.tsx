'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

/**
 * Navigation bar component for the QCI demo application.
 * Fixed position at top of screen with blur backdrop.
 * Hidden on the main page (/) which has its own custom header.
 */
export default function Navbar(): React.ReactElement | null {
    const pathname = usePathname();

    // Don't render on the main page - it has its own header
    if (pathname === '/') {
        return null;
    }

    // Simplified nav - back to demo + Why QCI
    const links = pathname === '/compare'
        ? [{href: '/', label: '← Back to Demo'}]
        : [
            {href: '/', label: '← Back to Demo'},
            {href: '/compare', label: 'Why QCI?'},
        ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex gap-6 pointer-events-auto shadow-2xl">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-xs font-bold font-mono uppercase tracking-wider transition-colors hover:text-white ${
                            pathname === link.href ? 'text-blue-400' : 'text-slate-500'
                        }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
