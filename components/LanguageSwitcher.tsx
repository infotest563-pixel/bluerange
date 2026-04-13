'use client';

import { useEffect, useState } from 'react';

const languages = [
    { code: 'en', label: 'English', flag: 'gb' },
    { code: 'sv', label: 'Svenska', flag: 'se' },
];

function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function LanguageSwitcher() {
    const [current, setCurrent] = useState('en');

    useEffect(() => {
        const saved = getCookie('lang');
        if (saved) setCurrent(saved);
    }, []);

    const switchLang = (code: string) => {
        setCookie('lang', code);
        setCurrent(code);
        window.location.reload();
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => switchLang(lang.code)}
                    title={lang.label}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '2px',
                        opacity: current === lang.code ? 1 : 0.45,
                        outline: current === lang.code ? '2px solid #0070f3' : 'none',
                        borderRadius: '2px',
                        lineHeight: 0,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://flagcdn.com/w20/${lang.flag}.png`}
                        srcSet={`https://flagcdn.com/w40/${lang.flag}.png 2x`}
                        width={20}
                        height={14}
                        alt={lang.label}
                        style={{ display: 'block' }}
                    />
                </button>
            ))}
        </div>
    );
}
