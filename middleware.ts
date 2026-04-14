import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LANGS = ['en', 'sv'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';

    // Check if the pathname starts with a language segment
    const segments = pathname.split('/');
    const langSegment = segments[1];

    let detectedLang = '';

    // 1. Priority: URL path segment
    if (VALID_LANGS.includes(langSegment)) {
        detectedLang = langSegment;
    } 
    // 2. Domain-based detection
    else if (host.endsWith('.se')) {
        detectedLang = 'sv';
    } 
    // 3. Cookie fallback
    else {
        detectedLang = request.cookies.get('lang')?.value || 'en';
    }

    // Default to 'en' if still not set or invalid
    if (!VALID_LANGS.includes(detectedLang)) {
        detectedLang = 'en';
    }

    const response = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    });

    // Add the header for server components
    response.headers.set('x-lang', detectedLang);
    // Also use request headers for some versions of Next.js middleware chaining
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lang', detectedLang);

    const finalResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Update 'lang' cookie if different
    const currentCookieLang = request.cookies.get('lang')?.value;
    if (currentCookieLang !== detectedLang) {
        finalResponse.cookies.set('lang', detectedLang, {
            path: '/',
            maxAge: 31536000,
            sameSite: 'lax',
        });
    }

    // NEW: Rewrite logic to avoid [lang] vs [slug] conflict
    // If the URL doesn't have a lang prefix, rewrite it to include one internally.
    if (!VALID_LANGS.includes(langSegment) && pathname !== '/' && !pathname.startsWith('/api/') && !pathname.includes('.')) {
        const url = request.nextUrl.clone();
        url.pathname = `/${detectedLang}${pathname}`;
        
        // Return a rewrite instead of a plain next()
        const rewriteResponse = NextResponse.rewrite(url);
        rewriteResponse.headers.set('x-lang', detectedLang);
        if (currentCookieLang !== detectedLang) {
            rewriteResponse.cookies.set('lang', detectedLang, {
                path: '/',
                maxAge: 31536000,
                sameSite: 'lax',
            });
        }
        return rewriteResponse;
    }

    return finalResponse;
}

export const config = {
    matcher: [
        // Match all paths except internal ones (api, _next, static, etc.)
        '/((?!api|_next/static|_next/image|favicon.ico|understrap|understrap-child|assets|images).*)',
    ],
};
