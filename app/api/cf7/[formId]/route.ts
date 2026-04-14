import { NextRequest, NextResponse } from 'next/server';

const WP = 'https://dev-bluerange.pantheonsite.io';

// GET: fetch real field names from WP rendered CF7 form HTML
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: `[contact-form-7 id="${formId}"]` }),
        });

        if (!res.ok) return NextResponse.json({ fields: [] });

        // The endpoint returns JSON — extract the html string from it
        const raw = await res.text();
        let html = '';
        try {
            const parsed = JSON.parse(raw);
            // Could be string, or { html: '...' }, or { data: '...' }
            if (typeof parsed === 'string') html = parsed;
            else if (parsed?.html) html = parsed.html;
            else if (parsed?.data) html = parsed.data;
            else html = raw;
        } catch {
            html = raw;
        }

        // Extract name attributes from input/textarea/select — skip hidden CF7 fields
        const nameMatches = [...html.matchAll(/name="([^"]+)"/g)];
        const fields = [...new Set(
            nameMatches
                .map((m: RegExpMatchArray) => m[1])
                .filter((n: string) => !n.startsWith('_wpcf7') && !n.startsWith('g-recaptcha'))
        )];

        if (fields.length === 0) {
            // Fallback: try fetching form structure from CF7 REST API
            const cfRes = await fetch(`${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}`, {
                headers: { 'Accept': 'application/json' },
            }).catch(() => null);
            if (cfRes?.ok) {
                const cfData = await cfRes.json();
                // Extract field tags from form body
                const tagMatches = [...(cfData?.properties?.form?.body || '').matchAll(/\[[\w-]+\s+([^\s\]]+)/g)];
                const tagFields = tagMatches.map((m: RegExpMatchArray) => m[1]).filter((n: string) => n && !n.startsWith('_'));
                return NextResponse.json({ fields: [...new Set(tagFields)] });
            }
        }

        return NextResponse.json({ fields });
    } catch {
        return NextResponse.json({ fields: [] });
    }
}

// POST: proxy submission directly to WP CF7 REST API
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        const incoming = await req.formData();

        // Build a clean FormData with all required CF7 hidden fields
        const body = new FormData();
        body.append('_wpcf7', formId);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', `wpcf7-f${formId}-o1`);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        // Copy all user-submitted fields
        for (const [key, value] of incoming.entries()) {
            if (!key.startsWith('_wpcf7')) {
                body.append(key, value);
            }
        }

        const res = await fetch(
            `${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
            { method: 'POST', body }
        );

        const json = await res.json();
        return NextResponse.json(json);
    } catch {
        return NextResponse.json({ status: 'error', message: 'Submission failed' }, { status: 500 });
    }
}
