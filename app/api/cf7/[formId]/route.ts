import { NextRequest, NextResponse } from 'next/server';

const WP = 'https://dev-bluerange.pantheonsite.io';

// Map of numeric CFDB7 form IDs to their CF7 GUID and ACF field info
const FORM_MAP: Record<string, { guid: string; slug: string; acfField: string }> = {
    '947': { guid: '8e88d3b',  slug: 'backup',                      acfField: 'storage_request_form_shortcode' },
    '948': { guid: 'cbbde7a',  slug: 'co-location',                  acfField: 'colc_form_shortcode' },
    '955': { guid: '1465da7',  slug: 's3-storage',                   acfField: 'colc_form_shortcode' },
    '957': { guid: 'b990f59',  slug: 'career',                       acfField: 'career_form_shortcode' },
    '943': { guid: 'b8c2759',  slug: 'public-sector',                acfField: 'metting_form_shortcode' },
    '944': { guid: '',         slug: 'software-hosting-as-a-service', acfField: 'get_a_quote_form' },
    '70':  { guid: '',         slug: 'contact-us',                   acfField: 'contact_form' },
    '282': { guid: '',         slug: 'service',                      acfField: 'services_questions_shortcode' },
};

async function fetchFormHtml(formId: string): Promise<string> {
    const info = FORM_MAP[formId];
    const guid = info?.guid;

    // Use GUID if available, otherwise numeric ID
    const shortcodeId = guid || formId;
    const code = `[contact-form-7 id="${shortcodeId}"]`;

    const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    if (!res.ok) return '';

    const raw = await res.text();
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') return parsed;
        if (parsed?.html) return parsed.html;
        if (parsed?.data) return parsed.data;
        return raw;
    } catch {
        return raw;
    }
}

// GET: return real field names extracted from WP rendered form HTML
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        const html = await fetchFormHtml(formId);
        if (!html) return NextResponse.json({ fields: [] });

        const nameMatches = [...html.matchAll(/name="([^"]+)"/g)];
        const fields = [...new Set(
            nameMatches
                .map((m: RegExpMatchArray) => m[1])
                .filter((n: string) => !n.startsWith('_wpcf7') && !n.startsWith('g-recaptcha'))
        )];

        return NextResponse.json({ fields });
    } catch {
        return NextResponse.json({ fields: [] });
    }
}

// POST: proxy submission to WP CF7 REST API
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        const incoming = await req.formData();
        
        // Get the GUID for WordPress submission
        const info = FORM_MAP[formId];
        const guid = info?.guid || formId;

        const body = new FormData();
        body.append('_wpcf7', guid);
        body.append('_wpcf7_version', '6.1.3');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', `wpcf7-f${guid}-o1`);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        // Add all form fields from the incoming request
        for (const [key, value] of incoming.entries()) {
            body.append(key, value);
        }

        const wpUrl = `${WP}/wp-json/contact-form-7/v1/contact-forms/${guid}/feedback`;

        const res = await fetch(wpUrl, { method: 'POST', body });
        const json = await res.json();
        
        return NextResponse.json(json);
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ status: 'error', message: 'Submission failed' }, { status: 500 });
    }
}
