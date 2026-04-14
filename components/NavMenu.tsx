'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface MenuItem {
    id: string | number;
    title: string;
    url: string;
    classes?: string[];
    children?: MenuItem[];
}

interface NavMenuProps {
    menuItems: MenuItem[];
    wpHost: string;
}

// Filter out Polylang language switcher items — we render our own
function isLangItem(item: MenuItem): boolean {
    const classes = item.classes || [];
    return (
        item.url === '#pll_switcher' ||
        item.title.includes('data:image') ||
        classes.some(c => ['pll-parent-menu-item', 'lang-item', 'lang-item-sv', 'lang-item-en'].includes(c)) ||
        (item.children ?? []).some(child =>
            (child.classes ?? []).some(c => ['lang-item', 'lang-item-sv', 'lang-item-en', 'current-lang'].includes(c))
        )
    );
}

// Remove base64 images from any title string
function cleanTitle(html: string): string {
    return html.replace(/<img[^>]*src="data:image[^"]*"[^>]*\/?>/gi, '').trim();
}

function resolveUrl(url: string, wpHost: string): string {
    if (!url || url === '#' || url === '#pll_switcher') return '#';
    if (url.startsWith(wpHost)) return url.replace(wpHost, '') || '/';
    return url;
}

function DropdownItem({ item, wpHost }: { item: MenuItem; wpHost: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const hasChildren = !!(item.children && item.children.length > 0);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (isLangItem(item)) return null;

    const liClasses = ['nav-item', ...(item.classes || [])];
    if (hasChildren) liClasses.push('dropdown', 'menu-item-has-children');

    return (
        <li ref={ref} className={liClasses.join(' ')}>
            <Link
                href={resolveUrl(item.url, wpHost)}
                className={`nav-link${hasChildren ? ' dropdown-toggle' : ''}`}
                onClick={hasChildren ? (e: { preventDefault: () => void }) => {
                    e.preventDefault();
                    setOpen(o => !o);
                } : undefined}
                aria-expanded={hasChildren ? open : undefined}
            >
                <span dangerouslySetInnerHTML={{ __html: cleanTitle(item.title) }} />
            </Link>
            {hasChildren && open && (
                <div className="dropdown-menu show">
                    {item.children!.filter(c => !isLangItem(c)).map((child) => (
                        <Link
                            key={child.id}
                            href={resolveUrl(child.url, wpHost)}
                            className="dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <span dangerouslySetInnerHTML={{ __html: cleanTitle(child.title) }} />
                        </Link>
                    ))}
                </div>
            )}
        </li>
    );
}

export default function NavMenu({ menuItems, wpHost }: NavMenuProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <button
                className="navbar-toggler"
                type="button"
                aria-controls="navbarNavDropdown"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen(o => !o)}
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`collapse navbar-collapse${mobileOpen ? ' show' : ''}`} id="navbarNavDropdown">
                <ul className="navbar-nav ml-auto" id="main-menu">
                    {Array.isArray(menuItems) && menuItems.map((item) => (
                        <DropdownItem key={item.id} item={item} wpHost={wpHost} />
                    ))}
                </ul>
            </div>
        </>
    );
}
