import Link from 'next/link';
import { getMenu, getSite, getSettings, getLang } from '../lib/wp';
import DeskToggle from './DeskToggle';
import NavMenu from './NavMenu';
import LanguageSwitcher from './LanguageSwitcher';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function Header() {
    const lang = await getLang();
    const siteData = await getSite(lang);
    const settings = await getSettings(lang);
    let menuItems = await getMenu('primary', lang);

    let logoUrl: string | null = null;

    if (!logoUrl && settings?.custom_logo_url) {
        logoUrl = settings.custom_logo_url;
    }
    if (!logoUrl && siteData?.logo) {
        const potentialLogo = typeof siteData.logo === 'string' ? siteData.logo : siteData.logo.url;
        if (potentialLogo && !potentialLogo.startsWith('data:image')) {
            logoUrl = potentialLogo;
        }
    }

    if (!menuItems || menuItems.length === 0) menuItems = await getMenu('primary-menu');
    if (!menuItems || menuItems.length === 0) menuItems = await getMenu('main-menu');

    return (
        <div suppressHydrationWarning>
            {/* Top bar */}
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

            {/* Main nav */}
            <header id="wrapper-navbar">
                <a className="skip-link screen-reader-text sr-only" href="#content">Skip to content</a>
                <nav id="main-nav" className="navbar navbar-expand-md navbar-dark bg-primary" aria-labelledby="main-nav-label">
                    <h2 id="main-nav-label" className="screen-reader-text sr-only">Main Navigation</h2>
                    <div className="container">
                        <Link href={lang === 'en' ? '/' : `/${lang}`} className="navbar-brand custom-logo-link" rel="home">
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

                        <NavMenu menuItems={menuItems} wpHost={WP_HOST} />
                        <LanguageSwitcher />

                        <DeskToggle menuItems={menuItems} wpHost={WP_HOST} />
                    </div>
                </nav>
            </header>
        </div>
    );
}   
