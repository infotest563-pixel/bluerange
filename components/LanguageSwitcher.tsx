'use client';

import { useEffect, useRef, useState } from 'react';

interface WPLang {
    name: string;
    slug: string;
    flag_code: string;
    home_url: string;
    is_default: boolean;
}

const FLAG_OVERRIDE: Record<string, string> = { en: 'gb' };

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
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = getCookie('lang');
        if (saved) setCurrent(saved);

        fetch('https://dev-bluerange.pantheonsite.io/wp-json/pll/v1/languages')
            .then(r => r.json())
            .then((data: WPLang[]) => {
                if (Array.isArray(data) && data.length > 0) setLangs(data);
            })
            .catch(() => {});
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchLang = (lang: WPLang) => {
        setCookie('lang', lang.slug);
        setCurrent(lang.slug);
        setOpen(false);
        
        const currentPath = window.location.pathname;
        const validLangs = ['en', 'sv'];
        
        // Split path: / [0] lang [1] rest [2+]
        const segments = currentPath.split('/').filter(Boolean);
        const firstSegment = segments[0];

        if (validLangs.includes(firstSegment)) {
            // Replace existing lang segment
            segments[0] = lang.slug;
            window.location.href = '/' + segments.join('/');
        } else {
            // Prepend new lang segment
            window.location.href = `/${lang.slug}${currentPath === '/' ? '' : currentPath}`;
        }
    };

    const activeLang = langs.find(l => l.slug === current) || langs[0];
    const otherLangs = langs.filter(l => l.slug !== current);

    if (!activeLang) return null;

    const activeFlag = FLAG_OVERRIDE[activeLang.slug] || activeLang.flag_code;

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            {/* Trigger — shows current language flag + dropdown arrow */}
            <button
                onClick={() => setOpen(o => !o)}
                title={activeLang.name}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    lineHeight: 1,
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://flagcdn.com/w20/${activeFlag}.png`}
                    srcSet={`https://flagcdn.com/w40/${activeFlag}.png 2x`}
                    width={20}
                    height={14}
                    alt={activeLang.name}
                    style={{ display: 'block' }}
                />
                {/* <span style={{ color: '#fff', fontSize: '11px' }}>▼</span> */}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '44px',
                    zIndex: 999,
                    overflow: 'hidden',
                }}>
                    {otherLangs.map((lang: WPLang) => {
                        const flagCode = FLAG_OVERRIDE[lang.slug] || lang.flag_code;
                        return (
                            <button
                                key={lang.slug}
                                onClick={() => switchLang(lang)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    color: '#333',
                                    borderBottom: '1px solid #f0f0f0',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
            )}
        </div>
    );
}
