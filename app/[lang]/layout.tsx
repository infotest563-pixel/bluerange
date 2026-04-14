import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    return (
        <>
            <Header lang={lang} />
            {children}
            <Footer lang={lang} />
        </>
    );
}
