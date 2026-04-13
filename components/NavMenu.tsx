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
    replaceFlagImages: (html: string) => string;
    resolveUrl: (url: string) => string;
}

function DropdownItem({ item, resolveUrl, replaceFlagImages }: {
    item: MenuItem;
    resolveUrl: (url: string) => string;
    replaceFlagImages: (html: string) => string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const hasChildren = item.children && item.children.length > 0;

    // Close on outside click
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
                href={resolveUrl(item.url)}
                className={`nav-link${hasChildren ? ' dropdown-toggle' : ''}`}
                onClick={hasChildren ? (e) => { e.preventDefault(); setOpen(o => !o); } : undefined}
                aria-expanded={hasChildren ? open : undefined}
            >
                <span dangerouslySetInnerHTML={{ __html: replaceFlagImages(item.title) }} />
            </Link>
            {hasChildren && (
                <div className={`dropdown-menu${open ? ' show' : ''}`}>
                    {item.children!.map((child) => (
                        <Link
                            key={child.id}
                            href={resolveUrl(child.url)}
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

export default function NavMenu({ menuItems, replaceFlagImages, resolveUrl }: NavMenuProps) {
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
                        <DropdownItem
                            key={item.id}
                            item={item}
                            resolveUrl={resolveUrl}
                            replaceFlagImages={replaceFlagImages}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
}
