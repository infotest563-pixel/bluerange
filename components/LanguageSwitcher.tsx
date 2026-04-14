'use client';

import { useEffect, useState } from 'react';

interface WPLang {
    name: string;
    slug: string;
    flag_code: string;
    home_url: string;
    is_default: boolean;
}

// WP returns 'us' for English — override to 'gb'
const flagOverride: Record<string, string> = { en: 'gb' };

// Static fallback in case API is slow/unavailable
const FALLBACK: WPLang[] = [
    { name: 'English', slug: 'en', flag_code: 'gb', home_url: '/', is_default: true },
    { name: 'Svenska', slug: 'sv', flag_code: 'se', home_url: '/', is_default: false },
];

function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : '';
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function LanguageSwitcher() {
    const [langs, setLangs] = useState<WPLang[]>(FALLBACK);
    const [current, setCurrent] = useState('en');

    useEffect(() => {
        const saved = getCookie('lang');
        if (saved) setCurrent(saved);

        fetch('https://dev-bluerange.pantheonsite.io/wp-json/pll/v1/languages')
            .then(r => r.json())
            .then((data: WPLang[]) => { if (Array.isArray(data) && data.length) setLangs(data); })
            .catch(() => {});
    }, []);

    const switchLang = (lang: WPLang) => {
        setCookie('lang', lang.slug);
        setCurrent(lang.slug);
        window.location.reload();
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {langs.map((lang) => {
                const flagCode = flagOverride[lang.slug] || lang.flag_code;
                const isActive = current === lang.slug;
                return (
                    <button
                        key={lang.slug}
                        onClick={() => switchLang(lang)}
                        title={lang.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            opacity: isActive ? 1 : 0.55,
                            borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
                            borderRadius: 0,
                            lineHeight: 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`https://flagcdn.com/w20/${flagCode}.png`}
                            srcSet={`https://flagcdn.com/w40/${flagCode}.png 2x`}
                            width={20}
                            height={14}
                            alt={lang.name}
                            style={{ display: 'block' }}
                        />
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>
                            {lang.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
