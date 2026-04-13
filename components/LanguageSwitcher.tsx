'use client';

import { useEffect, useState } from 'react';

interface WPLang {
    name: string;
    slug: string;
    flag_code: string;
    flag_url: string;
    home_url: string;
    is_default: boolean;
}

// flag_code overrides — WP returns 'us' for English but we want 'gb'
const flagOverride: Record<string, string> = {
    en: 'gb',
};

function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : '';
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function LanguageSwitcher() {
    const [langs, setLangs] = useState<WPLang[]>([]);
    const [current, setCurrent] = useState('en');

    useEffect(() => {
        // Read saved lang from cookie
        const saved = getCookie('lang');
        if (saved) setCurrent(saved);

        // Fetch languages from Polylang API
        fetch('https://dev-bluerange.pantheonsite.io/wp-json/pll/v1/languages')
            .then(r => r.json())
            .then((data: WPLang[]) => {
                if (Array.isArray(data)) setLangs(data);
            })
            .catch(() => {
                // Fallback static list
                setLangs([
                    { name: 'English', slug: 'en', flag_code: 'gb', flag_url: '', home_url: '/', is_default: true },
                    { name: 'Svenska', slug: 'sv', flag_code: 'se', flag_url: '', home_url: '/', is_default: false },
                ]);
            });
    }, []);

    const switchLang = (lang: WPLang) => {
        setCookie('lang', lang.slug);
        setCurrent(lang.slug);
        // Reload current page with new language cookie
        window.location.reload();
    };

    if (langs.length === 0) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {langs.map((lang) => {
                const flagCode = flagOverride[lang.slug] || lang.flag_code;
                const isActive = current === lang.slug;
                return (
                    <button
                        key={lang.slug}
                        onClick={() => switchLang(lang)}
                        title={lang.name}
                        style={{
                            border: isActive ? '2px solid #0070f3' : '2px solid transparent',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: '1px',
                            opacity: isActive ? 1 : 0.5,
                            borderRadius: '3px',
                            lineHeight: 0,
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
                    </button>
                );
            })}
        </div>
    );
}
