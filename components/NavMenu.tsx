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

const langFlagMap: Record<string, string> = {
    svenska: 'se',
    english: 'gb',
    norsk: 'no',
    dansk: 'dk',
    deutsch: 'de',
    français: 'fr',
    español: 'es',
    finnish: 'fi',
    suomi: 'fi',
};

function replaceFlagImages(html: string): string {
    return html.replace(
        /<img[^>]*src="data:image[^"]*"[^>]*\/?>/gi,
        (match) => {
            const altMatch = match.match(/alt="([^"]*)"/i);
            const alt = altMatch ? altMatch[1] : '';
            const code = langFlagMap[alt.toLowerCase()];
            if (code) {
                return `<img src="https://flagcdn.com/w20/${code}.png" srcset="https://flagcdn.com/w40/${code}.png 2x" width="16" height="11" alt="${alt}" style="width:16px;height:11px;vertical-align:middle;" />`;
            }
            return alt ? `<span style="font-size:12px;">${alt}</span>` : '';
        }
    );
}

function resolveUrl(url: string, wpHost: string): string {
    if (!url) return '#';
    if (url.startsWith(wpHost)) return url.replace(wpHost, '') || '/';
    return url;
}

function DropdownItem({ item, wpHost }: { item: MenuItem; wpHost: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const hasChildren = !!(item.children && item.children.length > 0);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const liClasses = ['nav-item', ...(item.classes || [])];
    if (hasChildren) liClasses.push('dropdown', 'menu-item-has-children');

    return (
        <li ref={ref} className={liClasses.join(' ')}>
            <Link
                href={resolveUrl(item.url, wpHost)}
                className={`nav-link${hasChildren ? ' dropdown-toggle' : ''}`}
                onClick={hasChildren ? (e: React.MouseEvent) => { e.preventDefault(); setOpen((o: boolean) => !o); } : undefined}
                aria-expanded={hasChildren ? open : undefined}
            >
                <span dangerouslySetInnerHTML={{ __html: replaceFlagImages(item.title) }} />
            </Link>
            {hasChildren && (
                <div className={`dropdown-menu${open ? ' show' : ''}`}>
                    {item.children!.map((child) => (
                        <Link
                            key={child.id}
                            href={resolveUrl(child.url, wpHost)}
                            className="dropdown-item"
                            onClick={() => setOpen(false)}
                        >
                            <span dangerouslySetInnerHTML={{ __html: replaceFlagImages(child.title) }} />
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
                onClick={() => setMobileOpen((o: boolean) => !o)}
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
