import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LANGS = ['en', 'sv'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the pathname starts with a language segment
    const segments = pathname.split('/');
    const langSegment = segments[1];

    if (VALID_LANGS.includes(langSegment)) {
        // Add a header so server components can read the current lang immediately
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-lang', langSegment);

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        
        // Also update the 'lang' cookie for future requests
        const currentLang = request.cookies.get('lang')?.value;
        if (currentLang !== langSegment) {
            response.cookies.set('lang', langSegment, {
                path: '/',
                maxAge: 31536000,
                sameSite: 'lax',
            });
        }
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except internal ones (api, _next, static, etc.)
        '/((?!api|_next/static|_next/image|favicon.ico|understrap|understrap-child|assets|images).*)',
    ],
};
