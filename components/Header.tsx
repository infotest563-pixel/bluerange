import Link from 'next/link';
import { getMenu, getSite, getSettings } from '../lib/wp';
import DeskToggle from './DeskToggle';
import NavMenu from './NavMenu';
import LanguageSwitcher from './LanguageSwitcher';

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

                        <NavMenu
                            menuItems={menuItems}
                            wpHost={WP_HOST}
                        />

                        <DeskToggle />

                    </div>
                </nav>
            </header>
        </div>
    );
}
