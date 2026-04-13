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

// Decode HTML entities like &amp; &lt; &#039; etc.
function decodeEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\\u003c/gi, '<')
        .replace(/\\u003e/gi, '>');
}

// Returns { flagUrl, label } if title contains a flag image, else null
function parseFlagTitle(rawTitle: string): { flagUrl: string; label: string } | null {
    const decoded = decodeEntities(rawTitle);
    // Match base64 img tag and extract alt
    const imgMatch = decoded.match(/<img[^>]*src="data:image[^"]*"[^>]*>/i);
    if (!imgMatch) return null;
    const altMatch = imgMatch[0].match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] : '';
    const code = langFlagMap[alt.toLowerCase()];
    if (!code) return null;
    return {
        flagUrl: `https://flagcdn.com/w40/${code}.png`,
        label: alt,
    };
}

function MenuTitle({ title }: { title: string }) {
    const flag = parseFlagTitle(title);
    if (flag) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={flag.flagUrl}
                alt={flag.label}
                width={22}
                height={15}
                style={{ width: '22px', height: '15px', verticalAlign: 'middle', display: 'inline-block' }}
            />
        );
    }
    // Plain text title — safe to render as HTML for any WP formatting
    return <span dangerouslySetInnerHTML={{ __html: title }} />;
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
                <MenuTitle title={item.title} />
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
                            <MenuTitle title={child.title} />
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
