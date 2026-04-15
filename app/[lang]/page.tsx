import { getSettingsWithLang, getPageById } from '../../lib/wp';
import { notFound } from 'next/navigation';
import DesignedHomepage from '../../components/DesignedHomepage';

export const dynamic = 'force-dynamic';

const VALID_LANGS = ['en', 'sv'];

export default async function LangHomePage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    if (!VALID_LANGS.includes(lang)) {
        notFound();
    }

    const settings = await getSettingsWithLang(lang);
    if (!settings?.page_on_front) {
        notFound();
    }

    // Fetch the front page for this language
    const page = await getPageById(settings.page_on_front, lang);

    if (!page || !page.acf) {
        notFound();
    }

    return <DesignedHomepage page={page} />;
}
