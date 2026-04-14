import { NextRequest, NextResponse } from 'next/server';

const WP = 'https://dev-bluerange.pantheonsite.io';

// GET: fetch form field names from WP rendered HTML
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        // Render the shortcode to get actual field names
        const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: `[contact-form-7 id="${formId}"]` }),
            next: { revalidate: 3600 },
        } as RequestInit);

        if (!res.ok) return NextResponse.json({ fields: [] });

        const html: string = await res.text();

        // Extract all input/textarea/select name attributes
        const nameMatches = [...html.matchAll(/name="([^"_][^"]+)"/g)];
        const fields = [...new Set(
            nameMatches
                .map(m => m[1])
                .filter(n => !n.startsWith('_wpcf7'))
        )];

        return NextResponse.json({ fields, html });
    } catch {
        return NextResponse.json({ fields: [] });
    }
}

// POST: proxy form submission to WP CF7 REST API
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    try {
        const formData = await req.formData();

        // Ensure required CF7 hidden fields are present
        if (!formData.get('_wpcf7')) formData.set('_wpcf7', formId);
        if (!formData.get('_wpcf7_unit_tag')) formData.set('_wpcf7_unit_tag', `wpcf7-f${formId}-o1`);
        if (!formData.get('_wpcf7_version')) formData.set('_wpcf7_version', '6.1.3');
        if (!formData.get('_wpcf7_locale')) formData.set('_wpcf7_locale', 'en_US');
        if (!formData.get('_wpcf7_container_post')) formData.set('_wpcf7_container_post', '0');
        if (!formData.get('_wpcf7_posted_data_hash')) formData.set('_wpcf7_posted_data_hash', '');

        const res = await fetch(
            `${WP}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
            { method: 'POST', body: formData }
        );

        const json = await res.json();
        return NextResponse.json(json);
    } catch (e) {
        return NextResponse.json({ status: 'error', message: 'Submission failed' }, { status: 500 });
    }
}
