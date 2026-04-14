import { getPageBySlug, getPostBySlug, getSettingsWithLang } from '../../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../../components/pages/WordPressPageRenderer';

const VALID_LANGS = ['en', 'sv'];

export default async function LangSlugPage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang } = await params;
    const slug = decodeURIComponent((await params).slug);

    // If lang segment is not a valid language, treat it as a regular slug (handled by [slug] route)
    if (!VALID_LANGS.includes(lang)) {
        notFound();
    }

    const settings = await getSettingsWithLang(lang);

    let data = await getPageBySlug(slug, lang);
    let type = 'page';

    if (!data) {
        data = await getPostBySlug(slug, lang);
        type = 'post';
    }

    if (!data) {
        notFound();
    }

    // New: Automatic localization redirect
    // If the page/post we found is NOT in the requested language, 
    // try to find the translation in the correct language.
    const pageLang = data.lang || 'en';
    if (pageLang !== lang && data.translations && data.translations[lang]) {
        const translatedId = data.translations[lang];
        const { getPageById } = await import('../../../lib/wp');
        const translatedPage = await getPageById(translatedId, lang);
        if (translatedPage?.slug) {
            redirect(`/${lang}/${translatedPage.slug}`);
        }
    }

    if (type === 'page') {
        return <WordPressPageRenderer page={data} />;
    }

    return (
        <main className="site-main" id="main">
            <article id={`post-${data.id}`} className={`${type} type-${type} status-publish hentry`}>
                <header className="entry-header">
                    <div className="container">
                        <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: data.title.rendered }} />
                    </div>
                </header>
                <div className="entry-content">
                    <div className="container">
                        <div dangerouslySetInnerHTML={{ __html: data.content.rendered }} />
                    </div>
                </div>
            </article>
        </main>
    );
}
