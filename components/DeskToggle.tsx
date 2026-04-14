'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
    id: string | number;
    title: string;
    url: string;
    classes?: string[] | string;
    children?: MenuItem[] | string;
}

interface DeskToggleProps {
    menuItems?: MenuItem[];
    wpHost?: string;
}

function getClasses(item: MenuItem): string[] {
    if (!item.classes) return [];
    if (Array.isArray(item.classes)) return item.classes;
    return item.classes.split(' ').filter(Boolean);
}

function getChildren(item: MenuItem): MenuItem[] {
    if (!item.children || item.children === '') return [];
    if (Array.isArray(item.children)) return item.children;
    return [];
}

function isLangItem(item: MenuItem): boolean {
    const cls = getClasses(item).join(' ');
    return (
        item.url === '#pll_switcher' ||
        item.title.includes('data:image') ||
        cls.includes('pll-parent-menu-item') ||
        cls.includes('lang-item')
    );
}

function cleanTitle(html: string): string {
    return html.replace(/<img[^>]*src="data:image[^"]*"[^>]*\/?>/gi, '').trim();
}

function resolveUrl(url: string, wpHost: string, currentLang: string): string {
    if (!url || url === '#' || url === '#pll_switcher') return '#';
    let resolved = url;
    if (url.startsWith(wpHost)) {
        resolved = url.replace(wpHost, '') || '/';
    }

    // Ensure the language segment is preserved if it exists in the current URL
    const validLangs = ['en', 'sv'];
    if (validLangs.includes(currentLang)) {
        // If resolved URL doesn't already start with a lang segment, prepend it
        const segments = resolved.split('/').filter(Boolean);
        if (segments.length === 0 || !validLangs.includes(segments[0])) {
            resolved = `/${currentLang}${resolved === '/' ? '' : resolved}`;
        }
    }

    // Strip trailing slash (except for root path)
    if (resolved !== '/' && resolved.endsWith('/')) {
        resolved = resolved.slice(0, -1);
    }
    return resolved;
}

function SidebarMenuItem({ item, wpHost, onClose, currentLang }: { item: MenuItem; wpHost: string; onClose: () => void; currentLang: string }) {
    const [open, setOpen] = useState(false);
    const children = getChildren(item).filter(c => !isLangItem(c));
    const hasChildren = children.length > 0;

    if (isLangItem(item)) return null;

    return (
        <li style={{ listStyle: 'none', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                    href={resolveUrl(item.url, wpHost, currentLang)}
                    onClick={hasChildren ? undefined : onClose}
                    style={{ display: 'block', padding: '10px 0', color: '#333', textDecoration: 'none', fontWeight: 500, flex: 1 }}
                >
                    <span dangerouslySetInnerHTML={{ __html: cleanTitle(item.title) }} />
                </Link>
                {hasChildren && (
                    <button
                        onClick={() => setOpen(o => !o)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', fontSize: '12px', color: '#666' }}
                        aria-label="Toggle submenu"
                    >
                        {open ? '▲' : '▼'}
                    </button>
                )}
            </div>
            {hasChildren && open && (
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {children.map(child => (
                        <li key={child.id} style={{ listStyle: 'none', borderTop: '1px solid #f0f0f0' }}>
                            <Link
                                href={resolveUrl(child.url, wpHost, currentLang)}
                                onClick={onClose}
                                style={{ display: 'block', padding: '8px 0', color: '#555', textDecoration: 'none', fontSize: '14px' }}
                            >
                                <span dangerouslySetInnerHTML={{ __html: cleanTitle(child.title) }} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function DeskToggle({ menuItems = [], wpHost = '' }: DeskToggleProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const segments = pathname.split('/');
    const currentLang = segments[1] || 'en';

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            <div className="desk-toggale">
                <span
                    className="desk-show"
                    onClick={() => setOpen(true)}
                    style={{ cursor: 'pointer', display: open ? 'none' : 'inline-block' }}
                >
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </span>
            </div>

            {/* Backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 110 }}
                />
            )}

            {/* Sidebar */}
            <div className={`deskside-inner${open ? ' active' : ''}`}>
                <span
                    className="desk-close"
                    onClick={() => setOpen(false)}
                    style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                    <i className="fa fa-window-close" aria-hidden="true"></i>
                </span>
                <div className="deskside-content">
                    {menuItems.length > 0 && (
                        <ul style={{ padding: 0, margin: 0 }}>
                            {menuItems.map(item => (
                                <SidebarMenuItem
                                    key={item.id}
                                    item={item}
                                    wpHost={wpHost}
                                    onClose={() => setOpen(false)}
                                    currentLang={currentLang}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
