import { getPageBySlugWithLang, getPostBySlugWithLang, getSettingsWithLang } from '../../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../../components/pages/WordPressPageRenderer';

const VALID_LANGS = ['en', 'sv'];

export default async function LangSlugPage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang, slug } = await params;

    // If lang segment is not a valid language, treat it as a regular slug (handled by [slug] route)
    if (!VALID_LANGS.includes(lang)) {
        notFound();
    }

    if (slug === 'home') {
        redirect('/');
    }

    const settings = await getSettingsWithLang(lang);

    let data = await getPageBySlugWithLang(slug, lang);
    let type = 'page';

    if (!data) {
        data = await getPostBySlugWithLang(slug, lang);
        type = 'post';
    }

    if (!data) {
        notFound();
    }

    if (type === 'page' && data.id === settings?.page_on_front) {
        redirect('/');
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
