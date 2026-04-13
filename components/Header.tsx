import Link from 'next/link';
import { getMenu, getSite, getSettings } from '../lib/wp';
import DeskToggle from './DeskToggle';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function Header() {
    const siteData = await getSite();
    const settings = await getSettings();
    let menuItems = await getMenu('primary');

    let logoUrl: string | null = null;

    // 1. Try ACF Options (Preferred)
    // if (settings?.options?.site_logo) {
    //     if (typeof settings.options.site_logo === 'string') {
    //         logoUrl = settings.options.site_logo;
    //     } else if (settings.options.site_logo.url) {
    //         logoUrl = settings.options.site_logo.url;
    //     }
    // }

    // 2. Try Site Settings (Legacy Endpoint)
    if (!logoUrl && settings?.custom_logo_url) {
        logoUrl = settings.custom_logo_url;
    }

    // 3. Try Site Data (Customizer - Fallback, might contain flags)
    if (!logoUrl && siteData?.logo) {
        const potentialLogo = typeof siteData.logo === 'string' ? siteData.logo : siteData.logo.url;
        // Avoid base64 flags
        if (potentialLogo && !potentialLogo.startsWith('data:image')) {
            logoUrl = potentialLogo;
        }
    }

    // Fetch Menu with Fallbacks
    if (!menuItems || menuItems.length === 0) {
        menuItems = await getMenu('primary-menu');
    }
    if (!menuItems || menuItems.length === 0) {
        menuItems = await getMenu('main-menu');
    }

    // Replace base64 flag images in menu titles with flagcdn.com URLs
    const langFlagMap: Record<string, string> = {
        svenska: 'se',
        english: 'gb',
        svenska: 'se',
        norsk: 'no',
        dansk: 'dk',
        deutsch: 'de',
        français: 'fr',
        español: 'es',
        finnish: 'fi',
        suomi: 'fi',
    };

    const replaceFlagImages = (html: string): string => {
        // Match any <img> that has a base64 src — extract alt from anywhere in the tag
        return html.replace(
            /<img[^>]*src="data:image[^"]*"[^>]*\/?>/gi,
            (match) => {
                const altMatch = match.match(/alt="([^"]*)"/i);
                const alt = altMatch ? altMatch[1] : '';
                const code = langFlagMap[alt.toLowerCase()];
                if (code) {
                    return `<img src="https://flagcdn.com/w20/${code}.png" srcset="https://flagcdn.com/w40/${code}.png 2x" width="16" height="11" alt="${alt}" style="width:16px;height:11px;vertical-align:middle;" />`;
                }
                // Fallback: show the alt text as a label
                return alt ? `<span style="font-size:12px;">${alt}</span>` : '';
            }
        );
    };

    // Fallback URL resolver
    const resolveUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith(WP_HOST)) {
            return url.replace(WP_HOST, '') || '/';
        }
        return url;
    };

    return (
        <div suppressHydrationWarning>
            <div className="top-header">
                <div className="container">
                    <div className="row">
                        <div className="col col-12">
                            <div className="wd-100 tophead-ul">
                                <ul>
                                    <li>
                                        <a href="tel:036345900">
                                            <img src={`${WP_HOST}/wp-content/uploads/2023/09/telephone-fill.svg`} className="img-fluid" alt="" />
                                            <span>036-34 59 00</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:Support@bluerange.se">
                                            <img src={`${WP_HOST}/wp-content/uploads/2023/09/envelope-fill.svg`} className="img-fluid" alt="" />
                                            <span>Support@bluerange.se</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <header id="wrapper-navbar">
                <a className="skip-link screen-reader-text sr-only" href="#content">
                    Skip to content
                </a>

                <nav id="main-nav" className="navbar navbar-expand-md navbar-dark bg-primary" aria-labelledby="main-nav-label">
                    <h2 id="main-nav-label" className="screen-reader-text sr-only">
                        Main Navigation
                    </h2>

                    <div className="container">
                        <Link href="/" className="navbar-brand custom-logo-link" rel="home">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    className="custom-logo"
                                    alt={siteData?.name || 'Bluerange'}
                                    width={200}
                                    height={50}
                                    style={{ width: 'auto', height: 'auto', maxHeight: '50px' }}
                                />
                            ) : (
                                <span>{siteData?.name || 'Bluerange'}</span>
                            )}
                        </Link>

                        <button
                            className="navbar-toggler"
                            type="button"
                            data-toggle="collapse"
                            data-target="#navbarNavDropdown"
                            aria-controls="navbarNavDropdown"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <ul className="navbar-nav ml-auto" id="main-menu">
                                {Array.isArray(menuItems) && menuItems.map((item: any) => {
                                    const hasChildren = item.children && item.children.length > 0;
                                    const liClasses = ['nav-item'];

                                    // Add WordPress specific classes if available
                                    if (item.classes) {
                                        if (Array.isArray(item.classes)) liClasses.push(...item.classes);
                                    }

                                    if (hasChildren) liClasses.push('dropdown');

                                    return (
                                        <li key={item.id} className={liClasses.join(' ')}>
                                            <Link
                                                href={resolveUrl(item.url)}
                                                className={`nav-link ${hasChildren ? 'dropdown-toggle' : ''}`}
                                                {...(hasChildren ? {
                                                    'data-toggle': 'dropdown',
                                                    'aria-haspopup': 'true',
                                                    'aria-expanded': 'false',
                                                    'id': `dropdown-target-${item.id}`
                                                } : {})}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: replaceFlagImages(item.title) }} />
                                            </Link>
                                            {hasChildren && (
                                                <div className="dropdown-menu" aria-labelledby={`dropdown-target-${item.id}`}>
                                                    {item.children.map((child: any) => (
                                                        <Link key={child.id} href={resolveUrl(child.url)} className="dropdown-item">
                                                            <span dangerouslySetInnerHTML={{ __html: replaceFlagImages(child.title) }} />
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <DeskToggle />

                    </div>
                </nav>
            </header>
        </div>
    );
}
