import Link from 'next/link';
import { getMedia } from '../../lib/wp';

export default async function OurPartners({ page }: { page: any }) {
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

    const bannerBg = await resolveImage(acf.banner_background_image);
    const productImg = await resolveImage(acf.looking_for_product_image);

    // Resolve repeater images
    const features = await Promise.all((acf.our_partner_features || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.our_partner_image)
    })));

    const partnerImages = await Promise.all((acf.our_partner_images || []).map(async (row: any) => ({
        ...row,
        img1: await resolveImage(row.partner_images),
        img2: await resolveImage(row.partner_image_2)
    })));

    return (
        <div className="our-partners-template">
            {/* Banner */}
            <section className="op-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row op-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners 2 */}
            <section className="op-sec-parrt2 sec-padd ed_section">
                <div className="container">
                    <div className="row op-parrts-inner sm-boxx-inr2 align-items-center md-revers">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            <div className="wd-100">
                                {acf.looking_for_product_title && <h2>{acf.looking_for_product_title}</h2>}
                                {acf.looking_for_product_content && <div dangerouslySetInnerHTML={{ __html: acf.looking_for_product_content }} />}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            {productImg && (
                                <div className="wd-100">
                                    <img src={productImg} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners 3 */}
            <section className="op-sec-orprrt3 sec-padd ed_section bg-light">
                <div className="container">
                    <div className="row op-orprrt3-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100">
                                {acf.become_our_partners && <h2>{acf.become_our_partners}</h2>}
                                {acf.become_our_partners_content && <div dangerouslySetInnerHTML={{ __html: acf.become_our_partners_content }} />}
                            </div>
                        </div>
                    </div>
                    <div className="row op-orprrt3-inner">
                        {features.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-12 col-md-4 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && <img src={row.imgUrl} className="img-fluid" alt="" />}
                                    {row.our_partner_title && <h4>{row.our_partner_title}</h4>}
                                    {row.our_partner_content && <div dangerouslySetInnerHTML={{ __html: row.our_partner_content }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Partners Slider */}
            <section className="op-sec-orpartners sec-padd ed_section">
                <div className="container">
                    <div className="row op-orpartners-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 tx-21 mx-800">
                                {acf.our_partners_title && <h5>{acf.our_partners_title}</h5>}
                                {acf.company_trust && <h2>{acf.company_trust}</h2>}
                                {acf.our_partner_subtitle && <p>{acf.our_partner_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row op-orpartners-inner2">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="swiper op-prtnrsldr">
                                <div className="swiper-wrapper">
                                    {partnerImages.map((row: any, i: number) => (
                                        <div key={i} className="swiper-slide wd-100">
                                            {row.img1 && <img src={row.img1} className="img-fluid" alt="" />}
                                            {row.img2 && <img src={row.img2} className="img-fluid" alt="" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="swiper-button-prev"></div>
                                <div className="swiper-button-next"></div>
                                <div className="swiper-pagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
