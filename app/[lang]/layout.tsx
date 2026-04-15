import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function LangLayout({
    children,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
