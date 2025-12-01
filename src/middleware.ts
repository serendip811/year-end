import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const publicPaths = [
        '/login',
        '/api/auth/login',
    ];

    const publicPathPrefixes = [
        '/icons',
        '/_next',
        '/workbox-',
    ];

    const publicFiles = [
        '/manifest.json',
        '/sw.js',
        '/firebase-messaging-sw.js',
    ];

    const isPublicPath = 
        publicPaths.includes(path) ||
        publicPathPrefixes.some(prefix => path.startsWith(prefix)) ||
        publicFiles.includes(path);

    const token = request.cookies.get('auth_token')?.value;
    const verifiedToken = token ? await verifyToken(token) : null;

    // If trying to access a protected path without a token, redirect to login
    if (!isPublicPath && !verifiedToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access login page with a valid token, redirect to dashboard
    if (path === '/login' && verifiedToken) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> actually we want to protect API routes too, except auth
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
