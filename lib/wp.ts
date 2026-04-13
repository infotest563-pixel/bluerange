const WP = 'https://dev-bluerange.pantheonsite.io';

export async function getSettings() {
    const url = `${WP}/wp-json/headless/v1/site-settings?lang=en`;
    const res = await fetch(url, {
        next: { revalidate: 60 },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    });

    if (!res.ok) {
        console.error(`[getSettings] Failed: ${res.status} ${res.statusText}`);
        return {};
    }

    const data = await res.json();
    return {
        show_on_front: data.show_on_front,
        page_on_front: Number(data.page_on_front),
        page_for_posts: Number(data.page_for_posts),
        options: data.options,
        footer_form_html: data.footer_form_html,
        custom_logo_url: data.custom_logo_url
    };
}

export async function getSite() {
    const url = `${WP}/wp-json/headless/v1/site/?lang=en`;

    try {
        const res = await fetch(url, {
            next: { revalidate: 3600 }, // Cache site info longer
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            return { name: 'Bluerange', description: '' };
        }

        return res.json();
    } catch (err) {
        console.error(`[getSite] Network Error:`, err);
        return { name: 'Bluerange', description: '' };
    }
}


export async function getPageById(id: number) {
    return fetch(`${WP}/wp-json/wp/v2/pages/${id}?_embed&lang=en&acf_format=standard`, { next: { revalidate: 60 } }).then(r => r.json());
}

export async function getMedia(id: number) {
    return fetch(`${WP}/wp-json/wp/v2/media/${id}?lang=en`, { next: { revalidate: 3600 } }).then(r => r.json());
}

export async function getPageBySlug(slug: string) {
    const res = await fetch(`${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&lang=en&acf_format=standard`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data[0] || null;
}

export async function getPostBySlug(slug: string) {
    const res = await fetch(`${WP}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=en&acf_format=standard`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data[0] || null;
}

export async function getMenu(slug: string) {
    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/menus/${slug}`, { next: { revalidate: 300 } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

export async function renderShortcode(code: string) {
    if (!code) return '';

    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
            next: { revalidate: 60 }
        });

        if (!res.ok) return '';

        const data = await res.json();

        if (typeof data === 'string') return data;
        if (data?.html) return data.html;
        if (data?.data) return data.data;

        return '';
    } catch (e) {
        console.error('[renderShortcode] Error:', e);
        return '';
    }
}