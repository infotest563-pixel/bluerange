import { NextRequest, NextResponse } from 'next/server';

const WP = 'https://dev-bluerange.pantheonsite.io';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();

        if (!domain || typeof domain !== 'string') {
            return NextResponse.json({ success: false, message: 'Invalid domain' }, { status: 400 });
        }

        const body = new URLSearchParams({
            action: 'wdc_check_domain',
            domain: domain.trim(),
            item_id: '741',
        });

        const res = await fetch(`${WP}/wp-admin/admin-ajax.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[domain-check] Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
