import { cookies, headers } from 'next/headers';

const WP = 'https://dev-bluerange.pantheonsite.io';

export async function getLang(): Promise<string> {
    try {
        const headerList = await headers();
        const headerLang = headerList.get('x-lang');
        if (headerLang) return headerLang;

        const cookieStore = await cookies();
        return cookieStore.get('lang')?.value || 'en';
    } catch {
        return 'en';
    }
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';

export async function getSettings(lang?: string) {
    const currentLang = lang || await getLang();
    const res = await fetch(`${WP}/wp-json/headless/v1/site-settings?lang=${currentLang}`, {
        next: { revalidate: 60 },
        headers: { 'User-Agent': UA },
    } as RequestInit);

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
        custom_logo_url: data.custom_logo_url,
    };
}

export async function getSite(lang?: string) {
    const currentLang = lang || await getLang();
    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/site/?lang=${currentLang}`, {
            next: { revalidate: 3600 },
            headers: { 'User-Agent': UA, 'Accept': 'application/json' },
        } as RequestInit);
        if (!res.ok) return { name: 'Bluerange', description: '' };
        return res.json();
    } catch (err) {
        console.error(`[getSite] Network Error:`, err);
        return { name: 'Bluerange', description: '' };
    }
}

export async function getPageById(id: number, lang?: string) {
    const currentLang = lang || await getLang();
    const data = await fetch(`${WP}/wp-json/wp/v2/pages/${id}?_embed&lang=${currentLang}&acf_format=standard`, {
        next: { revalidate: 60 },
    } as RequestInit).then(r => r.json());
    if (data?.content?.rendered) {
        data.content.rendered = stripCF7Forms(data.content.rendered);
    }
    return data;
}

export async function getMedia(id: number, lang?: string) {
    const currentLang = lang || await getLang();
    return fetch(`${WP}/wp-json/wp/v2/media/${id}?lang=${currentLang}`, {
        next: { revalidate: 3600 },
    } as RequestInit).then(r => r.json());
}

export async function getPageBySlug(slug: string, lang?: string) {
    const currentLang = lang || await getLang();
    const res = await fetch(`${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&lang=${currentLang}&acf_format=standard`, {
        next: { revalidate: 60 },
    } as RequestInit);
    const data = await res.json();
    const page = data[0] || null;
    if (page?.content?.rendered) {
        page.content.rendered = stripCF7Forms(page.content.rendered);
    }
    // Also strip from ACF fields that might contain shortcode HTML
    if (page?.acf) {
        for (const key of Object.keys(page.acf)) {
            if (typeof page.acf[key] === 'string') {
                page.acf[key] = stripCF7Forms(page.acf[key]);
            }
        }
    }
    return page;
}

export async function getPostBySlug(slug: string, lang?: string) {
    const currentLang = lang || await getLang();
    const res = await fetch(`${WP}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=${currentLang}&acf_format=standard`, {
        next: { revalidate: 60 },
    } as RequestInit);
    const data = await res.json();
    return data[0] || null;
}

export async function getMenu(slug: string, lang?: string) {
    const currentLang = lang || await getLang();
    try {
        const res = await fetch(`${WP}/wp-json/headless/v1/menus/${slug}?lang=${currentLang}`, {
            next: { revalidate: 300 },
        } as RequestInit);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
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
            next: { revalidate: 60 },
        } as RequestInit);
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

// Lang-explicit versions for [lang]/[slug] routes
export async function getSettingsWithLang(lang: string) {
    const res = await fetch(`${WP}/wp-json/headless/v1/site-settings?lang=${lang}`, {
        next: { revalidate: 60 },
        headers: { 'User-Agent': UA },
    } as RequestInit);
    if (!res.ok) return {};
    const data = await res.json();
    return {
        show_on_front: data.show_on_front,
        page_on_front: Number(data.page_on_front),
        page_for_posts: Number(data.page_for_posts),
        options: data.options,
        footer_form_html: data.footer_form_html,
        custom_logo_url: data.custom_logo_url,
    };
}

export async function getPageBySlugWithLang(slug: string, lang: string) {
    const res = await fetch(
        `${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&lang=${lang}&acf_format=standard`,
        { next: { revalidate: 60 } } as RequestInit
    );
    const data = await res.json();
    const page = data[0] || null;
    if (page?.content?.rendered) page.content.rendered = stripCF7Forms(page.content.rendered);
    if (page?.acf) {
        for (const key of Object.keys(page.acf)) {
            if (typeof page.acf[key] === 'string') page.acf[key] = stripCF7Forms(page.acf[key]);
        }
    }
    return page;
}

export async function getPostBySlugWithLang(slug: string, lang: string) {
    const res = await fetch(
        `${WP}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=${lang}&acf_format=standard`,
        { next: { revalidate: 60 } } as RequestInit
    );
    const data = await res.json();
    return data[0] || null;
}

// Strip CF7 shortcode forms from rendered HTML content
// Prevents native form submission redirecting to WP endpoint
export function stripCF7Forms(html: string): string {
    if (!html) return html;
    let result = html;
    // Remove [contact-form-7 ...] shortcode tags
    result = result.replace(/\[contact-form-7[^\]]*\]/gi, '');
    // Remove entire <form> elements that post to WP CF7/shortcode endpoints
    result = result.replace(/<form[^>]*action="[^"]*(?:wpcf7|shortcode|contact-form)[^"]*"[^>]*>[\s\S]*?<\/form>/gi, '');
    // Remove wpcf7 wrapper divs (greedy removal of nested structure)
    result = result.replace(/<div[^>]*(?:class|id)="[^"]*wpcf7[^"]*"[^>]*>[\s\S]*?<\/div>(?:\s*<\/div>)*/gi, '');
    return result;
}
