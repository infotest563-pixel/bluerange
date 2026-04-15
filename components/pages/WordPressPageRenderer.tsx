import DesignedHomepage from '../DesignedHomepage';
import VirtualServer from '../templates/VirtualServer';
import CoLocation from '../templates/CoLocation';
import S3Storage from '../templates/S3Storage';
import Backup from '../templates/Backup';
import InfrastructureAsAService from '../templates/InfrastructureAsAService';
import SoftwareHostingAsAService from '../templates/SoftwareHostingAsAService';
import SoftwareEntrepreneurs from '../templates/SoftwareEntrepreneurs';
import OurPartners from '../templates/OurPartners';
import Microsoft365 from '../templates/Microsoft365';
import WebHotel from '../templates/WebHotel';
import Domains from '../templates/Domains';
import Broadband from '../templates/Broadband';
import Crowdsec from '../templates/Crowdsec';
import SecurityAwarenessTraining from '../templates/SecurityAwarenessTraining';
import PublicSector from '../templates/PublicSector';
import About from '../templates/About';
import Career from '../templates/Career';
import KubernetesAsAService from '../templates/KubernetesAsAService';
import SwedishCloud from '../templates/SwedishCloud';
import ContactUs from '../templates/ContactUs';
import News from '../templates/News';
import Products from '../templates/Products';
import Services from '../templates/Services';
import { stripCF7Forms } from '../../lib/wp';


export default function WordPressPageRenderer({ page }: { page: any }) {
    const slug = page.slug;
    const template = page.template || '';

    // Homepage: slug is 'home' or template includes 'home' or front-page
    if (
        slug === 'home' ||
        slug === 'hem' || // Swedish: 'home'
        template.includes('front-page') ||
        template.includes('home')
    ) {
        return <DesignedHomepage page={page} />;
    }

    // Route by template first (more reliable for multi-language)
    if (template.includes('virtual-server')) {
        return <VirtualServer page={page} />;
    }
    if (template.includes('co-location') || template.includes('colocation')) {
        return <CoLocation page={page} />;
    }
    if (template.includes('s3-storage') || template.includes('storage')) {
        return <S3Storage page={page} />;
    }
    if (template.includes('backup')) {
        return <Backup page={page} />;
    }
    if (template.includes('infrastructure')) {
        return <InfrastructureAsAService page={page} />;
    }
    if (template.includes('software-hosting')) {
        return <SoftwareHostingAsAService page={page} />;
    }
    if (template.includes('software-entrepreneurs')) {
        return <SoftwareEntrepreneurs page={page} />;
    }
    if (template.includes('our-partners') || template.includes('partners')) {
        return <OurPartners page={page} />;
    }
    if (template.includes('microsoft')) {
        return <Microsoft365 page={page} />;
    }
    if (template.includes('web-hotel') || template.includes('web-hosting')) {
        return <WebHotel page={page} />;
    }
    if (template.includes('domain')) {
        return <Domains page={page} />;
    }
    if (template.includes('broadband')) {
        return <Broadband page={page} />;
    }
    if (template.includes('crowdsec')) {
        return <Crowdsec page={page} />;
    }
    if (template.includes('security-awareness') || template.includes('awarness')) {
        return <SecurityAwarenessTraining page={page} />;
    }
    if (template.includes('public-sector')) {
        return <PublicSector page={page} />;
    }
    if (template.includes('about')) {
        return <About page={page} />;
    }
    if (template.includes('career')) {
        return <Career page={page} />;
    }
    if (template.includes('kubernetes')) {
        return <KubernetesAsAService page={page} />;
    }
    if (template.includes('swedish-cloud') || template.includes('svenskt-moln')) {
        return <SwedishCloud page={page} />;
    }
    if (template.includes('contact')) {
        return <ContactUs page={page} />;
    }
    if (template.includes('news')) {
        return <News page={page} />;
    }
    if (template.includes('product')) {
        return <Products page={page} />;
    }
    if (template.includes('service')) {
        return <Services page={page} />;
    }

    // Fallback to slug-based routing for pages without templates
    switch (slug) {
        case 'virtual-server':
        case 'virtuell-server': // Swedish
            return <VirtualServer page={page} />;
        case 'co-location':
        case 'samlokalisering': // Swedish
            return <CoLocation page={page} />;
        case 's3-storage':
        case 'lagring': // Swedish
            return <S3Storage page={page} />;
        case 'backup':
        case 'sakerhetskopiering': // Swedish
            return <Backup page={page} />;
        case 'infrastructure-as-a-service':
        case 'infrastruktur-som-en-tjanst': // Swedish
            return <InfrastructureAsAService page={page} />;
        case 'software-hosting-as-a-service':
        case 'mjukvaruhotell-som-en-tjanst': // Swedish
            return <SoftwareHostingAsAService page={page} />;
        case 'software-entrepreneurs':
        case 'mjukvaruforetag': // Swedish
            return <SoftwareEntrepreneurs page={page} />;
        case 'our-partners':
        case 'vara-partners': // Swedish
            return <OurPartners page={page} />;
        case 'microsoft-365':
        case 'microsoft-365-2': // Swedish variant
            return <Microsoft365 page={page} />;
        case 'web-hotel': // Ensure this matches the slug. The file is web-hotel.php but slug might be web-hosting or web-hotel. 
            // Best to cover both or assume slug matches filename broadly.
            // Usually slugs are lowercase dashed. 
            return <WebHotel page={page} />;
        case 'web-hosting': // Alias just in case
            return <WebHotel page={page} />;
        case 'domains':
        case 'domaner': // Swedish
            return <Domains page={page} />;
        case 'broadband':
        case 'bredband': // Swedish
            return <Broadband page={page} />;
        case 'crowdsec':
            return <Crowdsec page={page} />;
        case 'sercurity-awarness-training': // Matching the typo in filename/user request
            return <SecurityAwarenessTraining page={page} />;
        case 'security-awareness-training': // Matching corrected spelling just in case
            return <SecurityAwarenessTraining page={page} />;
        case 'public-sector':
        case 'offentlig-sektor': // Swedish
            return <PublicSector page={page} />;
        case 'about-bluerange':
        case 'about':
        case 'om-bluerange': // Swedish
            return <About page={page} />;
        case 'career':
        case 'karriar': // Swedish
            return <Career page={page} />;
        case 'kubernetes-as-a-service':
        case 'kubernetes-som-en-tjanst': // Swedish
            return <KubernetesAsAService page={page} />;
        case 'swedish-cloud':
        case 'svenskt-moln': // Swedish
            return <SwedishCloud page={page} />;
        case 'contact-us':
        case 'kontakta-oss': // Swedish
            return <ContactUs page={page} />;
        case 'news':
        case 'nyheter': // Swedish
            return <News page={page} />;
        case 'products':
        case 'produkter': // Swedish
            return <Products page={page} />;
        case 'services':
        case 'tjanster': // Swedish
            return <Services page={page} />;

        // TODO: Implement other pages
        // case 'backup': return <Backup page={page} />;
        // ...

        default:
            // Generic Fallback (Gutenberg Content)
            return (
                <main className="site-main" id="main">
                    <article id={`post-${page.id}`} className={`page type-page status-publish hentry`}>
                        <header className="entry-header">
                            <div className="container">
                                <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                            </div>
                        </header>
                        <div className="entry-content">
                            <div className="container">
                                <div dangerouslySetInnerHTML={{ __html: stripCF7Forms(page.content.rendered) }} />
                            </div>
                        </div>
                    </article>
                </main>
            );
    }
}
