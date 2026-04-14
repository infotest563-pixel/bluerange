'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

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

// Detect if a menu item is the Polylang language switcher
function isLangSwitcher(item: MenuItem): boolean {
    return (
        item.url === '#pll_switcher' ||
        (Array.isArray(item.classes) && item.classes.includes('pll-parent-menu-item')) ||
        (item.children?.some(c =>
            Array.isArray(c.classes) && (
                c.classes.includes('lang-item') ||
                c.classes.includes('current-lang')
            )
        ) ?? false)
    );
}   );
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
    // Replace Polylang switcher with our clean component
    if (isLangSwitcher(item)) {
        return (
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center' }}>
                <LanguageSwitcher inNav />
            </li>
        );
    }f (isLangSwitcher(item)) {
        return (
            <li className="nav-item">
                <LanguageSwitcher />
            </li>
        );
    }

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
                <span dangerouslySetInnerHTML={{ __html: item.title }} />
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
                            <span dangerouslySetInnerHTML={{ __html: child.title }} />
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
    