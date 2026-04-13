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


export default function WordPressPageRenderer({ page }: { page: any }) {
    const slug = page.slug;

    // Route to specific template components based on slug
    switch (slug) {
        case 'virtual-server':
            return <VirtualServer page={page} />;
        case 'co-location':
            return <CoLocation page={page} />;
        case 's3-storage':
            return <S3Storage page={page} />;
        case 'backup':
            return <Backup page={page} />;
        case 'infrastructure-as-a-service':
            return <InfrastructureAsAService page={page} />;
        case 'software-hosting-as-a-service':
            return <SoftwareHostingAsAService page={page} />;
        case 'software-entrepreneurs':
            return <SoftwareEntrepreneurs page={page} />;
        case 'our-partners':
            return <OurPartners page={page} />;
        case 'microsoft-365':
            return <Microsoft365 page={page} />;
        case 'web-hotel': // Ensure this matches the slug. The file is web-hotel.php but slug might be web-hosting or web-hotel. 
            // Best to cover both or assume slug matches filename broadly.
            // Usually slugs are lowercase dashed. 
            return <WebHotel page={page} />;
        case 'web-hosting': // Alias just in case
            return <WebHotel page={page} />;
        case 'domains':
            return <Domains page={page} />;
        case 'broadband':
            return <Broadband page={page} />;
        case 'crowdsec':
            return <Crowdsec page={page} />;
        case 'sercurity-awarness-training': // Matching the typo in filename/user request
            return <SecurityAwarenessTraining page={page} />;
        case 'security-awareness-training': // Matching corrected spelling just in case
            return <SecurityAwarenessTraining page={page} />;
        case 'public-sector':
            return <PublicSector page={page} />;
        case 'about-bluerange': // User specified slug
            return <About page={page} />;
        case 'about': // Alias
            return <About page={page} />;
        case 'career':
            return <Career page={page} />;
        case 'kubernetes-as-a-service':
            return <KubernetesAsAService page={page} />;
        case 'swedish-cloud':
            return <SwedishCloud page={page} />;
        case 'contact-us':
            return <ContactUs page={page} />;
        case 'news':
            return <News page={page} />;
        case 'products':
            return <Products page={page} />;
        case 'services':
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
                                <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
                            </div>
                        </div>
                    </article>
                </main>
            );
    }
}
