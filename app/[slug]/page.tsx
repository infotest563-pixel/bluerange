import { getPageBySlug, getPostBySlug, getSettings } from '../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../components/pages/WordPressPageRenderer';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Prevent massive redirect loops if slug is 'home' or empty
    if (slug === 'home') {
        redirect('/');
    }

    const settings = await getSettings();

    // 1. Try Page
    let data = await getPageBySlug(slug);
    let type = 'page';

    // 2. Try Post if Page not found
    if (!data) {
        data = await getPostBySlug(slug);
        type = 'post';
    }

    // 3. 404 if neither
    if (!data) {
        notFound();
    }

    // 4. Redirect if this is actually the homepage
    if (type === 'page' && data.id === settings.page_on_front) {
        redirect('/');
    }

    // 5. Render Page via Engine
    if (type === 'page') {
        return <WordPressPageRenderer page={data} />;
    }

    // 6. Render Post (Generic fallback for posts)
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
