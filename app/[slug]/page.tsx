import { getPageBySlug, getPostBySlug, getSettings, getPageBySlugWithLang, getPostBySlugWithLang, getSettingsWithLang } from '../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../components/pages/WordPressPageRenderer';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Prevent massive redirect loops if slug is 'home' or empty
    if (slug === 'home') {
        redirect('/');
    }

    // Try English first
    let settings = await getSettings();
    let data = await getPageBySlug(slug);
    let type = 'page';
    let lang = 'en';

    // If not found in English, try Swedish
    if (!data) {
        data = await getPageBySlugWithLang(slug, 'sv');
        lang = 'sv';
        settings = await getSettingsWithLang('sv');
    }

    // Try posts if page not found
    if (!data) {
        data = await getPostBySlug(slug);
        lang = 'en';
        type = 'post';
    }

    if (!data) {
        data = await getPostBySlugWithLang(slug, 'sv');
        lang = 'sv';
        type = 'post';
    }

    // 404 if neither
    if (!data) {
        notFound();
    }

    // Redirect if this is actually the homepage
    if (type === 'page' && data.id === settings.page_on_front) {
        redirect('/');
    }

    // Render Page via Engine
    if (type === 'page') {
        return <WordPressPageRenderer page={data} />;
    }

    // Render Post (Generic fallback for posts)
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
