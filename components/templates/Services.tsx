import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import CF7Form from '../CF7Form';

export default async function Services({ page }: { page: any }) {
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
    const serviceImg = await resolveImage(acf.service_image);
    const testimonialBg = await resolveImage(acf.testimonial_background_image);

    // Valuable Services Loop
    const valuableServices = await Promise.all((acf.valuable_service || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.services_image)
    })));

    // Service Questions — using CF7Form directly

    // Testimonial logic needs fetching 'testimonials' custom post type.
    // For now, we will add a placeholder or skip if we can't fetch CPTs easily without a dedicated fetching function.
    // Assuming standard WP API exposes testimonials if configured, but let's stick to page content.
    // The original template used `new WP_Query` to fetch testimonials.
    // We would need to add a `getTestimonials` function to `lib/wp.ts` if this content is required. 
    // I will add a TO-DO comment or a placeholder for now.

    return (
        <div className="services-template">
            {/* Banner */}
            <section className="sr-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row sr-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valuable Service */}
            <section className="sr-sec-valuable sec-padd ed_section">
                <div className="container">
                    <div className="row sr-valuable-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.valuable_service_title && <h2>{acf.valuable_service_title}</h2>}
                                {acf.valuable_service_subtitle && <p>{acf.valuable_service_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    {valuableServices.length > 0 && (
                        <div className="row sr-valuable-inner2">
                            {valuableServices.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        {row.imgUrl && (
                                            <div className="rounded-circle">
                                                <img src={row.imgUrl} className="img-fluid" alt="" />
                                            </div>
                                        )}
                                        {row.services_title && <h4>{row.services_title}</h4>}
                                        {row.services_content && <p>{row.services_content}.</p>}
                                        {row.services_button && (
                                            <Link className="btn" href={row.services_button.url} role="button">
                                                {row.services_button.title}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Service Part 2 */}
            <section className="sr-sec-srviceprt2 sec-padd ed_section">
                <div className="container">
                    <div className="row sr-srviceprt2-inner align-items-center">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            {serviceImg && (
                                <div className="wd-100 mx-800 tx-21 ml-0">
                                    <img src={serviceImg} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6 tx-wht">
                            <div className="wd-100 pl-lg-2">
                                {acf.service_title && <h2>{acf.service_title}</h2>}
                                {acf.service_content && <div dangerouslySetInnerHTML={{ __html: acf.service_content }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Questions */}
            <section className="sr-sec-srvicqestn sec-padd ed_section">
                <div className="container">
                    <div className="row sr-srvicqestn-inner">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-5">
                            <div className="wd-100 tx-21 pr-lg-2">
                                {acf.services_questions_title && <h2>{acf.services_questions_title}</h2>}
                                {acf.services_questions_subtitle && <p>{acf.services_questions_subtitle}.</p>}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-7 sr-srqstacrod">
                            <div className="wd-100">
                                <CF7Form
                                    formId={282}
                                    unitTag="wpcf7-f282-o1"
                                    fields={[
                                        { name: 'first-name', type: 'text', placeholder: 'First Name', required: true, half: true },
                                        { name: 'last-name', type: 'text', placeholder: 'Last Name', required: true, half: true },
                                        { name: 'email', type: 'email', placeholder: 'Email Address', required: true, half: true },
                                        { name: 'phone', type: 'tel', placeholder: 'Phone Number', required: false, half: true },
                                        { name: 'your-message', type: 'textarea', placeholder: 'Your Question', required: false },
                                    ]}
                                    submitLabel="Send"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            {/* Note: Fetching testimonials requires additional API setup. Rendering static structure if available or skipping loop. */}
            <section className="sr-sec-testimonial sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${testimonialBg}')` }}>
                <div className="container">
                    <div className="row sr-tetimnil-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 tx-21 mx-800">
                                {acf.testimonail_title && <h2>{acf.testimonail_title}</h2>}
                                {acf.testimonial_subtitle && <p>{acf.testimonial_subtitle}.</p>}
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for testimonials loop as CPT retrieval isn't implemented */}
                    <div className="row sr-tetimnil-inner2">
                        <div className="bl-box col-sm-12 col-md-12">
                            {/* Testimonial slider would go here */}
                            <p className="text-center text-white">[Testimonials CPT Placeholder - Requires API Extension]</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
