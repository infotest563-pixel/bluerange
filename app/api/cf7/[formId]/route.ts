import { NextRequest, NextResponse } from 'next/server';

const WP = 'https://dev-bluerange.pantheonsite.io';

// Map of numeric CFDB7 form IDs to their CF7 GUID
const FORM_MAP: Record<string, string> = {
    '947': '8e88d3b',
    '948': 'cbbde7a',
    '955': '1465da7',
    '957': 'b990f59',
    '943': 'b8c2759',
};

// GET: return predefined field names (no longer fetching from WP)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ formId: string }> }
) {
    const { formId } = await params;
    
    // Return empty fields array - we're using predefined fields in the component
    return NextResponse.json({ fields: [] });
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
        const guid = FORM_MAP[formId] || formId;

        // Create form data for WordPress
        const body = new FormData();
        
        // Add CF7 required fields
        body.append('_wpcf7', guid);
        body.append('_wpcf7_version', '5.8');
        body.append('_wpcf7_locale', 'en_US');
        body.append('_wpcf7_unit_tag', `wpcf7-f${guid}-o1`);
        body.append('_wpcf7_container_post', '0');
        body.append('_wpcf7_posted_data_hash', '');

        // Add all form fields
        for (const [key, value] of incoming.entries()) {
            body.append(key, value);
        }

        // Submit to WordPress
        const wpUrl = `${WP}/wp-json/contact-form-7/v1/contact-forms/${guid}/feedback`;
        
        const res = await fetch(wpUrl, {
            method: 'POST',
            body: body,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('WordPress error:', res.status, errorText);
            return NextResponse.json({ 
                status: 'error', 
                message: 'Failed to submit form to WordPress' 
            }, { status: res.status });
        }

        const json = await res.json();
        return NextResponse.json(json);
        
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Submission failed' 
        }, { status: 500 });
    }
}
