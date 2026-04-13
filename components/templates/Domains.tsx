import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';

export default async function Domains({ page }: { page: any }) {
    const acf = page.acf;
    const title = page.title.rendered;

    const resolveImage = async (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field.url) return field.url;
        if (typeof field === 'number') {
            const media = await getMedia(field).catch(() => null);
            return media?.source_url || '';
        }
        return '';
    };

    const bgImage = await resolveImage(acf.background_image);

    // Shortcode
    const shortcodeHtml = acf.shortcode
        ? await renderShortcode(acf.shortcode)
        : '';

    return (
        <div className="domains-template">
            {/* Domains Section */}
            <section className="hm-sec-takeyour web-hotel-takeyour sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${bgImage}')` }}>
                <div className="container">
                    <div className="row hm-takeyour-inner text-center animated">
                        <div className="bl-box col-md-12 tx-wht tx-21">
                            <div className="wd-100">
                                {acf.title && <h2>{acf.title}</h2>}
                                {shortcodeHtml && (
                                    <div dangerouslySetInnerHTML={{ __html: shortcodeHtml }} suppressHydrationWarning />
                                )}
                                {acf.extra_content && (
                                    <div className="extra-content" dangerouslySetInnerHTML={{ __html: acf.extra_content }} />
                                )}
                            </div>
                        </div>
                    </div>
                    {acf.button_link && acf.button_title && (
                        <div className="hm-takebtn-inner text-center">
                            <Link className="btn" href={acf.button_link} role="button">
                                {acf.button_title}
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
